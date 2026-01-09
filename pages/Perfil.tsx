
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
  Linkedin
} from 'lucide-react';

// Custom Icons


const TabButton = ({ id, label, icon: Icon, active, onClick }: { id: ProfileTab, label: string, icon: any, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-2.5 md:gap-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap
    ${active
        ? 'bg-blue-600 text-white shadow-blue-600/20'
        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
  >
    <Icon size={20} />
    {label}
  </button>
);

const InputField = ({ label, icon: Icon, placeholder, type = "text", value, onChange, required = false, disabled = false }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600
        ${required && !value ? 'border-red-300 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-800'}
        ${disabled ? 'opacity-70 cursor-not-allowed select-none' : ''}`}
      />
    </div>
  </div>
);

import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { supabase } from '../lib/supabase';
// ... imports

type ProfileTab = 'account' | 'company';

export const Perfil: React.FC = () => {
  const { user, profile, company, refreshProfile, onboardingCompleted } = useAuth();
  const { toast } = useFeedback();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [activeSocials, setActiveSocials] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Local state for forms
  const [formDataAccount, setFormDataAccount] = useState({
    full_name: profile?.full_name || '',
    whatsapp: profile?.whatsapp || '',
    // city: profile?.city || '' // Assuming city is not in DB schema yet, map to address or ignore for now? 
    // Schema only has full_name, whatsapp. I'll stick to schema for Account.
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

  // Update state when context data loads
  // Initialize activeSocials based on existing data
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

      // Set active socials if they have content
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

      // Check if company exists to update or insert
      // Since we might not have ID if not created yet (though fetchProfile gets it).
      // If we have company object, update. Else insert.
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

  // Removed internal component definitions to different scope to fix re-render focus loss

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {!onboardingCompleted && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-6 rounded-2xl animate-shake">
          <h3 className="text-red-700 dark:text-red-400 font-bold mb-1 flex items-center gap-2">
            <Lock size={18} /> Perfil Incompleto
          </h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/70">
            Você precisa preencher todos os campos obrigatórios (Perfil e Empresa) para desbloquear o acesso ao sistema.
          </p>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-2 w-full">
        <TabButton id="account" label="Perfil da Conta" icon={User} active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
        <TabButton id="company" label="Perfil da Empresa" icon={Building2} active={activeTab === 'company'} onClick={() => setActiveTab('company')} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'account' ? (
          <div className="space-y-8">
            {/* Account Info */}
            <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dados da Conta</h3>
                <p className="text-sm text-slate-500 font-medium">Informações de acesso e contato pessoal do administrador.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-10 gap-6 items-start">
                <div className="md:col-span-3">
                  <InputField
                    label="Nome Completo"
                    icon={User}
                    required
                    value={formDataAccount.full_name}
                    onChange={(e: any) => setFormDataAccount({ ...formDataAccount, full_name: e.target.value })}
                  />
                </div>

                <div className="md:col-span-4">
                  <InputField
                    label="Email"
                    icon={Mail}
                    value={user?.email || ''}
                    disabled // User's email is fixed from auth
                  />
                </div>

                <div className="md:col-span-3">
                  <InputField
                    label="WhatsApp Pessoal"
                    icon={Smartphone}
                    required
                    placeholder="15 9 9999-9999"
                    value={formDataAccount.whatsapp}
                    onChange={(e: any) => setFormDataAccount({ ...formDataAccount, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleSaveAccount} disabled={loading} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                  <Save size={18} /> {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </section>

            {/* Password Reset */}
            <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Redefinir Senha</h3>
                  <p className="text-sm text-slate-500 font-medium">Mantenha sua conta protegida alterando sua senha regularmente.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Senha Atual" icon={Key} type="password" placeholder="••••••••" />
                <InputField label="Nova Senha" icon={Lock} type="password" placeholder="••••••••" />
                <InputField label="Confirmar Senha" icon={Check} type="password" placeholder="••••••••" />
              </div>

              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95">
                  Atualizar Senha
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Company Info */}
            <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Dados da Empresa</h3>
                <p className="text-sm text-slate-500 font-medium">Informações institucionais e de faturamento.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nome da Empresa"
                  icon={Building2}
                  required
                  value={formDataCompany.name}
                  onChange={(e: any) => setFormDataCompany({ ...formDataCompany, name: e.target.value })}
                />
                <InputField
                  label="CNPJ"
                  icon={Hash}
                  value={formDataCompany.cnpj}
                  onChange={(e: any) => setFormDataCompany({ ...formDataCompany, cnpj: e.target.value })}
                />
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-10 gap-6 items-start">
                  <div className="md:col-span-3">
                    <InputField
                      label="WhatsApp Comercial"
                      icon={Smartphone}
                      placeholder="(15) 99999-9999"
                      required
                      value={formDataCompany.whatsapp}
                      onChange={(e: any) => setFormDataCompany({ ...formDataCompany, whatsapp: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1.5 ml-1">
                      Este contato que será utilizado no rodapé das suas vagas
                    </p>
                  </div>

                  <div className="md:col-span-4">
                    <InputField
                      label="Email Corporativo"
                      icon={Mail}
                      placeholder="contato@empresa.com"
                      required
                      value={(formDataCompany as any).email}
                      onChange={(e: any) => setFormDataCompany({ ...formDataCompany, email: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <InputField
                      label="CEP"
                      icon={Hash}
                      required
                      value={formDataCompany.zip_code}
                      onChange={(e: any) => setFormDataCompany({ ...formDataCompany, zip_code: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Address Section Removed as per request, CEP moved above */}

              {/* Perfis Digitais */}
              <div className="pt-4 space-y-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Perfis Digitais</h4>
                  </div>

                  {/* Social Network Toggles */}
                  <div className="flex gap-2">
                    {[
                      { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' }
                    ].map((social) => (
                      !activeSocials.includes(social.id) && (
                        <button
                          key={social.id}
                          onClick={() => toggleSocial(social.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all"
                          title={`Adicionar ${social.label}`}
                        >
                          <social.icon size={16} />
                        </button>
                      )
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField
                      label="Site"
                      icon={Globe}
                      value={formDataCompany.website}
                      onChange={(e: any) => setFormDataCompany({ ...formDataCompany, website: e.target.value })}
                    />
                  </div>
                  <InputField
                    label="Instagram"
                    icon={Instagram}
                    value={formDataCompany.instagram}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, instagram: e.target.value })}
                  />
                  <InputField
                    label="Facebook"
                    icon={Facebook}
                    value={(formDataCompany as any).facebook}
                    onChange={(e: any) => setFormDataCompany({ ...formDataCompany, facebook: e.target.value })}
                  />

                  {activeSocials.includes('linkedin') && (
                    <div className="max-w-full animate-fadeIn">
                      <InputField
                        label="LinkedIn"
                        icon={Linkedin}
                        value={formDataCompany.linkedin}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, linkedin: e.target.value })}
                        required={false}
                      />
                    </div>
                  )}


                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button onClick={handleSaveCompany} disabled={loading} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                  <Save size={18} /> {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
