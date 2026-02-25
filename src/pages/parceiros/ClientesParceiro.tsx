import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, Mail, Phone, Calendar, Building, User, Activity, ExternalLink, X, Search } from 'lucide-react';

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

    useEffect(() => {
        const fetchClients = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Fetch Referrals
                const { data: referrals, error: refError } = await supabase
                    .from('referrals')
                    .select('*')
                    .eq('referrer_id', user.id)
                    .order('created_at', { ascending: false });

                if (refError) throw refError;
                if (!referrals || referrals.length === 0) {
                    setClients([]);
                    setLoading(false);
                    return;
                }

                const referredUserIds = referrals.map(r => r.referred_user_id);

                // 2. Fetch Profiles, Companies, Accounts with IN queries
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

                // 3. Combine Data
                const combinedData: ClientData[] = referrals.map(ref => {
                    const profile = profiles?.find(p => p.id === ref.referred_user_id);
                    const company = companies?.find(c => c.owner_id === ref.referred_user_id);
                    const account = accounts?.find(a => a.user_id === ref.referred_user_id);

                    let type: 'empresa' | 'candidato' | 'desconhecido' = 'desconhecido';
                    let name = 'Usuário Incompleto';
                    let whatsapp = null;
                    let avatar_url = null;

                    if (company && company.name) {
                        type = 'empresa';
                        name = company.name;
                        whatsapp = company.whatsapp || profile?.whatsapp || null;
                        avatar_url = company.logo_url || null;
                    } else if (profile && profile.full_name) {
                        type = 'candidato';
                        name = profile.full_name;
                        whatsapp = profile.whatsapp || null;
                        avatar_url = profile.avatar_url || null;
                    }

                    return {
                        referral_id: ref.id,
                        referred_user_id: ref.referred_user_id,
                        created_at: ref.created_at,
                        type,
                        name,
                        whatsapp,
                        email: null, // As said, auth.users hidden, would need a raw query or admin RPC.
                        avatar_url,
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Meus Clientes
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie os usuários e empresas que se cadastraram com seu link.
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredClients.map((client) => (
                        <div
                            key={client.referral_id}
                            onClick={() => setSelectedClient(client)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg hover:border-blue-500/30 transition-all cursor-pointer group flex items-start gap-4"
                        >
                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                                {client.avatar_url ? (
                                    <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
                                ) : client.type === 'empresa' ? (
                                    <Building size={24} />
                                ) : (
                                    <User size={24} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {client.name}
                                    </h3>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${getStatusColor(client.status)}`}>
                                        {getStatusText(client.status)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium capitalize">
                                        {client.type}
                                    </span>
                                    {client.whatsapp && (
                                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <Phone size={12} /> {client.whatsapp}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                        <Calendar size={12} /> {new Date(client.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Detalhes */}
            {selectedClient && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedClient(null)}>
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden relative animate-scaleUp" onClick={e => e.stopPropagation()}>

                        <div className="relative h-24 bg-gradient-to-r from-blue-600 to-blue-500">
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="relative -mt-12 flex justify-between items-end mb-6">
                                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-xl">
                                    {selectedClient.avatar_url ? (
                                        <img src={selectedClient.avatar_url} alt={selectedClient.name} className="w-full h-full object-cover" />
                                    ) : selectedClient.type === 'empresa' ? (
                                        <Building size={40} />
                                    ) : (
                                        <User size={40} />
                                    )}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border mb-2 ${getStatusColor(selectedClient.status)}`}>
                                    Status: {getStatusText(selectedClient.status)}
                                </span>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                    {selectedClient.name}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 capitalize font-medium flex items-center gap-2 mt-1.5">
                                    {selectedClient.type === 'empresa' ? <Building size={16} /> : <User size={16} />}
                                    Conta {selectedClient.type === 'empresa' ? 'Empresarial' : 'Candidato'}
                                    <span className="mx-1">•</span>
                                    Iniciado em {new Date(selectedClient.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {/* Informações de Contato */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
                                    {selectedClient.whatsapp ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                                                <Phone size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp Principal</p>
                                                <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{selectedClient.whatsapp}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 opacity-50">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                                                <Phone size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp</p>
                                                <p className="text-sm text-slate-500">Não informado</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    disabled={!selectedClient.whatsapp}
                                    onClick={() => {
                                        if (selectedClient.whatsapp) {
                                            const num = selectedClient.whatsapp.replace(/\D/g, '');
                                            window.open(`https://wa.me/55${num}`, '_blank');
                                        }
                                    }}
                                    className="col-span-2 py-3.5 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    <Phone size={18} /> Chamar no WhatsApp
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
