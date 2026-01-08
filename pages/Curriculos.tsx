import React from 'react';
import { FileText } from 'lucide-react';

export const Curriculos = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <FileText size={40} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Currículos</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Em breve este recurso estará disponível</p>
        </div>
    );
};
