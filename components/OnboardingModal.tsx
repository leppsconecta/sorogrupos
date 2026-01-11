import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Building, User, Smartphone, MapPin, Mail, ArrowRight, AlertCircle, Globe, Facebook, Instagram, Linkedin, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../contexts/FeedbackContext';

export const OnboardingModal: React.FC = () => {
    const { user, profile, company, refreshProfile } = useAuth();
    const { showToast } = useFeedback();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [success, setSuccess] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [personalPhone, setPersonalPhone] = useState('');

    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyCep, setCompanyCep] = useState('');
    const [companySite, setCompanySite] = useState('');

    const [showSocials, setShowSocials] = useState(false);
    const [companyInstagram, setCompanyInstagram] = useState('');
    const [companyFacebook, setCompanyFacebook] = useState('');
    const [companyLinkedin, setCompanyLinkedin] = useState('');

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPersonalPhone(profile.whatsapp || '');
        }
        if (company) {
            setCompanyName(company.name || '');
            setCompanyEmail(company.email || '');
            setCompanyPhone(company.whatsapp || '');
            setCompanyCep(company.zip_code || '');
            setCompanySite(company.website || '');

            // Check if any social is present to auto-open toggle
            if (company.instagram || company.facebook || company.linkedin) {
                setShowSocials(true);
                setCompanyInstagram(company.instagram || '');
                setCompanyFacebook(company.facebook || '');
                setCompanyLinkedin(company.linkedin || '');
            }
        }
    }, [profile, company]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) return;

        if (!fullName || !personalPhone || !companyName || !companyEmail || !companyPhone || !companyCep) {
            setError('Preencha os campos obrigatórios (Perfil e Empresa).');
            return;
        }

        setLoading(true);

        try {
            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    whatsapp: personalPhone.replace(/\D/g, ''),
                    status_created: 1,
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            // Update Company
            const { data: existingCompany } = await supabase
                .from('companies')
                .select('id')
                .eq('owner_id', user.id)
                .maybeSingle();

            const companyData = {
                name: companyName,
                email: companyEmail,
                whatsapp: companyPhone.replace(/\D/g, ''),
                zip_code: companyCep.replace(/\D/g, ''),
                website: companySite,
                instagram: companyInstagram,
                facebook: companyFacebook,
                linkedin: companyLinkedin,
                status_created: 1,
                owner_id: user.id
            };

            let companyError;

            if (existingCompany) {
                const { error } = await supabase
                    .from('companies')
                    .update(companyData)
                    .eq('id', existingCompany.id);
                companyError = error;
            } else {
                const { error } = await supabase
                    .from('companies')
                    .insert([companyData]);
                companyError = error;
            }

            if (companyError) throw companyError;

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
                                        type="text"
                                        value={personalPhone}
                                        onChange={e => handlePhoneChange(e.target.value, setPersonalPhone)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Company Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest flex items-center gap-2 mb-2 border-b border-slate-100 pb-2 pt-2">
                                <Building size={14} /> Dados da Empresa
                            </h3>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">CEP</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            value={companyCep}
                                            onChange={e => handleCepChange(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:font-normal"
                                            placeholder="00000-000"
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
            </div>
        </div>
    );
};
