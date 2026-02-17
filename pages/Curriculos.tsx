
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useFeedback } from '../contexts/FeedbackContext';
import {
    Search, Filter, Eye, MoreHorizontal, Download, Phone, Mail,
    MapPin, Calendar, Clock, Briefcase, FileText, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, AlertCircle, Edit, Save, History, Printer
} from 'lucide-react';
import { ResumePreviewModal } from '../components/Resumes/ResumePreviewModal';
import { BlockCandidateModal } from '../components/modals/BlockCandidateModal';
import { NoteViewModal } from '../components/modals/NoteViewModal';
import { ContactModal } from '../components/modals/ContactModal';

// --- Interfaces ---

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

    status: 'Ativo' | 'Bloqueado' | 'Válido'; // Supporting legacy 'Válido'
    note: string; // New Note
    created_at: string;
    // Computed for display
    age?: number;
}

interface Job {
    id: string;
    title: string;
    code?: string;
    status: string;
    folder_company_id: string; // Mapped from DB column
}

// --- Helper Functions ---

const calculateAge = (birthDate: string) => {
    if (!birthDate) return undefined;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString('pt-BR'),
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
};

const formatPhone = (phone: string) => {
    // Remove +55 and format as (XX) XXXXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
        // 55XXXXXXXXXXX -> (XX) XXXXX-XXXX
        return cleaned.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
        // XXXXXXXXXXX -> (XX) XXXXX-XXXX
        return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return phone; // Return as-is if doesn't match expected format
};

export const Curriculos: React.FC = () => {
    const { user, logOperatorAction } = useAuth();
    const { toast } = useFeedback();

    // Helper to match existing showToast usages (message, type)
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        toast({ message, type, duration: 3000 });
    };

    // Data State
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]); // Active jobs
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Actions State
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewInitialTab, setPreviewInitialTab] = useState<'dados' | 'vagas' | 'historico'>('dados');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const [statusForm, setStatusForm] = useState({ status: 'Ativo', note: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false); // Summary Modal State

    // Contact Modal State
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedContactPhone, setSelectedContactPhone] = useState('');
    const [selectedContactName, setSelectedContactName] = useState('');

    // Expand Extras
    const [expandedExtras, setExpandedExtras] = useState<string | null>(null);

    // Fetch Data
    const fetchCandidates = async (useCache = true) => {
        // Only use cache for initial view (Page 1, no search) to prevent flashing on nav back
        const canUseCache = useCache && page === 1 && !searchTerm;

        // Try load from cache first
        if (canUseCache) {
            const cachedData = sessionStorage.getItem('candidates_cache');
            const cachedCount = sessionStorage.getItem('candidates_count');
            if (cachedData && cachedCount) {
                setCandidates(JSON.parse(cachedData));
                setTotalCount(parseInt(cachedCount));
                setLoading(false); // Show cached data immediately
            } else {
                setLoading(true);
            }
        } else {
            setLoading(true);
        }

        try {
            let query = supabase
                .from('candidates')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,cargo_principal.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
            }

            const { data, error, count } = await query;

            if (error) throw error;

            const formattedData = (data || []).map(c => ({
                ...c,
                age: calculateAge(c.birth_date),
                cargos_extras: Array.isArray(c.cargos_extras) ? c.cargos_extras : []
            }));

            setCandidates(formattedData);
            setTotalCount(count || 0);

            // Update cache
            sessionStorage.setItem('candidates_cache', JSON.stringify(formattedData));
            sessionStorage.setItem('candidates_count', (count || 0).toString());

        } catch (error) {
            console.error('Error fetching candidates:', error);
            showToast('Erro ao carregar currículos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        const { data } = await supabase.from('jobs').select('id, title, code, status, folder_company_id').eq('status', 'active');
        if (data) setJobs(data as Job[]);
    };

    useEffect(() => {
        if (user) {
            fetchCandidates();
            fetchJobs();
        }
    }, [user, page, searchTerm]); // Search triggers re-fetch

    // Handlers
    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        showToast('Email copiado!', 'success');
    };



    // ... imports

    // ... (existing code top)

    // Modals State
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState('');
    const [candidateToBlock, setCandidateToBlock] = useState<Candidate | null>(null);

    // ... (fetchCandidates, handleDeletes, etc keep same)

    const handleConfirmBlock = async (reason: string) => {
        if (!candidateToBlock) return;

        setIsSubmitting(true);
        try {
            // 1. Update Candidate Status
            console.log('[DEBUG] Updating candidate status...', { id: candidateToBlock.id, status: 'Bloqueado' });
            const { error: updateError } = await supabase
                .from('candidates')
                .update({
                    status: 'Bloqueado',
                    // note: reason, // Removed to preserve existing note (Nota Basica)
                    updated_at: new Date().toISOString()
                })
                .eq('id', candidateToBlock.id);

            if (updateError) {
                console.error('[ERROR] Failed to update candidate status:', updateError);
                throw updateError;
            }
            console.log('[DEBUG] Candidate status updated successfully');

            // 2. Add History Entry
            console.log('[DEBUG] Inserting history entry...');
            const { error: historyError } = await supabase
                .from('candidate_history')
                .insert({
                    candidate_id: candidateToBlock.id,
                    action: 'Bloqueado',
                    description: reason,
                    created_at: new Date().toISOString()
                });

            if (historyError) {
                console.error('[ERROR] Failed to insert history:', historyError);
                // Don't throw, just log
            } else {
                console.log('[DEBUG] History entry inserted successfully');
            }

            // 3. Log Operator Action
            console.log('[DEBUG] Logging operator action...');
            await logOperatorAction('UPDATE', {
                candidate_id: candidateToBlock.id,
                action: 'BLOCK_CANDIDATE',
                reason
            });
            console.log('[DEBUG] Operator action logged successfully');

            showToast('Candidato bloqueado com sucesso', 'success');
            setIsBlockModalOpen(false);
            setCandidateToBlock(null);
            fetchCandidates(false); // Refresh list
        } catch (error) {
            console.error('[ERROR] Error blocking candidate:', error);
            showToast('Erro ao bloquear candidato', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (candidate: Candidate, newStatus: string) => {
        if (newStatus === 'Bloqueado') {
            setCandidateToBlock(candidate);
            setIsBlockModalOpen(true);
        } else {
            // Update immediately to Ativo/Válido if not Blocked
            try {
                const { error } = await supabase
                    .from('candidates')
                    .update({ status: 'Ativo', updated_at: new Date().toISOString() })
                    .eq('id', candidate.id);
                if (error) throw error;

                // Log Unblock History
                if (candidate.status === 'Bloqueado') {
                    await supabase.from('candidate_history').insert({
                        candidate_id: candidate.id,
                        action: 'Desbloqueado',
                        description: 'Status alterado manualmente para Ativo',
                        created_at: new Date().toISOString()
                    });
                }

                // Log Operator Action
                await logOperatorAction('UPDATE', {
                    candidate_id: candidate.id,
                    action: 'UNBLOCK_CANDIDATE',
                    previous_status: candidate.status
                });

                showToast('Status atualizado para Ativo', 'success');
                fetchCandidates(false);
            } catch (error) {
                console.error('Error updating status:', error);
                showToast('Erro ao atualizar status', 'error');
            }
        }
    };

    const handleViewNote = async (candidate: Candidate) => {
        let noteToDisplay = candidate.note || '';

        if (candidate.status === 'Bloqueado') {
            try {
                // Fetch latest block reason
                const { data: historyData, error } = await supabase
                    .from('candidate_history')
                    .select('description')
                    .eq('candidate_id', candidate.id)
                    .eq('action', 'Bloqueado') // Assuming 'Bloqueado' is the action name used in handleStatusChange log
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (historyData?.description) {
                    const blockReason = historyData.description;
                    const separator = "\n---------------------------------------\n";
                    const blockPrefix = "Bloqueio: ";

                    if (noteToDisplay.includes(separator)) {
                        // Update existing block section
                        const parts = noteToDisplay.split(separator);
                        noteToDisplay = `${parts[0]}${separator}${blockPrefix}${blockReason}`;
                    } else {
                        // Append new block section
                        // If note is empty, maybe just show the block reason or prefix with "Nota basica: (vazia)"?
                        // User requested: "Nota basica: [conteudo]\n---\nBloqueio: [motivo]"
                        const basicNote = noteToDisplay ? `Nota basica: ${noteToDisplay}` : "Nota basica: ";
                        noteToDisplay = `${basicNote}${separator}${blockPrefix}${blockReason}`;
                    }
                }
            } catch (err) {
                console.error('Error fetching block history:', err);
            }
        }

        setSelectedNote(noteToDisplay);
        setSelectedCandidate(candidate); // For name display
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = async (note: string) => {
        if (!selectedCandidate) return;

        try {
            const { error } = await supabase
                .from('candidates')
                .update({ note, updated_at: new Date().toISOString() })
                .eq('id', selectedCandidate.id);

            if (error) throw error;

            // Log Operator Action
            await logOperatorAction('UPDATE', {
                candidate_id: selectedCandidate.id,
                action: 'UPDATE_NOTE',
                note_snippet: note.substring(0, 50) + (note.length > 50 ? '...' : '')
            });

            // Update local state
            setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? { ...c, note } : c));
            setSelectedCandidate(prev => prev ? { ...prev, note } : null);
            setSelectedNote(note);

            showToast('Nota salva automaticamente', 'success');
        } catch (error) {
            console.error('Error saving note:', error);
            showToast('Erro ao salvar nota', 'error');
        }
    };

    const handleLinkJob = async (candidateId: string, jobId: string) => {
        try {
            // Check if already applied
            const { data: existing } = await supabase
                .from('job_applications')
                .select('id')
                .eq('job_id', jobId)
                .eq('candidate_id', candidateId)
                .single();

            if (existing) {
                showToast('Candidato já vinculado a esta vaga.', 'warning');
                return;
            }

            // Find job to get company_id
            const job = jobs.find(j => j.id === jobId);
            if (!job) {
                showToast('Vaga não encontrada.', 'error');
                return;
            }

            const { error } = await supabase.from('job_applications').insert({
                job_id: jobId,
                candidate_id: candidateId,
                // company_id is now optional via SQL migration (removed here to avoid FK error)
                status: 'pending',
                origin: 'operator', // Track that operator linked this
                applied_at: new Date().toISOString()
            });

            if (error) throw error;
            showToast('Candidato vinculado com sucesso!', 'success');
        } catch (error) {
            console.error('Error linking job:', error);
            showToast('Erro ao vincular candidato', 'error');
            throw error;
        }
    };

    const handlePrintResume = (url: string) => {
        if (!url) return;
        const isPdf = url.toLowerCase().includes('.pdf');

        if (isPdf) {
            window.open(url, '_blank');
        } else {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Imprimir Currículo</title>
                            <style>
                                @page { size: A4; margin: 0; }
                                body { margin: 0; padding: 0; width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; overflow: hidden; }
                                img { width: 100%; height: 100%; object-fit: contain; }
                            </style>
                        </head>
                        <body>
                            <img src="${url}" onload="window.print();" />
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, função, email ou telefone..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:text-gray-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Could add more filters here later */}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                <th className="p-4 text-center w-16">#</th>
                                <th className="p-3 text-left w-24">Data</th>
                                <th className="p-3 text-left">Nome</th>
                                <th className="p-3 text-center w-16">Sexo</th>
                                <th className="p-3 text-center w-16">Idade</th>
                                <th className="p-3 text-left">Local</th>
                                <th className="p-3 text-left w-28">Contato</th>
                                <th className="p-3 text-left">Função</th>
                                <th className="p-3 text-left w-32">Status</th>
                                <th className="p-4 text-center">Nota</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center">
                                        <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                                    </td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center text-slate-400">
                                        Nenhum currículo encontrado.
                                    </td>
                                </tr>
                            ) : (
                                candidates.map((row, index) => (
                                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-2 text-center text-slate-400 font-mono text-xs whitespace-nowrap">
                                            {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="p-2 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            <span className="font-semibold">{formatDate(row.created_at).date}</span>
                                        </td>
                                        <td className="p-2 max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">
                                            <div className="truncate" title={row.name}>
                                                <span className="font-semibold text-xs text-slate-800 dark:text-gray-100">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-2 text-center whitespace-nowrap">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.sex?.toLowerCase() === 'masculino' || row.sex === 'M'
                                                ? 'bg-blue-50 text-blue-600'
                                                : row.sex?.toLowerCase() === 'feminino' || row.sex === 'F'
                                                    ? 'bg-pink-50 text-pink-600'
                                                    : 'bg-slate-50 text-slate-500'
                                                }`}>
                                                {row.sex?.toLowerCase() === 'masculino' ? 'M' : row.sex?.toLowerCase() === 'feminino' ? 'F' : '-'}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {row.age || '-'}
                                        </td>
                                        <td className="p-2 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                                            <div className="truncate text-xs text-slate-600 dark:text-slate-300" title={`${row.city || ''}${row.state ? ` / ${row.state}` : ''}`}>
                                                {row.city || '-'}{row.state ? ` / ${row.state}` : ''}
                                            </div>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            {row.phone ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedContactPhone(row.phone);
                                                        setSelectedContactName(row.name);
                                                        setIsContactModalOpen(true);
                                                    }}
                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                                                >
                                                    {formatPhone(row.phone)}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-2 max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                                            <div className="truncate text-xs text-slate-700 dark:text-slate-200 font-medium" title={row.cargo_principal || 'Não informado'}>
                                                {row.cargo_principal || 'Não informado'}
                                            </div>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <select
                                                value={(row.status === 'Válido' ? 'Ativo' : row.status) || 'Ativo'}
                                                onChange={(e) => handleStatusChange(row, e.target.value)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1 transition-colors ${(row.status === 'Bloqueado')
                                                    ? 'text-red-600 border-red-200 bg-red-50 focus:ring-red-500'
                                                    : 'text-green-600 border-green-200 bg-green-50 focus:ring-green-500'
                                                    }`}
                                            >
                                                <option value="Ativo">Ativo</option>
                                                <option value="Bloqueado">Bloqueado</option>
                                            </select>
                                        </td>
                                        <td className="p-2 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewNote(row)}
                                                className={`p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${row.note ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 hover:text-slate-500'
                                                    }`}
                                                title={row.note || 'Sem nota'}
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                        <td className="p-2 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCandidate(row);
                                                        setPreviewInitialTab('historico');
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                                                    title="Histórico"
                                                >
                                                    <History size={14} /> Histórico
                                                </button>

                                                <a
                                                    href={row.resume_url}
                                                    download={`curriculo_${row.name.replace(/\s+/g, '_')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver / Baixar Currículo"
                                                >
                                                    <Eye size={18} />
                                                </a>

                                                <button
                                                    onClick={() => handlePrintResume(row.resume_url)}
                                                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Imprimir Currículo"
                                                >
                                                    <Printer size={18} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={20} className="text-slate-500" />
                        </button>
                        <span className="text-sm text-slate-500 font-medium">
                            Página {page} de {Math.ceil(totalCount / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            onClick={() => setPage(p => (p * ITEMS_PER_PAGE < totalCount ? p + 1 : p))}
                            disabled={page * ITEMS_PER_PAGE >= totalCount}
                            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={20} className="text-slate-500" />
                        </button>
                    </div>
                )}
            </div>

            {/* Resume Preview Modal */}
            <ResumePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                candidate={selectedCandidate}
                onStatusUpdate={(c, s) => {
                    if (c) handleStatusChange({ ...selectedCandidate!, id: c } as any, s);
                }}
                availableJobs={jobs}
                onLinkJob={handleLinkJob}
                initialTab={previewInitialTab}
            />

            <BlockCandidateModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                onConfirm={handleConfirmBlock}
                isLoading={isSubmitting}
                candidateName={candidateToBlock?.name || ''}
            />

            <NoteViewModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                note={selectedNote}
                candidateName={selectedCandidate?.name || ''}
                onSave={handleSaveNote}
            />

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                phone={selectedContactPhone}
                candidateName={selectedContactName}
            />

            {/* Candidate Summary Modal */}
            {isSummaryModalOpen && selectedCandidate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSummaryModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-scaleUp">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Resumo do Candidato</h3>
                            <button onClick={() => setIsSummaryModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{selectedCandidate.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Idade</label>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{selectedCandidate.age} anos</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Sexo</label>
                                    <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">{selectedCandidate.sex}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Local</label>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{selectedCandidate.city} / {selectedCandidate.state}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Função Principal</label>
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold inline-block">
                                    {selectedCandidate.cargo_principal}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Funções Extras</label>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedCandidate.cargos_extras || []).map((role, i) => (
                                        <span key={i} className="px-3 py-1 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                            {role}
                                        </span>
                                    ))}
                                    {(selectedCandidate.cargos_extras || []).length === 0 && (
                                        <span className="text-slate-400 text-sm italic">Nenhuma função extra.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <a
                                href={selectedCandidate.resume_url}
                                download={`curriculo_${selectedCandidate.name.replace(/\s+/g, '_')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <Download size={18} />
                                Baixar Currículo
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Curriculos;
