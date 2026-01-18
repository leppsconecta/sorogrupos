
import React, { useState, useRef } from 'react';
import { X, Check, FileText, Trash2, UploadCloud } from 'lucide-react';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    onSubmit: (data: any, file: File) => Promise<void>;
}

type Step = 'form' | 'verification' | 'success';

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, jobTitle, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<Step>('form');
    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleStartApply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Por favor, anexe seu currículo.");
            return;
        }
        setStep('verification');
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationCode.length !== 4) {
            alert("Insira o código de 4 dígitos enviado ao seu WhatsApp.");
            return;
        }
        setIsSubmitting(true);

        try {
            if (file) {
                await onSubmit(formData, file);
                setStep('success');
                setTimeout(() => {
                    onClose();
                    reset();
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar candidatura. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setStep('form');
        setFormData({ name: '', phone: '', email: '' });
        setFile(null);
        setVerificationCode('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a234a]/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl relative animate-scaleUp">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {step === 'success' && (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a234a] mb-2">Currículo Enviado!</h3>
                        <p className="text-gray-500">Sua candidatura para <strong>{jobTitle}</strong> foi concluída com sucesso.</p>
                    </div>
                )}

                {step === 'verification' && (
                    <div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-[#1a234a] mb-1">Validação de Telefone</h3>
                            <p className="text-gray-500 text-sm">Enviamos um código via WhatsApp para {formData.phone}</p>
                        </div>
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400">Código de 4 dígitos</label>
                                <input
                                    required
                                    autoFocus
                                    type="text"
                                    maxLength={4}
                                    className="w-full px-5 py-4 text-center text-3xl tracking-[1rem] rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-mono"
                                    placeholder="0000"
                                    value={verificationCode}
                                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 rounded-2xl bg-green-600 text-white font-semibold uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all"
                            >
                                {isSubmitting ? 'Verificando...' : 'Confirmar e Enviar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                className="w-full text-gray-400 text-xs font-medium hover:underline"
                            >
                                Alterar número de telefone
                            </button>
                        </form>
                    </div>
                )}

                {step === 'form' && (
                    <>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-[#1a234a] mb-1">Candidatar-se</h3>
                            <p className="text-blue-600 font-medium text-sm">{jobTitle}</p>
                        </div>

                        <form onSubmit={handleStartApply} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="Como gostaria de ser chamado"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400">Telefone (WhatsApp)</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                        placeholder="(00) 00000-0000"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                        placeholder="Seu melhor e-mail"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Currículo</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${file ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,image/*"
                                        onChange={e => {
                                            const selectedFile = e.target.files?.[0];
                                            if (selectedFile) {
                                                const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'];
                                                if (validTypes.includes(selectedFile.type) || selectedFile.type.startsWith('image/')) {
                                                    setFile(selectedFile);
                                                } else {
                                                    alert('Formato de arquivo inválido. Por favor envie PDF, Word ou Imagem.');
                                                    e.target.value = ''; // Reset input
                                                }
                                            }
                                        }}
                                    />
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-green-700 text-sm">
                                            <FileText size={20} />
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }} className="text-red-500 ml-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center">
                                            <UploadCloud size={32} className="mb-1" />
                                            <p className="text-sm font-semibold">Anexar currículo</p>
                                            <p className="text-[10px]">PDF, DOC ou Imagem</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all text-sm"
                            >
                                Próximo Passo
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ApplicationModal;
