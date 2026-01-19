import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle, AlertCircle, Phone, Lock, UploadCloud, RefreshCw, Edit2, FileText, Paperclip, ArrowRight, User, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { InputMask } from '@react-input/mask';
import { supabase } from '../../../lib/supabase';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    jobOwnerId: string;
    jobId: string;
}

type Step = 'contact_info' | 'personal_info' | 'verification' | 'success';

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, jobTitle, jobOwnerId, jobId }) => {
    const [step, setStep] = useState<Step>('contact_info');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        sex: '',
        birthDate: ''
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const [canResend, setCanResend] = useState(false);

    // Resume input ref to reset file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep('contact_info');
            setFormData({ name: '', phone: '', email: '', city: '', sex: '', birthDate: '' });
            setResumeFile(null);
            setVerificationCode('');
            setError('');
            setTimeLeft(0);
        }
    }, [isOpen]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timeLeft]);

    if (!isOpen) return null;

    const startTimer = () => {
        setTimeLeft(30);
        setCanResend(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate Size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('O arquivo deve ter no máximo 5MB.');
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            // Validate Type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setError('Formato inválido. Use PDF, Word ou Imagem.');
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            setResumeFile(file);
            setError('');
        }
    };

    const validateAge = (dateStr: string) => {
        // format: DD/MM/YYYY (guaranteed by regex check before calling this if needed)
        const parts = dateStr.split('/');
        if (parts.length !== 3) return { valid: false, message: 'Formato inválido.' };

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        const birthDate = new Date(year, month - 1, day);
        const today = new Date();

        // Check if date is valid
        if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
            return { valid: false, message: 'Data inexistente.' };
        }

        // Check if future
        if (birthDate > today) {
            return { valid: false, message: 'A data não pode ser futura.' };
        }

        // Check age >= 13
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) {
            return { valid: false, message: 'Idade mínima de 13 anos.' };
        }

        return { valid: true };
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 'contact_info') {
            if (!formData.name || !formData.phone || !formData.email) {
                setError('Preencha os campos obrigatórios.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError('Digite um e-mail válido.');
                return;
            }

            const cleanPhone = formData.phone.replace(/\D/g, '');
            if (cleanPhone.length < 10) {
                setError('Telefone inválido.');
                return;
            }

            if (!resumeFile) {
                setError('Por favor, anexe seu currículo.');
                return;
            }

            setStep('personal_info');
        } else if (step === 'personal_info') {
            if (!formData.city || !formData.sex || !formData.birthDate) {
                setError('Preencha todos os campos.');
                return;
            }

            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(formData.birthDate)) {
                setError('Data incompleta.');
                return;
            }

            const ageCheck = validateAge(formData.birthDate);
            if (!ageCheck.valid) {
                setError(ageCheck.message || 'Data inválida.');
                return;
            }

            // Proceed to request code
            handleRequestCode();
        }
    };

    const handleRequestCode = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const ddd = cleanPhone.substring(0, 2);
            const number = cleanPhone.substring(2);
            const formattedPhone = `55${ddd}${number}`;

            const payload = {
                type: 'solicita_codigo',
                user_id: jobOwnerId,
                phone: formattedPhone,
                formato: '55+ddd+numero'
            };

            const response = await fetch('https://webhook.leppsconecta.com.br/webhook/1b3c5fe0-68c9-4c9f-b8b0-2afce5e08718', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setStep('verification');
                startTimer();
            } else {
                throw new Error('Falha ao solicitar código.');
            }

        } catch (error) {
            console.error(error);
            setError("Erro ao enviar solicitação. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalSubmission = async () => {
        try {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const ddd = cleanPhone.substring(0, 2);
            const number = cleanPhone.substring(2);
            const formattedPhone = `55${ddd}${number}`;

            const data = new FormData();
            data.append('type', 'nova_candidatura');
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formattedPhone);
            data.append('city', formData.city);
            data.append('sex', formData.sex);
            data.append('birth_date', formData.birthDate);
            data.append('user_id', jobOwnerId);
            data.append('job_title', jobTitle);

            if (resumeFile) {
                data.append('file', resumeFile);
            }

            const response = await fetch('https://webhook.leppsconecta.com.br/webhook/1b3c5fe0-68c9-4c9f-b8b0-2afce5e08718', {
                method: 'POST',
                body: data
            });

            if (response.ok) {
                setStep('success');
            } else {
                throw new Error('Falha ao enviar candidatura.');
            }

        } catch (error) {
            console.error(error);
            setError("Erro ao finalizar candidatura. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleValidateCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (verificationCode.length < 4) {
            setError('O código deve ter 4 dígitos.');
            return;
        }

        setIsSubmitting(true);

        try {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const ddd = cleanPhone.substring(0, 2);
            const number = cleanPhone.substring(2);
            const formattedPhone = `55${ddd}${number}`;

            const payload = {
                type: 'valida_codigo',
                user_id: jobOwnerId,
                phone: formattedPhone,
                formato: '55+ddd+numero',
                token: verificationCode
            };

            const response = await fetch('https://webhook.leppsconecta.com.br/webhook/1b3c5fe0-68c9-4c9f-b8b0-2afce5e08718', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data && data.confirme_code === true) {
                await handleFinalSubmission();
            } else {
                setError('Código inválido ou expirado.');
                setIsSubmitting(false);
            }

        } catch (error) {
            console.error(error);
            setError("Erro ao validar código. Verifique sua conexão.");
            setIsSubmitting(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 'contact_info': return 'Informações de Contato';
            case 'personal_info': return 'Dados Pessoais';
            case 'verification': return 'Verificação de Segurança';
            default: return 'Candidatar-se';
        }
    };

    const getStepProgress = () => {
        switch (step) {
            case 'contact_info': return 33;
            case 'personal_info': return 66;
            case 'verification': return 90;
            case 'success': return 100;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn ring-1 ring-slate-100 transition-all duration-300">

                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white relative">
                    <div className="pr-8 w-full">
                        <div className="flex items-center gap-2 mb-2">
                            {step === 'personal_info' && (
                                <button
                                    onClick={() => setStep('contact_info')}
                                    className="p-1 -ml-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {step === 'verification' ? <Lock size={20} className="text-blue-600" /> : <Send size={20} className="text-blue-600" />}
                                {getStepTitle()}
                            </h2>
                        </div>
                        {step !== 'success' && (
                            <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                    style={{ width: `${getStepProgress()}%` }}
                                />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {step === 'success' ? (
                    <div className="w-full text-center py-12 px-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Candidatura Enviada!</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8 text-sm">
                            Seu número foi verificado e sua candidatura foi enviada com sucesso.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 text-sm"
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    /* Content */
                    <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-shake mb-4">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {step === 'contact_info' && (
                            <form onSubmit={handleNextStep} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Seu Nome *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Digite seu nome completo"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">WhatsApp *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <InputMask
                                                mask="(__) _ ____-____"
                                                replacement={{ _: /\d/ }}
                                                placeholder="(15) 9 1234-1234"
                                                type="tel"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">E-mail *</label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Discreet Resume Upload */}
                                <div className="pt-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="resume-upload-mini"
                                    />
                                    <label
                                        htmlFor="resume-upload-mini"
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${resumeFile ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                    >
                                        <div className={`p-2 rounded-full ${resumeFile ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                            <Paperclip size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {resumeFile ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold truncate">{resumeFile.name}</span>
                                                    <span className="text-xs opacity-70">{(resumeFile.size / 1024 / 1024).toFixed(2)}MB - Clique para alterar</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">Anexar Currículo</span>
                                                    <span className="text-xs opacity-60">PDF, Word ou Imagem (Máx 5MB)</span>
                                                </div>
                                            )}
                                        </div>
                                        {resumeFile && <CheckCircle size={18} className="text-blue-500" />}
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        Próxima Etapa <ArrowRight size={16} />
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 'personal_info' && (
                            <form onSubmit={handleNextStep} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cidade *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ex: Sorocaba"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sexo *</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm appearance-none"
                                            value={formData.sex}
                                            onChange={e => setFormData({ ...formData, sex: e.target.value })}
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Feminino">Feminino</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data de Nascimento *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <InputMask
                                                mask="__/__/____"
                                                replacement={{ _: /\d/ }}
                                                placeholder="DD/MM/AAAA"
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                                value={formData.birthDate}
                                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Confirmar envio <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}


                        {step === 'verification' && (
                            // Verification Step - Code Only
                            <form onSubmit={handleValidateCode} className="flex flex-col h-full bg-slate-50/50 -mx-6 -my-6 p-6">

                                <div className="flex-1 flex flex-col justify-center items-center gap-4 py-4">

                                    <div className="w-full max-w-[180px]">
                                        <input
                                            type="number"
                                            placeholder="0000"
                                            className="w-full text-center text-3xl font-bold tracking-[0.2em] px-2 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-200 text-slate-800 shadow-sm [&::-webkit-inner-spin-button]:appearance-none"
                                            value={verificationCode}
                                            onChange={e => {
                                                if (e.target.value.length <= 4) {
                                                    setVerificationCode(e.target.value);
                                                }
                                            }}
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setStep('contact_info')}
                                        className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1"
                                    >
                                        Alterar dados
                                    </button>
                                </div>

                                <div className="space-y-3 mt-auto pt-4 border-t border-slate-200/60">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || verificationCode.length < 4}
                                        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold tracking-wide shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Verificando...
                                            </>
                                        ) : (
                                            'Validar Código'
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center text-xs px-1">
                                        {canResend ? (
                                            <button
                                                type="button"
                                                onClick={() => handleRequestCode()}
                                                className="text-slate-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-1.5 py-1"
                                            >
                                                <RefreshCw size={12} />
                                                Reenviar Código
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 font-medium cursor-not-allowed opacity-70 py-1">
                                                Reenviar em {timeLeft}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationModal;
