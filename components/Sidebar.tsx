
import React from 'react';
import {
  LayoutDashboard,
  Megaphone,
  Briefcase,
  UserCircle,
  LifeBuoy,
  CreditCard,
  CalendarDays,
  Users,
  FileText,
  Calendar,
  Plus
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

interface SidebarProps {
  onCreateGroup?: () => void;
}

const WhatsAppIcon = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const menuItems = [
  { path: '/painel', label: 'Painel', icon: <LayoutDashboard size={22} /> },
  { path: '/calendario', label: 'Calendário', icon: <CalendarDays size={22} /> },
  { path: '/anunciar', label: 'Anunciar Vaga', icon: <Megaphone size={22} /> },
  { path: '/vagas', label: 'Minhas vagas', icon: <Briefcase size={22} /> },
  { path: '/grupos', label: 'Meus grupos', icon: <WhatsAppIcon size={22} /> },
  { path: '/meuplano', label: 'Meu Plano', icon: <CreditCard size={22} /> },
  { path: '/suporte', label: 'Suporte', icon: <LifeBuoy size={22} /> },
  { path: '/perfil', label: 'Perfil', icon: <UserCircle size={22} /> },
];

const comingSoonItems = [
  { path: '/candidatos', label: 'Candidatos', icon: <Users size={22} /> },
  { path: '/curriculos', label: 'Currículos', icon: <FileText size={22} /> },
  { path: '/agenda', label: 'Minha Agenda', icon: <Calendar size={22} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCreateGroup }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className="hidden lg:flex h-screen bg-blue-950 text-white z-50 border-r border-white/5 shadow-2xl flex-col flex-shrink-0 w-72"
    >
      {/* Logo Area */}
      <div className="h-28 flex items-center px-6 overflow-hidden flex-shrink-0">
        <img src="/logo-sidebar.png" alt="Soro Empregos" className="h-[100px] w-auto object-contain mt-1" />
      </div>

      <div className="h-4" /> {/* Spacer */}

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`w-full group flex items-center h-12 px-4 rounded-xl transition-all duration-200 relative
              ${isActive(item.path)
                ? 'bg-blue-900/50 shadow-sm border border-white/5'
                : 'hover:bg-white/5'
              }`}
          >
            <div className="flex items-center justify-center mr-3 min-w-[24px] text-yellow-400">
              {item.icon}
            </div>
            <span className={`text-sm font-medium whitespace-nowrap transition-colors ${isActive(item.path) ? 'text-white font-bold' : 'text-blue-100/70 group-hover:text-white'}`}>
              {item.label}
            </span>

            {isActive(item.path) && (
              <div className="absolute left-0 w-1 h-6 bg-yellow-400 rounded-r-full" />
            )}
          </Link>
        ))}

        <div className="pt-6 pb-3 px-2">
          <p className="text-xs font-bold text-blue-400/50 uppercase tracking-widest pl-3 mb-3">Em breve</p>
          <div className="border-t border-white/5 mb-2 mx-1"></div>
        </div>

        {comingSoonItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`w-full group flex items-center h-12 px-4 rounded-xl transition-all duration-200 relative opacity-70 hover:opacity-100
              ${isActive(item.path)
                ? 'bg-blue-900/50 shadow-sm border border-white/5 opacity-100'
                : 'hover:bg-white/5'
              }`}
          >
            <div className="flex items-center justify-center mr-3 min-w-[24px] text-yellow-400">
              {item.icon}
            </div>
            <span className={`text-sm font-medium whitespace-nowrap transition-colors ${isActive(item.path) ? 'text-white font-bold' : 'text-blue-100/70 group-hover:text-white'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Create Group Action */}
      <div className="px-4 pb-4">
        <button
          onClick={() => {
            navigate('/grupos');
            if (onCreateGroup) onCreateGroup();
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 group"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Plus size={16} />
          </div>
          <span>Criar Grupo</span>
        </button>
      </div>

      {/* Footer / Info */}
      <div className="p-5 border-t border-white/5 bg-blue-900/20 px-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-900 border border-blue-800 overflow-hidden flex-shrink-0">
            <img src="https://picsum.photos/seed/admin/40/40" alt="Admin" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Admin Sorogrupos</p>
            <p className="text-[10px] text-blue-400 font-medium truncate">Versão 2.4.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
