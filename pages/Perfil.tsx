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
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { supabase } from '../lib/supabase';
import { ActionsModal } from '../components/ActionsModal';
import { PlansSection } from '../components/PlansSection';

// Styled Components / Reusable Parts

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

export const Perfil: React.FC = () => {
  const { user, profile, company, refreshProfile, onboardingCompleted } = useAuth();
  const { toast } = useFeedback();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [activeSocials, setActiveSocials] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Local state for forms
  const [formDataAccount, setFormDataAccount] = useState({
    full_name: profile?.full_name || '',
    whatsapp: profile?.whatsapp || '',
  });

  const [formDataCompany, setFormDataCompany] = useState({
    name: company?.name || '',
    cnpj: company?.cnpj || '',
    whatsapp: company?.whatsapp || '',
    email: company?.email || '',
    zip_code: company?.zip_code || '',
    website: company?.website || '',
    instagram: company?.instagram || '',
    facebook: company?.facebook || '',
    linkedin: company?.linkedin || ''
  });

  // Password Management State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loadingPass, setLoadingPass] = useState(false);

  const hasPassword = user?.app_metadata?.providers?.includes('email');

  // Load Data Effect
  React.useEffect(() => {
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
        website: company.website || '',
        instagram: company.instagram || '',
        facebook: company.facebook || '',
        linkedin: company.linkedin || ''
      }));

      const active = [];
      if (company.linkedin) active.push('linkedin');
      setActiveSocials(active);
    }
  }, [profile, company]);

  const toggleSocial = (social: string) => {
    setActiveSocials(prev =>
      prev.includes(social) ? prev.filter(s => s !== social) : [...prev, social]
    );
  };

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
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formDataAccount.full_name,
          whatsapp: formDataAccount.whatsapp,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      await refreshProfile();
      toast({ type: 'success', title: 'Sucesso', message: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Erro', message: 'Erro ao atualizar perfil: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dataToUpsert = {
        owner_id: user.id,
        name: formDataCompany.name,
        cnpj: formDataCompany.cnpj,
        whatsapp: formDataCompany.whatsapp,
        zip_code: formDataCompany.zip_code,
        email: (formDataCompany as any).email,
        website: formDataCompany.website,
        instagram: formDataCompany.instagram,
        facebook: (formDataCompany as any).facebook,
        linkedin: formDataCompany.linkedin,
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

                <InputField
                  label="WhatsApp Pessoal"
                  icon={Smartphone}
                  required
                  placeholder="(15) 9 9999-9999"
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
                  required
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

                  <InputField
                    label="WhatsApp Comercial"
                    icon={Smartphone}
                    placeholder="(15) 99999-9999"
                    required
                    value={formDataCompany.whatsapp}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, whatsapp: e.target.value })}
                    helper="Este número aparecerá no botão de contato das vagas."
                  />

                  <InputField
                    label="Email Corporativo"
                    icon={Mail}
                    placeholder="contato@empresa.com"
                    required
                    value={(formDataCompany as any).email}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, email: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label="CEP (Endereço)"
                    icon={MapPin}
                    required
                    placeholder="18000-000"
                    value={formDataCompany.zip_code}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, zip_code: e.target.value })}
                    helper="Apenas o CEP é necessário para geolocalização básica."
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Globe size={16} /> Redes Sociais e Site
                  </h4>

                  {/* Social Toggles */}
                  <div className="flex gap-2">
                    <button onClick={() => toggleSocial('linkedin')} className={`p-2 rounded-lg transition-colors ${activeSocials.includes('linkedin') ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                      <Linkedin size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Website"
                    icon={Globe}
                    placeholder="https://www.site.com.br"
                    value={formDataCompany.website}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, website: e.target.value })}
                  />
                  <InputField
                    label="Instagram"
                    icon={Instagram}
                    placeholder="@usuario"
                    value={formDataCompany.instagram}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, instagram: e.target.value })}
                  />
                  <InputField
                    label="Facebook"
                    icon={Facebook}
                    placeholder="facebook.com/pagina"
                    value={(formDataCompany as any).facebook}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, facebook: e.target.value })}
                  />
                  {activeSocials.includes('linkedin') && (
                    <div className="animate-fadeIn">
                      <InputField
                        label="LinkedIn"
                        icon={Linkedin}
                        placeholder="linkedin.com/in/perfil"
                        value={formDataCompany.linkedin}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, linkedin: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={handleSaveCompany}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                  Salvar Dados da Empresa
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

    </div>
  );
};
