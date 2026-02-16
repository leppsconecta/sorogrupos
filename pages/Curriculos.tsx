
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useFeedback } from '../contexts/FeedbackContext';
import {
    Search, Filter, Trash2, Eye, MoreHorizontal, Download, Phone, Mail,
    MapPin, Calendar, Clock, Briefcase, FileText, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, AlertCircle, Edit, Save
} from 'lucide-react';
import { ResumePreviewModal } from '../components/Resumes/ResumePreviewModal';

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
    status: 'Válido' | 'Bloqueado'; // New Status
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
    return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
        .replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4'); // Simple formatter
};

export const Curriculos: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useFeedback();

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
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusForm, setStatusForm] = useState({ status: 'Válido', note: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Expand Extras
    const [expandedExtras, setExpandedExtras] = useState<string | null>(null);

    // Fetch Data
    const fetchCandidates = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('candidates')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,cargo_principal.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
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

        } catch (error) {
            console.error('Error fetching candidates:', error);
            showToast('Erro ao carregar currículos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        const { data } = await supabase.from('jobs').select('id, title, code, status').eq('status', 'active');
        if (data) setJobs(data);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este currículo? Esta ação não pode ser desfeita.')) return;

        try {
            const { error } = await supabase.from('candidates').delete().eq('id', id);
            if (error) throw error;
            showToast('Currículo excluído com sucesso', 'success');
            fetchCandidates();
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('Erro ao excluir', 'error');
        }
    };

    const openStatusModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setStatusForm({
            status: candidate.status || 'Válido',
            note: candidate.note || ''
        });
        setIsStatusModalOpen(true);
    };

    const handleSaveStatus = async () => {
        if (!selectedCandidate) return;

        if (statusForm.status === 'Bloqueado' && !statusForm.note.trim()) {
            showToast('É obrigatório adicionar uma nota ao bloquear um candidato', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('candidates')
                .update({
                    status: statusForm.status,
                    note: statusForm.note,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedCandidate.id);

            if (error) throw error;

            showToast('Status atualizado com sucesso', 'success');
            setIsStatusModalOpen(false);
            fetchCandidates();
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Erro ao atualizar status', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (candidate: Candidate, newStatus: string) => {
        if (newStatus === 'Bloqueado') {
            // Open modal to require note
            openStatusModal(candidate);
            setStatusForm({ status: 'Bloqueado', note: candidate.note || '' });
        } else {
            // Update immediately to Válido
            try {
                const { error } = await supabase
                    .from('candidates')
                    .update({ status: 'Válido', updated_at: new Date().toISOString() })
                    .eq('id', candidate.id);
                if (error) throw error;
                showToast('Status atualizado para Válido', 'success');
                fetchCandidates();
            } catch (error) {
                console.error('Error updating status:', error);
                showToast('Erro ao atualizar status', 'error');
            }
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

            const { error } = await supabase.from('job_applications').insert({
                job_id: jobId,
                candidate_id: candidateId,
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

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Banco de Currículos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie todos os candidatos cadastrados no sistema.</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">
                        Total: {totalCount}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, função ou email..."
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
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-4 text-center w-16">#</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Idade</th>
                                <th className="p-4">Local</th>
                                <th className="p-4">Função</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Nota</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center">
                                        <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                                    </td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-400">
                                        Nenhum currículo encontrado.
                                    </td>
                                </tr>
                            ) : (
                                candidates.map((row, index) => (
                                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4 text-center text-slate-400 font-mono text-xs">
                                            {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {formatDate(row.created_at)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 dark:text-gray-100">{row.name}</span>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    {/* Phone/Email below name for compactness if desired, or keep separate. 
                                                         User asked for 'Nome' column. I will keep contact info with name or separated?
                                                         "Candidato mude para nome". "Local: (endereço) adicione apenas a cidade / estado".
                                                         Let's keep name simple here.
                                                     */}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                            {row.age || 'N/A'}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                            {row.city || 'N/A'}{row.state ? ` / ${row.state}` : ''}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                                    {row.cargo_principal || 'Não informado'}
                                                </span>
                                                {row.cargos_extras && row.cargos_extras.length > 0 && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setExpandedExtras(expandedExtras === row.id ? null : row.id)}
                                                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                                                        >
                                                            +{row.cargos_extras.length}
                                                        </button>
                                                        {expandedExtras === row.id && (
                                                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 z-20 w-max max-w-[200px] animate-fadeIn">
                                                                <ul className="text-xs space-y-1.5 ">
                                                                    {row.cargos_extras.map((role, i) => (
                                                                        <li key={i} className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                                                                            <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                                                            {role}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={row.status || 'Válido'}
                                                onChange={(e) => handleStatusChange(row, e.target.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${(row.status || 'Válido') === 'Bloqueado'
                                                    ? 'text-red-600 border-red-200 bg-red-50 focus:ring-red-500'
                                                    : 'text-green-600 border-green-200 bg-green-50 focus:ring-green-500'
                                                    }`}
                                            >
                                                <option value="Válido">Válido</option>
                                                <option value="Bloqueado">Bloqueado</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openStatusModal(row)}
                                                className={`p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${row.note ? 'text-green-500' : 'text-slate-300'
                                                    }`}
                                                title={row.note || 'Adicionar nota'}
                                            >
                                                <FileText size={20} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedCandidate(row); setIsPreviewOpen(true); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                                >
                                                    <Eye size={16} /> Ver
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
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
                onStatusUpdate={(c, s) => c && handleStatusChange(c, s)}
                availableJobs={jobs}
                onLinkJob={handleLinkJob}
            />

            {/* Status & Note Modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsStatusModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-scaleUp">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Atualizar Status</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setStatusForm({ ...statusForm, status: 'Válido' })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${statusForm.status === 'Válido'
                                            ? 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-2'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                            }`}
                                    >
                                        Válido
                                    </button>
                                    <button
                                        onClick={() => setStatusForm({ ...statusForm, status: 'Bloqueado' })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${statusForm.status === 'Bloqueado'
                                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-2'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                            }`}
                                    >
                                        Bloqueado
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Nota / Observação {statusForm.status === 'Bloqueado' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                                    placeholder="Escreva uma observação sobre este candidato..."
                                    value={statusForm.note}
                                    onChange={e => setStatusForm({ ...statusForm, note: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleSaveStatus}
                                disabled={isSubmitting}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>Salvand...</>
                                ) : (
                                    <><Save size={18} /> Salvar Alterações</>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={() => setIsStatusModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <XCircle size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Curriculos;
