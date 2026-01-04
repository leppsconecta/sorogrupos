
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
  Check
} from 'lucide-react';

type ProfileTab = 'account' | 'company';

export const Perfil: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');

  const TabButton = ({ id, label, icon: Icon }: { id: ProfileTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap
        ${activeTab === id 
          ? 'bg-blue-600 text-white shadow-blue-600/20' 
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  const InputField = ({ label, icon: Icon, placeholder, type = "text", defaultValue = "" }: any) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={18} />
        </div>
        <input 
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Tab Switcher */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
        <TabButton id="account" label="Perfil da Conta" icon={User} />
        <TabButton id="company" label="Perfil da Empresa" icon={Building2} />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Nome Completo" icon={User} placeholder="Seu nome" defaultValue="Administrador Sorogrupos" />
                <InputField label="Email" icon={Mail} placeholder="seu@email.com" defaultValue="admin@sorogrupos.com" />
                <InputField label="WhatsApp" icon={Smartphone} placeholder="(15) 99999-9999" defaultValue="(15) 99999-9999" />
                <InputField label="Cidade" icon={MapPin} placeholder="Sorocaba" defaultValue="Sorocaba" />
              </div>

              <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                  <Save size={18} /> Salvar Alterações
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
                <InputField label="Nome da Empresa" icon={Building2} placeholder="Sua Empresa LTDA" />
                <InputField label="CNPJ" icon={Hash} placeholder="00.000.000/0001-00" />
                <InputField label="WhatsApp Comercial" icon={Smartphone} placeholder="(15) 99999-9999" />
                <InputField label="Email Corporativo" icon={Mail} placeholder="contato@empresa.com" />
              </div>

              <div className="pt-4 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={18} className="text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Endereço</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <InputField label="Rua" icon={MapPin} placeholder="Av. Paulista" />
                  </div>
                  <InputField label="Número" icon={Hash} placeholder="1000" />
                  <InputField label="Bairro" icon={MapPin} placeholder="Centro" />
                  <InputField label="Cidade" icon={MapPin} placeholder="Sorocaba" />
                  <InputField label="Estado" icon={Globe} placeholder="SP" />
                  <InputField label="CEP" icon={Hash} placeholder="00000-000" />
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                  <Save size={18} /> Salvar Perfil da Empresa
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
