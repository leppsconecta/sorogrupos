import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    Plus,
    AlertCircle
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

    const calendarDays = useMemo(() => {
        return viewMode === 'week' ? getWeekDays() : getMonthDays();
    }, [currentDate, viewMode]);

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
                                onClick={handlePrevious}
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="text-center min-w-[160px]">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white capitalize">{monthYear}</h3>
                            </div>

                            <button
                                onClick={handleNext}
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

                {/* Calendar Grid (Days) */}
                <div className={`flex-1 grid grid-cols-7 ${viewMode === 'month' ? 'grid-rows-6' : ''} overflow-hidden`}>
                    {calendarDays.map((day, index) => {
                        const posts = getPostsForDate(day);
                        const isTodayDate = isToday(day);
                        // Filter posts for viewing in Month mode (e.g., max 3)
                        const displayedPosts = viewMode === 'month' ? posts.slice(0, 3) : posts;
                        const hiddenCount = posts.length - displayedPosts.length;

                        // Check if day belongs to current month (for styling dim days)
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    if (viewMode === 'month') {
                                        setCurrentDate(day);
                                        setViewMode('week');
                                    }
                                }}
                                className={`flex flex-col p-2 border-r border-b border-slate-300 dark:border-slate-600 
                                    ${(index + 1) % 7 === 0 ? 'border-r-0' : ''} 
                                    ${!isCurrentMonth && viewMode === 'month' ? 'bg-slate-50/80 dark:bg-slate-900/80 text-slate-400' : ''}
                                    ${isTodayDate ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''} 
                                    ${(index === 0 || index === 6 || (index) % 7 === 0 || (index + 1) % 7 === 0) && viewMode === 'week' ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}
                                    ${viewMode === 'month' ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative min-h-[80px]' : 'overflow-hidden'}
                                `}
                            >
                                {/* Day Number */}
                                <div className="flex items-center justify-between mb-1 flex-shrink-0">
                                    <span
                                        className={`text-xs font-bold ${isTodayDate
                                            ? 'w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full'
                                            : !isCurrentMonth && viewMode === 'month' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </span>
                                    {posts.length > 0 && viewMode === 'week' && (
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {posts.length}
                                        </span>
                                    )}
                                </div>


                                {/* Posts List */}
                                <div className={`space-y-1.5 flex-1 ${viewMode === 'week' ? 'overflow-y-auto overflow-x-hidden custom-scrollbar p-1' : 'overflow-hidden'}`}>
                                    {displayedPosts.map(post => (
                                        <div
                                            key={post.id}
                                            onClick={(e) => {
                                                if (viewMode === 'month') {
                                                    // In month mode, let the parent click handle zooming into the week
                                                    // OR optionally open modal directly? User said "open the day", so keeping parent click behavior is safer.
                                                    // But clicking the item specifically implies interest in the item.
                                                    // Let's stop propagation if we want item click to open modal, 
                                                    // but for "Compact Month View", usually clicking day zooms in. 
                                                    // Let's allow propagation so it zooms in to the day details.
                                                    return;
                                                }
                                                // Week mode logic
                                                e.stopPropagation();
                                                if (post.publishStatus === -1) {
                                                    // No alert, just open modal per recent request
                                                }
                                                openPreview(post);
                                            }}
                                            className={`group relative rounded-lg border-l-2 transition-all hover:brightness-95 cursor-pointer shadow-sm flex-shrink-0
                                                ${viewMode === 'month' ? 'p-1 py-0.5 text-[9px] truncate' : 'p-2'}
                                                ${post.publishStatus === 0
                                                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-900/30'
                                                    : post.publishStatus === 1
                                                        ? 'border-yellow-500 bg-yellow-50/80 dark:bg-yellow-900/30'
                                                        : 'border-rose-500 bg-rose-50/80 dark:bg-rose-900/30'
                                                }`}
                                        >
                                            {viewMode === 'week' ? (
                                                // Detailed Week Card
                                                <>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        {post.publishStatus === 0 ? (
                                                            <Clock size={10} className="text-emerald-600 dark:text-emerald-400" />
                                                        ) : post.publishStatus === 1 ? (
                                                            <CheckCircle2 size={10} className="text-yellow-600 dark:text-yellow-400" />
                                                        ) : (
                                                            <AlertCircle size={10} className="text-rose-600 dark:text-rose-400" />
                                                        )}
                                                        <span className={`text-[10px] font-black tracking-tight ${post.publishStatus === 0
                                                            ? 'text-emerald-700 dark:text-emerald-300'
                                                            : post.publishStatus === 1
                                                                ? 'text-yellow-700 dark:text-yellow-300'
                                                                : 'text-rose-700 dark:text-rose-300'
                                                            }`}>
                                                            {post.publishStatus === -1 ? '( Erro )' : post.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight mb-0.5 truncate">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                                        {post.company}
                                                    </p>
                                                </>
                                            ) : (
                                                // Compact Month Card (Title Only)
                                                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${post.publishStatus === 0 ? 'bg-emerald-500' :
                                                            post.publishStatus === 1 ? 'bg-yellow-500' : 'bg-rose-500'
                                                        }`} />
                                                    <span className="truncate font-medium">{post.title}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {viewMode === 'month' && hiddenCount > 0 && (
                                        <div className="text-[9px] text-slate-400 font-bold pl-1">
                                            +{hiddenCount} mais
                                        </div>
                                    )}
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
                                            {selectedSchedule.publishStatus === -1 && (
                                                <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-3">
                                                    <div className="text-rose-500 mt-0.5"><AlertCircle size={16} /></div>
                                                    <div>
                                                        <p className="text-xs font-bold text-rose-700">Falha na Publicação</p>
                                                        <p className="text-[11px] text-rose-600 leading-snug mt-0.5">Ocorreu um erro ao publicar esta vaga. Verifique a conexão ou tente novamente.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedSchedule.job.image_url || selectedSchedule.job.file_url ? (
                                                <div className="mb-3 rounded-lg overflow-hidden bg-slate-100">
                                                    <img src={selectedSchedule.job.image_url || selectedSchedule.job.file_url} alt="Vaga" className="w-full h-auto object-contain max-h-[200px]" />
                                                </div>
                                            ) : null}
                                            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium leading-snug">
                                                {(() => {
                                                    const text = generateJobText(selectedSchedule.job);
                                                    return text.split(/(\*[^*]+\*)/g).map((part, index) => {
                                                        if (part.startsWith('*') && part.endsWith('*')) {
                                                            return <strong key={index}>{part.slice(1, -1)}</strong>;
                                                        }
                                                        return part;
                                                    });
                                                })()}
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
