
import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  activeTab: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, activeTab, onLogout }) => {
  const getTabTitle = () => {
    const titles: Record<string, string> = {
      painel: 'Visão Geral',
      marketing: 'Marketing ',
      vagas: 'Gestão de Vagas',
      grupos: 'Gestão Grupos',
      plano: 'Meu Plano e Assinatura',
      suporte: 'Suporte e Central de Ajuda',
      perfil: 'Minha Conta',
    };
    return titles[activeTab] || 'Sorogrupos';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
          {getTabTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-slate-900 rounded-xl transition-all"
          title="Mudar Tema"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all font-bold text-sm"
          title="Sair"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};
