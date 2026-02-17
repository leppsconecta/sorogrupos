import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Search, Filter, Briefcase, User, CheckCircle, XCircle, Ban, Eye, ChevronRight, Check, MapPin, Calendar, Clock, Folder, CornerUpLeft, ChevronLeft, Send, Megaphone, Star, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CandidateReviewModal } from '../components/Resumes/CandidateReviewModal';
import JobDetailModal from '../components/public/modals/JobDetailModal';

// --- Interfaces ---

interface Candidate {
    id: string;
    job_id: string;
    name: string;
    email: string;
    phone: string;
    resume_url: string;
    status: 'pending' | 'approved' | 'rejected'; // Removed 'blocked'
    created_at: string;
    // Mock fields for display
    age?: number;
    sex?: 'Masculino' | 'Feminino';
    city?: string;
    state?: string;
    birth_date?: string;
    cargo_principal?: string;
    cargos_extras?: string[];
}

interface Job {
    id: string;
    title: string;
    code: string;
    city: string;
    region: string;
    created_at: string;
    status: string;
    folder_company_id?: string | null;
    sector_id?: string | null;
    candidates_count: number;
    candidates: Candidate[];
    description?: string;
    salary?: string;
    observation?: string;
    requirements?: string[];
    activities?: string[];
    benefits?: string[];
    last_viewed_candidates_at?: string;
}

interface CompanyFolder {
    id: string;
    name: string;
}

interface SectorFolder {
    id: string;
    name: string;
    folder_company_id: string;
}

// --- Navigation Types ---
type ViewLevel = 'root' | 'company' | 'sector';

interface NavigationState {
    level: ViewLevel;
    id?: string;
    name: string;
}

// Helper to calculate age from date string YYYY-MM-DD
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

export const Candidatos: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data State
    const [companies, setCompanies] = useState<CompanyFolder[]>([]);
    const [sectors, setSectors] = useState<SectorFolder[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [navStack, setNavStack] = useState<NavigationState[]>([
        { level: 'root', name: 'Todas as Empresas' }
    ]);

    // Global Filter/Search
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalCandidates: 0,
        activeJobs: 0,
        approved: 0,
        rejected: 0
    });

    // Modal Selection
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [candidateSearchTerm, setCandidateSearchTerm] = useState('');


    // --- Fetch Data ---
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel Fetch
            const [companiesRes, sectorsRes, jobsRes, applicationsRes] = await Promise.all([
                supabase.from('folder_companies').select('*').order('name'),
                supabase.from('sectors').select('*').order('name'),
                supabase.from('jobs').select('id, title, code, city, region, created_at, status, folder_company_id, sector_id, salary, observation, requirements, benefits, activities, last_viewed_candidates_at').eq('user_id', user?.id).eq('status', 'active'),
                supabase.from('job_applications')
                    .select(`
                        id,
                        status,
                        created_at,
                        job_id,
                        candidates (
                            id,
                            name,
                            email,
                            phone,
                            city,
                            state,
                            sex,
                            birth_date,
                            resume_url,
                            cargo_principal,
                            cargos_extras
                        )
                    `)
            ]);

            if (companiesRes.error) throw companiesRes.error;
            if (sectorsRes.error) throw sectorsRes.error;
            if (jobsRes.error) throw jobsRes.error;
            if (applicationsRes.error) throw applicationsRes.error;

            const fetchedJobs = jobsRes.data || [];
            const applications = applicationsRes.data || [];

            // Map applications to candidates format
            const jobWithCandidates = fetchedJobs.map(job => {
                const jobApps = applications.filter(app => app.job_id === job.id);

                const mappedCandidates: Candidate[] = jobApps.map((app: any) => ({
                    id: app.candidates.id, // Use candidate ID or Application ID?
                    // NOTE: The UI typically treats 'id' as the unique item to update status. 
                    // However, 'status' is on 'job_applications', not 'candidates'. 
                    // So we should probably use 'job_applications.id' as the key to update status, 
                    // or handle the update logic to update job_applications based on candidate_id + job_id.
                    // Let's use application ID as the 'id' for the UI actions to simplify status updates.
                    // Wait, existing code might expect 'id' to be candidate id? 
                    // Let's check handleUpdateStatus. It calls supabase.from('job_candidates').update({ status }).eq('id', candidateId).
                    // So currently it expects a "row ID" of the relationship table.
                    // Perfect. We have 'job_applications' table which replaces 'job_candidates'.
                    // So we will pass app.id as 'id'.
                    job_id: app.job_id,
                    name: app.candidates.name,
                    email: app.candidates.email,
                    phone: app.candidates.phone,
                    resume_url: app.candidates.resume_url,
                    status: app.status,
                    created_at: app.created_at,
                    age: calculateAge(app.candidates.birth_date),
                    sex: app.candidates.sex,
                    city: app.candidates.city,
                    state: app.candidates.state,
                    birth_date: app.candidates.birth_date,
                    cargo_principal: app.candidates.cargo_principal,
                    cargos_extras: app.candidates.cargos_extras
                }));

                return {
                    ...job,
                    candidates: mappedCandidates,
                    candidates_count: mappedCandidates.length
                };
            });

            setCompanies(companiesRes.data || []);
            setSectors(sectorsRes.data || []);
            setJobs(jobWithCandidates);

            // Calculate Global Stats
            const allCandidates = jobWithCandidates.flatMap(j => j.candidates);
            setStats({
                totalCandidates: allCandidates.length,
                activeJobs: fetchedJobs.length,
                approved: allCandidates.filter(c => c.status === 'approved').length,
                rejected: allCandidates.filter(c => c.status === 'rejected').length
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Navigation Helpers ---
    const currentView = navStack[navStack.length - 1];

    const navigateTo = (level: ViewLevel, id: string, name: string) => {
        setNavStack([...navStack, { level, id, name }]);
    };

    const navigateBack = () => {
        if (navStack.length > 1) {
            setNavStack(navStack.slice(0, -1));
        }
    };

    // --- Filtering Logic ---
    const getCurrentItems = () => {
        if (currentView.level === 'root') {
            return {
                folders: companies,
                jobs: jobs.filter(j => !j.folder_company_id && !j.sector_id)
            };
        } else if (currentView.level === 'company') {
            const currentCompanyId = currentView.id;
            const companySectors = sectors.filter(s => s.folder_company_id === currentCompanyId);
            const companyJobs = jobs.filter(j => j.folder_company_id === currentCompanyId && !j.sector_id);
            return {
                folders: companySectors,
                jobs: companyJobs
            };
        } else if (currentView.level === 'sector') {
            const currentSectorId = currentView.id;
            const sectorJobs = jobs.filter(j => j.sector_id === currentSectorId);
            return {
                folders: [],
                jobs: sectorJobs
            };
        }
        return { folders: [], jobs: [] };
    };

    const { folders: visibleFolders, jobs: visibleJobs } = getCurrentItems();

    const filteredFolders = visibleFolders.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredJobs = visibleJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Actions ---
    // --- Actions ---
    const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
        try {
            // Optimistic Update
            setJobs(prev => prev.map(job => ({
                ...job,
                candidates: job.candidates.map(c =>
                    c.id === applicationId ? { ...c, status: newStatus as any } : c
                )
            })));

            if (selectedJob) {
                setSelectedJob(prev => prev ? ({
                    ...prev,
                    candidates: prev.candidates.map(c =>
                        c.id === applicationId ? { ...c, status: newStatus as any } : c
                    )
                }) : null);
            }

            // Update in DB (using job_applications table)
            await supabase.from('job_applications').update({ status: newStatus }).eq('id', applicationId);

        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleJobClick = async (job: Job) => {
        setSelectedJob(job);

        const lastViewed = job.last_viewed_candidates_at ? new Date(job.last_viewed_candidates_at) : new Date(0);
        const hasNewCandidates = job.candidates.some(c => new Date(c.created_at) > lastViewed);

        if (hasNewCandidates || !job.last_viewed_candidates_at) {
            const now = new Date().toISOString();

            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, last_viewed_candidates_at: now } : j));
            if (selectedJob?.id === job.id) {
                setSelectedJob(prev => prev ? { ...prev, last_viewed_candidates_at: now } : null);
            }

            await supabase.from('jobs').update({ last_viewed_candidates_at: now }).eq('id', job.id);
        }
    };

    // --- Carousel Navigation ---
    const selectPreviousJob = () => {
        if (!selectedJob) return;
        const currentIndex = filteredJobs.findIndex(j => j.id === selectedJob.id);
        if (currentIndex > 0) {
            setSelectedJob(filteredJobs[currentIndex - 1]);
        }
    };

    const selectNextJob = () => {
        if (!selectedJob) return;
        const currentIndex = filteredJobs.findIndex(j => j.id === selectedJob.id);
        if (currentIndex !== -1 && currentIndex < filteredJobs.length - 1) {
            setSelectedJob(filteredJobs[currentIndex + 1]);
        }
    };

    return (
        <div className="space-y-6">

            {/* Stats Header */}
            {currentView.level === 'root' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Candidatos" value={stats.totalCandidates} icon={<User size={18} />} color="blue" />
                    <StatCard label="Vagas Ativas" value={stats.activeJobs} icon={<Briefcase size={18} />} color="indigo" />
                    <StatCard label="Aprovados" value={stats.approved} icon={<CheckCircle size={18} />} color="green" />
                    <StatCard label="Reprovados" value={stats.rejected} icon={<XCircle size={18} />} color="red" />
                </div>
            )}

            {/* Navigation & Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center transition-all">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
                    {navStack.length > 1 && (
                        <button onClick={navigateBack} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 mr-1 transition-colors">
                            <CornerUpLeft size={16} />
                        </button>
                    )}

                    <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {navStack.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <ChevronRight size={14} className="mx-1 text-slate-300" />}
                                <button
                                    onClick={() => {
                                        const newStack = navStack.slice(0, index + 1);
                                        setNavStack(newStack);
                                    }}
                                    className={`hover:text-blue-600 transition-colors ${index === navStack.length - 1 ? 'text-slate-800 dark:text-white font-bold' : ''}`}
                                >
                                    {item.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar nesta pasta..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:text-gray-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* 1. Folders Grid */}
                        {filteredFolders.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                                    {currentView.level === 'root' ? 'Empresas' : 'Setores'}
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {filteredFolders.map(folder => {
                                        let count = 0;
                                        if (currentView.level === 'root') {
                                            count = jobs.filter(j => j.folder_company_id === folder.id).length;
                                        } else {
                                            count = jobs.filter(j => j.sector_id === folder.id).length;
                                        }

                                        return (
                                            <div
                                                key={folder.id}
                                                className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl transition-all cursor-pointer hover:border-blue-500/50 hover:shadow-xl"
                                                onClick={() => navigateTo(currentView.level === 'root' ? 'company' : 'sector', folder.id, folder.name)}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${currentView.level === 'root' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                        <Folder size={24} />
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-slate-800 dark:text-gray-100 truncate">{folder.name}</h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {count} Vagas
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. Jobs List */}
                        {filteredJobs.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mt-6">
                                    Vagas
                                </h3>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredJobs.map(job => {
                                        const rejectedCount = job.candidates.filter(c => c.status === 'rejected').length;
                                        const availableCount = job.candidates_count - rejectedCount;
                                        const lastViewed = job.last_viewed_candidates_at ? new Date(job.last_viewed_candidates_at) : new Date(0);
                                        const newCandidatesCount = job.candidates.filter(c => new Date(c.created_at) > lastViewed).length;

                                        return (
                                            <div
                                                key={job.id}
                                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group flex items-center justify-between gap-4"
                                                onClick={() => handleJobClick(job)}
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 relative">
                                                        {job.title.charAt(0)}
                                                        {newCandidatesCount > 0 && (
                                                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm animate-pulse">
                                                                {newCandidatesCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-slate-800 dark:text-gray-100 text-sm truncate">{job.title}</h4>
                                                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono">#{job.code}</span>
                                                            {newCandidatesCount > 0 && (
                                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                                                    {newCandidatesCount} novos
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                                                            <span>{job.city || 'N/A'}{job.region ? ` - ${job.region}` : ''}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span>{new Date(job.created_at).toLocaleDateString()} às {new Date(job.created_at).toLocaleTimeString().slice(0, 5)}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 flex-shrink-0">
                                                    {/* Compact Stats */}
                                                    <div className="flex items-center gap-4 text-center">
                                                        <div>
                                                            <span className="block text-sm font-bold text-slate-700 dark:text-gray-300">{job.candidates_count}</span>
                                                            <span className="block text-[9px] text-slate-400 uppercase">Total</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-slate-100"></div>
                                                        <div>
                                                            <span className="block text-sm font-bold text-red-500">{rejectedCount}</span>
                                                            <span className="block text-[9px] text-slate-400 uppercase">Repr.</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-slate-100"></div>
                                                        <div>
                                                            <span className="block text-sm font-bold text-green-600">{availableCount}</span>
                                                            <span className="block text-[9px] text-slate-400 uppercase">Disp.</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {filteredFolders.length === 0 && filteredJobs.length === 0 && (
                            <div className="p-16 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                                <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">Está meio vazio por aqui...</h3>
                                <p className="text-sm">Nenhuma vaga ou pasta encontrada.</p>
                                {navStack.length > 1 && (
                                    <button onClick={navigateBack} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                                        Voltar
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Candidate List Modal (Slide-over) */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedJob(null)} />

                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-slideInRight">
                        {/* Header with Navigation Carousel */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 sticky top-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <ArrowLeft size={18} />
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={selectPreviousJob}
                                        disabled={filteredJobs.findIndex(j => j.id === selectedJob.id) <= 0}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all bg-white dark:bg-slate-800"
                                        title="Vaga Anterior"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <button
                                        onClick={selectNextJob}
                                        disabled={filteredJobs.findIndex(j => j.id === selectedJob.id) >= filteredJobs.length - 1}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900 disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all bg-white dark:bg-slate-800"
                                        title="Próxima Vaga"
                                    >
                                        <ChevronRight size={18} />
                                    </button>

                                    <div className="min-w-0 pl-2">
                                        <h2 className="text-sm font-bold text-slate-800 dark:text-gray-100 truncate max-w-[200px] sm:max-w-xs">{selectedJob.title}</h2>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">#{selectedJob.code}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* View Job Button */}
                            <div className="flex items-center gap-2 pl-2">
                                <button
                                    onClick={() => setIsJobDetailOpen(true)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 font-bold text-sm"
                                    title="Visualizar Vaga"
                                >
                                    <Eye size={18} />
                                    <span className="hidden sm:inline">Ver Vaga</span>
                                </button>
                            </div>
                        </div>

                        {/* Search & Tabs */}
                        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                            <div className="px-6 pt-4 pb-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome, cidade, idade..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:text-gray-200"
                                        value={candidateSearchTerm}
                                        onChange={e => setCandidateSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex px-6 gap-6 overflow-x-auto scrollbar-hide">
                                {['all', 'pending', 'approved', 'rejected'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status as any)}
                                        className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${statusFilter === status
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovados' : 'Reprovados'}
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {status === 'all'
                                                ? selectedJob.candidates.length
                                                : selectedJob.candidates.filter(c => c.status === status).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50 dark:bg-slate-950/50">
                            {selectedJob.candidates
                                .filter(c => {
                                    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
                                    const term = candidateSearchTerm.toLowerCase();
                                    const matchesSearch = candidateSearchTerm === '' ||
                                        c.name.toLowerCase().includes(term) ||
                                        (c.city && c.city.toLowerCase().includes(term)) ||
                                        (c.sex && c.sex.toLowerCase().includes(term)) ||
                                        (c.age && c.age.toString().includes(term));

                                    return matchesStatus && matchesSearch;
                                })
                                .map(candidate => (
                                    <div
                                        key={candidate.id}
                                        className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 justify-between transition-all hover:shadow-md cursor-pointer group/card"
                                        onClick={() => { setSelectedCandidate(candidate); setIsPreviewOpen(true); }}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-lg shrink-0 overflow-hidden">
                                                {/* Use mock avatar logic if needed, or just initials */}
                                                {candidate.sex === 'Feminino' ?
                                                    <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${candidate.name}&backgroundColor=transparent`} alt="avatar" className="w-full h-full object-cover" />
                                                    : candidate.name.charAt(0)
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-sm text-slate-800 dark:text-gray-100 truncate">{candidate.name}</h4>
                                                    <span className="text-[10px] text-slate-400">{new Date(candidate.created_at).toLocaleDateString()}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <span>{candidate.age ? `${candidate.age} anos` : 'Idade N/A'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{candidate.city || 'Cidade N/A'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{candidate.sex || 'Sexo N/A'}</span>
                                                </div>

                                                <div className="mt-2 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {candidate.status === 'pending' && <span className="text-yellow-600 font-bold text-[10px] uppercase bg-yellow-50 px-1.5 py-0.5 rounded">Pendente</span>}
                                                        {candidate.status === 'approved' && <span className="text-green-600 font-bold text-[10px] uppercase bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1"><Check size={10} /> Aprovado</span>}
                                                        {candidate.status === 'rejected' && <span className="text-red-500 font-bold text-[10px] uppercase bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1"><XCircle size={10} /> Reprovado</span>}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateStatus(candidate.id, 'approved');
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${candidate.status === 'approved'
                                                                ? 'bg-green-600 text-white shadow-md'
                                                                : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md'
                                                                }`}
                                                            title="Aprovar"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Aprovar
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateStatus(candidate.id, 'rejected');
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${candidate.status === 'rejected'
                                                                ? 'bg-red-600 text-white shadow-md'
                                                                : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md'
                                                                }`}
                                                            title="Rejeitar"
                                                        >
                                                            <XCircle size={14} />
                                                            Rejeitar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {selectedJob.candidates.filter(c => statusFilter === 'all' || c.status === statusFilter).length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-sm">Nenhum candidato com status "{statusFilter === 'pending' ? 'Pendentes' : statusFilter === 'approved' ? 'Aprovados' : statusFilter === 'rejected' ? 'Reprovados' : 'Todos'}".</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <CandidateReviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                candidate={selectedCandidate}
                onStatusUpdate={handleUpdateStatus}
            />

            <JobDetailModal
                isOpen={isJobDetailOpen}
                onClose={() => setIsJobDetailOpen(false)}
                job={selectedJob ? {
                    ...selectedJob,
                    location: `${selectedJob.city || ''} ${selectedJob.region ? `- ${selectedJob.region}` : ''}`,
                    postedAt: new Date(selectedJob.created_at).toLocaleDateString(),
                    type: 'Full-time',
                    description: selectedJob.observation || selectedJob.description || '',
                    salary: selectedJob.salary || 'A combinar',
                    requirements: typeof selectedJob.requirements === 'string' ? (selectedJob.requirements as string).split('\n') : (Array.isArray(selectedJob.requirements) ? selectedJob.requirements : []),
                    activities: typeof selectedJob.activities === 'string' ? (selectedJob.activities as string).split('\n') : (Array.isArray(selectedJob.activities) ? selectedJob.activities : []),
                    benefits: typeof selectedJob.benefits === 'string' ? (selectedJob.benefits as string).split('\n') : (Array.isArray(selectedJob.benefits) ? selectedJob.benefits : [])
                } as any : null}
                onApply={() => { }}
                onReport={() => { }}
                showFooter={false}
                customFooter={
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={() => {
                                setIsJobDetailOpen(false);
                                navigate('/anunciar');
                            }}
                            className="flex-1 py-3 px-4 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Megaphone size={16} />
                            Anunciar
                        </button>

                        <button
                            onClick={() => {
                                setIsJobDetailOpen(false);
                                navigate('/perfil');
                            }}
                            className="flex-1 py-3 px-4 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Star size={16} />
                            Destacar
                        </button>

                        <button
                            onClick={() => {
                                setIsJobDetailOpen(false);
                                if (selectedJob) {
                                    navigate('/vagas', { state: { editingJobId: selectedJob.id, isJobModalOpen: true } });
                                }
                            }}
                            className="flex-1 py-3 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit size={16} />
                            Editar
                        </button>
                    </div>
                }
            />
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        green: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        red: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colors[color].split(' ').find((c: string) => c.startsWith('border-'))} ${colors[color].split(' ').find((c: string) => c.startsWith('dark:border-'))} bg-white dark:bg-slate-800 shadow-sm flex flex-col justify-between h-24`}>
            <div className="flex items-center gap-2 text-slate-500">
                <div className={`p-1.5 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-2xl font-black text-slate-800 dark:text-white ml-1">{value}</span>
        </div>
    );
};

export default Candidatos;
