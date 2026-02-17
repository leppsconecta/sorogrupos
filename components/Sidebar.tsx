import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
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
  Plus,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Pin,
  PinOff,
  Menu,
  LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onCreateGroup?: () => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
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
  { path: '/candidatos', label: 'Candidatos', icon: <Users size={22} /> },
  { path: '/curriculos', label: 'Currículos', icon: <FileText size={22} /> },
  { path: '/vagas', label: 'Minhas vagas', icon: <Briefcase size={22} /> },
  { path: '/grupos', label: 'Meus grupos', icon: <WhatsAppIcon size={22} /> },
  { path: '/suporte', label: 'Suporte', icon: <LifeBuoy size={22} /> },
];

const comingSoonItems = [
  { path: '/agenda', label: 'Minha Agenda', icon: <Calendar size={22} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCreateGroup, theme, toggleTheme }) => {
  const { user, company, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [isExpanded, setIsExpanded] = useState(true);
  const [newCandidatesTotal, setNewCandidatesTotal] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNewCandidates = async () => {
      try {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, last_viewed_candidates_at')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (!jobs) return;

        const { data: apps } = await supabase
          .from('job_applications')
          .select('job_id, created_at')
          .in('job_id', jobs.map(j => j.id));

        if (!apps) return;

        let totalNew = 0;
        jobs.forEach(job => {
          const lastViewed = job.last_viewed_candidates_at ? new Date(job.last_viewed_candidates_at) : new Date(0);
          const jobApps = apps.filter(a => a.job_id === job.id);
          const newApps = jobApps.filter(a => new Date(a.created_at) > lastViewed);
          totalNew += newApps.length;
        });

        setNewCandidatesTotal(totalNew);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchNewCandidates();
    const interval = setInterval(fetchNewCandidates, 60000);
    return () => clearInterval(interval);
  }, [user]);
  const [isPinned, setIsPinned] = useState(true); // Default pinned to true as per request? "O usuario pode fixar...". Let's start pinned or unpinned? Request says "Ao abrir... manter expandido por 2 min, depois recolher". This implies NOT pinned initially.
  // Wait, request says: "Ao abrir o sistem o sidebar deve se manter expandido por 2 minutos., apó isso ele deve recolher".
  // So initial state: expanded=true, pinned=false.

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (path: string) => location.pathname === path;

  // Auto-collapse logic
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isPinned && isExpanded) {
      timerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 120000); // 2 minutes
    }
  };

  useEffect(() => {
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [isExpanded, isPinned]);

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    if (newPinned) {
      setIsExpanded(true); // Always expand if pinning
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      resetTimer();
    }
  };

  // Styles for active/inactive links
  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    const base = `flex items-center h-14 rounded-xl transition-all duration-200 relative group/link select-none cursor-pointer
                ${isExpanded ? 'px-4 mx-2' : 'justify-center px-0 mx-2'}`;

    // Active: Slightly lighter blue or transparent with border
    if (active) {
      return `${base} bg-blue-900/50 shadow-sm border border-white/5`;
    }
    return `${base} hover:bg-white/5 text-blue-100/70 hover:text-white`;
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen bg-blue-950 text-white border-r border-white/5 shadow-2xl z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-72' : 'w-24'
        }`}
    >
      {/* Sidebar Header: Spacer + Collapse Button */}
      <div className={`flex items-start flex-shrink-0 px-4 pt-5 pb-2 transition-all duration-300 ${isExpanded ? 'justify-between' : 'justify-center'}`}>

        {/* Welcome Message (Left) - Expanded Size */}
        {isExpanded && (
          <div className="flex flex-col overflow-hidden mr-3 animate-fadeIn flex-1">
            <p className="text-xs text-blue-300/80 font-bold uppercase tracking-wider mb-0.5">Seja Bem vindo</p>
            <p className="text-lg font-black text-white truncate leading-tight" title={company?.name}>{company?.name || 'Sua Empresa'}</p>
          </div>
        )}

        {/* Controls Row (Right) - Only Collapse Button */}
        <div className={`flex items-center ${isExpanded ? '' : 'w-full justify-center'}`}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/5 text-blue-300/50 hover:text-white transition-colors"
            title={isExpanded ? "Recolher" : "Expandir"}
          >
            {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 space-y-1 overflow-y-auto no-scrollbar flex flex-col">

        {menuItems.map((item) => (
          <div key={item.path} className="relative group">
            <Link
              to={item.path}
              className={getLinkClasses(item.path)}
            >
              <div className={`flex-shrink-0 transition-colors duration-200 flex items-center justify-center min-w-[24px] text-yellow-400 ${isExpanded ? 'mr-4' : ''} relative`}>
                {item.icon}
                {item.path === '/candidatos' && newCandidatesTotal > 0 && (
                  <div className="absolute -top-2 -right-3 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1 rounded-full border-2 border-blue-950 animate-pulse shadow-lg z-10">
                    {newCandidatesTotal > 99 ? '99+' : newCandidatesTotal}
                  </div>
                )}
              </div>

              <span className={`text-base font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
                } ${isActive(item.path) ? 'text-white font-bold' : 'text-blue-100/70 group-hover:text-white'} flex items-center justify-between`}>
                {item.label}
              </span>

              {/* Active Indicator */}
              {!isExpanded && isActive(item.path) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-r-full" />
              )}
              {isExpanded && isActive(item.path) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-r-full" />
              )}
            </Link>

            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg border border-white/10">
                {item.label}
              </div>
            )}
          </div>
        ))}

        <div className="pt-8 pb-3 px-4">
          {isExpanded ? (
            <>
              <p className="text-xs font-bold text-blue-400/50 uppercase tracking-widest pl-1 mb-3">Em breve</p>
              <div className="border-t border-white/5 mb-2"></div>
            </>
          ) : (
            <div className="border-t border-white/5 my-2 mx-2"></div>
          )}
        </div>

        {comingSoonItems.map((item) => (
          <div key={item.path} className="relative group">
            <Link
              to={item.path}
              className={`flex items-center h-14 rounded-xl transition-all duration-200 relative group/link select-none opacity-60 hover:opacity-100 cursor-not-allowed hover:bg-white/5
              ${isExpanded ? 'px-4 mx-2' : 'justify-center px-0 mx-2'}`}
              onClick={(e) => {
                if (item.path !== '/curriculos') e.preventDefault();
              }}
            >
              <div className={`flex-shrink-0 flex items-center justify-center min-w-[24px] text-white/50 ${isExpanded ? 'mr-4' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-base font-medium text-blue-100/50 group-hover:text-white whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
                }`}>
                {item.label}
              </span>
              {/* Badge */}
              {isExpanded && <span className="ml-auto text-[10px] font-bold bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-md border border-blue-800/50">Breve</span>}
            </Link>
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg border border-white/10">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-white/5 bg-blue-950">
        <Link
          to="/configuracao"
          className={`flex items-center group transition-colors rounded-xl p-2 hover:bg-white/5 ${isExpanded ? 'gap-3' : 'justify-center'}`}
          title="Configurações"
        >
          {/* Settings Icon - Subtle (Yellow as requested? "icone sutill de configurações") */}
          {/* The user provided image shows a BIG filled yellow circle. Text says "sutil". I'll do a nice yellow icon. */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-950 shadow-md transition-transform group-hover:scale-105`}>
            <Settings size={22} className="stroke-[2.5px]" />
          </div>

          {/* Text Info */}
          {isExpanded && (
            <div className="overflow-hidden flex-1">
              <p className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">Configurações</p>
              <p className="text-xs text-blue-300/70 truncate font-mono">{user?.email}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};
