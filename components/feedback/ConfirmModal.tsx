import React from 'react';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { ConfirmOptions } from '../../types';

interface ConfirmModalProps {
    isOpen: boolean;
    options: ConfirmOptions | null;
    onClose: () => void; // Calls onCancel effectively
    onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, options, onClose, onConfirm }) => {
    if (!isOpen || !options) return null;

    const getIcon = () => {
        switch (options.type) {
            case 'danger': return <AlertCircle size={48} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={48} className="text-yellow-500" />;
            case 'info':
            default: return <Info size={48} className="text-blue-500" />;
        }
    };

    const getButtonStyles = () => {
        switch (options.type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-200';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-200';
            case 'info':
            default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative animate-scaleIn border border-slate-100 dark:border-slate-800">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${options.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : options.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                        {getIcon()}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {options.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            {options.description}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                        >
                            {options.cancelText || 'Cancelar'}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-900/10 transition-all active:scale-95 outline-none focus:ring-4 ${getButtonStyles()}`}
                        >
                            {options.confirmText || 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
