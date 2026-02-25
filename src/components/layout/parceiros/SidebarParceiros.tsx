import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
    Menu,
    X,
    LayoutDashboard,
    Wallet,
    Settings,
    Copy,
    Check
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SidebarParceirosProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}

export const SidebarParceiros: React.FC<SidebarParceirosProps> = ({ isExpanded, setIsExpanded }) => {
    const { user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchCode = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('affiliates')
                .select('code')
                .eq('user_id', user.id)
                .single();
            if (data) setAffiliateCode(data.code);
        };
        fetchCode();
    }, [user]);

    const handleCopyId = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (affiliateCode) {
            navigator.clipboard.writeText(affiliateCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const links = [
        { to: "/parceiros/painel", icon: LayoutDashboard, label: "Painel" },
        { to: "/parceiros/financeiro", icon: Wallet, label: "Financeiro" }
    ];

    return (
        <>
            {/* Mobile Menu Button - Fixed on top left */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-5 left-4 z-50 p-2.5 bg-blue-900 text-white rounded-xl shadow-lg border border-white/10 active:scale-95 transition-transform"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container (Sempre expandido no Desktop lg:w-72) */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        flex flex-col h-screen bg-blue-950 text-white border-r border-white/5 shadow-2xl
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        lg:w-72
      `}>
                {/* Logo Area */}
                <div className="h-20 md:h-24 flex items-center justify-center p-4 border-b border-white/5 relative bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 flex-shrink-0">
                            <span className="text-xl font-black text-blue-950 tracking-tighter">SE</span>
                        </div>
                        <div className="flex flex-col animate-fade-in whitespace-nowrap">
                            <span className="text-lg tracking-wider font-bold text-white leading-none">Affiliates</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 py-8 overflow-y-auto custom-scrollbar px-3 space-y-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) => `
                flex items-center rounded-2xl group transition-all duration-200 relative
                px-4 py-3.5 gap-4
                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }
              `}
                        >
                            <link.icon
                                size={22}
                                className={`flex-shrink-0 transition-transform duration-300`}
                                strokeWidth={1.5}
                            />

                            <div className="flex flex-1 items-center justify-between whitespace-nowrap animate-fade-in font-medium">
                                {link.label}
                                {('badge' in link) && (link as any).badge && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 text-slate-300 px-2.5 py-1 rounded-full border border-white/5">
                                        {(link as any).badge}
                                    </span>
                                )}
                            </div>
                        </NavLink>
                    ))}
                </div>

                {/* Footer / Settings - Sempre visível */}
                <div className="p-4 border-t border-white/5 bg-blue-950 mt-auto">
                    <div className="flex items-center group transition-colors rounded-xl p-2 bg-white/5 border border-white/5">
                        {/* Settings Icon - Subtle yellow */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-950 shadow-md transition-transform group-hover:scale-105">
                            <Settings size={22} className="stroke-[2.5px]" />
                        </div>

                        {/* Text Info */}
                        <div className="overflow-hidden flex-1 ml-3 cursor-default">
                            <p className="text-base font-bold text-white group-hover:text-blue-200 transition-colors truncate">
                                Portal do Parceiro
                            </p>
                            <p className="text-xs text-blue-300/70 truncate font-mono" title={user?.email}>
                                {user?.email || 'parceiro@email.com'}
                            </p>
                            {/* Affiliate ID Copy */}
                            <div
                                className="flex items-center gap-1.5 mt-1 cursor-pointer group/copy"
                                onClick={handleCopyId}
                                title="Copiar Seu Link/Cód."
                            >
                                <p className="text-[10px] text-blue-300/50 font-mono tracking-wider group-hover/copy:text-blue-300 transition-colors">
                                    ID: {affiliateCode || '----'}
                                </p>
                                {copied ? (
                                    <Check size={10} className="text-green-400" />
                                ) : (
                                    <Copy size={10} className="text-blue-300/30 group-hover/copy:text-blue-300 transition-colors" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
