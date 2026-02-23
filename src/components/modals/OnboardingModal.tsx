import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Building, User, Smartphone, MapPin, Mail, ArrowRight, AlertCircle, Globe, Facebook, Instagram, Linkedin, Plus, Minus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../../contexts/FeedbackContext';

export const OnboardingModal: React.FC = () => {
    const { user, profile, company, refreshProfile } = useAuth();
    const { showToast } = useFeedback();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [success, setSuccess] = useState(false);

    // Auth Update State (Claim Account)
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [confirmAuthPassword, setConfirmAuthPassword] = useState('');
    const [isTempAccount, setIsTempAccount] = useState(false);
    const [isPhantomUser, setIsPhantomUser] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [personalPhone, setPersonalPhone] = useState('');

    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyCep, setCompanyCep] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyNumber, setCompanyNumber] = useState('');
    const [companyComplement, setCompanyComplement] = useState('');
    const [companyNeighborhood, setCompanyNeighborhood] = useState('');
    const [companyCity, setCompanyCity] = useState('');
    const [companyState, setCompanyState] = useState('');
    const [businessType, setBusinessType] = useState<'agencia' | 'empresa' | ''>('');

    const [loadingCep, setLoadingCep] = useState(false);

    const [companySite, setCompanySite] = useState('');

    const [showSocials, setShowSocials] = useState(false);
    const [companyInstagram, setCompanyInstagram] = useState('');
    const [companyFacebook, setCompanyFacebook] = useState('');
    const [companyLinkedin, setCompanyLinkedin] = useState('');

    useEffect(() => {
        const metadata = user?.user_metadata || {};
        const metaPhone = metadata.whatsapp ? metadata.whatsapp.replace(/^\+55/, '') : '';
        const isPhantom = metadata.tipo === 'fantasma'; // Check for phantom user

        setIsPhantomUser(isPhantom);

        if (profile) {
            // If Phantom, DO NOT pre-fill name from metadata (let user type)
            // UNLESS profile already has a real name (not the default one)
            setFullName(isPhantom ? '' : (profile.full_name || metadata.full_name || metadata.name || ''));
            setPersonalPhone(profile.whatsapp || metaPhone || '');
        } else {
            // Fallback if profile is not yet loaded
            setFullName(isPhantom ? '' : (metadata.full_name || metadata.name || ''));
            setPersonalPhone(metaPhone || '');
        }

        if (company) {
            setCompanyName(company.name || '');
            setCompanyEmail(company.email || '');
            setCompanyPhone(company.whatsapp || '');
            setCompanyCep(company.zip_code || company.cep || '');
            setCompanyAddress(company.address || '');
            setCompanyNumber(company.number || '');
            setCompanyComplement(company.complement || '');
            setCompanyNeighborhood(company.neighborhood || '');
            setCompanyCity(company.city || '');
            setCompanyState(company.state || '');
            setCompanySite(company.website || '');

            if (company.instagram || company.facebook || company.linkedin) {
                setShowSocials(true);
                setCompanyInstagram(company.instagram || '');
                setCompanyFacebook(company.facebook || '');
                setCompanyLinkedin(company.linkedin || '');
            }
        } else if (isPhantom) {
            // Clear company fields for phantom user if no company exists yet
            setCompanyName('');
            setCompanyEmail('');
            setCompanyPhone('');
            setCompanyCep('');
        }

        // Check for temp account (n8n created)
        if (user && user.email) {
            setAuthEmail(user.email);
            // If phantom user or temp email, clear auth email field
            if (isPhantom || user.email.includes('@temp.lepps.com') || user.email.includes('placeholder')) {
                setIsTempAccount(true);
                setAuthEmail(''); // Clear temp email so user types real one
            }
        }
    }, [profile, company, user]);

    const handlePhoneChange = (value: string, setter: (val: string) => void) => {
        const numbers = value.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 2) formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        if (numbers.length > 7) formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        setter(formatted);
    };

    const handleCepChange = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 5) formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
        setCompanyCep(formatted);
    };

    const handleCepBlur = async () => {
        const cepClean = companyCep.replace(/\D/g, '');
        if (cepClean.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setCompanyAddress(data.logradouro);
                setCompanyNeighborhood(data.bairro);
                setCompanyCity(data.localidade);
                setCompanyState(data.uf);

                // Optional: focus number field?
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setLoadingCep(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) return;

        if (!authEmail || !authPassword) {
            setError('Defina seu Email e Senha de acesso.');
            return;
        }

        if (authPassword !== confirmAuthPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!fullName || !personalPhone || !companyName || !companyEmail || !companyPhone || !companyCep || !businessType) {
            setError('Preencha os campos obrigatórios (Perfil, Empresa e Tipo de Perfil).');
            return;
        }

        setLoading(true);

        try {
            // Helper to format phone for DB (55 + DDD + Number)
            const formatPhoneForDB = (phone: string) => {
                const numbers = phone.replace(/\D/g, '');
                // If length is 10 or 11 (DDD + Number), add 55
                if (numbers.length >= 10 && numbers.length <= 11) {
                    return `55${numbers}`;
                }
                // If already has 55 (starts with 55 and length is 12 or 13), keep it
                // Or if user typed weirdly, trust the digits but ideally we strictly want 55+11
                return numbers;
            };

            const dbPersonalPhone = formatPhoneForDB(personalPhone);
            const dbCompanyPhone = formatPhoneForDB(companyPhone);

            // Use Edge Function for atomic claim (admin update)
            const { error: claimError } = await supabase.functions.invoke('claim-account', {
                body: {
                    email: authEmail,
                    password: authPassword,
                    phone: dbPersonalPhone,
                    fullName: fullName,
                    companyData: {
                        name: companyName,
                        email: companyEmail,
                        whatsapp: dbCompanyPhone,
                        type_business: businessType,
                        zip_code: companyCep.replace(/\D/g, ''),
                        cep: companyCep,
                        address: companyAddress,
                        number: companyNumber,
                        complement: companyComplement,
                        neighborhood: companyNeighborhood,
                        city: companyCity,
                        state: companyState,
                        website: companySite,
                        instagram: companyInstagram,
                        facebook: companyFacebook,
                        linkedin: companyLinkedin
                    }
                }
            });

            if (claimError) {
                console.error("Error claiming account:", claimError);
                // Check if it's a known auth error wrapped in the function response
                if (claimError.message && claimError.message.includes("requires a valid email")) {
                    throw new Error("Email inválido para login.");
                }
                throw claimError;
            }

            // await refreshProfile();
            setSuccess(true);

        } catch (err: any) {
            console.error('Error updating onboarding:', err);
            setError(`Erro ao salvar: ${err.message || 'Verifique os dados e tente novamente.'}`);
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
                        Seja bem-vindo(a) à SoroEmpregos! 💛💙❤️
                    </h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Crie sua primeira vaga e divulgue automaticamente nos grupos de WhatsApp.
                    </p>
                    <button
                        onClick={() => {
                            window.location.href = '/vagas';
                        }}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Criar vaga <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
            <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col md:flex-row max-h-[90vh]">

                {/* Visual Side */}
                <div className="w-full md:w-1/3 bg-blue-950 p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-yellow-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Quase lá!</h2>
                        <p className="text-blue-200 text-sm font-medium leading-relaxed hidden md:block">
                            Complete seu cadastro para ter acesso total à plataforma e começar a divulgar suas vagas.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 space-y-4 hidden md:block">
                        <div className="flex items-center gap-3 text-white/60 text-xs font-bold uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            Responsável da conta
                        </div>
                        <div className="flex items-center gap-3 text-white/60 text-xs font-bold uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            Dados da Empresa
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Profile Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                                <User size={14} /> Responsável da conta
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        required
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">WhatsApp Pessoal</label>
                                    <input
                                        required
                                        readOnly={isPhantomUser} // LOCK FOR PHONE
                                        type="text"
                                        value={personalPhone}
                                        onChange={e => handlePhoneChange(e.target.value, setPersonalPhone)}
                                        className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal ${isPhantomUser ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Access Section (Claiming) */}
                        <div className="space-y-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest flex items-center gap-2 mb-2 pb-2">
                                <Mail size={14} /> Dados de Acesso (Login)
                            </h3>
                            {/* Grid ajustado de 2 para 1 coluna se precisar ou manter 2 e spanning */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Email de Login</label>
                                    <input
                                        required
                                        type="email"
                                        value={authEmail}
                                        onChange={e => setAuthEmail(e.target.value)}
                                        className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Crie sua Senha</label>
                                        <input
                                            required
                                            type="password"
                                            value={authPassword}
                                            onChange={e => setAuthPassword(e.target.value)}
                                            className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                            placeholder="Mínimo 6 caracteres"
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Confirme sua Senha</label>
                                        <input
                                            required
                                            type="password"
                                            value={confirmAuthPassword}
                                            onChange={e => setConfirmAuthPassword(e.target.value)}
                                            className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                            placeholder="Repita a senha"
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isTempAccount && (
                                <p className="text-[10px] text-blue-600 font-medium px-1">
                                    * Como você entrou via WhatsApp, defina um email e senha para garantir seu acesso futuro.
                                </p>
                            )}
                        </div>

                        {/* Company Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest flex items-center gap-2 mb-2 border-b border-slate-100 pb-2 pt-2">
                                <Building size={14} /> Dados da Empresa
                            </h3>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Tipo perfil</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setBusinessType('agencia')}
                                        className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 ${businessType === 'agencia'
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        Agência de empregos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBusinessType('empresa')}
                                        className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 ${businessType === 'empresa'
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        Empresa
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Nome da Empresa</label>
                                <input
                                    required
                                    type="text"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                    placeholder="Razão Social ou Nome Fantasia"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Email Corporativo</label>
                                    <input
                                        required
                                        type="email"
                                        value={companyEmail}
                                        onChange={e => setCompanyEmail(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                        placeholder="contato@empresa.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">WhatsApp Comercial</label>
                                    <input
                                        required
                                        type="text"
                                        value={companyPhone}
                                        onChange={e => handlePhoneChange(e.target.value, setCompanyPhone)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">CEP</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                value={companyCep}
                                                onChange={e => handleCepChange(e.target.value)}
                                                onBlur={handleCepBlur}
                                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                                placeholder="00000-000"
                                                maxLength={9}
                                            />
                                            {loadingCep && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <Loader2 size={16} className="text-blue-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Site (Opcional)</label>
                                        <div className="relative">
                                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={companySite}
                                                onChange={e => setCompanySite(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                                placeholder="www.suaempresa.com.br"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Endereço (Rua/Av)</label>
                                    <input
                                        required
                                        type="text"
                                        value={companyAddress}
                                        onChange={e => setCompanyAddress(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                        placeholder="Rua Exemplo"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Número</label>
                                        <input
                                            required
                                            type="text"
                                            value={companyNumber}
                                            onChange={e => setCompanyNumber(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                            placeholder="123"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Complemento</label>
                                        <input
                                            type="text"
                                            value={companyComplement}
                                            onChange={e => setCompanyComplement(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                            placeholder="Sala 1, Bloco B"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Bairro</label>
                                        <input
                                            required
                                            type="text"
                                            value={companyNeighborhood}
                                            onChange={e => setCompanyNeighborhood(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                            placeholder="Bairro"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Cidade</label>
                                        <input
                                            required
                                            readOnly
                                            type="text"
                                            value={companyCity}
                                            onChange={e => setCompanyCity(e.target.value)}
                                            className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
                                            placeholder="Cidade"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">UF</label>
                                        <input
                                            required
                                            readOnly
                                            type="text"
                                            value={companyState}
                                            onChange={e => setCompanyState(e.target.value)}
                                            className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
                                            placeholder="UF"
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Social Media Toggle */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowSocials(!showSocials)}
                                    className="flex items-center justify-between w-full"
                                >
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                        Deseja adicionar redes sociais?
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showSocials ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {showSocials ? <Minus size={14} /> : <Plus size={14} />}
                                    </div>
                                </button>

                                {showSocials && (
                                    <div className="mt-4 space-y-3 animate-fadeIn">
                                        <div className="relative">
                                            <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                                            <input
                                                type="text"
                                                value={companyInstagram}
                                                onChange={e => setCompanyInstagram(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 ring-pink-500/20 transition-all placeholder:font-normal"
                                                placeholder="@instagram"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Facebook size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                                            <input
                                                type="text"
                                                value={companyFacebook}
                                                onChange={e => setCompanyFacebook(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-600/20 transition-all placeholder:font-normal"
                                                placeholder="Link do Facebook"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" />
                                            <input
                                                type="text"
                                                value={companyLinkedin}
                                                onChange={e => setCompanyLinkedin(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-700/20 transition-all placeholder:font-normal"
                                                placeholder="Link do LinkedIn"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? 'Finalizando...' : <>Concluir e Acessar <ArrowRight size={16} /></>}
                        </button>
                    </form>
                </div>
            </div >
        </div >
    );
};
