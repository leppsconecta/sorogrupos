
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Marketing } from './pages/Marketing';
import { Vagas } from './pages/Vagas';
import { Grupos } from './pages/Grupos';
import { Perfil } from './pages/Perfil';
import { Suporte } from './pages/Suporte';
import { Plano } from './pages/Plano';
import { Agendamentos } from './pages/Agendamentos';
import { Candidatos } from './pages/Candidatos';
import { Curriculos } from './pages/Curriculos';
import { MinhaAgenda } from './pages/MinhaAgenda';
import { LandingPage } from './pages/LandingPage';
import { Theme } from './types';
import { X, Smartphone, QrCode, RefreshCw, ArrowLeft, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FeedbackProvider, useFeedback } from './contexts/FeedbackContext';
import { supabase } from './lib/supabase';
import { ResetPasswordModal } from './components/ResetPasswordModal';

const AppContent: React.FC = () => {
  const { session, signOut, onboardingCompleted, user } = useAuth();
  const { showToast } = useFeedback();
  const isLoggedIn = !!session;

  // Note: activeTab state removed as we now use URL routing

  const [theme, setTheme] = useState<Theme>('light');
  const [triggerCreateGroup, setTriggerCreateGroup] = useState(0);

  // WhatsApp Global State
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Connection Flow State
  const [connectionStep, setConnectionStep] = useState<'phone' | 'result'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+55');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);

  // Webhook Response Data
  const [connectionData, setConnectionData] = useState<{
    type: 'qrcode' | 'code' | 'error';
    data: string | null;
    message: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState(90);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Realtime Connection Status Monitoring + Polling Fallback
  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('whatsapp_conections')
          .select('status, id, phone')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching connection status:', error);
          return;
        }

        if (data) {
          setConnectionId(data.id);
          setConnectedPhone(data.phone);
          const currentStatus = data.status?.toLowerCase();
          console.log('Fetched status:', currentStatus, 'Phone:', data.phone);

          if (currentStatus === 'connected' || currentStatus === 'conectado') {
            setIsWhatsAppConnected(true);
            if (isConnectModalOpen) {
              setIsConnectModalOpen(false);
              showToast('WhatsApp conectado com sucesso!', 'success');
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else {
            setIsWhatsAppConnected(false);
          }
        }
      } catch (err) {
        console.error('Unexpected error checking status:', err);
      }
    };

    checkStatus();
    const pollInterval = setInterval(checkStatus, 5000);

    const channel = supabase
      .channel(`whatsapp_status_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_conections',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Realtime update received:', payload);
          checkStatus();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
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

  }, [user, showToast, isConnectModalOpen]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // QR Code Scan Timeout (90s) & Timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (connectionStep === 'result' && connectionData?.type === 'qrcode') {
      setTimeLeft(90);

      intervalId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setConnectionData(prevData =>
              prevData ? { ...prevData, type: 'error', message: 'Tempo limite excedido. Tente novamente.' } : null
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionStep, connectionData?.type]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleCreateGroupShortcut = () => {
    // Just trigger the effect, navigation is handled inside Sidebar component or via explicit navigation if needed
    // But since Sidebar handles navigation now, we just need to increment this trigger 
    // AND ensure we are on the groups page? 
    // Sidebar's button does: navigate('/grupos'); onCreateGroup();
    setTriggerCreateGroup(prev => prev + 1);
  };

  const handleGenerateQRCode = async () => {
    if (phoneNumber.length < 12) return;
    if (!phoneNumber) return;
    if (isProcessing) return;

    setIsProcessing(true);
    setConnectionData(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      let currentConnectionId = connectionId;

      if (!currentConnectionId && user) {
        const { data } = await supabase
          .from('whatsapp_conections')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (data?.id) {
          currentConnectionId = data.id;
          setConnectionId(data.id);
        }
      }

      const response = await fetch('https://webhook.leppsconecta.com.br/webhook/dd3c18ed-9015-4066-b994-ed5865b880ac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanPhone,
          method: 'qrcode',
          user_id: user?.id,
          connection_id: currentConnectionId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success && data.data?.base64) {
        const base64Image = `data:image/png;base64,${data.data.base64}`;
        setConnectionData({
          type: 'qrcode',
          data: base64Image,
          message: 'Escaneie o QR Code abaixo com seu WhatsApp'
        });
        setConnectionStep('result');
      } else {
        showToast(`${data.message || 'Erro ao gerar QR Code'}. Tente novamente.`, 'error');
      }

    } catch (error: any) {
      console.error('Webhook error:', error);
      if (error.name === 'AbortError') {
        showToast('A operação demorou muito. Tente novamente.', 'error');
      } else {
        showToast('Erro de comunicação com o servidor', 'error');
      }
    } finally {
      setIsProcessing(false);
      clearTimeout(timeoutId);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await fetch('https://webhook.leppsconecta.com.br/webhook/405917eb-1478-45e1-800d-f7e67569575b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitacao: 'desconectar',
          id_user: user.id
        })
      });

      const data = await response.json();

      if (data.status === true) {
        setIsWhatsAppConnected(false);
        setConnectedPhone(null);
        setIsDisconnectModalOpen(false);
        showToast('Desconectado com sucesso!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast('Erro ao desconectar. Tente novamente.', 'error');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      showToast('Erro ao desconectar.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setIsConnectModalOpen(false);
    setConnectionStep('phone');
    setPhoneNumber('+55');
    setConnectionData(null);
  };

  const commonProps = {
    isWhatsAppConnected,
    onOpenConnect: () => {
      setConnectionStep('phone');
      setIsConnectModalOpen(true);
    }
  };

  // Redirect to painel if logged in and trying to access public routes
  if (isLoggedIn && (location.pathname === '/' || location.pathname === '/login')) {
    return <Navigate to="/painel" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {isLoggedIn && (
        <Sidebar
          onCreateGroup={handleCreateGroupShortcut}
        />
      )}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {isLoggedIn && (
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            onLogout={handleLogout}
            isWhatsAppConnected={isWhatsAppConnected}
            connectedPhone={connectedPhone}
            onOpenConnect={() => {
              setConnectionStep('phone');
              setIsConnectModalOpen(true);
            }}
            onOpenDisconnect={() => setIsDisconnectModalOpen(true)}
          />
        )}

        <main className={`flex-1 overflow-y-auto ${isLoggedIn ? 'p-4 md:p-6 lg:p-8 pb-24 lg:pb-8' : ''} custom-scrollbar`}>
          <div className={isLoggedIn ? "w-full max-w-7xl mx-auto" : "w-full h-full"}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LandingPage autoOpenLogin={true} />} />

              {/* Protected Routes */}
              <Route path="/painel" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Dashboard {...commonProps} />)} />
              <Route path="/anunciar" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Marketing {...commonProps} />)} />
              <Route path="/vagas" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Vagas />)} />
              <Route path="/grupos" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Grupos externalTrigger={triggerCreateGroup} {...commonProps} />)} />
              <Route path="/calendario" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Agendamentos />)} />
              <Route path="/meuplano" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Plano />)} />
              <Route path="/suporte" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Suporte />)} />
              <Route path="/perfil" element={!isLoggedIn ? <Navigate to="/login" /> : <Perfil />} />
              <Route path="/candidatos" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Candidatos />)} />
              <Route path="/curriculos" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <Curriculos />)} />
              <Route path="/agenda" element={!isLoggedIn ? <Navigate to="/login" /> : (!onboardingCompleted ? <Navigate to="/perfil" /> : <MinhaAgenda />)} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to={isLoggedIn ? "/painel" : "/"} replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {isLoggedIn && <BottomNav />}

      {/* Shared WhatsApp Connection Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetModal} />
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
                onClick={resetModal}
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
                      onClick={() => {
                        setConnectionStep('phone');
                        setConnectionData(null);
                      }}
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
                          onClick={() => {
                            setConnectionStep('phone');
                            setConnectionData(null);
                          }}
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

            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={resetModal}
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDisconnectModalOpen(false)} />
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
                onClick={() => setIsDisconnectModalOpen(false)}
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
                onClick={() => setIsDisconnectModalOpen(false)}
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
          <AppContent />
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
