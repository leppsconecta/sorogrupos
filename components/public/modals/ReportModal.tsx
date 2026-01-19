
import React, { useState } from 'react';
import { X, Megaphone, CheckCircle, AlertCircle } from 'lucide-react';
import { InputMask } from '@react-input/mask';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, jobTitle }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

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
            // Parses phone for payload: (15) 91234-1234 -> ddd: 15, contato: 912341234
            const ddd = cleanPhone.substring(0, 2);
            const contato = cleanPhone.substring(2);

            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone, // "O telefone deve ser enviado com dddi ddd e contato" - Sending full raw too just in case
                dddi: 55,
                ddd: parseInt(ddd),
                contato: parseInt(contato),
                description: formData.description,
                jobTitle: jobTitle
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
                // Auto close after success? User asked to "Exiba a tela de sucesso". 
                // We'll leave it open for user to close or auto-close after a longer delay if desired.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/30 backdrop-blur-sm">
            <div className={`bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative animate-scaleUp overflow-hidden flex flex-col md:flex-row transition-all ${isSuccess ? 'max-w-lg md:max-w-lg' : ''}`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>

                {isSuccess ? (
                    <div className="w-full text-center py-16 px-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">Denúncia Enviada!</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">
                            Agradecemos sua colaboração. Nossa equipe irá analisar a vaga <strong>{jobTitle}</strong> o mais rápido possível.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Left Side - Info - Hidden on Mobile */}
                        <div className="hidden md:flex w-full md:w-2/5 bg-gradient-to-br from-red-600 to-red-700 p-10 text-white flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                    <Megaphone size={24} className="text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-2">Reportar Irregularidade</h3>
                                <p className="text-red-100 text-sm leading-relaxed mb-6">
                                    Ajude-nos a manter a comunidade segura. Se esta vaga viola nossas diretrizes ou parece suspeita, por favor nos avise.
                                </p>

                                <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                    <p className="text-xs uppercase tracking-wider text-red-200 mb-1 font-bold">Vaga Denunciada</p>
                                    <p className="font-semibold text-lg line-clamp-2">{jobTitle}</p>
                                </div>
                            </div>

                            <div className="relative z-10 mt-8 md:mt-0">
                                <p className="text-xs text-red-200">
                                    Sua identidade será mantida em sigilo absoluto.
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="w-full md:w-3/5 p-6 md:p-10 bg-white">

                            {/* Mobile Header */}
                            <div className="md:hidden mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <Megaphone size={20} className="text-red-600" />
                                    Reportar Vaga
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-1">{jobTitle}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-shake">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Seu Nome</label>
                                    <input
                                        type="text"
                                        placeholder="Digite seu nome completo"
                                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Telefone</label>
                                        <InputMask
                                            mask="(__) 9 ____-____"
                                            replacement={{ _: /\d/ }}
                                            placeholder="(15) 9 1234-1234"
                                            type="tel"
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">E-mail</label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Descrição do Problema</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Explique o motivo do reporte com detalhes..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all resize-none placeholder:text-gray-400 text-gray-800"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold tracking-wide shadow-lg shadow-gray-900/20 hover:bg-black hover:transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar Reporte'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
