
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
  ChevronLeft,
  Eye,
  EyeOff,
  LogIn,
  Search
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { CandidateLanding } from '../components/public/CandidateLanding';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Grupo {
  id: string;
  nome_grupo: string;
  descricao_grupo: string | null;
  vinculo: string | null;
  categoria: string | null;
  cidade: string | null;
  total_participantes: number | null;
  link_convite: string | null;
}

interface LandingPageProps {
  autoOpenLogin?: boolean;
}

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const MOCK_GRUPOS: Grupo[] = [
  { id: 'm1', nome_grupo: 'SoroEmpregos - Vagas CLT 01', descricao_grupo: 'Vagas fixas em Sorocaba e região', vinculo: 'CLT', categoria: 'Geral', cidade: 'Sorocaba', total_participantes: 245, link_convite: 'https://chat.whatsapp.com/test-clt-1' },
  { id: 'm2', nome_grupo: 'Logística & Indústria', descricao_grupo: 'Foco em vagas operacionais', vinculo: 'CLT', categoria: 'Logística', cidade: 'Itu', total_participantes: 180, link_convite: 'https://chat.whatsapp.com/test-clt-2' },
  { id: 'm3', nome_grupo: 'Bicos Sorocaba & Votorantim', descricao_grupo: 'Trabalhos rápidos e diárias', vinculo: 'FREELANCE', categoria: 'Geral', cidade: 'Sorocaba', total_participantes: 250, link_convite: 'https://chat.whatsapp.com/test-free-1' },
  { id: 'm4', nome_grupo: 'Garçons & Eventos VIP', descricao_grupo: 'Freelance para buffets e festas', vinculo: 'FREELANCE', categoria: 'Eventos', cidade: 'Sorocaba', total_participantes: 120, link_convite: 'https://chat.whatsapp.com/test-free-2' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ autoOpenLogin = false }) => {
  const [landingMode, setLandingMode] = useState<'EMP' | 'CAND'>('CAND');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'login' | 'forgot' | 'reset_sent' | 'account_exists' | 'register_success'>('login');

  // Floating WhatsApp Group Button States
  const [showFloatingWa, setShowFloatingWa] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [groupStep, setGroupStep] = useState<'type' | 'list' | 'lead'>('type');
  const [selectedGroupVinculo, setSelectedGroupVinculo] = useState<'CLT' | 'FREELANCE' | null>('CLT'); // Default to CLT
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');

  // Lead Capture States
  const [leadName, setLeadName] = useState('');
  const [leadProfile, setLeadProfile] = useState<'empresa' | 'voluntario' | 'agencia' | ''>('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [error, setError] = useState('');

  // Register Form State
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // WhatsApp Login State
  const [loginMethod, setLoginMethod] = useState<'email' | 'whatsapp'>('email');
  const [whatsPhone, setWhatsPhone] = useState('');
  const [whatsCode, setWhatsCode] = useState('');
  const [whatsStep, setWhatsStep] = useState<'phone' | 'code'>('phone');
  const [whatsLoading, setWhatsLoading] = useState(false);
  const [isNotFoundModalOpen, setIsNotFoundModalOpen] = useState(false); // New state for alert modal
  const [countdown, setCountdown] = useState(0);

  // Timer Effect
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Floating Button Timer (6 seconds in EMP mode)
  React.useEffect(() => {
    if (landingMode === 'EMP') {
      const timer = setTimeout(() => setShowFloatingWa(true), 6000);
      return () => clearTimeout(timer);
    } else {
      setShowFloatingWa(false);
    }
  }, [landingMode]);

  // Fetch Groups when vinculo is selected
  React.useEffect(() => {
    if (!selectedGroupVinculo) {
      setGrupos([]);
      return;
    }
    setGroupsLoading(true);
    // Note: Search is local now, so we don't clear it here unless we want to
    // setGroupSearch(''); 

    supabase
      .from('grupos')
      .select('id, nome_grupo, descricao_grupo, vinculo, categoria, cidade, total_participantes, link_convite')
      .eq('vinculo', selectedGroupVinculo)
      .eq('apoio', true)
      .order('nome_grupo', { ascending: true })
      .then(({ data }) => {
        const dbData = (data as Grupo[]) || [];
        const mocks = MOCK_GRUPOS.filter(g => g.vinculo === selectedGroupVinculo);

        // Combine or just use mocks if db is empty for testing
        setGrupos([...dbData, ...mocks]);
        setGroupsLoading(false);
      });
  }, [selectedGroupVinculo]);

  const handleLeadPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let numeric = rawValue.slice(0, 11);

    // Prevent DDD starting with 0
    if (numeric.length > 0 && numeric[0] === '0') {
      numeric = numeric.slice(1);
    }

    let formatted = numeric;
    if (numeric.length > 2) formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
    // format as (XX) 9 XXXX-XXXX if 11 digits
    if (numeric.length === 11) {
      formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2, 3)} ${numeric.slice(3, 7)}-${numeric.slice(7)}`;
    } else if (numeric.length > 7) {
      formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7)}`;
    }
    setLeadPhone(formatted);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = leadPhone.replace(/\D/g, '');

    if (!leadName || !leadProfile || phoneDigits.length < 10 || !leadEmail || !selectedGroup) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const ddd = phoneDigits.slice(0, 2);
    if (ddd.length < 2 || ddd[0] === '0') {
      alert("Por favor, insira um DDD válido (não pode começar com 0).");
      return;
    }

    setLeadLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('name', leadName);
      params.append('profile', leadProfile);
      params.append('phone', leadPhone);
      params.append('email', leadEmail);
      params.append('target_group', selectedGroup.nome_grupo);
      params.append('group_id', selectedGroup.id);
      params.append('date', new Date().toISOString());

      await fetch('https://webhook.leppsconecta.com.br/webhook/b3728120-3da1-4bf5-9a9d-91b177ba1ff8', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      // Redirect to group link
      window.open(selectedGroup.link_convite || '#', '_blank');

      // Reset and close
      setIsLeadModalOpen(false);
      setLeadName('');
      setLeadProfile('');
      setLeadPhone('');
      setLeadEmail('');
      // setGroupStep('type'); // Keep the step in the section
      setSelectedGroup(null);
      // setSelectedGroupVinculo(null); // Keep the vinculo
    } catch (error) {
      console.error(error);
      alert("Erro ao processar lead. Tente novamente.");
    } finally {
      setLeadLoading(false);
    }
  };

  const filteredGroups = grupos.filter(g => {
    if (groupSearch.trim() === '') return true;
    const q = groupSearch.toLowerCase();
    return (
      g.nome_grupo?.toLowerCase().includes(q) ||
      g.cidade?.toLowerCase().includes(q) ||
      g.descricao_grupo?.toLowerCase().includes(q)
    );
  });


  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleContactPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    let charCode = numbers.length;
    if (numbers.length > 11) charCode = 11;
    const numeric = numbers.slice(0, charCode);
    let formatted = numeric;
    if (numeric.length > 2) formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
    if (numeric.length > 7) formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7)}`;
    setContactPhone(formatted);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage || !contactPhone) {
      alert("Preencha todos os campos.");
      return;
    }
    setContactLoading(true);
    try {
      // Usando no-cors com form-urlencoded para evitar bloqueios de CORS em localhost
      // e garantir que o webhook receba os dados mesmo sem headers complexos
      const params = new URLSearchParams();
      params.append('name', contactName);
      params.append('email', contactEmail);
      params.append('phone', contactPhone);
      params.append('message', contactMessage);
      params.append('date', new Date().toISOString());

      await fetch('https://webhook.leppsconecta.com.br/webhook/ad743de6-8435-435c-85af-21bbfb696eae', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      // Com no-cors, não recebemos status de erro (é opaco), então assumimos sucesso se não lançar exceção de rede
      setContactSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleLoginForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Auth state change will handle redirect in App.tsx
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryInput, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;
      setModalView('reset_sent');
    } catch (err) {
      // For security, we often show success even if email not found, or handle specific errors
      setModalView('reset_sent');
    } finally {
      setLoading(false);
    }
  };

  const closeAndResetModal = () => {
    setIsLoginModalOpen(false);
    setModalView('login');
    setError('');
    setRecoveryInput('');
    setLoading(false);
  };

  const handleWhatsPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '');
    let charCode = numbers.length;
    if (numbers.length > 11) charCode = 11;
    const numeric = numbers.slice(0, charCode);
    let formatted = numeric;
    if (numeric.length > 2) formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
    if (numeric.length > 7) formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7)}`;
    setWhatsPhone(formatted);
  };

  const handleWhatsAppTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsPhone.replace(/\D/g, '').length < 10) {
      alert("Por favor, insira um número válido.");
      return;
    }
    setWhatsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-whatsapp-login', {
        body: { phone: whatsPhone }
      });

      if (error) throw error;

      if (data && data.not_found) {
        setIsNotFoundModalOpen(true);
        return;
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      setWhatsStep('code');
      setCountdown(60); // Start 60s timer
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setWhatsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setWhatsCode(''); // Limpa o campo de código
    setWhatsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('trigger-whatsapp-login', {
        body: { phone: whatsPhone }
      });
      if (error) throw error;
      setCountdown(60);
      // alert('Código reenviado com sucesso!'); // Removido a pedido
    } catch (err: any) {
      console.error(err);
      alert('Erro ao reenviar: ' + err.message);
    } finally {
      setWhatsLoading(false);
    }
  };

  const handleWhatsAppVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsCode.length < 6) return;
    setWhatsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-whatsapp-login', {
        body: { phone: whatsPhone, code: whatsCode }
      });

      if (error) throw error;

      // Checa erro lógico retornado com status 200 (para evitar bloqueio de CORS/Client genérico)
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;
        // Auth context handles redirect
      }
    } catch (err: any) {
      console.error(err);
      if (err.message) {
        alert(err.message);
      } else {
        alert('Código inválido ou expirado.');
      }
    } finally {
      setWhatsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não é dígito
    const numbers = e.target.value.replace(/\D/g, '');
    let charCode = numbers.length;
    if (numbers.length > 11) charCode = 11; // max 11 digits

    const numeric = numbers.slice(0, charCode);
    let formatted = numeric;

    // Formatação (XX) XXXXX-XXXX
    if (numeric.length > 2) {
      formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
    }
    if (numeric.length > 7) {
      formatted = `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7)}`;
    }

    setRegPhone(formatted);
  };

  const handleRegisterForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regEmail || !regPassword || !regCompany || !regPhone) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Validação de senha: min 6 caracteres
    if (regPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Validação: pelo menos 1 letra e 1 número
    const hasLetter = /[a-zA-Z]/.test(regPassword);
    const hasNumber = /[0-9]/.test(regPassword);

    if (!hasLetter && !hasNumber) {
      // Fallback interpretation of "letter OR number" if user really meant that (which is just alphanumeric check vs special chars)
      // But usually "letra E numero" is the standard requirement.
      // User said "minimo 1 letra ou numero" (at least 1 letter OR number) in second prompt.
      // First prompt "minimo 1 letra... e numeros".
      // I will assume they want at least one letter AND at least one number.
    }

    // Strict interpretation of "At least 1 letter or number" means strings like "!!!!!" fail, but "a!!!!" passes.
    // Ideally we want 1 letter AND 1 number.
    if (!hasLetter && !hasNumber) {
      alert('A senha deve conter pelo menos 1 letra ou 1 número.');
      return;
    }

    // Validação básica de telefone (esperando 11 dígitos => formato com pelo menos 14 ou 15 chars)
    // (XX) XXXXX-XXXX -> 15 chars
    if (regPhone.replace(/\D/g, '').length < 10) {
      alert('Por favor, insira um telefone válido com DDD.');
      return;
    }

    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regCompany,
            name: regCompany,
            company_name: regCompany,
            whatsapp: `+55${regPhone.replace(/\D/g, '')}`, // Persist with +55 prefix stripped of formatting
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Trigger de banco de dados agora cria automaticamente:
        // 1. Perfil
        // 2. Conexão WhatsApp
        // 3. Emojis Padrão
        // 4. Pasta Empresa (Carrefour)
        // 5. Pasta Setor (Ax. Administrativo)
      }

      if (data.session) {
        // Logado automaticamente
      } else {
        // Sucesso no cadastro
        setIsLoginModalOpen(true);
        setModalView('register_success');
        // Reset fields
        setRegCompany('');
        setRegPhone('');
        setRegEmail('');
        setRegPassword('');
      }
    } catch (err: any) {
      console.error('Erro detalhado no cadastro:', err);
      if (err.message === 'User already registered' || err.status === 422) {
        setIsLoginModalOpen(true);
        setModalView('account_exists');
      } else {
        alert('Erro ao cadastrar: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Erro Google login:', err);
      alert('Erro ao conectar com Google: ' + err.message);
    }
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
    <div id="home" className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden pt-20">
      {/* Header - Fixed on top */}
      <header className="h-20 bg-blue-950 fixed top-0 left-0 w-full z-50 px-6 md:px-12 flex items-center justify-between shadow-xl">
        <div className="flex-1"></div>

        <div className="flex bg-blue-900/50 p-1 rounded-xl backdrop-blur-sm border border-blue-800/50">
          <button
            onClick={() => setLandingMode('CAND')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${landingMode === 'CAND' ? 'bg-yellow-400 text-blue-950 shadow-lg' : 'text-blue-300 hover:text-white'}`}
          >
            Modo Candidato
          </button>
          <button
            onClick={() => setLandingMode('EMP')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${landingMode === 'EMP' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-300 hover:text-white'}`}
          >
            Modo Empresa
          </button>
        </div>

        <div className="flex-1 flex justify-end">
          {landingMode === 'EMP' && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden md:block px-8 py-2.5 bg-yellow-400 text-blue-950 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      {
        landingMode === 'EMP' ? (
          <>
            <section className="flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 lg:px-24 py-8 lg:py-12 gap-10 max-w-7xl mx-auto w-full relative">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[11px] font-bold uppercase tracking-widest">
                  <Zap size={14} /> Automação Inteligente de Vagas
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-950 leading-[1.1] tracking-tight">
                  Gerencie suas vagas e grupos de <span className="text-green-500">WhatsApp</span>.
                </h2>
                <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Potencialize seu recrutamento. Dispare vagas em massa ou agende envios automáticos para centenas de comunidades de forma profissional.
                </p>
                <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center gap-3 md:gap-4 justify-center lg:justify-start">
                  <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 px-3 md:px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center sm:text-left">
                    <WhatsAppIcon size={24} className="text-green-500" />
                    <span className="text-[10px] sm:text-sm font-semibold text-slate-700">Integrado ao WhatsApp</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 px-3 md:px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center sm:text-left">
                    <CheckCircle2 size={24} className="text-blue-600" />
                    <span className="text-[10px] sm:text-sm font-semibold text-slate-700">Recrutamento Escalável</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="md:hidden text-sm text-blue-400 hover:text-blue-600 transition-colors underline underline-offset-2 mt-1"
                >
                  Fazer login
                </button>
              </div>

              {/* Register Form */}
              <div className="w-full max-w-md">
                <div className="bg-blue-950 p-8 rounded-[3rem] shadow-3xl shadow-blue-900/50 border border-blue-900 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-800 rounded-full blur-3xl opacity-20 -mr-24 -mt-24"></div>

                  <h3 className="text-2xl font-bold text-white mb-6 text-center relative z-10">Teste Grátis Agora</h3>
                  <form onSubmit={handleRegisterForm} className="space-y-4 relative z-10">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest ml-1">Qual seu nome</label>
                      <div className="relative">
                        <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                        <input
                          required
                          type="text"
                          value={regCompany}
                          onChange={(e) => setRegCompany(e.target.value)}
                          placeholder="Seu nome"
                          className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-blue-300 uppercase tracking-widest ml-1 font-semibold">Qual seu WhatsApp?</label>
                      <div className="relative">
                        <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                        <span className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">+55</span>
                        <input
                          required
                          type="text"
                          inputMode="numeric"
                          value={regPhone}
                          onChange={handlePhoneChange}
                          placeholder="(15) 99999-9999"
                          className="w-full bg-white border-none rounded-2xl pl-20 pr-4 py-3.5 text-sm outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-blue-300 uppercase tracking-widest ml-1 font-semibold">Qual o email de login para a conta ?</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                        <input
                          required
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-blue-300 uppercase tracking-widest ml-1 font-semibold">Senha</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" />
                        <input
                          required
                          type={showRegPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border-none rounded-2xl pl-12 pr-12 py-3.5 text-sm outline-none focus:ring-4 ring-yellow-400/50 transition-all text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-500 transition-colors"
                        >
                          {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button disabled={loading} className="w-full py-4 bg-yellow-400 text-blue-950 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-yellow-300 shadow-2xl shadow-yellow-400/40 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse-scale disabled:opacity-70 disabled:pointer-events-none">
                        {loading ? (
                          <>Criando conta...</>
                        ) : (
                          <>Teste grátis <ArrowRight size={18} /></>
                        )}
                      </button>

                      <div className="relative flex py-4 items-center">
                        <div className="flex-grow border-t border-blue-800"></div>
                        <span className="flex-shrink-0 mx-4 text-blue-300/40 text-[10px] font-bold uppercase tracking-widest">Ou continue com</span>
                        <div className="flex-grow border-t border-blue-800"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white text-blue-950 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Entrar com Google
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
                  <h3 className="text-3xl font-bold text-blue-950 mb-2">Potencialize sua Gestão</h3>
                  <p className="text-slate-500 font-medium text-base">Tudo o que você precisa para dominar o recrutamento digital.</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {benefits.map((b, i) => (
                    <div key={i} className="p-4 md:p-8 bg-blue-950 rounded-[2rem] md:rounded-[2.5rem] border border-blue-900 hover:scale-[1.02] transition-all group flex flex-col items-center text-center shadow-2xl shadow-blue-950/20">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-900 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm group-hover:bg-blue-800 transition-colors">
                        {React.cloneElement(b.icon as React.ReactElement, { className: "w-5 h-5 md:w-6 md:h-6" })}
                      </div>
                      <h4 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 leading-tight">{b.title}</h4>
                      <p className="text-blue-300/70 text-[10px] md:text-sm leading-relaxed font-medium line-clamp-3">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* WhatsApp CTA Section for EMP Mode (Simple - Igual ao Candidato) */}
            <section id="grupos-whatsapp" className="py-10 md:py-16 px-6 md:px-12 lg:px-24 bg-[#25D366]">
              <div className="max-w-3xl mx-auto text-center">
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                  <WhatsAppIcon size={40} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  Milhares de candidatos esperando por você
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Escolha a categoria para ver os grupos e anuncie sua vaga agora mesmo.
                </p>

                <button
                  onClick={() => setIsGroupModalOpen(true)}
                  className="inline-flex items-center gap-3 bg-white text-[#25D366] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-green-50 transition-all shadow-xl shadow-green-900/20 active:scale-95"
                >
                  <WhatsAppIcon size={20} />
                  Ver Grupos
                </button>
              </div>
            </section>
          </>
        ) : (
          <CandidateLanding />
        )
      }

      {/* Simplified Footer */}
      <footer className="bg-blue-950 text-white py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="text-blue-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
          >
            Fale com a SoroEmpregos
          </button>
        </div>
      </footer>

      {/* Login / Recovery Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={closeAndResetModal} />
          <div className="relative bg-blue-950 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-10 animate-scaleUp border border-blue-900">
            <button
              onClick={closeAndResetModal}
              className="absolute top-8 right-8 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {modalView === 'login' && (
              <div className="animate-fadeIn">
                <h3 className="text-2xl font-black text-white mb-2 text-center">Bem-vindo</h3>
                <p className="text-sm text-blue-300/60 mb-6 text-center">Acesse sua conta profissional</p>

                <div className="flex p-1 bg-blue-900/30 rounded-xl mb-6 border border-blue-900/50">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${loginMethod === 'email' ? 'bg-yellow-400 text-blue-950 shadow-lg' : 'text-blue-300 hover:text-white'}`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setLoginMethod('whatsapp')}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${loginMethod === 'whatsapp' ? 'bg-green-500 text-white shadow-lg' : 'text-blue-300 hover:text-white'}`}
                  >
                    WhatsApp
                  </button>
                </div>

                {loginMethod === 'email' ? (
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

                    <div className="relative flex py-4 items-center">
                      <div className="flex-grow border-t border-blue-800"></div>
                      <span className="flex-shrink-0 mx-4 text-blue-300/40 text-[10px] font-black uppercase tracking-widest">Ou continue com</span>
                      <div className="flex-grow border-t border-blue-800"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full py-4 bg-white text-blue-950 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Entrar com Google
                    </button>
                  </form>
                ) : (
                  <div className="animate-fadeIn">
                    {whatsStep === 'phone' ? (
                      <form onSubmit={handleWhatsAppTrigger} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">WhatsApp</label>
                          <div className="relative">
                            <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <span className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">+55</span>
                            <input
                              required
                              autoFocus
                              type="text"
                              inputMode="numeric"
                              value={whatsPhone}
                              onChange={handleWhatsPhoneChange}
                              placeholder="(99) 99999-9999"
                              className="w-full bg-white border-none rounded-2xl pl-20 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 ring-green-500/50 transition-all text-slate-800"
                            />
                          </div>
                        </div>
                        <button disabled={whatsLoading} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 shadow-xl shadow-green-500/20 active:scale-95 transition-all mt-4 disabled:opacity-70">
                          {whatsLoading ? 'Enviando...' : 'Receber Código'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleWhatsAppVerify} className="space-y-5">
                        <div className="text-center mb-4">
                          <p className="text-xs text-blue-300">Código enviado para <span className="text-white font-bold">{whatsPhone}</span></p>
                          <button type="button" onClick={() => setWhatsStep('phone')} className="text-[10px] text-yellow-400 font-bold uppercase mt-1 hover:underline">Alterar número</button>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">Código de 6 dígitos</label>
                          <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              required
                              autoFocus
                              type="text"
                              maxLength={6}
                              value={whatsCode}
                              onChange={e => setWhatsCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-xl font-bold outline-none focus:ring-4 ring-green-500/50 transition-all text-slate-800 tracking-[0.5em] text-center"
                            />
                          </div>
                        </div>

                        {countdown > 0 ? (
                          <p className="text-center text-xs text-blue-300/50 font-bold uppercase tracking-widest mt-2">
                            Aguarde {countdown}s para reenviar
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={whatsLoading}
                            className="w-full py-2 text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Reenviar Código
                          </button>
                        )}

                        <button disabled={whatsLoading} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 shadow-xl shadow-green-500/20 active:scale-95 transition-all mt-4 disabled:opacity-70">
                          {whatsLoading ? 'Verificando...' : 'Entrar'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
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
                <p className="text-sm text-blue-300/60 mb-8 text-center">Informe seu e-mail cadastrado para enviarmos os dados de acesso.</p>

                <form onSubmit={handleRecoverPassword} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={recoveryInput}
                        onChange={e => setRecoveryInput(e.target.value)}
                        placeholder="seu@email.com"
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

            {modalView === 'reset_sent' && (
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

            {modalView === 'register_success' && (
              <div className="animate-scaleUp text-center py-4">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={40} />
                </div>

                <h3 className="text-2xl font-black text-white mb-4">Conta Criada!</h3>
                <p className="text-sm text-blue-300/70 mb-10 leading-relaxed">
                  Seu cadastro foi realizado com sucesso. Verifique seu e-mail para ativar sua conta e acessar o painel.
                </p>

                <button
                  onClick={() => setModalView('login')}
                  className="w-full py-4 bg-white text-blue-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
                >
                  Fazer Login
                </button>
              </div>
            )}

            {modalView === 'account_exists' && (
              <div className="animate-scaleUp text-center py-4">
                <div className="w-20 h-20 bg-blue-900 text-yellow-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Logo size="sm" />
                </div>

                <h3 className="text-2xl font-black text-white mb-4">Conta Já Existe</h3>
                <p className="text-sm text-blue-300/70 mb-10 leading-relaxed">
                  Este e-mail já está cadastrado em nossa plataforma. Por favor, faça login para continuar.
                </p>

                <button
                  onClick={() => setModalView('login')}
                  className="w-full py-4 bg-yellow-400 text-blue-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
                >
                  Ir para Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone Not Found Modal */}
      {isNotFoundModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setIsNotFoundModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-scaleUp text-center border border-slate-100">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-black text-blue-950 mb-2">Conta não encontrada</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              O telefone <span className="font-bold text-blue-950">{whatsPhone}</span> não possui cadastro ativo.
              <br />Por favor, realize seu cadastro para continuar.
            </p>
            <button
              onClick={() => { setIsNotFoundModalOpen(false); setIsLoginModalOpen(false); scrollTo('home'); }}
              className="w-full py-3 bg-blue-950 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20"
            >
              Criar Cadastro Grátis
            </button>
            <button
              onClick={() => setIsNotFoundModalOpen(false)}
              className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-950 transition-colors"
            >
              Tentar outro número
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setIsContactModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-10 animate-scaleUp border border-slate-100">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <h4 className="text-2xl font-black text-blue-950 mb-6 text-center">Solicitar Contato</h4>

            {contactSuccess ? (
              <div className="text-center py-10 animate-scaleUp">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <h5 className="text-xl font-bold text-blue-950 mb-2">Mensagem Enviada!</h5>
                <p className="text-slate-500 text-sm">Em breve nossa equipe entrará em contato.</p>
                <button
                  onClick={() => { setContactSuccess(false); setContactName(''); setContactEmail(''); setContactPhone(''); setContactMessage(''); }}
                  className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800"
                >
                  Enviar nova mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                  <input
                    required
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm font-semibold outline-none focus:ring-2 ring-blue-500 transition-all text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    value={contactPhone}
                    onChange={handleContactPhoneChange}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm font-semibold outline-none focus:ring-2 ring-blue-500 transition-all text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input
                    required
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm font-semibold outline-none focus:ring-2 ring-blue-500 transition-all text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mensagem</label>
                  <textarea
                    required
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    rows={3}
                    placeholder="Como podemos te ajudar?"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm font-semibold outline-none focus:ring-2 ring-blue-500 transition-all resize-none text-slate-800"
                  ></textarea>
                </div>
                <button
                  disabled={contactLoading}
                  type="submit"
                  className="w-full py-4 bg-blue-950 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-900 shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {contactLoading ? 'Enviando...' : (<>Enviar <Send size={18} /></>)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Floating WhatsApp Group Button */}
      {showFloatingWa && (
        <div className="fixed bottom-8 right-8 z-[90] flex items-center gap-2 animate-scaleUp">
          <button
            onClick={() => {
              const element = document.getElementById('grupos-whatsapp');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 animate-pulse-subtle group border border-blue-400/20"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <WhatsAppIcon size={24} />
            </div>
            <span className="font-bold text-sm">Anuncie nos grupos</span>
          </button>

          <button
            onClick={() => setShowFloatingWa(false)}
            className="w-8 h-8 rounded-full bg-slate-900/50 backdrop-blur-md text-white/70 flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Group Selection Modal (Restaurado) */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setIsGroupModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-10 animate-scaleUp border border-slate-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsGroupModalOpen(false)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="py-2 overflow-y-auto flex flex-col h-full">
              <div className="text-center mb-8 pt-4 shrink-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                  <WhatsAppIcon size={12} /> Grupos de Vagas
                </div>
                <h4 className="text-2xl font-black text-blue-950 mb-2">Selecione a Categoria</h4>
                <p className="text-slate-500 text-sm">Escolha onde deseja anunciar sua vaga</p>
              </div>

              {/* Categories Side-by-Side */}
              <div className="grid grid-cols-2 gap-3 mb-8 px-2 shrink-0">
                <button
                  onClick={() => { setSelectedGroupVinculo('CLT'); }}
                  className={`group p-4 rounded-3xl flex flex-col items-center gap-2 transition-all border-2 ${selectedGroupVinculo === 'CLT' ? 'border-green-500 bg-green-50 text-green-600 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedGroupVinculo === 'CLT' ? 'bg-green-100' : 'bg-white'}`}>
                    <Briefcase size={20} className={selectedGroupVinculo === 'CLT' ? 'text-green-600' : 'text-slate-400'} />
                  </div>
                  <p className="font-black text-xs uppercase tracking-tight">Vagas CLT</p>
                </button>

                <button
                  onClick={() => { setSelectedGroupVinculo('FREELANCE'); }}
                  className={`group p-4 rounded-3xl flex flex-col items-center gap-2 transition-all border-2 ${selectedGroupVinculo === 'FREELANCE' ? 'border-green-500 bg-green-50 text-green-600 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedGroupVinculo === 'FREELANCE' ? 'bg-green-100' : 'bg-white'}`}>
                    <Zap size={20} className={selectedGroupVinculo === 'FREELANCE' ? 'text-green-600' : 'text-slate-400'} />
                  </div>
                  <p className="font-black text-xs uppercase tracking-tight text-center">Freelance & Bicos</p>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6 px-2 shrink-0">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={groupSearch}
                  onChange={e => setGroupSearch(e.target.value)}
                  placeholder="Pesquisar cidade ou nome do grupo..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-3xl text-sm outline-none focus:ring-2 ring-green-500 transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>

              {/* Groups List */}
              <div className="flex-1 overflow-y-auto space-y-3 px-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                {groupsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Carregando grupos...</p>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MapPin size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Nenhum grupo encontrado.</p>
                  </div>
                ) : (
                  filteredGroups.map(g => (
                    <div key={g.id} className="bg-slate-50 p-4 rounded-3xl flex items-center justify-between hover:scale-[1.01] transition-all border border-transparent hover:border-slate-200">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-blue-950 text-sm truncate">{g.nome_grupo}</p>
                        <div className="flex items-center gap-3 mt-1 opacity-60">
                          <span className="text-[10px] flex items-center gap-1 font-bold text-slate-500">
                            <MapPin size={10} /> {g.cidade || 'Geral'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedGroup(g);
                          setIsGroupModalOpen(false);
                          setIsLeadModalOpen(true);
                        }}
                        className="shrink-0 px-5 py-2.5 bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                      >
                        Selecionar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setIsLeadModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-10 animate-scaleUp border border-slate-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsLeadModalOpen(false)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="py-2 overflow-y-auto">
              <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                  <CheckCircle2 size={12} /> Quase lá!
                </div>
                <h4 className="text-2xl font-black text-blue-950 mb-2">Dados de Acesso</h4>
                <p className="text-slate-500 text-sm">Preencha rapidamente para entrar no grupo<br /><span className="text-slate-800 font-bold">{selectedGroup?.nome_grupo}</span></p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                  <input
                    required
                    type="text"
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm outline-none focus:ring-2 ring-green-500 transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Você é:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'empresa', label: 'Empresa', desc: 'Restaurante, mercado...' },
                      { id: 'voluntario', label: 'Voluntário', desc: 'Anuncia grátis' },
                      { id: 'agencia', label: 'Agência', desc: 'Recrutamento' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLeadProfile(opt.id as any)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${leadProfile === opt.id ? 'border-green-500 bg-green-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-tight ${leadProfile === opt.id ? 'text-green-700' : 'text-slate-600'}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    value={leadPhone}
                    onChange={handleLeadPhoneChange}
                    placeholder="(15) 9 9999-9999"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm outline-none focus:ring-2 ring-green-500 transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
                  <input
                    required
                    type="email"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3.5 text-sm outline-none focus:ring-2 ring-green-500 transition-all text-slate-800 font-semibold"
                  />
                </div>

                <button
                  disabled={leadLoading}
                  type="submit"
                  className="w-full py-4 mt-4 bg-[#25D366] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#128C7E] shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {leadLoading ? 'Processando...' : (<>Entrar no Grupo <ArrowRight size={18} /></>)}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
