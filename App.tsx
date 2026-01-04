
import React, { useState, useEffect } from 'react';
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
import { LandingPage } from './pages/LandingPage';
import { Theme } from './types';
import { X, Smartphone, QrCode, RefreshCw, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('painel');
  const [theme, setTheme] = useState<Theme>('light');
  const [triggerCreateGroup, setTriggerCreateGroup] = useState(0);
  
  // WhatsApp Global State
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<'selection' | 'qrcode' | 'pairingCode'>('selection');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pairingCode, setPairingCode] = useState('');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (email: string, pass: string) => {
    if (email === 'felipelepefe@gmail.com' && pass === '123') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('painel');
  };

  const handleCreateGroupShortcut = () => {
    setActiveTab('grupos');
    setTriggerCreateGroup(prev => prev + 1);
  };

  const handleProcessConnection = () => {
    if (!phoneNumber) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (connectionMethod === 'pairingCode') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPairingCode(code);
      }
      setShowResult(true);
    }, 1500);
  };

  const handleConnectSuccess = () => {
    setIsWhatsAppConnected(true);
    setIsConnectModalOpen(false);
    setShowResult(false);
    setPhoneNumber('');
    setConnectionMethod('selection');
  };

  const resetModal = () => {
    setIsConnectModalOpen(false);
    setShowResult(false);
    setConnectionMethod('selection');
    setPhoneNumber('');
    setPairingCode('');
  };

  const renderContent = () => {
    const commonProps = {
      isWhatsAppConnected,
      onOpenConnect: () => {
        setConnectionMethod('selection');
        setIsConnectModalOpen(true);
      }
    };

    switch (activeTab) {
      case 'painel': return <Dashboard setActiveTab={setActiveTab} {...commonProps} />;
      case 'marketing': return <Marketing {...commonProps} />;
      case 'vagas': return <Vagas />;
      case 'grupos': return <Grupos externalTrigger={triggerCreateGroup} {...commonProps} />;
      case 'plano': return <Plano />;
      case 'suporte': return <Suporte />;
      case 'perfil': return <Perfil />;
      default: return <Dashboard setActiveTab={setActiveTab} {...commonProps} />;
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onCreateGroup={handleCreateGroupShortcut}
      />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          activeTab={activeTab}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 custom-scrollbar">
          <div className="w-full max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Shared WhatsApp Connection Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={resetModal} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-scaleUp text-center">
            <button 
              onClick={resetModal} 
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            {connectionMethod !== 'selection' && !showResult && (
              <button 
                onClick={() => setConnectionMethod('selection')}
                className="absolute top-8 left-8 p-2 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
            )}

            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-600/10">
              <Smartphone size={40} />
            </div>

            {connectionMethod === 'selection' ? (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Conectar WhatsApp</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium">Escolha o método de conexão preferido para seus disparos.</p>
                
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setConnectionMethod('qrcode')}
                    className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] hover:border-blue-500 transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-widest mb-1">Método 01</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">Conectar com QR Code</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setConnectionMethod('pairingCode')}
                    className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] hover:border-blue-500 transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                      <Key size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-widest mb-1">Método 02</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">Conectar com Código (6 dígitos)</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : !showResult ? (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {connectionMethod === 'qrcode' ? 'QR Code' : 'Código de Emparelhamento'}
                </h3>
                <p className="text-sm text-slate-500 mb-8 font-medium">Insira o número de telefone para iniciar.</p>
                
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de Telefone</label>
                  <input 
                    type="text" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ex: 5515999999999"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-semibold outline-none focus:ring-4 ring-blue-500/10 transition-all"
                  />
                </div>
                <button 
                  onClick={handleProcessConnection}
                  disabled={!phoneNumber || isProcessing}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      {connectionMethod === 'qrcode' ? <QrCode size={18} /> : <Key size={18} />}
                      {connectionMethod === 'qrcode' ? 'Gerar QR Code' : 'Gerar Código'}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Escaneie ou Digite</h3>
                
                {connectionMethod === 'qrcode' ? (
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 inline-block shadow-inner">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SorogruposWhatsAppSession" alt="WhatsApp QR Code" className="w-48 h-48 dark:invert" />
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="flex justify-center gap-2 mb-4">
                      {pairingCode.split('').map((char, i) => (
                        <div key={i} className="w-10 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-black text-blue-600 border border-slate-100 dark:border-slate-700 shadow-sm">
                          {char}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Este é seu código de 6 dígitos</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl flex items-start gap-3 text-left">
                  <Smartphone size={18} className="text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                    {connectionMethod === 'qrcode' 
                      ? 'Abra o WhatsApp > Aparelhos Conectados > Conectar um Aparelho e escaneie o código.' 
                      : 'No WhatsApp, vá em Configurações > Aparelhos Conectados > Conectar um Aparelho > Conectar com número de telefone e digite o código acima.'}
                  </p>
                </div>

                <button 
                  onClick={handleConnectSuccess}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Finalizar Conexão
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
