import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,

  LogOut,
  CheckCircle2,
  Menu,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  isWhatsAppConnected: boolean;
  onOpenConnect: () => void;
  onOpenDisconnect: () => void;
  connectedPhone: string | null;
  toggleSidebar?: () => void;
}

const OfficialWhatsAppIcon = ({ size = 20, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onLogout, isWhatsAppConnected, onOpenConnect, onOpenDisconnect, connectedPhone, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accountStatus } = useAuth(); // Access accountStatus

  const getTabTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Painel';
    if (path === '/vagas') return 'Vagas';
    if (path === '/marketing') return 'Marketing';
    if (path === '/agendamentos') return 'Agendamentos';
    if (path === '/configuracao') return 'Configuração';
    if (path === '/meuplano') return 'Meu Plano';
    if (path === '/suporte') return 'Suporte';
    return 'Painel';
  };

  return (
    <>
      {accountStatus === 'inactive' && (
        <div className="bg-rose-500 text-white px-4 py-2 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-4 animate-fadeIn sticky top-0 z-50">
          <span>⚠️ Ative sua assinatura para continuar criando e agendando vagas</span>
          <button
            onClick={() => navigate('/meuplano')}
            className="bg-white text-rose-600 px-3 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-2"
          >
            <CreditCard size={14} /> Ativar Agora
          </button>
        </div>
      )}
      <header className={`h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-6 md:px-8 flex items-center justify-between sticky z-40 ${accountStatus === 'inactive' ? 'top-10' : 'top-0'}`}>

        <div className="flex items-center gap-4">
          {/* Mobile Menu Button - Optional if layout handles it */}
          <h1 className="hidden md:block text-xl font-black text-slate-800 dark:text-white tracking-tight">
            {getTabTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* WhatsApp Indicator */}
          {isWhatsAppConnected ? (
            <button
              onClick={onOpenDisconnect}
              className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mr-2 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              title={connectedPhone ? `Conectado: ${connectedPhone}` : 'WhatsApp Conectado'}
            >
              <OfficialWhatsAppIcon size={16} />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest inline">
                  {connectedPhone ? connectedPhone : 'Conectado'}
                </span>
                <CheckCircle2 size={12} className="text-emerald-500" />
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenConnect}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl border border-red-600 shadow-lg shadow-red-600/30 mr-2 transition-all group animate-pulse"
              style={{ animationDuration: '800ms' }}
            >
              <div className="text-white">
                <OfficialWhatsAppIcon size={16} color="currentColor" />
              </div>
              <span className="inline text-[10px] font-bold text-white uppercase tracking-widest">WhatsApp Desconectado</span>
            </button>
          )}

          {/* Minha Página Button */}
          <button
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
          >
            <User size={18} />
            <span className="hidden lg:inline">Minha página</span>
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all font-bold text-sm"
            title="Sair"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>
    </>
  );
};
