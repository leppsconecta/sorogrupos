import React, { useState, useEffect } from 'react';
import {
    Building2,
    Save,
    Globe,
    Upload,
    Eye,
    EyeOff,
    Briefcase,
    MapPin,
    Camera,
    Settings2,
    Palette,
    LinkIcon,
    X,
    ChevronDown,
    ChevronUp,
    Bell,
    Check,
    Loader2,
    Copy,
    Phone,
    Info,
    Instagram,
    Facebook,
    Linkedin,
    ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Public Components for Preview
import JobCard from '../components/public/JobCard';
import Filters from '../components/public/Filters';
import AlertModal from '../components/public/modals/AlertModal';
import QuestionModal from '../components/public/modals/QuestionModal';
import ReportModal from '../components/public/modals/ReportModal';
import ApplicationModal from '../components/public/modals/ApplicationModal';
import { Job, FilterType, CompanyProfile } from '../components/public/types';
import PublicProfileLayout from '../components/public/PublicProfileLayout';
import FeaturedCarousel from '../components/public/FeaturedCarousel';

// Helper Components
const InputField = ({ label, icon: Icon, helper, ...props }: any) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon size={14} className="text-slate-400" />}
                {label}
            </label>
            {props.required && <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">Campo Obrigatório</span>}
        </div>
        <div className="group relative">
            <input
                className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-800 dark:text-white rounded-xl px-4 py-3.5 outline-none transition-all font-medium placeholder:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 disabled:opacity-50"
                {...props}
            />
        </div>
        {helper && <p className="text-xs text-slate-500 pl-1">{helper}</p>}
    </div>
);

export const Perfil: React.FC = () => {
    const { user, company, refreshProfile } = useAuth();
    const { toast } = useFeedback();
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const navigate = useNavigate();

    const [showSettings, setShowSettings] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        profile_header_color: '#1e293b',
        name: '',
        description: '',
        profile_title_color: '#1e293b',
        logo_url: '',
        cover_url: '',
        cep: '',
        address: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        website: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        linkedin: ''
    });

    const [loadingCep, setLoadingCep] = useState(false);

    // Preview State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<FilterType>(FilterType.ALL);

    // Preview Modals State
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    // Username Verification State
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    const MOCK_JOBS: Job[] = [
        {
            id: 'mock-1',
            title: 'Senior UX Designer (Exemplo)',
            company: 'Sua Empresa',
            location: 'Sorocaba, SP',
            type: 'CLT',
            salary: 'R$ 8.000 - R$ 12.000',
            postedAt: 'Há 2 dias',
            description: 'Esta é uma vaga de exemplo para você visualizar como ficará seu perfil. Crie vagas reais para substituí-la.',
            requirements: ['Experiência 5+ anos', 'Figma', 'Prototipagem', 'Design System'],
            benefits: ['Vale Refeição', 'Plano de Saúde', 'Home Office', 'Gympass'],
            activities: ['Liderar design system', 'Realizar pesquisas com usuários', 'Prototipar interfaces']
        },
        {
            id: 'mock-2',
            title: 'Desenvolvedor Frontend (Exemplo)',
            company: 'Sua Empresa',
            location: 'Remoto',
            type: 'PJ',
            salary: 'R$ 6.000 - R$ 9.000',
            postedAt: 'Há 5 dias',
            description: 'Vaga de exemplo. Ao publicar vagas reais, elas aparecerão aqui automaticamente.',
            requirements: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
            benefits: ['Flexibilidade de horários', 'Equipamento fornecido', 'Bônus anual'],
            activities: ['Desenvolver novas features', 'Manter código legado', 'Code review']
        }
    ];

    const getPreviewJobs = (): Job[] => {
        if (jobs.length === 0) return MOCK_JOBS;

        return jobs.map(j => ({
            id: j.id,
            title: j.role || j.title,
            company: formData.name || 'Sua Empresa',
            location: j.city || 'Sorocaba, SP',
            type: (j.type === 'PJ' ? 'PJ' : j.type === 'Freelance' ? 'Freelance' : 'CLT') as any,
            salary: j.salary_range ? `R$ ${j.salary_range}` : undefined,
            postedAt: 'Recente',
            description: j.description || 'Sem descrição',
            requirements: [],
            benefits: [],
            activities: []
        }));
    };

    const previewJobs = getPreviewJobs().filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === FilterType.ALL || job.type === selectedType;
        return matchesSearch && matchesType;
    });

    useEffect(() => {
        if (company) {
            setFormData({
                username: company.username || company.name.toLowerCase().replace(/[^a-z0-9]/g, '') || '',
                profile_header_color: company.profile_header_color || '#1e293b',
                name: company.name || '',
                description: company.description || '',
                profile_title_color: company.profile_title_color || '#ffffff',
                logo_url: company.logo_url || '',
                cover_url: company.cover_url || '',
                cep: company.cep || '',
                address: company.address || '',
                number: company.number || '',
                complement: company.complement || '',
                neighborhood: company.neighborhood || '',
                city: company.city || '',
                state: company.state || '',
                website: company.website || '',
                phone: company.phone || '',
                whatsapp: company.whatsapp || '',
                instagram: company.instagram || '',
                facebook: company.facebook || '',
                linkedin: company.linkedin || ''
            });
            fetchJobs();
        }
    }, [company]);

    const fetchJobs = async () => {
        if (!company?.id) return;
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('company_id', company.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (data) setJobs(data);
    };

    const handleSave = async () => {
        if (!user || !company?.id) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    username: formData.username,
                    profile_header_color: formData.profile_header_color,
                    description: formData.description,
                    profile_title_color: formData.profile_title_color,
                    logo_url: formData.logo_url,
                    cover_url: formData.cover_url,
                    cep: formData.cep,
                    address: formData.address,
                    number: formData.number,
                    complement: formData.complement,
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    state: formData.state,
                    website: formData.website,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    instagram: formData.instagram,
                    facebook: formData.facebook,
                    linkedin: formData.linkedin,
                    updated_at: new Date().toISOString()
                })
                .eq('id', company.id);

            if (error) throw error;

            await refreshProfile();
            toast({ type: 'success', title: 'Sucesso', message: 'Configurações atualizadas!' });
        } catch (err: any) {
            toast({ type: 'error', title: 'Erro', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !company) return;

        const file = e.target.files[0];
        setUploadingLogo(true);

        try {
            // Logic to ensure only 1 image per company -> Delete old ones first
            // We use a prefix pattern
            const fileExt = file.name.split('.').pop();
            const baseFileName = `${company.id}-logo`;

            // 1. List existing files to find old one
            const { data: listData } = await supabase.storage
                .from('company-logos')
                .list('', { search: baseFileName });

            // 2. Delete existing files
            if (listData && listData.length > 0) {
                const filesToRemove = listData.map(f => f.name);
                await supabase.storage
                    .from('company-logos')
                    .remove(filesToRemove);
            }

            // 3. Upload new file
            const newFileName = `${baseFileName}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('company-logos')
                .upload(newFileName, file, {
                    cacheControl: '0',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('company-logos')
                .getPublicUrl(newFileName);

            // 5. Append Timestamp for Cache Busting
            const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

            setFormData(prev => ({ ...prev, logo_url: publicUrlWithTimestamp }));

            // Save immediately
            await supabase.from('companies').update({ logo_url: publicUrlWithTimestamp }).eq('id', company.id);
            toast({ type: 'success', title: 'Logo Atualizado', message: 'Logo da empresa enviado com sucesso!' });

            // Force refresh context
            await refreshProfile();

        } catch (error: any) {
            toast({ type: 'error', title: 'Erro no Upload', message: error.message });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !company) return;

        const file = e.target.files[0];
        setUploadingCover(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${company.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('company-covers')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('company-covers')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, cover_url: publicUrl }));

            // Save immediately
            await supabase.from('companies').update({ cover_url: publicUrl }).eq('id', company.id);
            toast({ type: 'success', title: 'Capa Atualizada', message: 'Imagem de capa enviada com sucesso!' });

        } catch (error: any) {
            toast({ type: 'error', title: 'Erro no Upload', message: error.message });
        } finally {
            setUploadingCover(false);
        }
    };

    const toggleJobVisibility = async (jobId: string, currentHidden: boolean) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update({ public_hidden: !currentHidden })
                .eq('id', jobId);

            if (error) throw error;

            setJobs(jobs.map(j => j.id === jobId ? { ...j, public_hidden: !currentHidden } : j));
            toast({ type: 'success', title: 'Vaga Atualizada', message: !currentHidden ? 'Vaga oculta da página pública.' : 'Vaga visível na página pública.' });
        } catch (err: any) {
            toast({ type: 'error', title: 'Erro', message: err.message });
        }
    };

    const checkUsernameAvailability = async () => {
        if (!company) return;

        const username = formData.username.trim();

        if (!username) {
            toast({ type: 'error', title: 'Erro', message: 'O campo username não pode ficar vazio.' });
            return;
        }

        setCheckingUsername(true);
        setUsernameAvailable(null);

        try {
            const { count, error } = await supabase
                .from('companies')
                .select('*', { count: 'exact', head: true })
                .eq('username', username)
                .neq('id', company.id);

            if (error) throw error;

            if (count === 0) {
                setUsernameAvailable(true);
                // Auto-save if available
                const { error: updateError } = await supabase
                    .from('companies')
                    .update({ username: username })
                    .eq('id', company.id);

                if (updateError) throw updateError;

                await refreshProfile();
                toast({ type: 'success', title: 'Salvo!', message: 'Seu usuário foi atualizado com sucesso.' });

            } else {
                setUsernameAvailable(false);
                toast({ type: 'error', title: 'Indisponível', message: 'Este usuário já está em uso.' });
            }

        } catch (error: any) {
            console.error('Error checking username:', error);
            toast({ type: 'error', title: 'Erro', message: 'Erro ao verificar/salvar: ' + error.message });
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                toast({ type: 'error', title: 'Erro', message: 'CEP não encontrado.' });
                return;
            }

            setFormData(prev => ({
                ...prev,
                address: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf,
                complement: prev.complement
            }));
        } catch (error) {
            toast({ type: 'error', title: 'Erro', message: 'Falha ao buscar CEP.' });
        } finally {
            setLoadingCep(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6">

            {/* Header Removed as per request, just the container */}
            <div className="flex flex-col gap-6">

                {/* Link Display - Top Public Link */}
                <div className="flex justify-start items-center p-2 rounded-2xl">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm">
                            <span className="text-slate-400 text-sm font-bold">soroempregos.com/</span>
                            <input
                                className="bg-transparent outline-none font-bold text-slate-700 dark:text-white w-auto min-w-[20px]"
                                value={formData.username}
                                onChange={e => {
                                    setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') });
                                    setUsernameAvailable(null);
                                }}
                                placeholder={company?.name ? company.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : "seu-usuario"}
                            />

                            <div className="flex items-center ml-2">
                                {checkingUsername ? (
                                    <Loader2 size={16} className="animate-spin text-slate-400" />
                                ) : usernameAvailable === true ? (
                                    <Check size={16} className="text-emerald-500" />
                                ) : usernameAvailable === false ? (
                                    <X size={16} className="text-red-500" />
                                ) : (
                                    <button
                                        onClick={checkUsernameAvailability}
                                        disabled={!formData.username}
                                        className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                    >
                                        Verificar
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const finalUsername = formData.username || company?.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                navigator.clipboard.writeText(`https://soroempregos.com/${finalUsername}`);
                                toast({ type: 'success', title: 'Copiado!', message: 'Link copiado para a área de transferência.' });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 transition-all font-bold text-xs text-slate-600 uppercase tracking-wider shadow-sm"
                            title="Copiar Link"
                        >
                            <Copy size={16} />
                            Copiar Link
                        </button>
                        <button
                            onClick={() => {
                                const finalUsername = formData.username || company?.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                const url = `${window.location.origin}/${finalUsername}`;
                                window.open(url, '_blank');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shadow-sm"
                            title="Ver Página Pública"
                        >
                            <ExternalLink size={16} />
                            Ver Página
                        </button>
                    </div>
                </div>

                {/* SETTINGS DRAWER (Collapsible) - Moved here for cleaner flow or keep inside? User said "Expandir configurações". Let's keep separate from Preview container. */}
                <div className={`transition-all duration-500 ease-in-out bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden ${showSettings ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0 border-none'}`}>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Palette size={18} /> Aparência</h4>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                        Fundo do Topo
                                        <span className="text-[10px] bg-slate-200 px-2 rounded text-slate-600">Usado se sem capa</span>
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input type="color" value={formData.profile_header_color} onChange={e => setFormData({ ...formData, profile_header_color: e.target.value })} className="h-10 w-full rounded lg:w-20 cursor-pointer" />
                                        <span className="text-xs font-mono text-slate-400">{formData.profile_header_color}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Cor dos Títulos</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="color" value={formData.profile_title_color} onChange={e => setFormData({ ...formData, profile_title_color: e.target.value })} className="h-10 w-full rounded lg:w-20 cursor-pointer" />
                                        <span className="text-xs font-mono text-slate-400">{formData.profile_title_color}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><MapPin size={18} /> Endereço</h4>
                            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                {/* CEP, Rua, Numero */}
                                <div className="flex gap-3">
                                    <div className="w-1/4">
                                        <label className="text-xs font-bold text-slate-500 uppercase">CEP</label>
                                        <div className="relative">
                                            <input
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={formData.cep}
                                                onChange={e => setFormData({ ...formData, cep: e.target.value.replace(/\D/g, '').substring(0, 8) })}
                                                onBlur={handleCepBlur}
                                                placeholder="00000000"
                                            />
                                            {loadingCep && <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-indigo-500" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Rua</label>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Logradouro"
                                        />
                                    </div>
                                    <div className="w-1/4">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Número</label>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={formData.number}
                                            onChange={e => setFormData({ ...formData, number: e.target.value })}
                                            placeholder="Nº"
                                        />
                                    </div>
                                </div>

                                {/* Complemento */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Complemento <span className="text-[10px] text-slate-400 font-normal normal-case">(Opcional)</span></label>
                                    <input
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.complement}
                                        onChange={e => setFormData({ ...formData, complement: e.target.value })}
                                        placeholder="Ap, Bloco, etc."
                                    />
                                </div>

                                {/* Bairro, Cidade, Estado */}
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={formData.neighborhood}
                                            onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                            placeholder="Bairro"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Cidade</label>
                                        <input
                                            className="w-full bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg p-2.5 text-sm outline-none text-slate-500 cursor-not-allowed"
                                            value={formData.city}
                                            readOnly
                                            placeholder="Cidade"
                                        />
                                    </div>
                                    <div className="w-16">
                                        <label className="text-xs font-bold text-slate-500 uppercase">UF</label>
                                        <input
                                            className="w-full bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg p-2.5 text-sm outline-none text-center text-slate-500 cursor-not-allowed"
                                            value={formData.state}
                                            readOnly
                                            placeholder="UF"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><LinkIcon size={18} /> Informações Básicas</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        placeholder="username"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                                    <textarea
                                        rows={2}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descrição curta..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 pb-8 flex justify-end">
                        <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/10">
                            {loading ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Settings (4 cols) */}
                    {/* Removed separate settings column, now integrated into top of right column logic */}
                    <div className="hidden"></div>

                    {/* Right Column: Preview & Job Management (8 cols) */}
                    {/* Content Area (Full Width) */}
                    <div className="col-span-1 lg:col-span-12 space-y-8">

                        {/* Large Preview & Inline Editing Area */}
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 relative">

                            {/* Configuration Toggle (Floating - Left Side) */}


                            {/* SETTINGS DRAWER (Collapsible) */}
                            <div className={`transition-all duration-500 ease-in-out border-b border-slate-200 bg-white ${showSettings ? 'max-h-[800px] opacity-100 py-8 px-8' : 'max-h-0 opacity-0 py-0 overflow-hidden'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2"><Palette size={18} /> Aparência</h4>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Fundo do Topo</label>
                                            <div className="flex gap-2">
                                                <input type="color" value={formData.profile_header_color} onChange={e => setFormData({ ...formData, profile_header_color: e.target.value })} className="h-10 w-20 rounded cursor-pointer" />
                                                <div className="text-xs text-slate-400 pt-2">Cor da área superior da página.</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Cor dos Títulos das Vagas</label>
                                            <div className="flex gap-2">
                                                <input type="color" value={formData.profile_title_color} onChange={e => setFormData({ ...formData, profile_title_color: e.target.value })} className="h-10 w-20 rounded cursor-pointer" />
                                                <div className="text-xs text-slate-400 pt-2">Cor usada nos títulos das vagas.</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2"><LinkIcon size={18} /> Informações</h4>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Link Personalizado</label>
                                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 relative group-focus-within:border-indigo-500 transition-colors">
                                                <span className="text-slate-400 text-sm font-bold shrink-0">soroempregos.com/</span>
                                                <input
                                                    className="bg-transparent outline-none font-bold text-slate-700 w-full text-sm"
                                                    value={formData.username}
                                                    onChange={e => {
                                                        setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') });
                                                        setUsernameAvailable(null);
                                                    }}
                                                    placeholder="suaempresa"
                                                />
                                                <div className="shrink-0">
                                                    {checkingUsername ? (
                                                        <Loader2 size={16} className="animate-spin text-slate-400" />
                                                    ) : usernameAvailable === true ? (
                                                        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                            <Check size={14} strokeWidth={3} />
                                                            <span className="text-[10px] font-bold uppercase">Disponível</span>
                                                        </div>
                                                    ) : usernameAvailable === false ? (
                                                        <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                            <X size={14} strokeWidth={3} />
                                                            <span className="text-[10px] font-bold uppercase">Indisponível</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={checkUsernameAvailability}
                                                            disabled={!formData.username}
                                                            className="text-[10px] font-bold uppercase bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                                        >
                                                            Verificar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {usernameAvailable === false && (
                                                <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">Este usuário já existe. Tente outro.</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Descrição da Empresa</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-indigo-500"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Descreva sua empresa..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                    <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 flex items-center gap-2">
                                        {loading ? 'Salvando...' : <><Save size={16} /> Salvar Alterações</>}
                                    </button>
                                </div>
                            </div>



                            {/* PREVIEW AREA USING SHARED LAYOUT */}
                            <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-white">
                                <PublicProfileLayout
                                    company={{
                                        id: company?.id || '',
                                        name: formData.name,
                                        username: formData.username,
                                        description: formData.description,
                                        website: formData.website,
                                        profile_header_color: formData.profile_header_color,
                                        profile_title_color: formData.profile_title_color,
                                        zip_code: formData.cep,
                                        address: formData.address,
                                        number: formData.number,
                                        neighborhood: formData.neighborhood,
                                        city: formData.city,
                                        state: formData.state,
                                        complement: formData.complement,
                                        logo_url: formData.logo_url,
                                        cover_url: formData.cover_url,
                                        phone: formData.phone,
                                        whatsapp: formData.whatsapp,
                                        instagram: formData.instagram,
                                        facebook: formData.facebook,
                                        linkedin: formData.linkedin
                                    }}
                                    loading={false}
                                    isOwner={true}
                                    onLogoUpload={handleLogoUpload}
                                    isUploadingLogo={uploadingLogo}
                                >

                                    {/* Preview Controls Overlay */}
                                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center justify-between gap-3 mx-4 lg:mx-0">
                                        <div className="flex items-center gap-3">
                                            <Info className="text-yellow-600 shrink-0" size={18} />
                                            <div>
                                                <h4 className="text-sm font-bold text-yellow-800">Modo de Pré-visualização</h4>
                                                <p className="text-xs text-yellow-700">
                                                    É assim que sua página aparecerá para o público.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Buttons removed as requested */}
                                        </div>
                                    </div>

                                    {/* Filters Demo */}
                                    <Filters
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        selectedType={selectedType}
                                        setSelectedType={setSelectedType}
                                    />

                                    {/* Featured Carousel Preview */}
                                    <FeaturedCarousel
                                        jobs={previewJobs.slice(0, 3)}
                                        onApply={(job) => { setSelectedJob(job); setIsApplicationModalOpen(true); }}
                                    />

                                    <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Todas as Vagas</h3>

                                    {/* Jobs Grid Preview */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {previewJobs.map(job => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onApply={() => { setSelectedJob(job); setIsApplicationModalOpen(true); }}
                                                onReport={() => { setSelectedJob(job); setIsReportModalOpen(true); }}
                                                onQuestion={() => { setSelectedJob(job); setIsQuestionModalOpen(true); }}
                                            />
                                        ))}
                                    </div>
                                </PublicProfileLayout>
                            </div>


                            {/* Modals for Preview */}
                            {selectedJob && (
                                <>
                                    <ApplicationModal
                                        isOpen={isApplicationModalOpen}
                                        onClose={() => setIsApplicationModalOpen(false)}
                                        jobTitle={selectedJob.title}
                                    />
                                    <ReportModal
                                        isOpen={isReportModalOpen}
                                        onClose={() => setIsReportModalOpen(false)}
                                        jobTitle={selectedJob.title}
                                    />
                                    <QuestionModal
                                        isOpen={isQuestionModalOpen}
                                        onClose={() => setIsQuestionModalOpen(false)}
                                        jobTitle={selectedJob.title}
                                    />
                                </>
                            )}
                            <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
