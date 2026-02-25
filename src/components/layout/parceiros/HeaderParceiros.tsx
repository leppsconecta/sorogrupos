import React from 'react';
import {
    LogOut,
    Moon,
    Sun,
    Copy,
    Check
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onLogout: () => void;
}

export const HeaderParceiros: React.FC<HeaderProps> = ({
    theme,
    toggleTheme,
    onLogout
}) => {
    const { user } = useAuth();
    const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user) {
            supabase.from('affiliates')
                .select('code')
                .eq('user_id', user.id)
                .single()
                .then(({ data, error }) => {
                    if (!error && data) {
                        setAffiliateCode(data.code);
                    }
                });
        }
    }, [user]);

    const referralLink = affiliateCode ? `${window.location.origin}/?ref=${affiliateCode}` : '';

    const handleCopyLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <header className="h-20 md:h-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shadow-sm relative z-40 transition-colors duration-300">

            {/* Esquerda: Logo/Título Mobile ou Espaçamento Desktop */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-black text-blue-900 dark:text-white hidden sm:block">
                    Portal do Parceiro
                </h1>
            </div>

            {/* Direita: Ações */}
            <div className="flex items-center gap-3 md:gap-4">

                {/* Bloco Copiar Link Afiliado */}
                {affiliateCode && (
                    <div className="hidden sm:flex items-center gap-2 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl p-1.5 shadow-sm">
                        <span className="text-xs font-mono font-medium text-slate-500 pl-3">
                            {window.location.host}/?ref=<span className="text-blue-600 dark:text-blue-400 font-bold">{affiliateCode}</span>
                        </span>
                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${copied
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            title="Copiar Link"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-4 ring-slate-100 dark:ring-slate-800 outline-none"
                    title={theme === 'light' ? 'Escurecer' : 'Clarear'}
                >
                    {theme === 'light' ? <Moon size={22} className="text-slate-600" /> : <Sun size={22} className="text-yellow-400" />}
                </button>

                {/* Separator */}
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2 group"
                    title="Sair"
                >
                    <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Sair</span>
                </button>
            </div>
        </header>
    );
};
