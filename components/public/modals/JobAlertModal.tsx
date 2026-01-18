import React, { useState } from 'react';
import { X, Bell, Check, AlertCircle, MessageCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useMask } from '@react-input/mask';

interface JobAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
    companyName: string;
}

export const JobAlertModal: React.FC<JobAlertModalProps> = ({ isOpen, onClose, companyId, companyName }) => {
    const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        tags: [] as string[]
    });
    const [tagInput, setTagInput] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const whatsappMaskRef = useMask({ mask: '(__) _____-____', replacement: { _: /\d/ } });

    if (!isOpen) return null;

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim();
            if (tag && formData.tags.length < 3 && !formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

    const handleSendCode = async () => {
        setError('');
        if (!formData.name || !formData.email || !formData.whatsapp) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        const phone = cleanPhone(formData.whatsapp);
        if (phone.length < 10) {
            setError('Número de WhatsApp inválido.');
            return;
        }

        setLoading(true);
        try {
            // Generate a random 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // Store verification request
            const { error: dbError } = await supabase
                .from('job_alert_verifications')
                .insert({ phone, code });

            if (dbError) throw dbError;

            // In a real app, n8n or an Edge Function would pick this up and send the message.
            // For this UI implementation, we proceed to OTP step.
            setStep('otp');
        } catch (err: any) {
            console.error('Error sending code:', err);
            setError('Erro ao enviar código. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setError('');
        setLoading(true);
        try {
            const phone = cleanPhone(formData.whatsapp);

            // Allow public select policy enables this check
            const { data, error: fetchError } = await supabase
                .from('job_alert_verifications')
                .select('*')
                .eq('phone', phone)
                .eq('code', otp)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (fetchError || !data) {
                setError('Código inválido ou expirado.');
                setLoading(false);
                return;
            }

            // Code verified, create Job Alert
            const { error: insertError } = await supabase
                .from('job_alerts')
                .insert({
                    company_id: companyId,
                    name: formData.name,
                    email: formData.email,
                    whatsapp: phone,
                    tags: formData.tags,
                    verified: true
                });

            if (insertError) throw insertError;

            setStep('success');

            // Clean up verification (optional, or let trigger handle it)
            // await supabase.from('job_alert_verifications').delete().eq('phone', phone);

        } catch (err: any) {
            console.error('Error verifying code:', err);
            setError('Erro ao verificar código.');
        } finally {
            setLoading(false);
        }
    };

    // Close modal reset
    const handleClose = () => {
        setStep('form');
        setFormData({ name: '', email: '', whatsapp: '', tags: [] });
        setOtp('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Bell className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Receber Alertas de Vagas</h2>
                    <p className="text-blue-100 text-sm">
                        Seja o primeiro a saber das novidades da <br />
                        <span className="font-bold underline text-white">{companyName}</span>
                    </p>
                </div>

                <div className="p-6">
                    {/* Step 1: Form */}
                    {step === 'form' && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="Digite seu nome completo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <input
                                        ref={whatsappMaskRef}
                                        type="text"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Interesse (Tags) <span className="text-gray-400 font-normal text-xs">- Max 3</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-100">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="hover:text-blue-900"><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    {formData.tags.length < 3 && (
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                            placeholder="Digite e tecle Enter (Ex: Vendas, RH...)"
                                        />
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleSendCode}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Enviando...' : 'Receber Código de Validação'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
                        <div className="space-y-6 text-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Verifique seu WhatsApp</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    Enviamos um código de 6 dígitos para o número <strong>{formData.whatsapp}</strong>
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-48 text-center text-3xl font-bold tracking-widest px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="000000"
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm font-medium flex items-center justify-center gap-1">
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleVerifyCode}
                                    disabled={loading || otp.length < 6}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Validando...' : 'Confirmar Código'}
                                </button>
                                <button onClick={() => setStep('form')} className="text-gray-400 hover:text-gray-600 text-xs font-semibold">
                                    Corrigir Número
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="text-green-500" size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h3>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                Você receberá alertas exclusivos da da empresa <strong>{companyName}</strong>.
                                <br />Fique atento ao seu WhatsApp!
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
