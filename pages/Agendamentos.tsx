import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    Plus,
    AlertCircle,
    Trash2,
    Users,
    FileText,
    ExternalLink,
    MapPin,
    Smartphone,
    Mail,
    X,
    Search
} from 'lucide-react';
import { SuccessModal } from '../components/SuccessModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AgendamentosProps {
    setActiveTab: (tab: string) => void;
}

export const Agendamentos: React.FC<AgendamentosProps> = ({ setActiveTab }) => {
    const { user, company } = useAuth();
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedBatch, setSelectedBatch] = useState<any[] | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Reschedule State
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [originalDate, setOriginalDate] = useState('');
    const [originalTime, setOriginalTime] = useState('');

    // Add Groups State
    const [allGroups, setAllGroups] = useState<any[]>([]);
    const [isAddGroupsModalOpen, setIsAddGroupsModalOpen] = useState(false);
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [selectedNewGroups, setSelectedNewGroups] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false); // Global saving state for buttons

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleCloseModal = () => {
        setIsPreviewModalOpen(false);
    };

    // Generate week days (7 days)
    const getWeekDays = () => {
        const days = [];
        const today = new Date(currentDate);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    // Generate month days (42 days - 6 weeks)
    const getMonthDays = () => {
        const days = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const startDay = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(firstDayOfMonth.getDate() - startDay);

        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const fetchSchedules = async () => {
        try {
            setLoading(true);

            if (!user) return;

            // 1. Fetch Schedules
            const { data: schedulesData, error: schedulesError } = await supabase
                .from('marketing_schedules')
                .select('id, user_id, jobs_ids, scheduled_date, scheduled_time, status, publish_status, groups_count, id_group')
                .eq('user_id', user.id);

            if (schedulesError) throw schedulesError;

            // 2. Extract all unique Job IDs and Group IDs
            const scheduleJobIdsMap: Record<string, string[]> = {};
            const allGroupIds = new Set<string>();
            const allJobIds = new Set<string>();

            (schedulesData || []).forEach(s => {
                let parsedIds: string[] = [];
                // Robust parsing for jobs_ids
                if (Array.isArray(s.jobs_ids)) {
                    parsedIds = s.jobs_ids.map((id: any) =>
                        typeof id === 'string' ? id.trim().replace(/"/g, '') : String(id)
                    );
                } else if (typeof s.jobs_ids === 'string') {
                    try {
                        const parsed = JSON.parse(s.jobs_ids);
                        if (Array.isArray(parsed)) {
                            parsedIds = parsed.map((id: any) =>
                                typeof id === 'string' ? id.trim().replace(/"/g, '') : String(id)
                            );
                        }
                        else if (typeof parsed === 'string') parsedIds = [parsed.trim().replace(/"/g, '')];
                    } catch (e) {
                        try {
                            parsedIds = s.jobs_ids.replace('{', '').replace('}', '').split(',').map((id: string) => id.trim().replace(/"/g, ''));
                        } catch (e2) {
                            console.error('Failed to parse jobs_ids:', s.jobs_ids);
                        }
                    }
                }

                parsedIds.forEach(id => allJobIds.add(id));
                scheduleJobIdsMap[s.id] = parsedIds;

                if (s.id_group) {
                    allGroupIds.add(s.id_group);
                }
            });

            // 3. Fetch Job Details (FETCH ALL - Using FLAT COLUMNS)
            let jobsMap: Record<string, any> = {};
            let jobFetchError = null;

            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('id, title, code, job_type, company_name, hide_company, employment_type, city, region, requirements, benefits, activities, image_url, show_observation, observation, contact_whatsapp, contact_email, contact_link, contact_address, contact_address_date, contact_address_time, function')
                .eq('user_id', user.id);

            if (jobsError) {
                console.error('Error fetching jobs:', jobsError);
                jobFetchError = jobsError;
            }

            let jobsFoundCount = 0;
            if (jobsData) {
                jobsFoundCount = jobsData.length;
                jobsData.forEach(j => {
                    // Map flat columns to format expected by generateJobText
                    const contacts = [];
                    if (j.contact_whatsapp) contacts.push({ type: 'WhatsApp', value: j.contact_whatsapp });
                    if (j.contact_email) contacts.push({ type: 'Email', value: j.contact_email });
                    if (j.contact_link) contacts.push({ type: 'Link', value: j.contact_link });
                    if (j.contact_address) {
                        contacts.push({
                            type: 'Endereço',
                            value: j.contact_address,
                            date: j.contact_address_date,
                            time: j.contact_address_time,
                            noDateTime: !j.contact_address_date
                        });
                    }

                    jobsMap[j.id] = {
                        ...j,
                        role: j.title || j.function,
                        jobCode: j.code,
                        type: j.job_type === 'text' ? 'scratch' : 'file',
                        companyName: j.company_name,
                        hideCompany: j.hide_company,
                        bond: j.employment_type === 'CLT' ? 'CLT ( Fixo )' : j.employment_type === 'PJ' ? 'Pessoa Jurídica' : j.employment_type === 'Estágio' ? 'Estágio' : j.employment_type,
                        contacts: contacts,
                        showObservation: j.show_observation // Ensure naming matches use in generateJobText
                    };
                });
            }

            // 4. Fetch Group Names
            let groupsMap: Record<string, string> = {};
            if (allGroupIds.size > 0) {
                const { data: groupsData } = await supabase
                    .from('whatsapp_groups')
                    .select('id, name_group')
                    .in('id', Array.from(allGroupIds));

                if (groupsData) {
                    groupsData.forEach(g => {
                        groupsMap[g.id] = g.name_group;
                    });
                }
            }

            // 5. Merge Data
            const processedSchedules = (schedulesData || []).map(s => {
                const parsedIds = scheduleJobIdsMap[s.id] || [];
                const firstJobId = parsedIds[0];
                const job = jobsMap[firstJobId];

                return {
                    id: s.id,
                    job: job,
                    jobIdDebug: firstJobId || 'No ID found',
                    debugJobsFound: jobsFoundCount,
                    debugUserId: user.id,
                    debugError: jobFetchError,
                    allJobIds: Object.keys(jobsMap).join(', '), // Debug available IDs
                    title: job?.role || job?.title || 'Vaga sem título',
                    company: job?.company_name || 'Empresa',
                    date: s.scheduled_date,
                    time: s.scheduled_time?.substring(0, 5),
                    status: s.status,
                    publishStatus: s.publish_status,
                    groupsCount: s.groups_count,
                    groupName: groupsMap[s.id_group] || 'Grupo Desconhecido',
                    rawDate: new Date(s.scheduled_date)
                };
            });

            setSchedules(processedSchedules);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all available groups
    const fetchAllGroups = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('whatsapp_groups')
            .select('id, name_group')
            .eq('user_id', user.id)
            .order('name_group');

        if (!error && data) {
            setAllGroups(data);
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchAllGroups();

        if (!user) return;

        const channel = supabase
            .channel(`marketing_schedules_changes_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'marketing_schedules',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    fetchSchedules();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const calendarDays = useMemo(() => {
        return viewMode === 'week' ? getWeekDays() : getMonthDays();
    }, [currentDate, viewMode]);

    // Group schedules by Date -> Time -> Job
    const groupedSchedules = useMemo(() => {
        const map: Record<string, any[]> = {};
        schedules.forEach(s => {
            if (!s.date) return;
            // Group Key: DATE_TIME_JOBID
            const key = `${s.date}_${s.time}_${s.job?.id || 'unknown'}`;
            if (!map[key]) map[key] = [];
            map[key].push(s);
        });

        // Transform map back to array organized by Date
        const dateMap: Record<string, any[][]> = {};
        Object.values(map).forEach(batch => {
            if (batch.length === 0) return;
            const date = batch[0].date;
            if (!dateMap[date]) dateMap[date] = [];
            dateMap[date].push(batch);
        });

        return dateMap;
    }, [schedules]);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getBatchesForDate = (date: Date) => {
        const dateStr = formatDate(date);
        return groupedSchedules[dateStr] || [];
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + 7);
        } else {
            newDate.setMonth(currentDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const handlePrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() - 7);
        } else {
            newDate.setMonth(currentDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSchedulePast = (dateStr: string, timeStr: string) => {
        const now = new Date();
        const scheduleDate = new Date(`${dateStr}T${timeStr}:00`);
        return scheduleDate <= now;
    };

    const handleDelete = async (id: string) => {
        // 1. Snapshot previous state for rollback
        const previousSchedules = [...schedules];
        const previousBatch = selectedBatch ? [...selectedBatch] : null;

        // 2. Optimistic Update (Immediate)
        setSchedules(prev => prev.filter(s => s.id !== id));

        let shouldCloseModal = false;
        if (selectedBatch) {
            const newBatch = selectedBatch.filter(s => s.id !== id);
            if (newBatch.length === 0) {
                shouldCloseModal = true;
                setIsPreviewModalOpen(false);
                setSelectedBatch(null);
            } else {
                setSelectedBatch(newBatch);
            }
        }

        try {
            // 3. Perform DB Operation
            const { error } = await supabase
                .from('marketing_schedules')
                .delete()
                .eq('id', id);

            if (error) throw error;

        } catch (error) {
            console.error('Error deleting:', error);
            // 4. Revert on Error
            alert('Erro ao excluir agendamento. Restaurando...');
            setSchedules(previousSchedules);
            if (previousBatch) {
                setSelectedBatch(previousBatch);
                if (shouldCloseModal) setIsPreviewModalOpen(true);
            }
        }
    };

    const openPreview = (batch: any[]) => {
        setSelectedBatch(batch);
        setIsPreviewModalOpen(true);
        // Initialize edit states
        if (batch.length > 0) {
            setEditDate(batch[0].date);
            setEditTime(batch[0].time);
            setOriginalDate(batch[0].date);
            setOriginalTime(batch[0].time);
        }
    };

    // Check if can reschedule
    const canReschedule = (batch: any[]) => {
        if (!batch || batch.length === 0) return false;
        const first = batch[0];

        // Cannot reschedule if already sent
        if (first.publishStatus === 1) return false;

        // Cannot reschedule if time has passed
        const now = new Date();
        const scheduleDateTime = new Date(`${first.date}T${first.time}:00`);
        return scheduleDateTime > now;
    };

    // Validate new schedule time (30 min minimum from now)
    const validateReschedule = (dateStr: string, timeStr: string) => {
        const now = new Date();
        const newDateTime = new Date(`${dateStr}T${timeStr}:00`);
        const diffMs = newDateTime.getTime() - now.getTime();
        const diffMins = diffMs / 60000;
        return diffMins >= 30;
    };

    // Handle reschedule
    const handleReschedule = async () => {
        if (!selectedBatch || selectedBatch.length === 0) return;

        // Validate
        if (!validateReschedule(editDate, editTime)) {
            alert('O novo horário deve ser pelo menos 30 minutos a partir de agora.');
            return;
        }

        setIsSaving(true);

        try {
            // Update all schedules in the batch
            const updatePromises = selectedBatch.map(schedule =>
                supabase
                    .from('marketing_schedules')
                    .update({
                        scheduled_date: editDate,
                        scheduled_time: editTime
                    })
                    .eq('id', schedule.id)
            );

            const results = await Promise.all(updatePromises);
            const hasError = results.some(r => r.error);

            if (hasError) {
                alert('Erro ao reagendar alguns agendamentos');
                return;
            }

            // Success - refresh and close
            fetchSchedules(); // Background refresh
            setIsPreviewModalOpen(false);
            setSuccessMessage('Agendamento reagendado com sucesso!');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error rescheduling:', error);
            alert('Erro ao reagendar');
        } finally {
            setIsSaving(false);
        }
    };

    // Check if reschedule button should be enabled
    const isRescheduleChanged = () => {
        return editDate !== originalDate || editTime !== originalTime;
    };

    // Get groups already in this schedule
    const getAlreadyScheduledGroupIds = () => {
        if (!selectedBatch) return [];
        return selectedBatch.map(s => s.id_group || s.groupId).filter(Boolean);
    };

    // Get available groups (not already scheduled)
    const getAvailableGroups = () => {
        const scheduledIds = getAlreadyScheduledGroupIds();
        return allGroups.filter(g =>
            !scheduledIds.includes(g.id) &&
            g.name_group.toLowerCase().includes(groupSearchTerm.toLowerCase())
        );
    };

    // Toggle group selection for adding
    const toggleNewGroupSelection = (groupId: string) => {
        setSelectedNewGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    // Add selected groups to schedule
    const handleAddGroups = async () => {
        if (!selectedBatch || selectedBatch.length === 0 || selectedNewGroups.length === 0) return;

        const first = selectedBatch[0];
        const jobId = first.job?.id;

        if (!jobId) {
            alert('Erro: ID da vaga não encontrado');
            return;
        }

        setIsSaving(true);

        try {
            // Create new schedule entries for each selected group
            const inserts = selectedNewGroups.map(groupId => ({
                user_id: user?.id,
                jobs_count: 1,
                groups_count: 1,
                scheduled_date: first.date,
                scheduled_time: first.time,
                status: first.status,
                publish_status: 0, // Always pending for new additions
                jobs_ids: [jobId],
                groups_ids: [groupId],
                id_group: groupId
            }));

            const { data: newSchedules, error } = await supabase
                .from('marketing_schedules')
                .insert(inserts)
                .select('id, user_id, jobs_ids, scheduled_date, scheduled_time, status, publish_status, groups_count, id_group');

            if (error) {
                console.error('Error adding groups:', error);
                alert('Erro ao adicionar grupos: ' + error.message);
                return;
            }

            // Fetch group names for newly added groups
            // Optimization: Filter from allGroups instead of DB fetch if possible, but safely fetch to be sure
            const newGroupIds = newSchedules?.map(s => s.id_group) || [];
            const groupsMap: Record<string, string> = {};

            // Try to get names from local 'allGroups' first (Instant)
            newGroupIds.forEach(id => {
                const found = allGroups.find(g => g.id === id);
                if (found) groupsMap[id] = found.name_group;
            });

            // Map new schedules to same format as existing batch
            const newBatchItems = (newSchedules || []).map(s => ({
                id: s.id,
                job: first.job, // Same job as existing batch
                jobIdDebug: jobId,
                debugJobsFound: first.debugJobsFound,
                debugUserId: user?.id,
                title: first.title,
                company: first.company,
                date: s.scheduled_date,
                time: s.scheduled_time?.substring(0, 5),
                status: s.status,
                publishStatus: s.publish_status,
                groupsCount: s.groups_count,
                groupName: groupsMap[s.id_group] || 'Grupo Desconhecido',
                rawDate: new Date(s.scheduled_date),
                id_group: s.id_group
            }));

            // Update selectedBatch with new items
            setSelectedBatch(prev => prev ? [...prev, ...newBatchItems] : newBatchItems);

            // Update Main Schedules List Optimistically (Append new items)
            setSchedules(prev => [...prev, ...newBatchItems]);

            // Reset selection and hide selector
            setSelectedNewGroups([]);
            setIsAddGroupsModalOpen(false);
            setGroupSearchTerm('');

            // Background refresh to ensure consistency (optional)
            // fetchSchedules(); 
        } catch (error) {
            console.error('Exception adding groups:', error);
            alert('Erro ao adicionar grupos');
        } finally {
            setIsSaving(false);
        }
    };

    // --- COPIED & ADAPTED FROM MARKETING.TSX ---
    const generateJobText = (job: any) => {
        if (!job) return '';
        const code = job.jobCode || '---';
        const cvParts: string[] = [];
        const addressParts: string[] = [];
        const linkParts: string[] = [];

        job.contacts?.forEach((c: any) => {
            if (c.type === 'WhatsApp') cvParts.push(`WhatsApp ${c.value}`);
            else if (c.type === 'Email') cvParts.push(`e-mail ${c.value}`);
            else if (c.type === 'Link') linkParts.push(`Link ${c.value}`);
            else if (c.type === 'Endereço') {
                const addressBase = `${c.value}`;
                if (!c.noDateTime) {
                    const dateStr = c.date ? new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
                    addressParts.push(`${addressBase} no dia ${dateStr} às ${c.time || '__:__'}`);
                } else {
                    addressParts.push(addressBase);
                }
            }
        });

        const joinList = (list: string[]) => {
            if (list.length === 0) return '';
            if (list.length === 1) return list[0];
            const last = list.pop();
            return `${list.join(', ')} ou ${last}`;
        };

        const cvText = cvParts.length > 0 ? `Enviar curriculo com o nome da vaga/codigo para: ${joinList(cvParts)}` : '';
        const addressText = addressParts.length > 0 ? `Compareça no endereço: ${joinList(addressParts)}` : '';
        const linkText = linkParts.length > 0 ? `Acesse: ${joinList(linkParts)}` : '';

        const finalParts = [cvText, addressText, linkText].filter(Boolean);
        const interessadosText = finalParts.length > 0 ? joinList(finalParts) : 'Entre em contato pelos canais oficiais.';

        if (job.type === 'file') {
            const observationText = job.showObservation && job.observation ? `\nObs: ${job.observation}\n` : '';
            return `*${company?.name || 'Sua Empresa'}* 🟡🔴🤣
-----------------------------
Função: *${job.role || ''}*
Cód. Vaga: *${code}*
-----------------------------${observationText}
*Interessados*
 ${interessadosText}`;
        }

        return `*${company?.name || 'Sua Empresa'}* 🟡🔴🤣
-----------------------------
Função: *${job.role || ''}*
Cód. Vaga: *${code}*
-----------------------------  
*Vínculo:* ${job.bond || 'CLT'}
*Empresa:* ${job.hideCompany ? '(Oculto)' : job.companyName || ''}
*Cidade/Bairro:* ${job.city || ''} - ${job.region || ''}
*Requisitos:* ${job.requirements || ''}
*Benefícios:* ${job.benefits || ''}
*Atividades:* ${job.activities || ''}

*Interessados*
 ${interessadosText}
----------------------------- 

*Mais informações:*
➞ ${company?.name || 'Lepps |Conecta'}
➞ ${company?.whatsapp || '11946610753'}
➞ ${company?.website || 'leppsconecta.com.br'}`;
    };


    const monthYear = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const getBatchStatusInfo = (batch: any[]) => {
        const first = batch[0];
        const allSent = batch.every(s => s.publishStatus === 1);

        // Verde: Enviado | Amarelo: Agendado
        if (allSent) return { color: 'emerald', icon: CheckCircle2, label: first.time };
        return { color: 'yellow', icon: Clock, label: first.time };
    };

    return (
        <div className="h-full flex flex-col animate-fadeIn">
            {/* Calendar View */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>SEMANA</button>
                            <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>MÊS</button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handlePrevious} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"><ChevronLeft size={16} /></button>
                            <div className="text-center min-w-[160px]"><h3 className="text-base font-bold text-slate-800 dark:text-white capitalize">{monthYear}</h3></div>
                            <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"><ChevronRight size={16} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={goToToday} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">Hoje</button>
                            <button onClick={() => setActiveTab('marketing')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"><Plus size={14} /> Anunciar Vaga</button>
                        </div>
                    </div>
                </div>
                <div className={`${viewMode === 'month' ? 'grid' : 'hidden'} md:grid grid-cols-7 border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/20 flex-shrink-0`}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <div key={day} className={`p-2 text-center border-r border-slate-300 dark:border-slate-600 last:border-r-0 ${index === 0 || index === 6 ? 'bg-slate-100/50 dark:bg-slate-800/50' : ''}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{day}</span>
                        </div>
                    ))}
                </div>
                <div className={`${viewMode === 'month' ? 'grid' : 'hidden'} md:grid flex-1 grid-cols-7 ${viewMode === 'month' ? 'grid-rows-6' : ''} overflow-hidden`}>
                    {calendarDays.map((day, index) => {
                        const batches = getBatchesForDate(day);
                        const isTodayDate = isToday(day);
                        const displayedBatches = viewMode === 'month' ? batches.slice(0, 3) : batches;
                        const hiddenCount = batches.length - displayedBatches.length;
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={index}
                                onClick={() => { if (viewMode === 'month') { setCurrentDate(day); setViewMode('week'); } }}
                                className={`flex flex-col p-2 border-r border-b border-slate-300 dark:border-slate-600 ${(index + 1) % 7 === 0 ? 'border-r-0' : ''} ${!isCurrentMonth && viewMode === 'month' ? 'bg-slate-50/80 dark:bg-slate-900/80 text-slate-400' : ''} ${isTodayDate ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''} ${(index === 0 || index === 6 || (index) % 7 === 0 || (index + 1) % 7 === 0) && viewMode === 'week' ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''} ${viewMode === 'month' ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative min-h-[80px]' : 'overflow-hidden'}`}
                            >
                                <div className="flex items-center justify-between mb-1 flex-shrink-0">
                                    <span className={`text-xs font-bold ${isTodayDate ? 'w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full' : !isCurrentMonth && viewMode === 'month' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>{day.getDate()}</span>
                                    {batches.length > 0 && viewMode === 'week' && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{batches.length} AGENDA(S)</span>}
                                </div>
                                <div className={`space-y-1.5 flex-1 ${viewMode === 'week' ? 'overflow-y-auto overflow-x-hidden custom-scrollbar p-1' : 'overflow-hidden'}`}>
                                    {displayedBatches.map((batch, batchIndex) => {
                                        const { color, icon: Icon, label } = getBatchStatusInfo(batch);
                                        const first = batch[0];
                                        const count = batch.length;
                                        return (
                                            <div
                                                key={batchIndex}
                                                onClick={(e) => {
                                                    if (viewMode === 'month') return;
                                                    e.stopPropagation();
                                                    openPreview(batch);
                                                }}
                                                className={`group relative rounded-lg border-l-2 transition-all hover:brightness-95 cursor-pointer shadow-sm flex-shrink-0 ${viewMode === 'month' ? 'p-1 py-0.5 text-[9px] truncate' : 'p-2'} ${color === 'emerald' ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30' : color === 'yellow' ? 'border-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/30' : 'border-rose-500 bg-rose-50/80 dark:bg-rose-900/30'}`}
                                            >
                                                {viewMode === 'week' ? (
                                                    <>
                                                        <>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-1">
                                                                    <Icon size={10} className={`text-${color}-600 dark:text-${color}-400`} />
                                                                    <span className={`text-[10px] font-black tracking-tight text-${color}-700 dark:text-${color}-300`}>{label}</span>
                                                                </div>
                                                                {first.job?.jobCode && (
                                                                    <span className={`text-[9px] font-bold text-${color}-700 dark:text-${color}-300 opacity-80`}>
                                                                        {first.job.jobCode}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight mb-0.5 truncate">{first.title}</p>
                                                            <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate">{first.company}</p>
                                                        </>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-${color}-500`} />
                                                        <span className="truncate font-medium">{first.title} {count > 1 && `(+${count})`}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {viewMode === 'month' && hiddenCount > 0 && <div className="text-[9px] text-slate-400 font-bold pl-1">+{hiddenCount} mais</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile List View */}
                <div className={`md:hidden flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 pb-24 bg-white dark:bg-slate-900 ${viewMode === 'month' ? 'hidden' : 'block'}`}>
                    {calendarDays.map((day, index) => {
                        const batches = getBatchesForDate(day);
                        const isTodayDate = isToday(day);
                        const weekDayName = day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

                        return (
                            <div key={index} className="flex gap-4">
                                {/* Date Column */}
                                <div className="flex flex-col items-center min-w-[3rem] pt-1">
                                    <div className={`text-2xl font-bold ${isTodayDate ? 'bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center -ml-2 shadow-md shadow-blue-500/20' : 'text-slate-700 dark:text-white'}`}>
                                        {day.getDate()}
                                    </div>
                                    <span className={`text-xs font-medium capitalize mt-1 ${isTodayDate ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{weekDayName}</span>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 space-y-3 pt-1">
                                    {batches.length > 0 ? (
                                        batches.map((batch, batchIndex) => {
                                            const first = batch[0];
                                            const { color, icon: Icon, label } = getBatchStatusInfo(batch);

                                            // Handle case where we don't have job detail yet
                                            const jobImage = first.job?.image_url;

                                            return (
                                                <div
                                                    key={batchIndex}
                                                    onClick={() => openPreview(batch)}
                                                    className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex gap-3 active:scale-[0.98] transition-all"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                                                        {jobImage ? (
                                                            <img src={jobImage} alt="Job" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FileText className="text-slate-400" size={20} />
                                                        )}
                                                        {/* Icon Badge */}
                                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm z-10`}>
                                                            <Icon size={10} className={`text-${color}-500`} />
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest text-${color}-600 dark:text-${color}-400`}>{label}</span>
                                                            {first.job?.jobCode && <span className="text-[9px] font-mono text-slate-400">{first.job.jobCode}</span>}
                                                        </div>
                                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate leading-tight">{first.title}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{first.company}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <button
                                            onClick={() => setActiveTab('marketing')}
                                            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                                        >
                                            <Plus size={14} /> Agendar envio
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Batch Details Modal */}
            {isPreviewModalOpen && selectedBatch && selectedBatch.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Detalhes do Agendamento</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedBatch[0].title} - {selectedBatch.length} Grupos</p>
                            </div>
                            <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Job Info */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2"><FileText size={16} /> Sobre a Vaga</h4>

                                    {selectedBatch[0].job ? (
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">

                                            {selectedBatch[0].job.type === 'file' && selectedBatch[0].job.image_url && (
                                                <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                    <div className="relative w-full flex items-center justify-center bg-slate-900 min-h-[200px]">
                                                        <img src={selectedBatch[0].job.image_url} className="w-full h-auto max-h-[350px] object-contain" alt="Prévia" />
                                                    </div>
                                                    {/* Caption below image */}
                                                    <div className="p-3 bg-white dark:bg-slate-900 text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                        {generateJobText(selectedBatch[0].job).split('\n').map((line, i) => (
                                                            <React.Fragment key={i}>
                                                                {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                                                    part.startsWith('*') && part.endsWith('*') ? <strong key={j} className="font-semibold">{part.slice(1, -1)}</strong> : <span key={j}>{part}</span>
                                                                ))}
                                                                <br />
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBatch[0].job.type === 'scratch' && (
                                                <div className="relative rounded-lg bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                                                    <div className="text-[13px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                        {generateJobText(selectedBatch[0].job).split('\n').map((line, i) => (
                                                            <React.Fragment key={i}>
                                                                {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                                                    part.startsWith('*') && part.endsWith('*') ? <strong key={j} className="font-semibold">{part.slice(1, -1)}</strong> : <span key={j}>{part}</span>
                                                                ))}
                                                                <br />
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-800">
                                            <div className="flex flex-col items-center justify-center text-rose-500 py-4 gap-2">
                                                <AlertCircle size={24} />
                                                <p className="font-bold text-sm">Vaga não encontrada</p>
                                            </div>
                                            <div className="text-[10px] font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-rose-100 dark:border-rose-800 text-slate-500 break-all">
                                                <p><strong>Missing ID:</strong> {selectedBatch[0].jobIdDebug}</p>
                                                <p><strong>Available Job IDs:</strong> {selectedBatch[0].allJobIds}</p>
                                                <p><strong>Fetch Error:</strong> {JSON.stringify(selectedBatch[0].debugError)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Data</span>
                                            {canReschedule(selectedBatch) ? (
                                                <input
                                                    type="date"
                                                    value={editDate}
                                                    onChange={(e) => setEditDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                                />
                                            ) : (
                                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{new Date(selectedBatch[0].date).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Horário</span>
                                            {canReschedule(selectedBatch) ? (
                                                <input
                                                    type="time"
                                                    value={editTime}
                                                    onChange={(e) => setEditTime(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                                />
                                            ) : (
                                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedBatch[0].time}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reschedule Button - Always visible when allowed, enabled only if changed */}
                                    {canReschedule(selectedBatch) && (
                                        <button
                                            onClick={handleReschedule}
                                            disabled={!isRescheduleChanged() || isSaving}
                                            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:active:scale-100"
                                        >
                                            {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Clock size={14} />}
                                            {isSaving ? 'Salvando...' : 'Reagendar'}
                                        </button>
                                    )}
                                </div>

                                {/* Right Column: Groups List */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2"><Users size={16} /> Grupos ({selectedBatch.length})</h4>

                                    {/* Add Groups Button */}
                                    {canReschedule(selectedBatch) && (
                                        <button
                                            onClick={() => {
                                                setIsAddGroupsModalOpen(true);
                                                setGroupSearchTerm('');
                                                setSelectedNewGroups([]);
                                            }}
                                            className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} /> Adicionar Grupos
                                        </button>
                                    )}

                                    <div className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                            {selectedBatch.slice(0, 10).map((inst, idx) => {
                                                const isPast = isSchedulePast(inst.date, inst.time);
                                                return (
                                                    <div key={inst.id} className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                                                <Users size={16} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{inst.groupName}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {inst.publishStatus === -1 && <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Erro no Envio</span>}
                                                                    {inst.publishStatus === 1 && <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">Enviado</span>}
                                                                    {inst.publishStatus === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Aguardando</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleDelete(inst.id)} disabled={isPast} className={`p-2 rounded-lg transition-all flex-shrink-0 ${isPast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`} title={isPast ? "Não é possível excluir agendamentos passados" : "Remover do agendamento"}><Trash2 size={16} /></button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {selectedBatch.length > 10 && (
                                        <p className="text-xs text-slate-400 text-center font-medium">Exibindo 10 de {selectedBatch.length} grupos</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 pb-24 md:pb-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-lg active:scale-95"
                            >
                                Salvar e Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Groups Modal - Separate Layer */}
            {isAddGroupsModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp flex flex-col max-h-[80vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Adicionar Grupos</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Selecione para incluir neste agendamento</p>
                            </div>
                            <button
                                onClick={() => setIsAddGroupsModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar grupos..."
                                    value={groupSearchTerm}
                                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <div className="space-y-1">
                                {getAvailableGroups().length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <Users size={32} className="opacity-20 mb-2" />
                                        <p className="text-sm">Nenhum grupo encontrado</p>
                                    </div>
                                ) : (
                                    getAvailableGroups().map(group => (
                                        <label
                                            key={group.id}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                                        >
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedNewGroups.includes(group.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                                                {selectedNewGroups.includes(group.id) && <X size={12} className="text-white rotate-45 transform origin-center" style={{ strokeWidth: 4 }} />}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNewGroups.includes(group.id)}
                                                    onChange={() => toggleNewGroupSelection(group.id)}
                                                    className="hidden"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{group.name_group}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setIsAddGroupsModalOpen(false)}
                                className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                            >
                                Sair
                            </button>
                            <button
                                onClick={handleAddGroups}
                                disabled={selectedNewGroups.length === 0 || isSaving}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {isSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Salvar {selectedNewGroups.length > 0 ? `(${selectedNewGroups.length})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message={successMessage}
            />
        </div>
    );
}
