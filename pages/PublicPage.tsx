
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// New Components
import Header from '../components/public/Header';
import Filters from '../components/public/Filters';
import CompactJobCard from '../components/public/CompactJobCard';


import ReportModal from '../components/public/modals/ReportModal';
import ApplicationModal from '../components/public/modals/ApplicationModal';


import JobDetailModal from '../components/public/modals/JobDetailModal';

import { Job, FilterType, CompanyProfile } from '../components/public/types';
import { Building2, Bell, AlertCircle, Search, MapPin, Filter, Info, Star } from 'lucide-react';
import PublicProfileLayout from '../components/public/PublicProfileLayout';
import FeaturedCarousel from '../components/public/FeaturedCarousel';

export const PublicPage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const JOBS_PER_PAGE = 20;

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<FilterType>(FilterType.ALL);

    // Modals State
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);


    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        if (username) fetchData();
    }, [username]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch Company
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('*')
                .ilike('username', username)
                .single();

            if (companyError || !companyData) throw new Error('Empresa não encontrada.');

            // Map DB fields to Component Props
            setCompany({
                ...companyData,
                phone: companyData.whatsapp || companyData.phone // Ensure WhatsApp is used for contact
            });

            // Fetch Jobs
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .eq('user_id', companyData.owner_id) // Map via user_id as jobs use folder_company_id/user_id
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (!jobsError && jobsData) {
                const mappedJobs: Job[] = jobsData.map((j: any) => {
                    // Helper to parse JSON or text fields into array
                    const parseList = (field: any) => {
                        if (Array.isArray(field)) return field;
                        if (typeof field === 'string') {
                            try {
                                const parsed = JSON.parse(field);
                                if (Array.isArray(parsed)) return parsed;
                            } catch (e) {
                                // If not JSON, split by line break or return as single item
                                return field.split('\n').filter(s => s.trim().length > 0);
                            }
                        }
                        return [];
                    }

                    return {
                        id: j.id,
                        code: j.code || j.id.slice(0, 8).toUpperCase(), // Fallback to ID slice if code is missing
                        title: j.title,
                        company: companyData.name,
                        location: j.city || 'Sorocaba, SP',
                        type: mapJobType(j.type),
                        salary: j.salary_range ? `R$ ${j.salary_range} ` : undefined,
                        postedAt: formatDate(j.created_at),
                        description: j.description || 'Sem descrição',
                        requirements: parseList(j.requirements),
                        benefits: parseList(j.benefits),
                        activities: parseList(j.activities),
                        isFeatured: j.is_featured
                    };
                });
                setJobs(mappedJobs);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao carregar.');
        } finally {
            setLoading(false);
        }
    };

    const mapJobType = (type: string): 'CLT' | 'Freelance' | 'PJ' => {
        if (type === 'CLT') return 'CLT';
        if (type === 'PJ') return 'PJ';
        if (type === 'Freelance' || type === 'Free-lance') return 'Freelance';
        return 'CLT';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 1) return 'Agora mesmo';
        if (diffMinutes < 60) return `Há ${diffMinutes} min`;
        if (diffHours < 24) return `Há ${diffHours} h`;
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        return `Há ${diffDays} dias`;
    };

    const filteredJobs = jobs.filter(job => {
        if (job.isFeatured) return false; // Exclude featured jobs from main list
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === FilterType.ALL || job.type === selectedType;
        return matchesSearch && matchesType;
    }).sort((a, b) => a.title.localeCompare(b.title));

    const paginatedJobs = filteredJobs.slice(0, page * JOBS_PER_PAGE);
    const hasMore = paginatedJobs.length < filteredJobs.length;








    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
                    <p className="text-gray-500 mb-6">{error || 'Empresa não encontrada.'}</p>
                    <button onClick={() => navigate('/')} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                        Voltar para o Início
                    </button>
                </div>
            </div>
        );
    }

    const featuredJobs = jobs.filter(j => j.isFeatured).slice(0, 5); // Filter by isFeatured

    return (
        <PublicProfileLayout company={company} loading={false}>
            {/* SEO Head */}
            <div className="hidden">
                <title>{`${company.name} - Vagas em Aberto | SoroEmpregos`}</title>
                <meta name="description" content={`Confira as ${jobs.length} vagas de emprego abertas na ${company.name}. Envie seu currículo agora!`} />
            </div>

            <div className="space-y-6">

                {/* Fixed Header: Filters & Alert Button */}
                <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md py-4 -mx-4 px-4 flex flex-col md:flex-row gap-4 justify-between items-center transition-all">
                    <Filters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        company={company}
                    />


                </div>

                {/* Featured Carousel */}
                {searchTerm === '' && selectedType === FilterType.ALL && featuredJobs.length > 0 && (
                    <div className="py-2">
                        <h3 className="text-sm font-bold text-[#f59e0b] uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Star size={18} fill="#f59e0b" strokeWidth={0} />
                            Vagas em Destaque
                        </h3>

                        <FeaturedCarousel
                            jobs={featuredJobs}
                            onApply={(job) => { setSelectedJob(job); setIsDetailModalOpen(true); }}
                            headerColor={company.profile_header_color}
                        />
                    </div>
                )}

                {/* Job List */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                        Todas as Vagas <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{filteredJobs.length}</span>
                    </h3>

                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">Nenhuma vaga encontrada</h3>
                            <p className="text-gray-400 text-sm">Tente ajustar seus filtros de busca</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {paginatedJobs.map(job => (
                                    <CompactJobCard
                                        key={job.id}
                                        job={job}
                                        onViewDetails={() => { setSelectedJob(job); setIsDetailModalOpen(true); }}
                                    />
                                ))}
                            </div>

                            {/* Load More Pagination */}
                            {hasMore && (
                                <div className="flex justify-center pt-8">
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        className="bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                                    >
                                        Carregar Mais Vagas
                                    </button>
                                </div>
                            )}

                            <div className="text-center text-xs text-gray-400 pt-4 pb-8">
                                Exibindo {paginatedJobs.length} de {filteredJobs.length} vagas
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {selectedJob && (
                    <>

                        <ReportModal
                            isOpen={isReportModalOpen}
                            onClose={() => { setIsReportModalOpen(false); setIsDetailModalOpen(true); }}
                            jobTitle={selectedJob.title}
                            userId={company.owner_id}
                            jobCode={selectedJob.code}
                            jobId={selectedJob.id}
                        />

                        <ApplicationModal
                            isOpen={isApplicationModalOpen}
                            onClose={() => { setIsApplicationModalOpen(false); }}
                            jobTitle={selectedJob.title}
                            jobOwnerId={company.owner_id} // Pass owner ID for webhook
                            jobId={selectedJob.id}
                            companyId={company.id}
                        />

                        <JobDetailModal
                            isOpen={isDetailModalOpen}
                            onClose={() => setIsDetailModalOpen(false)}
                            job={selectedJob}
                            onApply={() => { setIsDetailModalOpen(false); setIsApplicationModalOpen(true); }}
                            onReport={() => { setIsDetailModalOpen(false); setIsReportModalOpen(true); }}
                            brandColor={company.profile_header_color}
                        />
                    </>
                )}

                {company && (
                    <></>
                )}

            </div>
        </PublicProfileLayout>
    );
};
