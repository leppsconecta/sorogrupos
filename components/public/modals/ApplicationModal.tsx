import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle, AlertCircle, Phone, Lock, UploadCloud, RefreshCw, Edit2, FileText, Paperclip, ArrowRight, User, MapPin, Calendar, ArrowLeft, Briefcase, Plus, Trash2 } from 'lucide-react';
import { InputMask } from '@react-input/mask';
import { supabase } from '../../../lib/supabase';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    jobOwnerId: string;
    jobId: string;
    companyId: string; // Added companyId prop
}

type Step = 'contact_info' | 'personal_info' | 'professional_info' | 'verification' | 'success';

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, jobTitle, jobOwnerId, jobId, companyId }) => {
    const [step, setStep] = useState<Step>('contact_info');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        sex: '',
        birthDate: '',
        mainRole: '',
        extraRoles: [] as string[]
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [generatedToken, setGeneratedToken] = useState('');
    const [candidateId, setCandidateId] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // City Autocomplete State
    const [cities, setCities] = useState<string[]>([]);
    const [filteredCities, setFilteredCities] = useState<string[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const [canResend, setCanResend] = useState(false);

    // Resume input ref to reset file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const UFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep('contact_info');
            setFormData({
                name: '', phone: '', email: '', city: '', state: '', sex: '', birthDate: '',
                mainRole: '', extraRoles: []
            });
            setResumeFile(null);
            setVerificationCode('');
            setGeneratedToken('');
            setCandidateId('');
            setError('');
            setTimeLeft(0);
            setCities([]);
        }
    }, [isOpen]);

    // Fetch cities when State changes
    useEffect(() => {
        if (formData.state) {
            const fetchCities = async () => {
                setIsLoadingCities(true);
                setFormData(prev => ({ ...prev, city: '' })); // Reset city when state changes
                try {
                    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`);
                    const data = await response.json();
                    const cityNames = data.map((c: any) => c.nome);
                    setCities(cityNames);
                    setFilteredCities(cityNames);
                } catch (err) {
                    console.error("Failed to fetch cities", err);
                    setCities([]);
                } finally {
                    setIsLoadingCities(false);
                }
            };
            fetchCities();
        } else {
            setCities([]);
            setFilteredCities([]);
        }
    }, [formData.state]);

    // Filter cities locally as user types
    useEffect(() => {
        if (formData.city) {
            const lower = formData.city.toLowerCase();
            const filtered = cities.filter(c => c.toLowerCase().includes(lower));
            setFilteredCities(filtered);
        } else {
            setFilteredCities(cities);
        }
    }, [formData.city, cities]);

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
        const parts = dateStr.split('/');
        if (parts.length !== 3) return { valid: false, message: 'Formato inválido.' };

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        const birthDate = new Date(year, month - 1, day);
        const today = new Date();

        if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
            return { valid: false, message: 'Data inexistente.' };
        }

        if (birthDate > today) {
            return { valid: false, message: 'A data não pode ser futura.' };
        }

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13) {
            return { valid: false, message: 'Idade mínima de 13 anos.' };
        }

        return { valid: true };
        return { valid: true };
    };

    const handleAddExtraRole = () => {
        if (formData.extraRoles.length < 5) {
            setFormData(prev => ({
                ...prev,
                extraRoles: [...prev.extraRoles, '']
            }));
        }
    };

    const handleRemoveExtraRole = (index: number) => {
        setFormData(prev => ({
            ...prev,
            extraRoles: prev.extraRoles.filter((_, i) => i !== index)
        }));
    };

    const handleExtraRoleChange = (index: number, value: string) => {
        const newRoles = [...formData.extraRoles];
        newRoles[index] = value;
        setFormData(prev => ({ ...prev, extraRoles: newRoles }));
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
            if (!formData.state || !formData.city || !formData.sex || !formData.birthDate) {
                setError('Preencha todos os campos.');
                return;
            }

            if (!cities.includes(formData.city)) {
                setError('Selecione uma cidade válida da lista.');
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

            setStep('professional_info');
        } else if (step === 'professional_info') {
            if (!formData.mainRole) {
                setError('Por favor, informe sua função principal/atual.');
                return;
            }
            handleRequestCode();
        }
    };

    const handleRequestCode = async () => {
        setIsSubmitting(true);
        setError('');

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedToken(code);

        try {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const ddd = cleanPhone.substring(0, 2);
            const number = cleanPhone.substring(2);
            const formattedPhone = `55${ddd}${number}`;

            // Format Birth Date
            const [day, month, year] = formData.birthDate.split('/');
            const dbBirthDate = `${year}-${month}-${day}`;

            // 1. Upsert Candidate via Secure RPC
            let currCandidateId = '';

            const { data: rpcData, error: rpcError } = await supabase
                .rpc('register_candidate', {
                    p_name: formData.name,
                    p_email: formData.email,
                    p_phone: formattedPhone,
                    p_city: formData.city,
                    p_state: formData.state,
                    p_sex: formData.sex,
                    p_birth_date: dbBirthDate,
                    p_cargo_principal: formData.mainRole,
                    p_cargos_extras: formData.extraRoles.filter(r => r.trim() !== '')
                });

            if (rpcError) {
                console.error("Error registering candidate:", rpcError);
                throw new Error('Falha ao cadastrar candidato via sistema seguro.');
            }

            currCandidateId = rpcData;

            setCandidateId(currCandidateId);

            // 2. Send Webhook
            const payload = {
                type: 'solicita_codigo',
                user_id: jobOwnerId,
                job_id: jobId, // Reverted to job_id (lowercase) to fix 500 error
                phone: formattedPhone,
                code: code,
                id_candidate: currCandidateId,
                formato: '55+ddd+numero'
            };

            console.log('Sending webhook payload:', payload);

            const response = await fetch('https://webhook.leppsconecta.com.br/webhook/1b3c5fe0-68c9-4c9f-b8b0-2afce5e08718', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Webhook failed:', response.status, errorText);
                throw new Error(`Falha ao enviar solicitação: ${response.status}`);
            }

            setStep('verification');
            startTimer();

        } catch (error: any) {
            console.error(error);
            setError(error.message || "Erro ao enviar solicitação. Tente novamente.");
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

            // 1. Upload Resume
            let resumeUrl = '';
            if (resumeFile) {
                const fileExt = resumeFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(filePath, resumeFile);

                if (uploadError) {
                    throw new Error('Falha ao enviar currículo.');
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(filePath);

                resumeUrl = publicUrl;

                // Update candidate with resume URL
                if (candidateId) {
                    const { error: updateResumeError } = await supabase
                        .from('candidates')
                        .update({
                            resume_url: resumeUrl,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', candidateId);

                    if (updateResumeError) console.error("Error updating resume URL:", updateResumeError);
                }
            }

            // 2. Check Candidate ID
            if (!candidateId) throw new Error("ID do candidato não encontrado.");

            // 3. Create Job Application
            const { error: appError } = await supabase
                .from('job_applications')
                .insert({
                    job_id: jobId,
                    candidate_id: candidateId,
                    company_id: companyId, // Added companyId to insert
                    status: 'pending'
                });

            if (appError) {
                if (appError.code === '23505') {
                    // Ignore unique violation
                } else {
                    console.error("Job Application Error:", appError);
                    throw new Error(`Falha ao registrar candidatura: ${appError.message} (${appError.code})`);
                }
            }


            // Success immediately after DB save
            setStep('success');

        } catch (error: any) {
            console.error(error);
            setError(error.message || "Erro ao finalizar candidatura. Tente novamente.");
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
            // Client-side validation
            if (verificationCode === generatedToken) {
                await handleFinalSubmission();
            } else {
                setError('Código incorreto.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            setError("Erro ao validar código.");
            setIsSubmitting(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 'contact_info': return 'Informações de Contato';
            case 'personal_info': return 'Dados Pessoais';
            case 'professional_info': return 'Informações Profissionais';
            case 'verification': return 'Verificação de Segurança';
            default: return 'Candidatar-se';
        }
    };

    const getStepProgress = () => {
        switch (step) {
            case 'contact_info': return 25;
            case 'personal_info': return 50;
            case 'professional_info': return 75;
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
                            {(step === 'personal_info' || step === 'professional_info') && (
                                <button
                                    onClick={() => {
                                        if (step === 'personal_info') setStep('contact_info');
                                        if (step === 'professional_info') setStep('personal_info');
                                    }}
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
                                <div className="grid grid-cols-12 gap-3">
                                    {/* State (UF) */}
                                    <div className="col-span-3 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">UF *</label>
                                        <select
                                            className="w-full px-2 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm appearance-none text-center"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            required
                                        >
                                            <option value="">UF</option>
                                            {UFs.map(uf => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* City Autocomplete */}
                                    <div className="col-span-9 space-y-1.5 relative">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cidade *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder={isLoadingCities ? "Carregando..." : (formData.state ? "Selecione na lista..." : "Selecione o estado primeiro")}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm ${!formData.state ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                value={formData.city}
                                                onChange={e => {
                                                    setFormData({ ...formData, city: e.target.value });
                                                    setShowCitySuggestions(true);
                                                }}
                                                onFocus={() => setShowCitySuggestions(true)}
                                                onBlur={() => {
                                                    // Delay hide to allow click
                                                    setTimeout(() => setShowCitySuggestions(false), 200);

                                                    // Strict Validation on Blur: If current value not in cities, clear it
                                                    // Using timeout to ensure state updates or clicks process first
                                                    setTimeout(() => {
                                                        if (formData.city && !cities.includes(formData.city)) {
                                                            // Optional: could keep it but validation will fail on submit
                                                        }
                                                    }, 300);
                                                }}
                                                disabled={!formData.state || isLoadingCities}
                                                required
                                            />
                                            {isLoadingCities && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Suggestions Dropdown */}
                                        {showCitySuggestions && filteredCities.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar animate-slideDown">
                                                {filteredCities.map((city) => (
                                                    <button
                                                        key={city}
                                                        type="button"
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                        onClick={() => {
                                                            setFormData({ ...formData, city: city });
                                                            setShowCitySuggestions(false);
                                                        }}
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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



                        {step === 'professional_info' && (
                            <form onSubmit={handleNextStep} className="space-y-6">
                                {/* Cargos - Main Role */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cargo Principal / Atual *</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Função principal. Ex: Aux. Administrativo"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                            value={formData.mainRole}
                                            onChange={e => setFormData({ ...formData, mainRole: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Extra Roles */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Funções extras</label>
                                        {formData.extraRoles.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={handleAddExtraRole}
                                                className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={14} /> Adicionar Função
                                            </button>
                                        )}
                                    </div>

                                    {formData.extraRoles.map((role, index) => (
                                        <div key={index} className="relative animate-fadeIn">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder={`Experiência em: Ex: Encanador`}
                                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                                                value={role}
                                                onChange={e => handleExtraRoleChange(index, e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExtraRole(index)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.extraRoles.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">Nenhuma função extra adicionada.</p>
                                    )}
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
