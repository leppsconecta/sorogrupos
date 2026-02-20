import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    message
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    if (!isOpen && !show) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Card */}
            <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                        <AlertCircle size={40} className="text-blue-500" strokeWidth={2.5} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Atenção</h3>
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={handleClose}
                        className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
