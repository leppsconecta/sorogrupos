import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
// Lazy Load Pages for Performance
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Marketing = React.lazy(() => import('./pages/Marketing').then(module => ({ default: module.Marketing })));
const Vagas = React.lazy(() => import('./pages/Vagas').then(module => ({ default: module.Vagas })));
const Grupos = React.lazy(() => import('./pages/Grupos').then(module => ({ default: module.Grupos })));
const Configuracao = React.lazy(() => import('./pages/Configuracao').then(module => ({ default: module.Configuracao })));
const Perfil = React.lazy(() => import('./pages/Perfil').then(module => ({ default: module.Perfil })));
const Suporte = React.lazy(() => import('./pages/Suporte').then(module => ({ default: module.Suporte })));
const Plano = React.lazy(() => import('./pages/Plano').then(module => ({ default: module.Plano })));
const Agendamentos = React.lazy(() => import('./pages/Agendamentos').then(module => ({ default: module.Agendamentos })));
const Candidatos = React.lazy(() => import('./pages/Candidatos').then(module => ({ default: module.Candidatos })));
const Curriculos = React.lazy(() => import('./pages/Curriculos').then(module => ({ default: module.Curriculos })));
const MinhaAgenda = React.lazy(() => import('./pages/MinhaAgenda').then(module => ({ default: module.MinhaAgenda })));
const LandingPage = React.lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const PublicPage = React.lazy(() => import('./pages/PublicPage').then(module => ({ default: module.PublicPage })));

import { Theme } from './types';
import { X, Smartphone, QrCode, RefreshCw, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FeedbackProvider, useFeedback } from './contexts/FeedbackContext';
import { WhatsAppProvider, useWhatsApp } from './contexts/WhatsAppContext'; // NEW IMPORT
import { supabase } from './lib/supabase';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { OnboardingModal } from './components/OnboardingModal';

const AppContent: React.FC = () => {
  const { session, signOut, onboardingCompleted, user } = useAuth();
  const { showToast } = useFeedback();

  const navigate = useNavigate();

  // Use Context
  const {
    isWhatsAppConnected,
    connectedPhone,
    isConnectModalOpen,
    isDisconnectModalOpen,
    connectionStep,
    phoneNumber,
    isProcessing,
    connectionData,
    timeLeft,
    openConnectModal,
    closeConnectModal,
    openDisconnectModal,
    closeDisconnectModal,
    setPhoneNumber,
    handleGenerateQRCode,
    handleDisconnect
  } = useWhatsApp();

  const isLoggedIn = !!session;

  const [theme, setTheme] = useState<Theme>('light');
  const [triggerCreateGroup, setTriggerCreateGroup] = useState(0);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle password recovery event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetPasswordModalOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      navigate('/');
    }
  };

  const handleCreateGroupShortcut = () => {
    setTriggerCreateGroup(prev => prev + 1);
  };

  const commonProps = {
    isWhatsAppConnected,
    onOpenConnect: openConnectModal
  };

  const location = useLocation();

  const dashboardPaths = [
    '/painel', '/anunciar', '/vagas', '/grupos', '/calendario',
    '/meuplano', '/suporte', '/configuracao', '/perfil',
    '/candidatos', '/curriculos', '/agenda'
  ];

  const isDashboardRoute = dashboardPaths.some(path => location.pathname.startsWith(path));
  const showDashboardUI = isLoggedIn && isDashboardRoute;

  // Redirect to painel if logged in and trying to access public routes
  if (isLoggedIn && (location.pathname === '/' || location.pathname === '/login')) {
    return <Navigate to="/painel" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {showDashboardUI && (
        <Sidebar
          onCreateGroup={handleCreateGroupShortcut}
        />
      )}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {showDashboardUI && (
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            onLogout={handleLogout}
            isWhatsAppConnected={isWhatsAppConnected}
            connectedPhone={connectedPhone}
            onOpenConnect={openConnectModal}
            onOpenDisconnect={openDisconnectModal}
          />
        )}

        <main className={`flex-1 overflow-y-auto ${showDashboardUI ? 'p-4 md:p-6 lg:p-8 pb-24 lg:pb-8' : ''} custom-scrollbar`}>
          <div className={showDashboardUI ? "w-full max-w-7xl mx-auto" : "w-full h-full"}>
            <React.Suspense fallback={
              <div className="flex h-full w-full items-center justify-center min-h-[50vh] text-slate-400 gap-3">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
                <span className="text-sm font-medium animate-pulse">Carregando painel...</span>
              </div>
            }>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/p/:username" element={<PublicPage />} />
                <Route path="/login" element={<LandingPage autoOpenLogin={true} />} />

                {/* Protected Routes */}
                <Route path="/painel" element={!isLoggedIn ? <Navigate to="/" /> : <Dashboard {...commonProps} />} />
                <Route path="/anunciar" element={!isLoggedIn ? <Navigate to="/" /> : <Marketing {...commonProps} />} />
                <Route path="/vagas" element={!isLoggedIn ? <Navigate to="/" /> : <Vagas />} />
                <Route path="/grupos" element={!isLoggedIn ? <Navigate to="/" /> : <Grupos externalTrigger={triggerCreateGroup} {...commonProps} />} />
                <Route path="/calendario" element={!isLoggedIn ? <Navigate to="/" /> : <Agendamentos />} />
                <Route path="/meuplano" element={!isLoggedIn ? <Navigate to="/" /> : <Plano />} />
                <Route path="/suporte" element={!isLoggedIn ? <Navigate to="/" /> : <Suporte />} />
                <Route path="/configuracao" element={!isLoggedIn ? <Navigate to="/" /> : <Configuracao />} />
                <Route path="/perfil" element={!isLoggedIn ? <Navigate to="/" /> : <Perfil />} />
                <Route path="/candidatos" element={!isLoggedIn ? <Navigate to="/" /> : <Candidatos />} />
                <Route path="/curriculos" element={!isLoggedIn ? <Navigate to="/" /> : <Curriculos />} />
                <Route path="/agenda" element={!isLoggedIn ? <Navigate to="/" /> : <MinhaAgenda />} />

                {/* Public Profile Route (Root Level) */}
                <Route path="/:username" element={<PublicPage />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to={isLoggedIn ? "/painel" : "/"} replace />} />
              </Routes>
            </React.Suspense>
          </div>
        </main>
      </div>

      {isLoggedIn && <BottomNav />}

      {/* Onboarding Modal */}
      {isLoggedIn && !onboardingCompleted && <OnboardingModal />}

      {/* Shared WhatsApp Connection Modal used via Context logic */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeConnectModal} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl overflow-hidden animate-scaleUp">

            {/* Header */}
            <div className="bg-[#0f172a] p-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-yellow-400/20">
                  <Smartphone size={20} className="text-slate-900" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {connectionStep === 'phone' && 'Informe seu Número'}
                    {connectionStep === 'result' && 'Escanear QR Code'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-900/50">
                      PASSO {connectionStep === 'phone' ? '1' : '2'}/2
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={closeConnectModal}
                className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950/50">
              {/* STEP 1: Phone Input */}
              {connectionStep === 'phone' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do WhatsApp (DDD + Número)</label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPhoneNumber(val ? '+' + val : '+');
                        }}
                        onFocus={() => {
                          if (!phoneNumber) setPhoneNumber('+55');
                        }}
                        placeholder="+55 (15) 99999-9999"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-lg font-bold text-center outline-none focus:ring-2 ring-blue-500/10 transition-all text-slate-800 dark:text-white tracking-wider"
                      />
                      <p className="text-[10px] text-slate-400 font-medium text-center">
                        Insira o código do país (+55), DDD e o número completo.
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateQRCode}
                      disabled={phoneNumber.length < 12 || isProcessing}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Gerando QR Code...
                        </>
                      ) : (
                        <>
                          Gerar QR Code <QrCode size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Result */}
              {connectionStep === 'result' && connectionData && (
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={openConnectModal} // resets to phone
                      className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                      <ArrowLeft size={16} />
                      Trocar número
                    </button>

                  </div>

                  <div className="text-center mb-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                      {connectionData.type === 'error' ? 'Erro' : 'Escaneie o QR Code'}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">{connectionData.message}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center space-y-5">
                    {connectionData.type === 'qrcode' && connectionData.data && (
                      <div className="inline-block p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner">
                        <img src={connectionData.data} alt="WhatsApp QR Code" className="w-48 h-48 dark:invert-0 object-contain" />
                      </div>
                    )}

                    {connectionData.type === 'error' && (
                      <div className="py-4 space-y-4">
                        <div className="text-rose-500 text-sm font-semibold">
                          {connectionData.message}
                        </div>
                        <button
                          onClick={openConnectModal}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                          Gerar Novo Código
                        </button>
                      </div>
                    )}

                    {connectionData.type !== 'error' && (
                      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                        <RefreshCw size={10} className="animate-spin" />
                        Aguardando conexão... {timeLeft}s
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Success */}
              {connectionStep === 'success' && (
                <div className="animate-fadeIn text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                    <CheckCircle2 size={40} />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                      WhatsApp Conectado!
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4">
                      WhatsApp conectado com sucesso!<br />
                      Iniciando carregamento dos grupos...
                    </p>
                  </div>

                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Confirmar e Iniciar
                  </button>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={closeConnectModal}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar Operação
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Disconnect Modal */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeDisconnectModal} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl overflow-hidden animate-scaleUp">

            <div className="bg-rose-600 p-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <LogOut size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">Desconectar WhatsApp</h3>
                  <p className="text-[10px] text-white/80 font-medium tracking-wide">Encerrar sessão atual</p>
                </div>
              </div>

              <button
                onClick={closeDisconnectModal}
                className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg z-10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número Conectado</p>
                <p className="text-xl font-black text-slate-800 dark:text-white">{connectedPhone || 'Desconhecido'}</p>
              </div>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Tem certeza que deseja desconectar? O sistema deixará de enviar mensagens automáticas.
              </p>

              <button
                onClick={handleDisconnect}
                disabled={isProcessing}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    Desconectando...
                  </>
                ) : (
                  <>
                    <LogOut size={16} /> Confirmar Desconexão
                  </>
                )}
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={closeDisconnectModal}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && (
        <ResetPasswordModal onClose={() => setIsResetPasswordModalOpen(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeedbackProvider>
          <WhatsAppProvider>
            <AppContent />
          </WhatsAppProvider>
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App; // Ensure default export if used elsewhere, though typically it's named or default via main.tsx
