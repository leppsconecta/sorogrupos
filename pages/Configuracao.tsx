import React, { useState } from 'react';
import {
  User,
  Building2,
  Key,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Lock,
  Smartphone,
  Hash,
  Check,
  Instagram,
  Facebook,
  Linkedin,
  CreditCard,
  Shield,
  Zap,
  Camera,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { supabase } from '../lib/supabase';
import { ActionsModal } from '../components/ActionsModal';
import { PlansSection } from '../components/PlansSection';

// Styled Components / Reusable Parts

// --- Helper Functions for Social Media ---
const parseInstagram = (url: string) => {
  if (!url) return '';
  // Try to extract username from URL
  const match = url.match(/instagram\.com\/([^/?#]+)/);
  if (match) return '@' + match[1];
  // If already starts with @, return as is
  if (url.startsWith('@')) return url;
  // If it's a simple string (no slash), assume username and add @
  if (!url.includes('/')) return '@' + url;
  return url;
};

const parseFacebook = (url: string) => {
  if (!url) return '';
  const match = url.match(/facebook\.com\/([^/?#]+)/);
  if (match) return match[1];
  // Remove trailing slashes and common prefixes if any
  return url.replace(/^https?:\/\/(www\.)?facebook\.com\//, '').replace(/\/$/, '');
};

const parseLinkedin = (url: string) => {
  if (!url) return '';
  const match = url.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/);
  if (match) return match[1];
  return url.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\//, '').replace(/\/$/, '');
};

const parseWebsite = (url: string) => {
  if (!url) return '';
  // Remove protocol
  return url.replace(/^https?:\/\//, '');
};

const formatInstagramSave = (value: string) => {
  if (!value) return '';
  const username = value.replace(/^@/, '');
  return `https://instagram.com/${username}`;
};

const formatFacebookSave = (value: string) => {
  if (!value) return '';
  return `https://facebook.com/${value}`;
};

const formatLinkedinSave = (value: string) => {
  if (!value) return '';
  return `https://www.linkedin.com/in/${value}`;
};

const formatWebsiteSave = (value: string) => {
  if (!value) return '';
  let url = value;
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }
  return url;
};

// Helper Component for Phone Input (Brazil Fixed)
const FixedBrazilPhoneInput = ({ label, value, onChange, placeholder, required = false, disabled = false, helper, icon: Icon }: any) => {
  // Value coming in is likely 5515999999999 or just 15999999999
  // We want to strip 55 if present for display
  const getDisplayValue = (val: string) => {
    if (!val) return '';
    let cleaned = val.replace(/\D/g, '');

    // Always strip leading 55 if present on the stored value
    if (cleaned.startsWith('55') && cleaned.length > 2) {
      cleaned = cleaned.substring(2);
    } else if (cleaned === '55') {
      return '';
    }

    if (cleaned.length === 0) return '';

    // Prevent leading zero in display
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Format as DD 9 XXXX-XXXX (No parentheses as requested)
    // 11 9 4661-7052

    // DDD (2 digits)
    if (cleaned.length <= 2) return cleaned;

    // DDD + 9 (3 digits) -> 11 9
    if (cleaned.length <= 3) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;

    // DDD + 9 + Part1 -> 11 9 4661
    if (cleaned.length <= 7) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3)}`;

    // Full
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleChange = (e: any) => {
    let input = e.target.value.replace(/\D/g, '');

    if (!input) {
      onChange({ target: { value: '' } });
      return;
    }

    // Block leading zero
    if (input.startsWith('0')) {
      input = input.substring(1);
    }

    // Max 11 digits (2 DDD + 9 Num)
    if (input.length > 11) input = input.slice(0, 11);

    if (input.length === 0) {
      onChange({ target: { value: '' } });
      return;
    }

    // Always prepend 55 for state
    const rawValue = '55' + input;
    onChange({ target: { value: rawValue } });
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </label>
      <div className="relative group flex items-stretch">
        <div className="bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-800 rounded-l-xl px-3 flex items-center justify-center text-slate-500 font-bold text-sm select-none min-w-[3.5rem]">
          <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-5 h-auto mr-2 rounded-sm opacity-80" />
          +55
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Icon size={18} />
          </div>
          <input
            type="text"
            value={getDisplayValue(value)}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full bg-white dark:bg-slate-900 border rounded-r-xl rounded-l-none pl-10 pr-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600
                        ${required && (!value || value === '55') && !disabled ? 'border-red-300 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800 left-[-1px] relative'}
                        ${disabled ? 'bg-slate-50 dark:bg-slate-950/50 opacity-70 cursor-not-allowed select-none' : 'hover:border-blue-400/50'}
                        `}
          />
        </div>
      </div>
      {helper && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">{helper}</p>}
    </div>
  );
};

const InputField = ({ label, icon: Icon, placeholder, type = "text", value, onChange, required = false, disabled = false, helper }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
      <span>{label} {required && <span className="text-red-500">*</span>}</span>
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-white dark:bg-slate-900 border rounded-xl pl-12 pr-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600
        ${required && !value && !disabled ? 'border-red-300 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'}
        ${disabled ? 'bg-slate-50 dark:bg-slate-950/50 opacity-70 cursor-not-allowed select-none' : 'hover:border-blue-400/50'}
        `}
      />
    </div>
    {helper && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">{helper}</p>}
  </div>
);

type ProfileTab = 'personal' | 'company' | 'security' | 'billing';

export const Configuracao: React.FC = () => {
  const { user, profile, company, refreshProfile, onboardingCompleted } = useAuth();
  const { toast } = useFeedback();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Local state for forms
  const [formDataAccount, setFormDataAccount] = useState({
    full_name: profile?.full_name || '',
    whatsapp: profile?.whatsapp || '', // Store as 55...
  });

  const [formDataCompany, setFormDataCompany] = useState({
    name: company?.name || '',
    cnpj: company?.cnpj || '',
    whatsapp: company?.whatsapp || '', // Store as 55...
    email: company?.email || '',
    zip_code: company?.zip_code || '',
    website: company?.website || '',
    instagram: company?.instagram || '',
    facebook: company?.facebook || '',
    linkedin: company?.linkedin || '',
    cep: company?.cep || '',
    address: company?.address || '',
    number: company?.number || '',
    complement: company?.complement || '',
    neighborhood: company?.neighborhood || '',
    city: company?.city || '',
    state: company?.state || ''
  });

  const [loadingCep, setLoadingCep] = useState(false);

  // Password Management State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loadingPass, setLoadingPass] = useState(false);

  const hasPassword = user?.app_metadata?.providers?.includes('email');

  const lastLoadedRef = React.useRef(0);

  // Load Data Effect
  React.useEffect(() => {
    // Update if never loaded (0) or if 5 minutes (300000ms) have passed
    const now = Date.now();
    const shouldUpdate = lastLoadedRef.current === 0 || (now - lastLoadedRef.current > 300000);

    if (!shouldUpdate) return;

    if (profile) {
      setFormDataAccount({
        full_name: profile.full_name || '',
        whatsapp: profile.whatsapp || ''
      });
    }

    if (company) {
      setFormDataCompany(prev => ({
        ...prev,
        name: company.name || '',
        cnpj: company.cnpj || '',
        whatsapp: company.whatsapp || '',
        zip_code: company.zip_code || '',
        email: company.email || '',
        website: parseWebsite(company.website || ''),
        instagram: parseInstagram(company.instagram || ''),
        facebook: parseFacebook(company.facebook || ''),
        linkedin: parseLinkedin(company.linkedin || ''),
        cep: company.cep || '',
        address: company.address || '',
        number: company.number || '',
        complement: company.complement || '',
        neighborhood: company.neighborhood || '',
        city: company.city || '',
        state: company.state || ''
      }));

    }

    if (profile || company) {
      lastLoadedRef.current = now;
    }

  }, [profile, company]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (loadingPass) return;

    if (passwords.new.length < 6) {
      toast({ type: 'warning', title: 'Atenção', message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({ type: 'error', title: 'Erro', message: 'As senhas não coincidem.' });
      return;
    }

    setLoadingPass(true);
    try {
      if (hasPassword) {
        if (!passwords.current) {
          throw new Error('Por favor, informe sua senha atual.');
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: passwords.current,
        });
        if (signInError) throw new Error('Senha atual incorreta.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new
      });
      if (updateError) throw updateError;

      await supabase.auth.refreshSession();
      setShowSuccessModal(true);
      setPasswords({ current: '', new: '', confirm: '' });

    } catch (err: any) {
      console.error(err);
      toast({ type: 'error', title: 'Erro', message: err.message || 'Erro ao atualizar senha.' });
    } finally {
      setLoadingPass(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Ensure prefix
      // FixedBrazilPhoneInput ensures '55' is already at the start if user typed anything.
      // But if we edited it directly or state is inconsistent, let's be safe.
      let phoneToSave = formDataAccount.whatsapp.replace(/\D/g, '');
      if (phoneToSave && !phoneToSave.startsWith('55')) {
        phoneToSave = '55' + phoneToSave;
      }

      const { data, error } = await supabase.functions.invoke('update-user-phone', {
        body: {
          phone: phoneToSave,
          fullName: formDataAccount.full_name
        }
      });

      if (error) throw error;

      await refreshProfile();
      toast({ type: 'success', title: 'Sucesso', message: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      console.error(err);
      toast({ type: 'error', title: 'Erro', message: 'Erro ao atualizar perfil: ' + (err.message || "Erro desconhecido") });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Ensure prefix for company phone too
      let compPhoneToSave = formDataCompany.whatsapp.replace(/\D/g, '');
      if (compPhoneToSave && !compPhoneToSave.startsWith('55')) {
        compPhoneToSave = '55' + compPhoneToSave;
      }

      const dataToUpsert = {
        owner_id: user.id,
        name: formDataCompany.name,
        cnpj: formDataCompany.cnpj,
        whatsapp: compPhoneToSave,
        zip_code: formDataCompany.zip_code,
        email: (formDataCompany as any).email,
        website: formatWebsiteSave(formDataCompany.website),
        instagram: formatInstagramSave(formDataCompany.instagram),
        facebook: formatFacebookSave((formDataCompany as any).facebook),
        cep: formDataCompany.cep,
        address: formDataCompany.address,
        number: formDataCompany.number,
        complement: formDataCompany.complement,
        neighborhood: formDataCompany.neighborhood,
        city: formDataCompany.city,
        state: formDataCompany.state,

        linkedin: formatLinkedinSave(formDataCompany.linkedin),
        updated_at: new Date().toISOString()
      };

      let query;
      if (company && company.id) {
        query = supabase.from('companies').update(dataToUpsert).eq('id', company.id);
      } else {
        query = supabase.from('companies').insert(dataToUpsert);
      }

      const { error } = await query;
      if (error) throw error;

      await refreshProfile();
      toast({ type: 'success', title: 'Sucesso', message: 'Dados da empresa atualizados!' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Erro', message: 'Erro ao salvar empresa: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCepBlur = async () => {
    const cep = formDataCompany.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({ type: 'error', title: 'Erro', message: 'CEP não encontrado.' });
        return;
      }

      setFormDataCompany(prev => ({
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
    <div className="max-w-5xl mx-auto pb-20 animate-fadeIn">
      <ActionsModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Sucesso!"
        message={(
          <div className="space-y-2">
            <p>Sua senha foi atualizada com sucesso!</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Use a nova senha no próximo login.
            </p>
          </div>
        )}
        autoCloseDuration={3000}
        confirmText="Entendido"
      />

      {!onboardingCompleted && (
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 p-6 rounded-2xl animate-shake">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-amber-800 dark:text-amber-200 font-bold mb-1">Passos Iniciais Pendentes</h3>
              <p className="text-sm text-amber-700/80 dark:text-amber-300/70">
                Para aproveitar todos os recursos, por favor complete seu cadastro preenchendo as abas <span className="font-bold">Dados Pessoais</span> e <span className="font-bold">Empresa</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Configurações da Conta</h1>
          <p className="text-slate-500 font-medium">Gerencie seus dados, informações da empresa e segurança.</p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
           ${activeTab === 'personal' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <User size={16} /> Dados Pessoais
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
           ${activeTab === 'company' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Building2 size={16} /> Empresa
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
           ${activeTab === 'security' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Shield size={16} /> Segurança
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
           ${activeTab === 'billing' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <CreditCard size={16} /> Plano e Fatura
        </button>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">

        {/* === TAB: PERSONAL === */}
        {activeTab === 'personal' && (
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-fadeIn">
            <div className="max-w-2xl space-y-8">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Informações Pessoais</h3>
                <p className="text-sm text-slate-500">Dados para identificação e contato direto com o administrador da conta.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputField
                    label="Nome Completo"
                    icon={User}
                    required
                    placeholder="Seu nome completo"
                    value={formDataAccount.full_name}
                    onChange={(e: any) => setFormDataAccount({ ...formDataAccount, full_name: e.target.value })}
                  />
                </div>

                <InputField
                  label="Email de Login"
                  icon={Mail}
                  value={user?.email || ''}
                  disabled
                  helper="O email não pode ser alterado."
                />

                <FixedBrazilPhoneInput
                  label="WhatsApp Pessoal"
                  icon={Smartphone}
                  required
                  placeholder="11 9 4661-7052"
                  value={formDataAccount.whatsapp}
                  onChange={(e: any) => setFormDataAccount({ ...formDataAccount, whatsapp: e.target.value })}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveAccount}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === TAB: COMPANY === */}
        {activeTab === 'company' && (
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-fadeIn">
            <div className="space-y-8">
              <div className="border-l-4 border-emerald-500 pl-4 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dados da Empresa</h3>
                  <p className="text-sm text-slate-500">Informações públicas que aparecerão nas suas vagas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField
                  label="Nome da Empresa"
                  icon={Building2}
                  placeholder="Nome Fantasia"
                  value={formDataCompany.name}
                  onChange={(e: any) => setFormDataCompany({ ...formDataCompany, name: e.target.value })}
                />
                <InputField
                  label="CNPJ"
                  icon={Hash}
                  placeholder="00.000.000/0000-00"
                  value={formDataCompany.cnpj}
                  onChange={(e: any) => setFormDataCompany({ ...formDataCompany, cnpj: e.target.value })}
                />

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="md:col-span-2 mb-2">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2">
                      <Phone size={16} className="text-blue-500" /> Contato Comercial
                    </h4>
                  </div>

                  <FixedBrazilPhoneInput
                    label="WhatsApp Comercial"
                    icon={Smartphone}
                    placeholder="11 9 4661-7052"
                    value={formDataCompany.whatsapp}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, whatsapp: e.target.value })}
                    helper="Este número aparecerá no botão de contato das vagas."
                  />

                  <InputField
                    label="Email Corporativo"
                    icon={Mail}
                    placeholder="contato@empresa.com"
                    value={(formDataCompany as any).email}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, email: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" /> Endereço da Empresa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Row 1: CEP, Rua, Numero */}
                    <div className="md:col-span-1 relative">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                        CEP
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                          value={formDataCompany.cep}
                          onChange={e => setFormDataCompany({ ...formDataCompany, cep: e.target.value.replace(/\D/g, '').substring(0, 8) })}
                          onBlur={handleCepBlur}
                          placeholder="00000000"
                        />
                        {loadingCep && <Loader2 size={16} className="absolute right-3 top-3.5 animate-spin text-blue-500" />}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <InputField
                        label="Rua"
                        value={formDataCompany.address}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, address: e.target.value })}
                        placeholder="Logradouro"
                        icon={MapPin}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <InputField
                        label="Número"
                        value={formDataCompany.number}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, number: e.target.value })}
                        placeholder="Nº"
                        icon={Hash}
                      />
                    </div>

                    {/* Row 2: Complemento */}
                    <div className="md:col-span-4">
                      <InputField
                        label="Complemento (Opcional)"
                        value={formDataCompany.complement}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, complement: e.target.value })}
                        placeholder="Apto, Bloco, Sala..."
                        icon={Building2}
                      />
                    </div>

                    {/* Row 3: Bairro, Cidade, Estado */}
                    <div className="md:col-span-2">
                      <InputField
                        label="Bairro"
                        value={formDataCompany.neighborhood}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, neighborhood: e.target.value })}
                        placeholder="Bairro"
                        icon={MapPin}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                        Cidade
                      </label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none text-slate-500 cursor-not-allowed"
                        value={formDataCompany.city}
                        readOnly
                        placeholder="Cidade"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                        UF
                      </label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none text-center text-slate-500 cursor-not-allowed"
                        value={formDataCompany.state}
                        readOnly
                        placeholder="UF"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Globe size={16} /> Redes Sociais e Site
                  </h4>

                  {/* Social Toggles */}
                  <div className="flex gap-2">
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Website"
                    icon={Globe}
                    placeholder="www.suaempresa.com.br"
                    value={formDataCompany.website}
                    onChange={(e: any) => {
                      let val = e.target.value.replace(/^https?:\/\//, '');
                      setFormDataCompany({ ...formDataCompany, website: val });
                    }}
                    onBlur={() => {
                      if (formDataCompany.website && !formDataCompany.website.startsWith('www.')) {
                        setFormDataCompany(prev => ({ ...prev, website: 'www.' + prev.website }));
                      }
                    }}
                    helper="Digite apenas o endereço (ex: www.site.com.br)"
                  />
                  <InputField
                    label="Instagram"
                    icon={Instagram}
                    placeholder="@usuario"
                    value={formDataCompany.instagram}
                    onChange={(e: any) => {
                      let val = e.target.value;
                      if (val.includes('instagram.com/')) {
                        const match = val.match(/instagram\.com\/([^/?#]+)/);
                        if (match) val = match[1];
                      }
                      // Remove invalid chars for username (allow alphanumeric, dot, underscore)
                      // Also remove @ to re-add it cleanly
                      val = val.replace(/[^a-zA-Z0-9._]/g, '');
                      if (val) val = '@' + val;

                      setFormDataCompany({ ...formDataCompany, instagram: val });
                    }}
                    helper="Digite apenas o usuário (ex: @usuario)"
                  />
                  <InputField
                    label="Facebook"
                    icon={Facebook}
                    placeholder="usuario"
                    value={(formDataCompany as any).facebook}
                    onChange={(e: any) => {
                      let val = e.target.value;
                      if (val.includes('facebook.com/')) {
                        const match = val.match(/facebook\.com\/([^/?#]+)/);
                        if (match) val = match[1];
                      }
                      val = val.replace(/@/g, '');
                      setFormDataCompany({ ...formDataCompany, facebook: val });
                    }}
                    helper="Digite apenas o nome de usuário (sem https://facebook.com/)"
                  />
                  <InputField
                    label="LinkedIn"
                    icon={Linkedin}
                    placeholder="usuario"
                    value={formDataCompany.linkedin}
                    onChange={(e: any) => {
                      let val = e.target.value;
                      if (val.includes('linkedin.com/')) {
                        const match = val.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/);
                        if (match) val = match[1];
                      }
                      val = val.replace(/@/g, '');
                      setFormDataCompany({ ...formDataCompany, linkedin: val });
                    }}
                    helper="Digite apenas o perfil (sem https://linkedin.com/in/)"
                  />
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleSaveCompany}
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>

        )}

        {/* === TAB: PUBLIC PAGE === */}
        {activeTab === 'public_page' && (
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-fadeIn">
            <div className="space-y-8">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Página Pública</h3>
                <p className="text-sm text-slate-500">Configure como sua empresa aparece publicamente.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <InputField
                    label="Username (Link da Página)"
                    icon={Globe}
                    required
                    placeholder="ex: minhaempresa"
                    value={formDataCompany.username}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    helper={`Seu link será: sorogrupos.com/p/${formDataCompany.username || 'seu-username'}`}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Cor do Cabeçalho
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={formDataCompany.profile_header_color}
                        onChange={(e) => setFormDataCompany({ ...formDataCompany, profile_header_color: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <div className="flex-1 opacity-50 text-xs">
                        Escolha uma cor de fundo para o topo da sua página pública.
                      </div>
                    </div>
                  </div>

                  {formDataCompany.username && (
                    <div className="pt-4">
                      <a
                        href={`/p/${formDataCompany.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                      >
                        <Globe size={16} /> Visualizar Página
                      </a>
                    </div>
                  )}
                </div>

                {/* Preview Card */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 right-0 h-24"
                    style={{ backgroundColor: formDataCompany.profile_header_color }}
                  />
                  <div className="relative pt-10 px-4 text-center pb-6">
                    <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex items-center justify-center text-4xl mb-4 border-4 border-white dark:border-slate-900">
                      {formDataCompany.name ? formDataCompany.name.charAt(0).toUpperCase() : <Building2 size={32} />}
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{formDataCompany.name || 'Nome da Empresa'}</h4>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSaveCompany}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === TAB: SECURITY === */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-fadeIn">
            <div className="max-w-2xl space-y-8">
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Segurança da Conta</h3>
                <p className="text-sm text-slate-500">Gerencie a senha de acesso ao painel.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                {hasPassword && (
                  <InputField
                    label="Senha Atual"
                    icon={Key}
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e: any) => setPasswords({ ...passwords, current: e.target.value })}
                    required
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Nova Senha"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={passwords.new}
                    onChange={(e: any) => setPasswords({ ...passwords, new: e.target.value })}
                    required
                  />
                  <InputField
                    label="Confirmar Nova Senha"
                    icon={Check}
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={(e: any) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-6 flex justify-start">
                  <button
                    type="submit"
                    disabled={loadingPass}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loadingPass ? 'Processando...' : <><Lock size={16} /> Atualizar Senha</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === TAB: BILLING === */}
        {activeTab === 'billing' && (
          <div className="animate-fadeIn">
            <PlansSection />
          </div>
        )}

      </div>

    </div >
  );
};
