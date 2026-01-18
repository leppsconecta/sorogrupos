
import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    onSubmit: (data: any) => Promise<void>;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, jobTitle, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setFormData({ name: '', phone: '', email: '', description: '' });
                setIsSuccess(false);
            }, 3000);
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar reporte. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/20 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl relative animate-scaleUp">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {isSuccess ? (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Megaphone size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a234a] mb-2">Relato Recebido!</h3>
                        <p className="text-gray-500">Obrigado por nos ajudar a manter a plataforma segura. Vamos analisar a vaga <strong>{jobTitle}</strong>.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-[#1a234a] mb-1">Reportar Irregularidade</h3>
                            <p className="text-red-500 font-medium text-sm">Vaga: {jobTitle}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Seu Nome</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400">Telefone</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Descrição do Problema</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Explique o motivo do reporte..."
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-red-500 focus:outline-none transition-all resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 mt-2 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all text-sm"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
