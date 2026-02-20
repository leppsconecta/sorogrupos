
import React, { useState } from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ResetPasswordModalProps {
    onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                onClose();
                window.location.reload(); // Reload to ensure clean state
            }, 2000);
        } catch (err: any) {
            console.error('Error updating password:', err);
            setError('Erro ao atualizar senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={success ? onClose : undefined} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 animate-scaleUp">

                {!success && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        {success ? <CheckCircle2 size={32} /> : <Lock size={32} />}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                        {success ? 'Senha Atualizada!' : 'Nova Senha'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {success
                            ? 'Sua senha foi redefinida com sucesso.'
                            : 'Defina uma nova senha para sua conta.'}
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500 transition-all text-slate-800 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500 transition-all text-slate-800 dark:text-white"
                            />
                        </div>

                        {error && (
                            <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">{error}</p>
                        )}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
                        >
                            {loading ? 'Atualizando...' : 'Atualizar Senha'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Tudo certo! Você já pode usar sua nova senha.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
