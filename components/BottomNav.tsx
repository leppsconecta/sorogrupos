
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
  Calendar
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
}

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const menuItems = [
  { path: '/painel', label: 'Painel', icon: <LayoutDashboard size={20} /> },
  { path: '/anunciar', label: 'Anunciar', icon: <Megaphone size={20} /> },
  { path: '/calendario', label: 'Planner', icon: <CalendarDays size={20} /> },
  { path: '/vagas', label: 'Vagas', icon: <Briefcase size={20} /> },
  { path: '/grupos', label: 'Grupos', icon: <WhatsAppIcon size={20} /> },
  { path: '/curriculos', label: 'Currículos', icon: <FileText size={20} /> },
  { path: '/agenda', label: 'Agenda', icon: <Calendar size={20} /> },
  { path: '/candidatos', label: 'Candidatos', icon: <Users size={20} /> },

  { path: '/suporte', label: 'Suporte', icon: <LifeBuoy size={20} /> },
  { path: '/perfil', label: 'Perfil', icon: <UserCircle size={20} /> },
];

export const BottomNav: React.FC<BottomNavProps> = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#172554] backdrop-blur-xl border-t border-white/10 z-[60] px-4 safe-area-bottom shadow-[0_-10px_20px_-5px_rgba(23,37,84,0.4)]">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar h-20">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all relative text-white`}
          >
            <div className={`p-2 rounded-xl transition-all text-yellow-400 ${isActive(item.path) ? 'bg-white/10 scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive(item.path) ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-yellow-400 rounded-b-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
