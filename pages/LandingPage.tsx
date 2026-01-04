
import React, { useState } from 'react';
import { 
  Megaphone, 
  Clock, 
  Briefcase, 
  FolderIcon, 
  Users, 
  LifeBuoy, 
  Zap, 
  Smartphone,
  CheckCircle2,
  Lock,
  Mail,
  Building,
  ArrowRight,
  X,
  MapPin,
  Send,
  ChevronLeft
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface LandingPageProps {
  onLogin: (email: string, pass: string) => boolean;
}

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'login' | 'forgot' | 'success'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [error, setError] = useState('');

  const handleLoginForm = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(email, password);
    if (!success) {
      setError('Credenciais inválidas.');
    }
  };

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput.trim()) return;
    setModalView('success');
  };

  const closeAndResetModal = () => {
    setIsLoginModalOpen(false);
    setModalView('login');
    setError('');
    setRecoveryInput('');
  };

  const handleRegisterForm = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const benefits = [
    { title: 'Envios em massa', desc: 'Dispare suas vagas para centenas de grupos simultaneamente.', icon: <Megaphone className="text-yellow-400" size={24} /> },
    { title: 'Programar envios', desc: 'Agende o dia e horário que suas vagas devem ser postadas.', icon: <Clock className="text-yellow-400" size={24} /> },
    { title: 'Gestão de vagas', desc: 'Interface intuitiva para criar e organizar seus anúncios.', icon: <Briefcase className="text-yellow-400" size={24} /> },
    { title: 'Pastas por empresa', desc: 'Organize tudo por clientes ou setores de forma profissional.', icon: <FolderIcon className="text-yellow-400" size={24} /> },
    { title: 'Gestão dos grupos', desc: 'Controle total sobre as comunidades do seu WhatsApp.', icon: <Users className="text-yellow-400" size={24} /> },
    { title: 'Suporte rápido', desc: 'Time especializado pronto para te ajudar a qualquer momento.', icon: <LifeBuoy className="text-yellow-400" size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden pt-20">
      {/* Header - Fixed on top */}
      <header className="h-20 bg-blue-950 fixed top-0 left-0 w-full z-50 px-6 md:px-12 flex items-center justify-between shadow-xl">
        <Logo size="md" />
        
        <nav className="hidden lg:flex items-center gap-10">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-sm font-medium text-white/80 hover:text-yellow-400 transition-colors">Home</button>
          <button onClick={() => scrollTo('beneficios')} className="text-sm font-medium text-white/80 hover:text-yellow-400 transition-colors">Benefícios</button>
          <button onClick={() => scrollTo('contato')} className="text-sm font-medium text-white/80 hover:text-yellow-400 transition-colors">Contato</button>
        </nav>

        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="px-8 py-2.5 bg-yellow-400 text-blue-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 lg:px-24 py-8 lg:py-12 gap-10 max-w-7xl mx-auto w-full relative">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[11px] font-black uppercase tracking-widest">
            <Zap size={14} /> Automação Inteligente de Vagas
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-blue-950 leading-[1.1] tracking-tight">
            Gerencie suas vagas e grupos de <span className="text-green-500">WhatsApp</span>.
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Potencialize seu recrutamento. Dispare vagas em massa ou agende envios automáticos para centenas de comunidades de forma profissional.
          </p>
          <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
             <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <WhatsAppIcon size={24} className="text-green-500" />
                <span className="text-sm font-bold text-slate-700">Integrado ao WhatsApp</span>
             </div>
             <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <CheckCircle2 size={24} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-700">Recrutamento Escalável</span>
             </div>
          </div>
        </div>

        {/* Register Form */}
        <div className="w-full max-w-md">
          <div className="bg-blue-950 p-8 rounded-[3rem] shadow-3xl shadow-blue-900/50 border border-blue-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-800 rounded-full blur-3xl opacity-20 -mr-24 -mt-24"></div>
            
            <h3 className="text-2xl font-black text-white mb-6 text-center relative z-10">Teste Grátis Agora</h3>
            <form onSubmit={handleRegisterForm} className="space-y-4 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">Empresa</label>
                <div className="relative">
                  <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                  <input required type="text" placeholder="Nome da sua empresa" className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">WhatsApp</label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                  <input required type="text" placeholder="(15) 99999-9999" className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                  <input required type="email" placeholder="seu@email.com" className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                  <input required type="password" placeholder="••••••••" className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800" />
                </div>
              </div>
              
              <div className="pt-2">
                <button className="w-full py-4 bg-yellow-400 text-blue-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 shadow-2xl shadow-yellow-400/40 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse-scale">
                  Teste grátis <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="bg-white py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-black text-blue-950 mb-2">Potencialize sua Gestão</h3>
            <p className="text-slate-500 font-medium text-base">Tudo o que você precisa para dominar o recrutamento digital.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="p-8 bg-blue-950 rounded-[2.5rem] border border-blue-900 hover:scale-[1.02] transition-all group flex flex-col items-center text-center shadow-2xl shadow-blue-950/20">
                <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-blue-800 transition-colors">
                  {b.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{b.title}</h4>
                <p className="text-blue-300/70 text-sm leading-relaxed font-medium">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="bg-slate-50 py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-black text-blue-950 mb-4">Fale Conosco</h3>
                <p className="text-slate-500 text-base font-medium leading-relaxed">
                  Dúvidas sobre o funcionamento ou precisa de uma demonstração personalizada? Nossa equipe está pronta para te atender.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-6 p-5 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:border-blue-500 transition-all">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <WhatsAppIcon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                    <p className="text-base font-medium text-blue-950 tracking-tight">011 94661-7052</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-5 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:border-blue-500 transition-all">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                    <p className="text-base font-medium text-blue-950 tracking-tight">Sorocaba São Paulo, Brazil</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-5 bg-white rounded-3xl shadow-sm border border-slate-100 group hover:border-blue-500 transition-all">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</p>
                    <p className="text-base font-medium text-blue-950 tracking-tight">contato@soroempregos.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
              <h4 className="text-xl font-black text-blue-950 mb-6">Solicitar Contato</h4>
              <form className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                  <input type="text" placeholder="Seu nome completo" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold outline-none focus:ring-2 ring-blue-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input type="email" placeholder="seu@email.com" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold outline-none focus:ring-2 ring-blue-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem</label>
                  <textarea rows={3} placeholder="Como podemos te ajudar?" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold outline-none focus:ring-2 ring-blue-500 transition-all resize-none"></textarea>
                </div>
                <button type="button" className="w-full py-4 bg-blue-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-900 shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                   Enviar <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-blue-950 text-white py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex justify-center">
          <a 
            href="https://soroempregos.com.br" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-300 hover:text-white transition-colors text-sm font-normal"
          >
            conheça a soroempregos.com.br
          </a>
        </div>
      </footer>

      {/* Login / Recovery Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={closeAndResetModal} />
          <div className="relative bg-blue-950 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-scaleUp border border-blue-900">
            <button 
              onClick={closeAndResetModal} 
              className="absolute top-8 right-8 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {modalView === 'login' && (
              <div className="animate-fadeIn">
                <div className="w-20 h-20 bg-blue-900 text-yellow-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Lock size={40} />
                </div>

                <h3 className="text-2xl font-black text-white mb-2 text-center">Bem-vindo</h3>
                <p className="text-sm text-blue-300/60 mb-8 text-center">Acesse sua conta profissional</p>

                <form onSubmit={handleLoginForm} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="seu@email.com" 
                        className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center pr-1">
                      <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">Senha</label>
                      <button 
                        type="button" 
                        onClick={() => setModalView('forgot')}
                        className="text-[10px] font-black text-yellow-400 uppercase hover:underline tracking-widest"
                      >
                        Recuperar Senha
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800" 
                      />
                    </div>
                  </div>
                  
                  {error && <p className="text-xs font-black text-rose-400 text-center uppercase tracking-widest">{error}</p>}

                  <button className="w-full py-4 bg-yellow-400 text-blue-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 shadow-xl shadow-yellow-400/20 active:scale-95 transition-all mt-4">
                    Entrar no Painel
                  </button>
                </form>
              </div>
            )}

            {modalView === 'forgot' && (
              <div className="animate-fadeIn">
                <button 
                  onClick={() => setModalView('login')}
                  className="flex items-center gap-2 text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-white transition-colors mb-6"
                >
                  <ChevronLeft size={16} /> Voltar ao Login
                </button>

                <div className="w-20 h-20 bg-blue-900 text-yellow-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Mail size={40} />
                </div>

                <h3 className="text-2xl font-black text-white mb-2 text-center">Recuperar Senha</h3>
                <p className="text-sm text-blue-300/60 mb-8 text-center">Informe seu e-mail ou telefone cadastrado para enviarmos os dados de acesso.</p>

                <form onSubmit={handleRecoverPassword} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">E-mail ou Telefone</label>
                    <div className="relative">
                      <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        type="text" 
                        value={recoveryInput}
                        onChange={e => setRecoveryInput(e.target.value)}
                        placeholder="Ex: (15) 99999-9999 ou seu@email.com" 
                        className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800" 
                      />
                    </div>
                  </div>

                  <button className="w-full py-4 bg-yellow-400 text-blue-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 shadow-xl shadow-yellow-400/20 active:scale-95 transition-all">
                    Recuperar
                  </button>
                </form>
              </div>
            )}

            {modalView === 'success' && (
              <div className="animate-scaleUp text-center py-4">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={40} />
                </div>

                <h3 className="text-2xl font-black text-white mb-4">Senha Enviada!</h3>
                <p className="text-sm text-blue-300/70 mb-10 leading-relaxed">
                  Os dados de acesso foram enviados para o canal informado. Verifique sua caixa de entrada ou seu WhatsApp.
                </p>

                <button 
                  onClick={() => setModalView('login')}
                  className="w-full py-4 bg-white text-blue-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
                >
                  Voltar ao Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
