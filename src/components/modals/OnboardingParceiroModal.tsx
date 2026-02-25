import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, MapPin, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OnboardingParceiroModal: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [stateId, setStateId] = useState('');
    const [city, setCity] = useState('');

    const [statesList, setStatesList] = useState<any[]>([]);
    const [citiesList, setCitiesList] = useState<any[]>([]);
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Carrega Estados
    useEffect(() => {
        const fetchEstados = async () => {
            try {
                const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
                const data = await response.json();
                setStatesList(data);
            } catch (error) {
                console.error("Erro ao carregar estados:", error);
            }
        };
        fetchEstados();
    }, []);

    // Carrega Cidades
    useEffect(() => {
        if (!stateId) {
            setCitiesList([]);
            return;
        }

        const fetchCidades = async () => {
            setLoadingLocation(true);
            try {
                const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`);
                const data = await response.json();
                setCitiesList(data);
            } catch (error) {
                console.error("Erro ao carregar cidades:", error);
            } finally {
                setLoadingLocation(false);
            }
        };
        fetchCidades();
    }, [stateId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) {
            setError('Usuário não autenticado.');
            return;
        }

        if (!name || !phone || !stateId || !city) {
            setError('Preencha os campos obrigatórios.');
            return;
        }

        setLoading(true);

        try {
            const formatPhoneForDB = (p: string) => {
                const numbers = p.replace(/\D/g, '');
                if (numbers.length >= 10 && numbers.length <= 11) {
                    return `55${numbers}`;
                }
                return numbers;
            };

            const dbPhone = formatPhoneForDB(phone);
            const stateSigla = statesList.find(s => s.id.toString() === stateId)?.sigla || stateId;

            // Update da tabela affiliates
            const { error: updateError } = await supabase
                .from('affiliates')
                .update({
                    name: name,
                    phone: dbPhone,
                    state: stateSigla,
                    city: city
                })
                .eq('user_id', user.id);

            if (updateError) {
                console.error('Update via affiliates fail, try checking table permissions', updateError);
                throw updateError;
            }

            setSuccess(true);
        } catch (err: any) {
            console.error('Error updating partner onboarding:', err);
            setError(`Erro ao salvar: ${err.message || 'Tente novamente.'}`);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
                <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center animate-scaleUp">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4">
                        Tudo Pronto, Parceiro! 🚀
                    </h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Seu cadastro foi concluído. Agora você tem acesso ao painel para acompanhar suas indicações.
                    </p>
                    <button
                        onClick={async () => {
                            navigate('/parceiros/painel');
                            await refreshProfile();
                        }}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Acessar Portal <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden relative animate-scaleUp">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-10 -mr-32 -mt-32 pointer-events-none"></div>

                <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                        Complete seu Perfil
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Para liberar o seu painel de parceiro e link de indicação, precisamos de mais alguns detalhes.
                    </p>
                </div>

                <div className="p-8 pb-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-start flex-col gap-1">
                            <span className="font-bold">❌ Ops, ocorreu um erro:</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Digite seu nome completo"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                WhatsApp
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        let formatted = val;
                                        if (val.length > 2) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                                        if (val.length > 7) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7, 11)}`;
                                        setPhone(formatted);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium font-mono"
                                    placeholder="(11) 99999-9999"
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    Estado
                                </label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3.5 top-[14px] text-slate-400" />
                                    <select
                                        required
                                        value={stateId}
                                        onChange={(e) => {
                                            setStateId(e.target.value);
                                            setCity('');
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                                    >
                                        <option value="">Selecione...</option>
                                        {statesList.map((st) => (
                                            <option key={st.id} value={st.id}>{st.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    Cidade
                                </label>
                                <div className="relative">
                                    <Building size={18} className="absolute left-3.5 top-[14px] text-slate-400" />
                                    <select
                                        required
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        disabled={!stateId || loadingLocation}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium appearance-none disabled:opacity-50"
                                    >
                                        <option value="">
                                            {loadingLocation ? 'Carregando...' : 'Selecione...'}
                                        </option>
                                        {citiesList.map((ct) => (
                                            <option key={ct.id} value={ct.nome}>{ct.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 pb-2">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-wide"
                            >
                                {loading ? 'Salvando...' : 'Finalizar Cadastro'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
