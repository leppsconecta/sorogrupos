import React from 'react';
import { Construction } from 'lucide-react';

export const ParceiroPlaceholder: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
    return (
        <div className="flex h-full items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-80px)]">
            <div className="text-center max-w-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-200 dark:border-blue-800">
                    <Construction size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{subtitle}</p>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl group">
                    <p className="text-xs text-yellow-800 dark:text-yellow-500/80 font-medium">
                        Este ambiente está em fase de teste de validação de dados de leads. Funções financeiras serão ativadas na próxima etapa de desenvolvimento conforme cronograma.
                    </p>
                </div>
            </div>
        </div>
    );
};
