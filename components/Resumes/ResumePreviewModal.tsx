import React, { useState, useEffect } from 'react';
import {
    X, Download, ExternalLink, Calendar, MapPin, Briefcase, Mail, Phone, User,
    CheckCircle, Search, Plus, Info, Clock, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useFeedback } from '../../contexts/FeedbackContext';
import JobDetailModal from '../public/modals/JobDetailModal';
import { SuccessModal } from '../SuccessModal'; // Import SuccessModal

interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    sex: string;
    birth_date: string;
    cargo_principal: string;
    cargos_extras: string[];
    resume_url: string;
    // Computed
    age?: number;
}

interface Job {
    id: string;
    title: string;
    code?: string;
    status: string;
    // Expanded for detail view
    description?: string;
    requirements?: string[];
    benefits?: string[];
    activities?: string[];
    location?: string;
    salary?: string;
    postedAt?: string;
    company?: string;
}

interface JobApplication {
    id: string;
    job_id: string;
    applied_at: string;
    status: string;
    origin?: 'candidate' | 'operator';
    jobs: {
        title: string;
        code: string;
    };
}

interface ResumePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onStatusUpdate: (candidateId: string, status: string) => void;
    availableJobs?: Job[];
    onLinkJob?: (candidateId: string, jobId: string) => void;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
    isOpen,
    onClose,
    candidate,
    onStatusUpdate,
    availableJobs = [],
    onLinkJob
}) => {
    const [activeTab, setActiveTab] = useState<'dados' | 'vagas' | 'historico'>('dados');
    const [jobSearch, setJobSearch] = useState('');
    const [linkingJobId, setLinkingJobId] = useState<string | null>(null); // Track specific job being linked
    const [isLinking, setIsLinking] = useState(false); // Global locking to prevent double clicks

    const { toast } = useFeedback();
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        toast({ message, type, duration: 3000 });
    };

    // History State
    const [history, setHistory] = useState<JobApplication[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Job Detail Modal State
    const [viewingJob, setViewingJob] = useState<Job | null>(null);
    const [loadingJobDetail, setLoadingJobDetail] = useState(false);

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (isOpen && candidate) {
            // Fetch history always to filter available jobs in 'vagas' tab too
            fetchHistory();
        }
    }, [isOpen, candidate]); // Run once when opened/candidate changes

    const fetchHistory = async () => {
        if (!candidate) return;
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select('*, jobs(title, code)')
                .eq('candidate_id', candidate.id)
                .order('applied_at', { ascending: false });

            if (error) throw error;
            setHistory(data as any || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleLinkJob = async (jobId: string) => {
        if (!jobId || !candidate || !onLinkJob) return;

        setIsLinking(true);
        setLinkingJobId(jobId);

        try {
            await onLinkJob(candidate.id, jobId);

            // Optimistic update: Add to history immediately so UI updates
            const jobDetails = availableJobs.find(j => j.id === jobId);
            const optimisticApp: any = {
                id: `temp_${Date.now()}`,
                job_id: jobId,
                candidate_id: candidate.id,
                status: 'pending',
                origin: 'operator',
                applied_at: new Date().toISOString(),
                jobs: {
                    title: jobDetails?.title || 'Carregando...',
                    code: jobDetails?.code || ''
                }
            };

            setHistory(prev => [optimisticApp, ...prev]);

            // Show Success Modal
            setShowSuccessModal(true);

            // Refresh history in background to confirm data
            await fetchHistory();

        } catch (error: any) {
            console.error("Link error inside modal", error);
            showToast(error.message || 'Erro ao vincular candidato', 'error');
        } finally {
            setIsLinking(false);
            setLinkingJobId(null);
        }
    };

    const handleOpenJobDetail = async (jobId: string) => {
        setLoadingJobDetail(true);
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (error) throw error;

            // Transform if needed to match Job interface expected by JobDetailModal
            const formattedJob: Job = {
                ...data,
                requirements: data.requirements || [],
                benefits: data.benefits || [],
                activities: data.activities || [],
            };

            setViewingJob(formattedJob);

        } catch (error) {
            console.error("Error fetching job details:", error);
        } finally {
            setLoadingJobDetail(false);
        }
    }

    if (!isOpen || !candidate) return null;

    const filteredJobs = availableJobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
            (job.code && job.code.toLowerCase().includes(jobSearch.toLowerCase()));

        // We now show all matching active jobs, and the UI handles the "Linked" state
        return matchesSearch;
    });

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 text-slate-600 dark:text-slate-300">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-scaleIn border border-slate-200 dark:border-slate-800">

                    {/* LEFT SIDE: Resume Preview */}
                    <div className="flex-1 lg:w-1/2 bg-slate-100 dark:bg-slate-950/50 relative flex flex-col h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">


                        {candidate.resume_url?.endsWith('.pdf') ? (
                            <iframe
                                src={`${candidate.resume_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full"
                                title="Resume Preview"
                            />
                        ) : (
                            <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                                <img
                                    src={candidate.resume_url}
                                    alt="Resume"
                                    className="max-w-full shadow-lg rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: Info & Actions */}
                    <div className="lg:w-1/2 bg-white dark:bg-slate-900 flex flex-col h-1/2 lg:h-full">
                        {/* Header / Summary */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start shrink-0 bg-white dark:bg-slate-900 z-10">
                            <div className="flex-1 pr-4">
                                <h2 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{candidate.name}</h2>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-1 items-center">
                                    {candidate.age && <span className="flex items-center gap-1"><User size={12} /> {candidate.age} anos</span>}
                                    {(candidate.city || candidate.state) && <span className="flex items-center gap-1"><MapPin size={12} /> {candidate.city}{candidate.state ? `/${candidate.state}` : ''}</span>}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {candidate.cargo_principal && (
                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide">
                                            {candidate.cargo_principal}
                                        </span>
                                    )}
                                    {candidate.cargos_extras && candidate.cargos_extras.map((extra, idx) => (
                                        <span key={idx} className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide border-l border-slate-200 dark:border-slate-700 pl-2">
                                            {extra}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hidden lg:block p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* TABS HEADER - UPDATED TO BUTTON STYLE */}
                        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 py-3 gap-2 shrink-0 bg-white dark:bg-slate-900">
                            <button
                                onClick={() => setActiveTab('dados')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'dados'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 transform scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <User size={14} /> Dados
                            </button>
                            <button
                                onClick={() => setActiveTab('vagas')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'vagas'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 transform scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Briefcase size={14} /> Vagas
                            </button>
                            <button
                                onClick={() => setActiveTab('historico')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'historico'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 transform scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Clock size={14} /> Histórico
                            </button>
                        </div>

                        {/* TAB CONTENT Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/30">

                            {/* TAB: DADOS */}
                            {activeTab === 'dados' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                                        {/* Download Button (Subtle) */}
                                        <a
                                            href={candidate.resume_url}
                                            download={`curriculo_${candidate.name.replace(/\s+/g, '_')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download size={14} /> Baixar Currículo Original
                                        </a>

                                        <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

                                        {/* Contact Info */}
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                Informações de Contato
                                            </h3>
                                            {candidate.phone && (
                                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                                            <Phone size={14} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 leading-none mb-1">WhatsApp / Telefone</span>
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight">{candidate.phone}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => { navigator.clipboard.writeText(candidate.phone); }} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50" title="Copiar"><div className="w-3.5 h-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></div></button>
                                                        <a href={`https://wa.me/${candidate.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-green-500 hover:text-green-600 transition-colors rounded-md hover:bg-green-100/50 dark:hover:bg-green-900/30" title="Abrir WhatsApp"><ExternalLink size={14} /></a>
                                                    </div>
                                                </div>
                                            )}
                                            {candidate.email && (
                                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <Mail size={14} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 leading-none mb-1">Email</span>
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight truncate max-w-[200px]" title={candidate.email}>{candidate.email}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => { navigator.clipboard.writeText(candidate.email); }} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50" title="Copiar"><div className="w-3.5 h-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></div></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: VAGAS */}
                            {activeTab === 'vagas' && onLinkJob && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                            <Briefcase size={14} className="text-blue-500" />
                                            Vincular a Vaga Ativa
                                        </h3>

                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Buscar vaga por nome ou código..."
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 active:scale-[0.99] transition-all"
                                                value={jobSearch}
                                                onChange={(e) => setJobSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className="h-[320px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                                            {filteredJobs.length > 0 ? (
                                                <div className="space-y-1">
                                                    {filteredJobs.map(job => {
                                                        const isAlreadyLinked = history.some(app => app.job_id === job.id);
                                                        const isLinkingThis = linkingJobId === job.id;

                                                        return (
                                                            <div
                                                                key={job.id}
                                                                className="w-full p-3 rounded-md text-xs transition-all flex items-center justify-between group bg-white dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                                                        {job.title}
                                                                    </span>
                                                                    {job.code && <span className="text-[10px] text-slate-400">Cód: {job.code}</span>}
                                                                </div>

                                                                {isAlreadyLinked ? (
                                                                    <button
                                                                        disabled
                                                                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-1.5 opacity-100 cursor-default"
                                                                    >
                                                                        <CheckCircle size={12} /> Vinculado
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleLinkJob(job.id)}
                                                                        disabled={isLinkingThis || isLinking} // Disable if linking ANY job, essentially
                                                                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                                                    >
                                                                        {isLinkingThis ? (
                                                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                                        ) : (
                                                                            <Plus size={12} />
                                                                        )}
                                                                        {isLinkingThis ? 'Vinculando...' : 'Vincular'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center p-4 text-center text-slate-400">
                                                    <Search size={24} className="opacity-20 mb-2" />
                                                    <span className="text-xs">Nenhuma vaga encontrada.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: HISTÓRICO */}
                            {activeTab === 'historico' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm min-h-[300px]">
                                        {loadingHistory ? (
                                            <div className="flex justify-center items-center h-[200px]">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
                                            </div>
                                        ) : history.length > 0 ? (
                                            <div className="space-y-3">
                                                {history.map((app) => (
                                                    <div key={app.id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                                        <div className="flex-1 min-w-0 pr-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                                                    {app.jobs?.title || 'Vaga desconhecida'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {app.jobs?.code && (
                                                                    <button
                                                                        onClick={() => handleOpenJobDetail(app.job_id)}
                                                                        className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors px-1.5 py-0.5 rounded cursor-pointer underline decoration-blue-300 underline-offset-2 flex items-center gap-1"
                                                                        title="Ver detalhes da vaga"
                                                                    >
                                                                        {app.jobs.code} <ExternalLink size={8} />
                                                                    </button>
                                                                )}
                                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                                    <Calendar size={10} /> {formatDateTime(app.applied_at)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {/* Status Badge */}
                                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide border ${app.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900' :
                                                                app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' :
                                                                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                                                                }`}>
                                                                {app.status === 'pending' ? 'Pendente' : app.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                                            </span>

                                                            {/* Origin Tag with Tooltip */}
                                                            <div className="relative group/tooltip">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform group-hover/tooltip:scale-110 cursor-help ${app.origin === 'operator'
                                                                    ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                                                                    : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                                    }`}>
                                                                    {app.origin === 'operator' ? 'O' : 'C'}
                                                                </div>

                                                                {/* Tooltip */}
                                                                <div className="absolute right-0 bottom-full mb-2 w-[180px] bg-slate-800 text-white text-[11px] p-2.5 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-20 text-center transform translate-y-1 group-hover/tooltip:translate-y-0">
                                                                    {app.origin === 'operator'
                                                                        ? 'O Candidato foi inserido via Operador'
                                                                        : 'O candidato enviou currículo'}
                                                                    <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-800"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                                                    <Info size={24} className="opacity-50" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhum histórico encontrado.</span>
                                                <p className="text-xs max-w-[200px] mt-1 opacity-70">Este candidato ainda não foi vinculado a nenhuma vaga.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Detail Modal Overlay */}
            <JobDetailModal
                isOpen={!!viewingJob}
                onClose={() => setViewingJob(null)}
                job={viewingJob}
                onApply={() => { }} // No apply action in admin view
                onReport={() => { }} // No report action in admin view
                showFooter={false}
                customFooter={
                    <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => setViewingJob(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Fechar</button>
                    </div>
                }
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message="Candidato vinculado à vaga com sucesso!"
                subMessage="O histórico foi atualizado."
                autoCloseDuration={3000}
            />
        </>
    );
};
