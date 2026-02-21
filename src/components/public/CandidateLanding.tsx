import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Loader2, ArrowRight, Clock } from 'lucide-react';
import JobDetailModal from './modals/JobDetailModal';
import ApplicationModal from './modals/ApplicationModal';
import { Job } from '../../types';
import InactiveJobModal from './modals/InactiveJobModal';
import ReportModal from './modals/ReportModal';

import { Link } from 'react-router-dom';
import FeaturedCarousel from './FeaturedCarousel';

export const CandidateLanding = () => {
    const [jobCode, setJobCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [foundJob, setFoundJob] = useState<Job | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isInactiveJobModalOpen, setIsInactiveJobModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Fetch Recent Jobs
    React.useEffect(() => {
        const fetchRecentJobs = async () => {
            try {
                const { data: jobs, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;

                if (jobs) {
                    const jobsWithCompany = await Promise.all(jobs.map(async (job) => {
                        const { data: company } = await supabase
                            .from('companies')
                            .select('*')
                            .eq('owner_id', job.user_id)
                            .single();
                        return mapJob(job, company);
                    }));
                    setRecentJobs(jobsWithCompany);
                }
            } catch (err) {
                console.error('Error fetching recent jobs:', err);
            } finally {
                setLoadingRecent(false);
            }
        };

        fetchRecentJobs();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanJobCode = jobCode.replace(/\s+/g, '').toUpperCase();
        if (!cleanJobCode) return;

        setLoading(true);
        setSearchError('');
        setFoundJob(null);
        setIsInactiveJobModalOpen(false);

        try {
            const { data: rpcData, error } = await supabase
                .rpc('get_job_details_by_code', { search_code: cleanJobCode })
                .maybeSingle();

            if (error) {
                console.error('Search error:', error);
                throw new Error('Erro ao buscar vaga. Tente novamente.');
            }

            if (!rpcData) {
                throw new Error('Vaga não encontrada. Verifique o código.');
            }

            const data = rpcData as any;

            if (data.status !== 'active') {
                setIsInactiveJobModalOpen(true);
                return;
            }

            const parseList = (field: any) => {
                if (!field) return [];
                if (Array.isArray(field)) return field;
                if (typeof field === 'string') {
                    try {
                        const parsed = JSON.parse(field);
                        if (Array.isArray(parsed)) return parsed;
                        return [parsed];
                    } catch (e) {
                        if (field.includes('\n')) return field.split('\n').filter((s: string) => s.trim().length > 0);
                        if (field.includes(',')) return field.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                        return [field];
                    }
                }
                return [];
            };

            const mappedJob: Job = {
                id: data.id,
                code: data.code || data.id.slice(0, 8).toUpperCase(),
                title: data.title,
                company: data.company_name || 'Confidencial',
                location: data.city || 'Local não informado',
                city: data.city,
                region: data.state || 'SP',
                schedule: data.work_schedule || 'Horário a combinar',
                type: data.type === 'CLT' ? 'CLT' : data.type === 'PJ' ? 'PJ' : 'Freelance',
                salary: data.salary_range ? `R$ ${data.salary_range}` : undefined,
                postedAt: new Date(data.created_at).toLocaleDateString(),
                description: data.description || '',
                requirements: parseList(data.requirements),
                benefits: parseList(data.benefits),
                activities: parseList(data.activities),
                isFeatured: data.is_featured,
                companyId: data.company_id,
                ownerId: data.user_id,
                companyData: {
                    name: data.company_name,
                    profile_header_color: data.company_profile_header_color,
                    whatsapp: data.company_whatsapp,
                    id: data.company_id
                }
            } as any;

            setFoundJob(mappedJob);
            setIsDetailModalOpen(true);

        } catch (err: any) {
            setSearchError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const mapJob = (j: any, company: any): Job => {
        const parseList = (field: any) => {
            if (!field) return [];
            if (Array.isArray(field)) return field;
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    if (Array.isArray(parsed)) return parsed;
                    return [parsed];
                } catch (e) {
                    if (field.includes('\n')) {
                        return field.split('\n').filter(s => s.trim().length > 0);
                    }
                    if (field.includes(',')) {
                        return field.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    }
                    return [field];
                }
            }
            return [];
        }

        return {
            id: j.id,
            code: j.code || j.id.slice(0, 8).toUpperCase(),
            title: j.title || j.role,
            company: company?.name || 'Confidencial',
            location: j.city || 'Local não informado',
            city: j.city,
            region: j.state || 'SP',
            schedule: j.work_schedule || 'Horário a combinar',
            type: j.employment_type === 'CLT' ? 'CLT' : j.employment_type === 'PJ' ? 'PJ' : 'Freelance',
            salary: j.salary_range ? `R$ ${j.salary_range}` : undefined,
            postedAt: new Date(j.created_at).toLocaleDateString(),
            description: j.description || j.observation || '',
            requirements: parseList(j.requirements),
            benefits: parseList(j.benefits),
            activities: parseList(j.activities),
            isFeatured: j.is_featured,
            companyId: company?.id,
            ownerId: j.user_id
        } as any;
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Hero Section */}
            <section className="bg-yellow-400 py-10 md:py-16 px-6 md:px-12 lg:px-24 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-50 -mr-24 -mt-24 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full blur-3xl opacity-20 -ml-12 -mb-12 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-blue-950 leading-[1.1] mb-6">
                        Encontre seu próximo<br className="hidden md:block" /> emprego <span className="text-white drop-shadow-md">agora</span>.
                    </h1>
                    <p className="text-base md:text-xl text-blue-900/70 font-bold mb-10 max-w-lg mx-auto leading-relaxed">
                        Digite o código da vaga para visualizar detalhes.
                    </p>

                    {/* Mobile: input card + button stacked | Desktop: single row inside card */}
                    <div className="max-w-sm md:max-w-md mx-auto flex flex-col md:block gap-3">
                        {/* Input card */}
                        <div className="bg-white p-1.5 rounded-2xl shadow-xl shadow-blue-900/5 flex items-center transform transition-all focus-within:scale-[1.02] focus-within:shadow-2xl focus-within:shadow-blue-900/10 border border-white/20">
                            <input
                                type="text"
                                value={jobCode}
                                onChange={(e) => setJobCode(e.target.value.toUpperCase())}
                                placeholder="#1234"
                                className="flex-1 h-12 md:h-14 px-4 text-center text-xl font-black text-blue-950 placeholder:text-slate-200 outline-none bg-transparent uppercase tracking-widest"
                            />
                            {/* Button inline — only on md+ */}
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="hidden md:flex bg-blue-950 text-white h-14 px-8 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-900 transition-all disabled:opacity-70 items-center justify-center shrink-0 shadow-lg shadow-blue-950/20 active:scale-95 gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                    <>
                                        <Search size={18} strokeWidth={3} />
                                        <span>BUSCAR</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Button below card — only on mobile */}
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="md:hidden bg-blue-950 text-white h-12 w-full rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-900 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    <Search size={18} strokeWidth={3} />
                                    <span>BUSCAR</span>
                                </>
                            )}
                        </button>
                    </div>

                    {searchError && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl inline-block font-medium animate-fadeIn">
                            {searchError}
                        </div>
                    )}
                </div>
            </section>

            {/* Latest Jobs Carousel Section */}
            <section className="py-6 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 px-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-blue-950">Vagas Recentes</h2>
                        <p className="text-slate-500 mt-1">Confira as últimas oportunidades publicadas.</p>
                    </div>
                    <Link
                        to="/vagas"
                        className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
                    >
                        Ver todas as vagas <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="mb-8">
                    {loadingRecent ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : (
                        <FeaturedCarousel
                            jobs={recentJobs}
                            onApply={(job) => { setFoundJob(job); setIsDetailModalOpen(true); }}
                        />
                    )}
                </div>

                <div className="flex justify-center md:hidden mb-4 md:mb-12">
                    <Link
                        to="/vagas"
                        className="w-full max-w-sm py-4 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors"
                    >
                        Ver todas as vagas <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* WhatsApp CTA Section */}
            <section className="py-10 md:py-16 px-6 md:px-12 lg:px-24 bg-[#25D366]">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                        Acesse nossos grupos de WhatsApp
                    </h2>
                    <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                        Confira centenas de vagas diariamente direto no seu celular.
                    </p>

                    <Link
                        to="/grupos"
                        className="inline-flex items-center gap-3 bg-white text-[#25D366] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-green-50 transition-all shadow-xl shadow-green-900/20 active:scale-95"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Ver Grupos
                    </Link>
                </div>
            </section>

            {foundJob && (
                <>
                    <JobDetailModal
                        isOpen={isDetailModalOpen}
                        onClose={() => setIsDetailModalOpen(false)}
                        job={foundJob}
                        onApply={() => { setIsDetailModalOpen(false); setIsApplicationModalOpen(true); }}
                        onReport={() => { setIsDetailModalOpen(false); setIsReportModalOpen(true); }}
                        brandColor={(foundJob as any).companyData?.profile_header_color || '#1e293b'}
                    />
                    <ApplicationModal
                        isOpen={isApplicationModalOpen}
                        onClose={() => setIsApplicationModalOpen(false)}
                        jobTitle={foundJob.title}
                        jobOwnerId={(foundJob as any).ownerId}
                        jobId={foundJob.id}
                        companyId={(foundJob as any).companyId}
                    />
                    <ReportModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        jobTitle={foundJob.title}
                        userId={(foundJob as any).ownerId}
                        jobCode={(foundJob as any).code}
                        jobId={foundJob.id}
                    />
                </>
            )}

            {/* Inactive Job Modal */}
            <InactiveJobModal
                isOpen={isInactiveJobModalOpen}
                onClose={() => setIsInactiveJobModalOpen(false)}
            />
        </div>
    );
};
