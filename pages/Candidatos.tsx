import React from 'react';
import { Users } from 'lucide-react';

export const Candidatos = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <Users size={40} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Candidatos</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Nesta página você poderá ver os candidatos que se candidataram para a vaga que você anunciou.</p>
        </div>
    );
};
