import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    Plus
} from 'lucide-react';
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
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Generate week days starting from today
    const getWeekDays = () => {
        const days = [];
        const today = new Date(currentDate);
        // Get start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
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
                .select('*')
                .eq('user_id', user.id);

            if (schedulesError) throw schedulesError;

            // 2. Extract all unique Job IDs 
            const allJobIds = new Set<string>();
            (schedulesData || []).forEach(s => {
                if (Array.isArray(s.jobs_ids)) {
                    s.jobs_ids.forEach((id: string) => allJobIds.add(id));
                }
            });

            // 3. Fetch Job Details
            let jobsMap: Record<string, any> = {};
            if (allJobIds.size > 0) {
                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select('*, job_contacts(*)')
                    .in('id', Array.from(allJobIds));

                if (jobsData) {
                    jobsData.forEach(j => {
                        jobsMap[j.id] = {
                            ...j,
                            // Map fields similar to Marketing.tsx for generateJobText/display
                            role: j.title,
                            jobCode: j.code,
                            type: j.job_type === 'text' ? 'scratch' : 'file',
                            companyName: j.company_name,
                            hideCompany: j.hide_company,
                            bond: j.employment_type === 'CLT' ? 'CLT ( Fixo )' : j.employment_type === 'PJ' ? 'Pessoa Jurídica' : j.employment_type,
                            contacts: (j.job_contacts || []).map((c: any) => ({
                                type: c.type === 'whatsapp' ? 'WhatsApp' :
                                    c.type === 'email' ? 'Email' :
                                        c.type === 'address' ? 'Endereço' : 'Link',
                                value: c.value,
                                date: c.date,
                                time: c.time,
                                noDateTime: c.no_date_time
                            }))
                        };
                    });
                }
            }

            // 4. Merge Data
            const processedSchedules = (schedulesData || []).map(s => {
                const firstJobId = s.jobs_ids?.[0];
                const job = jobsMap[firstJobId];

                return {
                    id: s.id,
                    job: job, // Store full job object
                    title: job?.role || job?.title || 'Vaga sem título',
                    company: job?.company_name || 'Empresa',
                    date: s.scheduled_date,
                    time: s.scheduled_time?.substring(0, 5),
                    status: s.status, // Keep original for reference
                    publishStatus: s.publish_status, // New integer status
                    groups: s.groups_count,
                    rawDate: new Date(s.scheduled_date)
                };
            });

            setSchedules(processedSchedules);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();

        // Realtime Subscription
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
                    console.log('Realtime change received!', payload);
                    fetchSchedules();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentDate, user]);

    const weekDays = useMemo(() => getWeekDays(), [currentDate]);

    const formatDate = (date: Date) => {
        // Correct timezone issue by using local parts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getPostsForDate = (date: Date) => {
        const dateStr = formatDate(date);
        return schedules.filter(post => post.date === dateStr);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Stop card click
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            try {
                const { error } = await supabase
                    .from('marketing_schedules')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // Remove from state
                setSchedules(prev => prev.filter(s => s.id !== id));
                if (selectedSchedule?.id === id) {
                    setIsPreviewModalOpen(false);
                    setSelectedSchedule(null);
                }
            } catch (error) {
                console.error('Error deleting schedule:', error);
                alert('Erro ao excluir agendamento');
            }
        }
    };

    const openPreview = (schedule: any) => {
        setSelectedSchedule(schedule);
        setIsPreviewModalOpen(true);
    };

    // --- Preview Generation Logic (Adapted from Marketing.tsx) ---
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
            const observationText = job.show_observation && job.observation ? `\nObs: ${job.observation}\n` : '';
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

    return (
        <div className="h-full flex flex-col animate-fadeIn">
            {/* Calendar View */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Calendar Controls - Reduced Height */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'week'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'month'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                Mês
                            </button>
                        </div>

                        {/* Month/Year Display */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={goToPreviousWeek}
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="text-center min-w-[160px]">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white capitalize">{monthYear}</h3>
                            </div>

                            <button
                                onClick={goToNextWeek}
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Actions: Today + Anunciar Vaga */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                            >
                                Hoje
                            </button>

                            <button
                                onClick={() => setActiveTab('marketing')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                <Plus size={14} />
                                Anunciar Vaga
                            </button>
                        </div>
                    </div>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-7 border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/20 flex-shrink-0">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <div
                            key={day}
                            className={`p-2 text-center border-r border-slate-300 dark:border-slate-600 last:border-r-0 ${index === 0 || index === 6 ? 'bg-slate-100/50 dark:bg-slate-800/50' : ''
                                }`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Days Grid - Flex-1 to fill remaining space */}
                <div className="flex-1 grid grid-cols-7 overflow-hidden">
                    {weekDays.map((day, index) => {
                        const posts = getPostsForDate(day);
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={index}
                                className={`flex flex-col p-2 border-r border-slate-300 dark:border-slate-600 last:border-r-0 ${isTodayDate ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                                    } ${index === 0 || index === 6 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                            >
                                {/* Day Number */}
                                <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0">
                                    <span
                                        className={`text-xs font-bold ${isTodayDate
                                            ? 'w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full'
                                            : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </span>
                                    {posts.length > 0 && (
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {posts.length}
                                        </span>
                                    )}
                                </div>


                                {/* Posts for this day - Compact View + Scroll */}
                                <div className="space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-1">
                                    {posts.map(post => (
                                        <div
                                            key={post.id}
                                            onClick={() => openPreview(post)}
                                            className={`group relative p-2 rounded-lg border-l-2 transition-all hover:brightness-95 cursor-pointer shadow-sm flex-shrink-0
                        ${post.publishStatus === 0
                                                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30' // 0 = Agendado = Verde
                                                    : 'border-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/30' // 1 = Publicado = Amarelo
                                                }`}
                                        >

                                            {/* Time & Icon */}
                                            <div className="flex items-center gap-1 mb-1">
                                                {post.publishStatus === 0 ? (
                                                    <Clock size={10} className="text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <CheckCircle2 size={10} className="text-yellow-600 dark:text-yellow-400" />
                                                )}
                                                <span className={`text-[10px] font-black tracking-tight ${post.publishStatus === 0
                                                    ? 'text-emerald-700 dark:text-emerald-300'
                                                    : 'text-yellow-700 dark:text-yellow-300'
                                                    }`}>
                                                    {post.time}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight mb-0.5 truncate">
                                                {post.title}
                                            </p>

                                            {/* Company */}
                                            <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                                {post.company}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewModalOpen && selectedSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Detalhes do Agendamento</h3>
                            <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Modal Content - Job Preview */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="bg-[#E5DDD5] dark:bg-[#111b21] p-4 rounded-xl shadow-inner relative">
                                <div className="bg-white dark:bg-[#202c33] p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                    {selectedSchedule.job ? (
                                        <>
                                            {selectedSchedule.job.image_url || selectedSchedule.job.file_url ? (
                                                <div className="mb-3 rounded-lg overflow-hidden bg-slate-100">
                                                    <img src={selectedSchedule.job.image_url || selectedSchedule.job.file_url} alt="Vaga" className="w-full h-auto object-contain max-h-[200px]" />
                                                </div>
                                            ) : null}
                                            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium leading-snug">
                                                {generateJobText(selectedSchedule.job)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <p>Detalhes da vaga não encontrados.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Schedule Details */}
                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                    <span className="block font-bold text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Data</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                    <span className="block font-bold text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Horário</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedSchedule.time}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between gap-3">
                            <button
                                onClick={(e) => handleDelete(e, selectedSchedule.id)}
                                className="px-4 py-2.5 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Excluir
                            </button>
                            <button
                                onClick={() => setIsPreviewModalOpen(false)}
                                className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
