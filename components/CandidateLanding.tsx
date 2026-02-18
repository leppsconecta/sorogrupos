import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Loader2, Users, MapPin, ArrowRight, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import JobDetailModal from './public/modals/JobDetailModal';
import ApplicationModal from './public/modals/ApplicationModal';
// Assuming Job type is available or redefine a minimal one
import { Job } from './public/types';

export const CandidateLanding = () => {
    const [jobCode, setJobCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [foundJob, setFoundJob] = useState<Job | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    const [selectedGroupType, setSelectedGroupType] = useState<'CLT' | 'FREELANCE' | null>(null);
    const [searchError, setSearchError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobCode.trim()) return;

        setLoading(true);
        setSearchError('');
        setFoundJob(null);

        try {
            // Use RPC function to bypass RLS for hidden jobs and ensure consistent data retrieval
            const { data, error } = await supabase
                .rpc('get_job_details_by_code', { search_code: jobCode })
                .maybeSingle();

            if (error) {
                console.error('Search error:', error);
                throw new Error('Erro ao buscar vaga. Tente novamente.');
            }

            if (!data) {
                throw new Error('Vaga não encontrada. Verifique o código.');
            }

            // Check if job is active
            if (data.status !== 'active') {
                // Scroll to WhatsApp groups
                const groupsSection = document.getElementById('grupos-whatsapp');
                if (groupsSection) {
                    groupsSection.scrollIntoView({ behavior: 'smooth' });
                }
                throw new Error('Esta vaga encerrou o processo de seleção. Acesse nossos grupos para novas oportunidades!');
            }

            // Robust JSON parser helper
            const parseList = (field: any) => {
                if (!field) return [];
                if (Array.isArray(field)) return field;
                if (typeof field === 'string') {
                    try {
                        const parsed = JSON.parse(field);
                        if (Array.isArray(parsed)) return parsed;
                        return [parsed];
                    } catch (e) {
                        // Fallback for non-JSON strings
                        if (field.includes('\n')) return field.split('\n').filter((s: string) => s.trim().length > 0);
                        if (field.includes(',')) return field.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                        return [field];
                    }
                }
                return [];
            };

            // Map data from RPC format to Job interface
            const mappedJob: Job = {
                id: data.id,
                code: data.code || data.id.slice(0, 8).toUpperCase(),
                title: data.title,
                company: data.company_name || 'Confidencial',
                location: data.city || 'Local não informado',
                type: data.employment_type === 'CLT' ? 'CLT' : data.employment_type === 'PJ' ? 'PJ' : 'Freelance',
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
                    // Try to parse as JSON
                    const parsed = JSON.parse(field);
                    if (Array.isArray(parsed)) return parsed;
                    // If parsed but not an array (e.g. "some string" in JSON), return as array
                    return [parsed];
                } catch (e) {
                    // If JSON parse fails, check if it's a comma-separated list or newline-separated
                    if (field.includes('\n')) {
                        return field.split('\n').filter(s => s.trim().length > 0);
                    }
                    if (field.includes(',')) {
                        // Optional: split by comma if it looks like a list
                        return field.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    }
                    // Fallback: return as single string item
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
            type: j.type === 'CLT' ? 'CLT' : j.type === 'PJ' ? 'PJ' : 'Freelance',
            salary: j.salary_range ? `R$ ${j.salary_range}` : undefined,
            postedAt: new Date(j.created_at).toLocaleDateString(),
            description: j.description || j.observation || '',
            requirements: parseList(j.requirements),
            benefits: parseList(j.benefits),
            activities: parseList(j.activities),
            isFeatured: j.is_featured,
            companyId: company?.id, // internal helper
            ownerId: j.user_id // internal helper
        } as any;
    };

    // Mock Groups Data (To be replaced by DB or Config if needed)
    const groupsCLT = [
        { name: 'Vagas Sorocaba Oficial', location: 'Sorocaba e Região', link: '#' },
        { name: 'Vagas Itu e Salto', location: 'Itu e Região', link: '#' },
        { name: 'Empregos Araçoiaba', location: 'Araçoiaba e Região', link: '#' },
        { name: 'Votorantim Vagas', location: 'Votorantim e Região', link: '#' },
    ];

    const groupsFreelance = [
        { name: 'Bicos & Freelance Sorocaba', location: 'Sorocaba e Região', link: '#' },
        { name: 'Freelance SP Interior', location: 'Interior de SP', link: '#' },
    ];

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

                    <div className="bg-white p-1.5 rounded-2xl shadow-xl shadow-blue-900/5 max-w-sm md:max-w-md mx-auto flex items-center transform transition-all focus-within:scale-[1.02] focus-within:shadow-2xl focus-within:shadow-blue-900/10 border border-white/20">
                        <input
                            type="text"
                            value={jobCode}
                            onChange={(e) => setJobCode(e.target.value.toUpperCase())}
                            placeholder="#1234"
                            className="flex-1 h-12 md:h-14 px-4 text-center md:text-left text-xl md:text-xl font-black text-blue-950 placeholder:text-slate-200 outline-none bg-transparent uppercase tracking-widest"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-blue-950 text-white h-12 w-12 md:w-auto md:h-14 md:px-8 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-900 transition-all disabled:opacity-70 flex items-center justify-center shrink-0 shadow-lg shadow-blue-950/20 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    <Search className="md:hidden" size={20} strokeWidth={3} />
                                    <span className="hidden md:inline">BUSCAR</span>
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

            {/* WhatsApp Groups Section */}
            <section id="grupos-whatsapp" className="py-16 px-6 md:px-12 lg:px-24 bg-green-50/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="w-16 h-16 bg-[#25D366] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 rotate-3">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-blue-950 mb-4">Grupos de WhatsApp</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Participe dos nossos grupos e receba vagas diretamente no seu celular. Selecione qual tipo de vaga você busca!</p>
                    </div>

                    {!selectedGroupType ? (
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <button
                                onClick={() => setSelectedGroupType('CLT')}
                                className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/10 transition-all text-left overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[2.5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="p-4 bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center text-green-600 mb-6 relative z-10 group-hover:scale-110 transition-transform">
                                    <Briefcase size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-blue-950 mb-2 relative z-10">Vagas CLT</h3>
                                <p className="text-slate-500 relative z-10">Oportunidades com registro em carteira, benefícios e estabilidade.</p>
                                <div className="mt-8 flex items-center gap-2 text-green-600 font-bold uppercase text-sm tracking-wider group-hover:gap-4 transition-all">
                                    Ver Grupos <ArrowRight size={18} />
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedGroupType('FREELANCE')}
                                className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/10 transition-all text-left overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-[2.5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="p-4 bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center text-yellow-600 mb-6 relative z-10 group-hover:scale-110 transition-transform">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-blue-950 mb-2 relative z-10">Freelance e Bicos</h3>
                                <p className="text-slate-500 relative z-10">Trabalhos temporários, diárias e oportunidades autônomas.</p>
                                <div className="mt-8 flex items-center gap-2 text-yellow-600 font-bold uppercase text-sm tracking-wider group-hover:gap-4 transition-all">
                                    Ver Grupos <ArrowRight size={18} />
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            <button onClick={() => setSelectedGroupType(null)} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-950 transition-colors font-medium">
                                <ArrowRight className="rotate-180" size={20} /> Voltar para categorias
                            </button>

                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`p-4 rounded-2xl ${selectedGroupType === 'CLT' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {selectedGroupType === 'CLT' ? <Briefcase size={32} /> : <Zap size={32} />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-blue-950">
                                            {selectedGroupType === 'CLT' ? 'Grupos de Vagas CLT' : 'Grupos de Freelance & Bicos'}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                                            {selectedGroupType === 'CLT' ? 'Selecione sua região' : 'Encontre oportunidades rápidas'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {(selectedGroupType === 'CLT' ? groupsCLT : groupsFreelance).map((group, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-green-400 hover:bg-green-50/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white shadow-sm text-[#25D366] rounded-full flex items-center justify-center">
                                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{group.name}</p>
                                                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                                                        <MapPin size={12} /> {group.location}
                                                    </div>
                                                </div>
                                            </div>
                                            <a href={group.link} className="px-5 py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20">
                                                Entrar
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Modals */}
            {foundJob && (
                <>
                    <JobDetailModal
                        isOpen={isDetailModalOpen}
                        onClose={() => setIsDetailModalOpen(false)}
                        job={foundJob}
                        onApply={() => { setIsDetailModalOpen(false); setIsApplicationModalOpen(true); }}
                        onReport={() => { }}
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
                </>
            )}

        </div>
    );
};
