import React, { useState, useEffect } from 'react';
import { X, Megaphone, CheckCircle, AlertCircle } from 'lucide-react';
import { InputMask } from '@react-input/mask';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    userId: string;
    jobCode: string;
    jobId: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, jobTitle, userId, jobCode, jobId }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', phone: '', email: '', description: '' });
            setIsSuccess(false);
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.name || !formData.phone || !formData.email || !formData.description) {
            setError('Todos os campos são obrigatórios.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Digite um e-mail válido.');
            return;
        }

        // Clean phone for check
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setError('Telefone inválido.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Parses phone for payload: (15) 91234-1234 -> 5515912341234
            const ddd = cleanPhone.substring(0, 2);
            const number = cleanPhone.substring(2);
            const formattedPhone = `55${ddd}${number}`;

            const payload = {
                name: formData.name,
                phone: formattedPhone,
                email: formData.email,
                user_id: userId,
                code_job: jobCode,
                job_id: jobId,
                description: formData.description,
                name_job: jobTitle
            };

            const response = await fetch('https://webhook.leppsconecta.com.br/webhook/38a97491-c52b-4378-8024-7cd2c90959e4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                throw new Error('Falha ao enviar.');
            }

        } catch (error) {
            console.error(error);
            setError("Erro ao enviar reporte. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn ring-1 ring-slate-100">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white relative">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone size={20} className="text-red-500" />
                        Reportar Vaga
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="w-full text-center py-12 px-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Denúncia Enviada!</h3>
                        <p className="text-gray-500 mb-8 text-sm">
                            Agradecemos sua colaboração. Nossa equipe irá analisar a vaga <strong>{jobTitle}</strong>.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    /* Form */
                    <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Seu Nome *</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome completo"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Telefone *</label>
                                    <InputMask
                                        mask="(__) _ ____-____"
                                        replacement={{ _: /\d/ }}
                                        placeholder="(15) 9 1234-1234"
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">E-mail *</label>
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Descrição do Problema *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Explique o motivo do reporte com detalhes..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all resize-none placeholder:text-slate-400 text-slate-800 text-sm"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold tracking-wide shadow-lg shadow-slate-900/20 hover:bg-black hover:transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Reporte'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
