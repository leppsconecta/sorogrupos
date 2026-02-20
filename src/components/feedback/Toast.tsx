import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
};

const styles = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const Icon = icons[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slideInRight transition-all max-w-sm w-full pointer-events-auto ${styles[toast.type]}`}>
            <Icon size={20} className="mt-0.5 shrink-0" />
            <div className="flex-1">
                {toast.title && <h4 className="font-bold text-sm mb-0.5">{toast.title}</h4>}
                <p className="text-sm font-medium opacity-90">{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100"
            >
                <X size={16} />
            </button>
        </div>
    );
};
