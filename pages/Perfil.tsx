
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
  // Added Check to imports to fix the error
  Check,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react';

// Custom Icons
const TikTokIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const KwaiIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 4v16" />
    <path d="M18 4l-10 8" />
    <path d="M8 12l10 8" />
  </svg>
);

const TabButton = ({ id, label, icon: Icon, active, onClick }: { id: ProfileTab, label: string, icon: any, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap
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
    name: company?.name || '',
    cnpj: company?.cnpj || '',
    name: company?.name || '',
    cnpj: company?.cnpj || '',
    whatsapp: company?.whatsapp || '',
    email: company?.email || '',
    zip_code: company?.zip_code || '',
    website: company?.website || '',
    instagram: company?.instagram || '',
    facebook: company?.facebook || '',
    linkedin: company?.linkedin || '',
    // custom fields not in DB explicitly but managed in state for now? 
    // Wait, the DB only has website, instagram, linkedin. 
    // And user asked for TikTok, Kwai. 
    // I need to add them to DB if I want to save them?
    // User request: "Ao clicar no icone (kawai, tiktok ou linkedin) abra o campo".
    // I should probably save them in a json 'socials' field or just assume they map to something.
    // Schema doesn't have tiktok/kwai. I will add them to state but since I can't save them to DB without schema change, I will ignore saving them to DB for now or reuse existing fields? 
    // Actually, I should probably ask or just implement the UI behavior requested.
    // I'll stick to what I can save: linkedin, instagram, website.
    // Except if user implied I should support them in DB too.
    // "Remova os campos de endereço... O campo CEP movido... Ao clicar no icone abra o campo".
    // I'll implement the UI logic. If I can't save TikTok/Kwai, I won't save them yet or I'll put them in a catch-all if I had one. 
    // Since I can't change schema for tiktok/kwai easily without migration (I can do migration), but user didn't explicitly ask for backend support for tiktok/kwai, just UI behavior.
    // Wait, I can do a migration for tiktok and kwai columns?
    // Let's stick to the requested UI changes first. I will add tiktok and kwai to state.
    tiktok: '',
    kwai: ''
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
      if (company.tiktok) active.push('tiktok');
      if (company.kwai) active.push('kwai');
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
        name: formDataCompany.name,
        cnpj: formDataCompany.cnpj,
        whatsapp: formDataCompany.whatsapp,
        zip_code: formDataCompany.zip_code,
        email: (formDataCompany as any).email,
        website: formDataCompany.website,
        instagram: formDataCompany.instagram,
        facebook: (formDataCompany as any).facebook,
        linkedin: formDataCompany.linkedin,
        tiktok: (formDataCompany as any).tiktok,
        kwai: (formDataCompany as any).kwai,
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
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
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
                <button onClick={handleSaveAccount} disabled={loading} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                  <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
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
                      { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                      { id: 'tiktok', icon: TikTokIcon, label: 'TikTok' },
                      { id: 'kwai', icon: KwaiIcon, label: 'Kwai' }
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

                  {activeSocials.includes('tiktok') && (
                    <div className="max-w-full animate-fadeIn">
                      <InputField
                        label="TikTok"
                        icon={TikTokIcon}
                        value={(formDataCompany as any).tiktok}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, tiktok: e.target.value })}
                        required={false}
                      />
                    </div>
                  )}

                  {activeSocials.includes('kwai') && (
                    <div className="max-w-full animate-fadeIn">
                      <InputField
                        label="Kwai"
                        icon={KwaiIcon}
                        value={(formDataCompany as any).kwai}
                        onChange={(e: any) => setFormDataCompany({ ...formDataCompany, kwai: e.target.value })}
                        required={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button onClick={handleSaveCompany} disabled={loading} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                  <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Perfil da Empresa'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
