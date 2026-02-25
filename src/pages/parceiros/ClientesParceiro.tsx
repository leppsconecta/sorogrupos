import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, Mail, Phone, Calendar, Building, User, Activity, ExternalLink, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClientData {
    referral_id: string;
    referred_user_id: string;
    created_at: string;
    type: 'empresa' | 'candidato' | 'desconhecido';
    name: string;
    whatsapp: string | null;
    email: string | null;
    avatar_url: string | null;
    status: string;
    document: string | null;
    corporate_name: string | null;
    business_type: string | null;
    address: string | null;
    social: {
        website?: string | null;
        instagram?: string | null;
        linkedin?: string | null;
        facebook?: string | null;
    } | null;
    public_link: string | null;
    details: {
        profile?: any;
        company?: any;
        account?: any;
    };
}

export const ClientesParceiro: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<ClientData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        const fetchClients = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Fetch Affiliate ID
                const { data: affiliateData, error: affErr } = await supabase
                    .from('affiliates')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (affErr || !affiliateData) {
                    setClients([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch Referrals
                const { data: referrals, error: refError } = await supabase
                    .from('referrals')
                    .select('*')
                    .eq('affiliate_id', affiliateData.id)
                    .order('created_at', { ascending: false });

                if (refError) throw refError;
                if (!referrals || referrals.length === 0) {
                    setClients([]);
                    setLoading(false);
                    return;
                }

                const referredUserIds = referrals.map(r => r.referred_user_id);

                // 3. Fetch Profiles, Companies, Accounts with IN queries
                const [
                    { data: profiles },
                    { data: companies },
                    { data: accounts }
                ] = await Promise.all([
                    supabase.from('profiles').select('*').in('id', referredUserIds),
                    supabase.from('companies').select('*').in('owner_id', referredUserIds),
                    supabase.from('user_accounts').select('*').in('user_id', referredUserIds)
                ]);

                // We need emails too. Since we can't query auth.users directly via REST without admin rights,
                // we will rely on profile/company data for communication.
                // It's recommended to store email in profiles if needed, but for now we'll use whatsapp.

                // 4. Combine Data
                const combinedData: ClientData[] = referrals.map(ref => {
                    const profile = profiles?.find(p => p.id === ref.referred_user_id);
                    const company = companies?.find(c => c.owner_id === ref.referred_user_id);
                    const account = accounts?.find(a => a.user_id === ref.referred_user_id);

                    let type: 'empresa' | 'candidato' | 'desconhecido' = 'desconhecido';
                    let name = 'Usuário Incompleto';
                    let whatsapp = null;
                    let email = null;
                    let avatar_url = null;
                    let document = null;
                    let corporate_name = null;
                    let business_type = null;
                    let address = null;
                    let social = null;
                    let public_link = null;

                    if (company && company.name) {
                        type = 'empresa';
                        name = company.name;
                        whatsapp = company.whatsapp || profile?.whatsapp || null;
                        email = company.email || profile?.email || null;
                        avatar_url = company.logo_url || null;
                        document = company.document || null;
                        corporate_name = company.corporate_name || null;
                        business_type = company.type_business || null;

                        // Pegar endereço e sociais da empresa
                        const addressParts = [company.address, company.neighborhood, company.city, company.state].filter(Boolean);
                        address = addressParts.length > 0 ? addressParts.join(', ') : null;

                        social = {
                            website: company.website,
                            instagram: company.instagram,
                            linkedin: company.linkedin,
                            facebook: company.facebook
                        };

                        public_link = company.short_id ? `https://sorogrupos.com.br/empresa/${company.short_id}` : null;
                    } else if (profile && profile.full_name) {
                        type = 'candidato';
                        name = profile.full_name;
                        whatsapp = profile.whatsapp || null;
                        email = profile.email || null;
                        avatar_url = profile.avatar_url || null;
                        document = profile.document || null;

                        const addressParts = [profile.city, profile.state].filter(Boolean);
                        address = addressParts.length > 0 ? addressParts.join(' - ') : null;

                        social = {
                            linkedin: profile.linkedin,
                            instagram: profile.instagram
                        };
                        public_link = null;
                    }

                    return {
                        referral_id: ref.id,
                        referred_user_id: ref.referred_user_id,
                        created_at: ref.created_at,
                        type,
                        name,
                        whatsapp,
                        email,
                        avatar_url,
                        document,
                        corporate_name,
                        business_type,
                        address,
                        social,
                        public_link,
                        status: account?.status || 'trial',
                        details: {
                            profile,
                            company,
                            account
                        }
                    };
                });

                setClients(combinedData);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [user]);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
    const paginatedClients = filteredClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'trial': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'suspended': return 'bg-red-100 text-red-700 border-red-200';
            case 'cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo e Pago';
            case 'trial': return 'Testando';
            case 'suspended': return 'Suspenso';
            case 'cancelled': return 'Cancelado';
            default: return 'Desconhecido';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-2">
                <div className="relative w-full md:w-72">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl min-h-[400px]">
                    <Activity className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Buscando seus referidos...</p>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl min-h-[400px] text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum cliente encontrado</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Compartilhe seu link de indicação para atrair mais empresas e candidatos para a SoroGrupos.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="p-3 font-semibold pl-4">Cliente</th>
                                    <th className="p-3 font-semibold">Contato</th>
                                    <th className="p-3 font-semibold">CNPJ / CPF</th>
                                    <th className="p-3 font-semibold text-center">Data</th>
                                    <th className="p-3 font-semibold text-center">Status</th>
                                    <th className="p-3 font-semibold text-center pr-4">Contato</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedClients.map((client) => (
                                    <tr
                                        key={client.referral_id}
                                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors last:border-0"
                                    >
                                        <td className="p-3 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                    {client.avatar_url ? (
                                                        <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover rounded-full" />
                                                    ) : client.type === 'empresa' ? (
                                                        <Building size={14} className="text-slate-500" />
                                                    ) : (
                                                        <User size={14} className="text-slate-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0 max-w-[200px]">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate" title={client.name}>
                                                        {client.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                                                            {client.type === 'empresa' && client.business_type ? client.business_type : client.type}
                                                        </span>
                                                    </div>
                                                    {client.type === 'empresa' && client.corporate_name && (
                                                        <span className="text-[10px] text-slate-400 truncate mt-0.5" title={client.corporate_name}>
                                                            {client.corporate_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                                                {client.whatsapp ? (
                                                    <div className="flex items-center gap-1.5 whitespace-nowrap"><Phone size={12} /> {client.whatsapp}</div>
                                                ) : <span className="text-slate-400 italic text-[10px] uppercase">S/ WPP</span>}
                                                {client.email && (
                                                    <div className="flex items-center gap-1.5 truncate max-w-[150px]" title={client.email}><Mail size={12} /> {client.email}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {client.document || '--'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {new Date(client.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 ml-2 rounded inline-block whitespace-nowrap ${getStatusColor(client.status)}`}>
                                                {getStatusText(client.status)}
                                            </span>
                                        </td>
                                        <td className="p-3 pr-4 text-center">
                                            <button
                                                onClick={() => setSelectedClient(client)}
                                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 font-bold tracking-wide text-xs transition-colors mx-auto flex items-center gap-1.5"
                                            >
                                                Ver Contato
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mt-2 shadow-sm">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Página <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> de <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Detalhes de Contato */}
            {selectedClient && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedClient(null)}>
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden relative animate-scaleUp" onClick={e => e.stopPropagation()}>

                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Informações de Contato</h3>
                                <p className="text-sm text-slate-500">{selectedClient.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="p-2 bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* Dados Básicos de Contato */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
                                {selectedClient.whatsapp && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                                            <Phone size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp</p>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{selectedClient.whatsapp}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const num = selectedClient.whatsapp!.replace(/\D/g, '');
                                                window.open(`https://wa.me/55${num}`, '_blank');
                                            }}
                                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold text-xs rounded-lg transition-colors"
                                        >
                                            Chamar
                                        </button>
                                    </div>
                                )}

                                {selectedClient.email && (
                                    <div className="flex items-center gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                            <Mail size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail</p>
                                            <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{selectedClient.email}</p>
                                        </div>
                                        <a
                                            href={`mailto:${selectedClient.email}`}
                                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 font-bold text-xs rounded-lg transition-colors"
                                        >
                                            Enviar
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Endereço */}
                            {selectedClient.address && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
                                        <Building size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Endereço / Localidade</p>
                                        <p className="font-medium text-sm text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">{selectedClient.address}</p>
                                    </div>
                                </div>
                            )}

                            {/* Redes Sociais */}
                            {selectedClient.social && (Object.values(selectedClient.social).some(v => !!v)) && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Redes Sociais</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedClient.social.instagram && (
                                            <a href={selectedClient.social.instagram} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg text-xs font-bold transition-colors">
                                                Instagram
                                            </a>
                                        )}
                                        {selectedClient.social.linkedin && (
                                            <a href={selectedClient.social.linkedin} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                                                LinkedIn
                                            </a>
                                        )}
                                        {selectedClient.social.facebook && (
                                            <a href={selectedClient.social.facebook} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                                                Facebook
                                            </a>
                                        )}
                                        {selectedClient.social.website && (
                                            <a href={selectedClient.social.website} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold transition-colors">
                                                Site
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Link Público */}
                            {selectedClient.public_link && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 p-4 flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-blue-600/70 dark:text-blue-400/70 tracking-wider">Link Público na Plataforma</p>
                                        <a href={selectedClient.public_link} target="_blank" rel="noreferrer" className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block mt-0.5">
                                            {selectedClient.public_link}
                                        </a>
                                    </div>
                                    <a
                                        href={selectedClient.public_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all shrink-0"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
