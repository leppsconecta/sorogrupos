import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnderDevelopmentProps {
    pageName: string;
}

export const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({ pageName }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6 relative group">
                <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/30 rounded-full animate-ping opacity-20"></div>
                <Construction size={48} className="text-amber-500 dark:text-amber-400 relative z-10" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">
                {pageName}
            </h2>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl px-6 py-3 mb-8">
                <p className="text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">
                    🚧 Em Desenvolvimento
                </p>
            </div>

            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-8 leading-relaxed">
                Estamos trabalhando duro para trazer esta funcionalidade em breve.
                <br className="hidden md:block" />
                Fique atento às novidades!
            </p>

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
                <ArrowLeft size={16} />
                Voltar
            </button>
        </div>
    );
};
