import React, { useState, useEffect } from 'react';
import {
    X, Mail, Phone, User, MapPin, Briefcase, Info, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
    age?: number;
}

interface CandidateReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onStatusUpdate: (candidateId: string, status: string) => void;
}

export const CandidateReviewModal: React.FC<CandidateReviewModalProps> = ({
    isOpen,
    onClose,
    candidate,
    onStatusUpdate
}) => {
    const [activeTab, setActiveTab] = useState<'resumo' | 'dados'>('dados');
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'participando' | 'aprovado' | 'rejeitado'>('participando');

    useEffect(() => {
        if (isOpen) {
            setActiveTab('dados');
            setFilterStatus('participando');
            fetchHistory();
        }
    }, [isOpen, candidate]);

    const fetchHistory = async () => {
        if (!candidate?.id) return;

        setLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select(`
                    *,
                    jobs:job_id (
                        id,
                        title,
                        code
                    )
                `)
                .eq('candidate_id', candidate.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleUpdateLocalStatus = async (applicationId: string, newStatus: string) => {
        // Call parent handler (which expects candidate ID generally, but we confirmed it passes application ID for job apps?) 
        // Wait, looking at Candidatos.tsx: handleUpdateStatus(applicationId, newStatus)
        // So we should pass applicationId (which is Item ID here)

        onStatusUpdate(applicationId, newStatus);

        // Update local state to reflect change immediately
        setHistory(prev => prev.map(item =>
            item.id === applicationId ? { ...item, status: newStatus } : item
        ));
    };

    if (!isOpen || !candidate) return null;

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
                            <a
                                href={candidate.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-full flex items-center justify-center p-4 cursor-pointer hover:bg-slate-200/20 transition-colors"
                                title="Clique para baixar/abrir original"
                            >
                                <img
                                    src={candidate.resume_url}
                                    alt="Resume"
                                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                                />
                            </a>
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

                        {/* TABS HEADER */}
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
                                onClick={() => setActiveTab('resumo')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'resumo'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 transform scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Info size={14} /> Resumo
                            </button>
                        </div>

                        {/* TAB CONTENT Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/30">

                            {/* TAB: DADOS */}
                            {activeTab === 'dados' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-start">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Nome:</span>
                                                <span className="text-slate-800 dark:text-slate-200 font-medium">{candidate.name}</span>
                                            </div>

                                            <div className="flex items-start">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Local:</span>
                                                <span className="text-slate-800 dark:text-slate-200 font-medium">
                                                    {candidate.city}{candidate.state ? ` / ${candidate.state}` : ''}
                                                </span>
                                            </div>

                                            <div className="flex items-start">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Idade:</span>
                                                <span className="text-slate-800 dark:text-slate-200 font-medium">{candidate.age || 'N/A'}</span>
                                            </div>

                                            <div className="flex items-start">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Sexo:</span>
                                                <span className="text-slate-800 dark:text-slate-200 font-medium">{candidate.sex || 'N/A'}</span>
                                            </div>

                                            <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>

                                            <div className="flex items-start">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Função Principal:</span>
                                                <span className="text-slate-800 dark:text-slate-200 font-medium">{candidate.cargo_principal || 'N/A'}</span>
                                            </div>

                                            {candidate.cargos_extras && candidate.cargos_extras.length > 0 && candidate.cargos_extras.map((extra, idx) => (
                                                <div key={idx} className="flex items-start">
                                                    <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Função extra {idx + 1}:</span>
                                                    <span className="text-slate-800 dark:text-slate-200 font-medium">{extra}</span>
                                                </div>
                                            ))}

                                            <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>

                                            <div className="flex items-start">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Contato:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-800 dark:text-slate-200 font-medium">{candidate.phone}</span>
                                                    <a
                                                        href={`https://wa.me/${candidate.phone?.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-500 hover:text-green-600 transition-colors"
                                                        title="Abrir WhatsApp"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">Email:</span>
                                                <span className="text-slate-800 dark:text-slate-200 font-medium break-all">{candidate.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: RESUMO */}
                            {activeTab === 'resumo' && (() => {
                                // Filters state (local to this render, but we need state to persist between clicks)
                                // We need to move this state up to the component level, but for now let's use a nested component or just use the state we added?
                                // Wait, I can't add state inside this conditional render block properly if it wasn't there before.
                                // I need to move the state definition to the top of the component first.
                                // But I can't do that in this replace_file_content call easily without replacing the whole file or multiple chunks.
                                // Actually, I can use a local variable for the derived data, but the *selected* filter needs to be state.

                                // CALCULATE COUNTS
                                const totalApplications = history.length;
                                const approvedCount = history.filter(h =>
                                    h.status?.toLowerCase().includes('aprovado') ||
                                    h.status?.toLowerCase().includes('contratado')
                                ).length;
                                const rejectedCount = history.filter(h =>
                                    h.status?.toLowerCase().includes('rejeitado') ||
                                    h.status?.toLowerCase().includes('recusado') ||
                                    h.status?.toLowerCase().includes('reprovado')
                                ).length;

                                // Get active/participating jobs (not approved or rejected)
                                const activeJobsCount = history.filter(h => {
                                    const status = h.status?.toLowerCase() || '';
                                    return !status.includes('aprovado') &&
                                        !status.includes('contratado') &&
                                        !status.includes('rejeitado') &&
                                        !status.includes('recusado') &&
                                        !status.includes('reprovado');
                                }).length;

                                // Filter History based on selection
                                const filteredHistory = history.filter(h => {
                                    const status = h.status?.toLowerCase() || '';
                                    const isApproved = status.includes('aprovado') || status.includes('contratado');
                                    const isRejected = status.includes('rejeitado') || status.includes('recusado') || status.includes('reprovado');
                                    const isPending = !isApproved && !isRejected;

                                    if (filterStatus === 'participando') return isPending;
                                    if (filterStatus === 'aprovado') return isApproved;
                                    if (filterStatus === 'rejeitado') return isRejected;
                                    return true; // 'all'
                                });

                                return (
                                    <div className="space-y-4 animate-fadeIn">
                                        {/* Statistics Cards / Filters */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {/* PARTICIPANDO */}
                                            <button
                                                onClick={() => setFilterStatus('participando')}
                                                className={`rounded-xl border p-3 shadow-sm transition-all text-left flex flex-col justify-between h-24 ${filterStatus === 'participando'
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 ring-1 ring-blue-500'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${filterStatus === 'participando' ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                                        }`}>
                                                        <Briefcase size={14} />
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${filterStatus === 'participando' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
                                                        }`}>Participando</span>
                                                </div>
                                                <div className={`text-2xl font-bold ${filterStatus === 'participando' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {activeJobsCount}
                                                </div>
                                            </button>

                                            {/* APROVADO */}
                                            <button
                                                onClick={() => setFilterStatus('aprovado')}
                                                className={`rounded-xl border p-3 shadow-sm transition-all text-left flex flex-col justify-between h-24 ${filterStatus === 'aprovado'
                                                    ? 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-500 ring-1 ring-green-500'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${filterStatus === 'aprovado' ? 'bg-green-500 text-white' : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                                        }`}>
                                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                            <path d="M20 6L9 17l-5-5" />
                                                        </svg>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${filterStatus === 'aprovado' ? 'text-green-700 dark:text-green-300' : 'text-slate-500 dark:text-slate-400'
                                                        }`}>Aprovado</span>
                                                </div>
                                                <div className={`text-2xl font-bold ${filterStatus === 'aprovado' ? 'text-green-700 dark:text-green-300' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {approvedCount}
                                                </div>
                                            </button>

                                            {/* REJEITADO */}
                                            <button
                                                onClick={() => setFilterStatus('rejeitado')}
                                                className={`rounded-xl border p-3 shadow-sm transition-all text-left flex flex-col justify-between h-24 ${filterStatus === 'rejeitado'
                                                    ? 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-500 ring-1 ring-red-500'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${filterStatus === 'rejeitado' ? 'bg-red-500 text-white' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                                                        }`}>
                                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <line x1="8" y1="8" x2="16" y2="16" />
                                                            <line x1="16" y1="8" x2="8" y2="16" />
                                                        </svg>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${filterStatus === 'rejeitado' ? 'text-red-700 dark:text-red-300' : 'text-slate-500 dark:text-slate-400'
                                                        }`}>Rejeitado</span>
                                                </div>
                                                <div className={`text-2xl font-bold ${filterStatus === 'rejeitado' ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {rejectedCount}
                                                </div>
                                            </button>

                                            {/* TODOS */}
                                            <button
                                                onClick={() => setFilterStatus('all')}
                                                className={`rounded-xl border p-3 shadow-sm transition-all text-left flex flex-col justify-between h-24 ${filterStatus === 'all'
                                                    ? 'bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-500 ring-1 ring-slate-400'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${filterStatus === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                        <Briefcase size={14} />
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${filterStatus === 'all' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                                                        }`}>Todos</span>
                                                </div>
                                                <div className={`text-2xl font-bold ${filterStatus === 'all' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {totalApplications}
                                                </div>
                                            </button>
                                        </div>

                                        {/* Filters active indicator */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                {filterStatus === 'participando' && <span className="text-blue-600">Vagas em Participação</span>}
                                                {filterStatus === 'aprovado' && <span className="text-green-600">Vagas Aprovadas</span>}
                                                {filterStatus === 'rejeitado' && <span className="text-red-600">Vagas Rejeitadas</span>}
                                                {filterStatus === 'all' && <span className="text-slate-600 dark:text-slate-300">Todas as Vagas</span>}
                                                <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                    {filteredHistory.length}
                                                </span>
                                            </h3>
                                        </div>

                                        {/* Jobs List */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                            {filteredHistory.length > 0 ? (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {filteredHistory.map((item, idx) => {
                                                        const isPending = !item.status?.toLowerCase().includes('aprovado') &&
                                                            !item.status?.toLowerCase().includes('contratado') &&
                                                            !item.status?.toLowerCase().includes('rejeitado') &&
                                                            !item.status?.toLowerCase().includes('recusado') &&
                                                            !item.status?.toLowerCase().includes('reprovado');

                                                        return (
                                                            <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                                                                {item.jobs?.title || 'Vaga sem título'}
                                                                            </h4>
                                                                            {item.jobs?.code && (
                                                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono">
                                                                                    #{item.jobs.code}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                                            <span className="flex items-center gap-1">
                                                                                <Briefcase size={12} />
                                                                                Aplicado em {new Date(item.created_at).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Actions or Status Badge */}
                                                                    <div className="flex items-center gap-2">
                                                                        {isPending && filterStatus === 'participando' ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => handleUpdateLocalStatus(item.id, 'rejected')}
                                                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                                                                    title="Reprovar Candidato"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleUpdateLocalStatus(item.id, 'approved')}
                                                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
                                                                                    title="Aprovar Candidato"
                                                                                >
                                                                                    <Check size={16} />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.status === 'approved' || item.status === 'hired'
                                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                                : item.status === 'rejected' || item.status === 'declined'
                                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                                }`}>
                                                                                {item.status === 'approved' ? 'Aprovado' :
                                                                                    item.status === 'rejected' ? 'Rejeitado' :
                                                                                        item.status === 'pending' ? 'Pendente' : item.status}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 px-6">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <h3 className="text-slate-900 dark:text-white font-medium mb-1">Nenhuma vaga encontrada</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                        Este candidato não possui vagas {filterStatus === 'all' ? 'no histórico' : `com status "${filterStatus}"`}.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CandidateReviewModal;
