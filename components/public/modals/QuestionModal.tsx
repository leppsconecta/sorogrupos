
import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    onSubmit: (data: any) => Promise<void>;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ isOpen, onClose, jobTitle, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', question: '' });
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
                setFormData({ name: '', phone: '', email: '', question: '' });
                setIsSuccess(false);
            }, 3000);
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar pergunta. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl relative animate-scaleUp">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {isSuccess ? (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a234a] mb-2">Pergunta Enviada!</h3>
                        <p className="text-gray-500">Sua dúvida sobre a vaga <strong>{jobTitle}</strong> foi enviada para o recrutador.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-[#1a234a] mb-1">Fazer Pergunta</h3>
                            <p className="text-blue-500 font-medium text-sm">Vaga: {jobTitle}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Seu Nome</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
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
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Sua Pergunta</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Descreva sua dúvida aqui..."
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none"
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 mt-2 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all text-sm"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Pergunta'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionModal;
