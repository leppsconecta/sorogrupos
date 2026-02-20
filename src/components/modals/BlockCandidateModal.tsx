import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface BlockCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isLoading?: boolean;
    candidateName: string;
}

export const BlockCandidateModal: React.FC<BlockCandidateModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    candidateName
}) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onConfirm(reason);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50 dark:bg-rose-900/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Bloquear Candidato</h3>
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Ação restritiva</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-rose-200/50 text-rose-600/70 hover:text-rose-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Você está prestes a bloquear <strong>{candidateName}</strong>.
                        Este candidato não poderá mais ser visto nas listagens ativas.
                    </p>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Motivo do Bloqueio <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full h-32 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none text-sm"
                            placeholder="Descreva o motivo do bloqueio..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!reason.trim() || isLoading}
                        >
                            {isLoading ? 'Bloqueando...' : 'Confirmar Bloqueio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
