import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Trash2, X, Info, HelpCircle } from 'lucide-react';

export type ActionModalType = 'success' | 'error' | 'warning' | 'info' | 'delete' | 'confirm';

interface ActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    type?: ActionModalType;
    title: string;
    message: React.ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    autoCloseDuration?: number;
}

export const ActionsModal: React.FC<ActionsModalProps> = ({
    isOpen,
    onClose,
    type = 'info',
    title,
    message,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false,
    autoCloseDuration
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
            if (autoCloseDuration) {
                const timer = setTimeout(() => {
                    handleClose();
                }, autoCloseDuration);
                return () => clearTimeout(timer);
            }
        } else {
            setShow(false);
        }
    }, [isOpen, autoCloseDuration]);

    const handleClose = () => {
        if (isLoading) return;
        setShow(false);
        setTimeout(onClose, 300);
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        // Don't auto-close if loading is expected, handled by parent
    };

    if (!isOpen && !show) return null;

    // Configuration based on type
    const config = {
        success: {
            icon: <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={2.5} />,
            bgIcon: 'bg-emerald-50 dark:bg-emerald-900/20',
            btnColor: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
            titleColor: 'text-emerald-900 dark:text-emerald-100',
        },
        error: {
            icon: <AlertCircle size={40} className="text-rose-500" strokeWidth={2.5} />,
            bgIcon: 'bg-rose-50 dark:bg-rose-900/20',
            btnColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
            titleColor: 'text-rose-900 dark:text-rose-100',
        },
        delete: {
            icon: <Trash2 size={40} className="text-rose-500" strokeWidth={2.5} />,
            bgIcon: 'bg-rose-50 dark:bg-rose-900/20',
            btnColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
            titleColor: 'text-rose-900 dark:text-rose-100',
        },
        warning: {
            icon: <AlertCircle size={40} className="text-amber-500" strokeWidth={2.5} />,
            bgIcon: 'bg-amber-50 dark:bg-amber-900/20',
            btnColor: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
            titleColor: 'text-amber-900 dark:text-amber-100',
        },
        info: {
            icon: <Info size={40} className="text-blue-500" strokeWidth={2.5} />,
            bgIcon: 'bg-blue-50 dark:bg-blue-900/20',
            btnColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
            titleColor: 'text-blue-900 dark:text-blue-100',
        },
        confirm: {
            icon: <HelpCircle size={40} className="text-blue-500" strokeWidth={2.5} />,
            bgIcon: 'bg-blue-50 dark:bg-blue-900/20',
            btnColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
            titleColor: 'text-blue-900 dark:text-blue-100',
        }
    };

    const currentConfig = config[type];
    const isConfirmType = type === 'delete' || type === 'confirm' || type === 'warning';

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Card */}
            <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'} border border-slate-100 dark:border-slate-800`}>
                {!isLoading && (
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 ${currentConfig.bgIcon} rounded-full flex items-center justify-center mb-6 animate-bounce-slow`}>
                        {isLoading ? (
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : currentConfig.icon}
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${currentConfig.titleColor} dark:text-white`}>{title}</h3>
                    <div className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm">
                        {message}
                    </div>

                    <div className="mt-8 w-full flex gap-3">
                        {/* Cancel Button - Only for confirm types */}
                        {isConfirmType && !isLoading && (
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                {cancelText}
                            </button>
                        )}

                        {/* Main Action Button */}
                        <button
                            onClick={isConfirmType ? handleConfirm : handleClose}
                            disabled={isLoading}
                            className={`flex-1 py-3 ${currentConfig.btnColor} text-white rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                isConfirmType ? confirmText : 'OK'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
