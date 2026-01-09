import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Plus,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    Briefcase,
    Building2,
    Eye,
    EyeOff,
    ChevronDown,
    Upload,
    Smartphone,
    Info,
    Check,
    MapPin,
    Mail,
    Link as LinkIcon,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Vaga as Job, JobContact } from '../types';
import { SavedContactsModal } from './SavedContactsModal';
import { OfficialWhatsAppIcon } from './OfficialWhatsAppIcon';

interface JobEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobToEdit?: any | null; // Can be Job type or null for new job
    onSave: () => void;
    hideBackButton?: boolean;
}

export const JobEditModal: React.FC<JobEditModalProps> = ({ isOpen, onClose, jobToEdit, onSave, hideBackButton }) => {
    const { company } = useAuth();
    const [jobCreationStep, setJobCreationStep] = useState<'selection' | 'form' | 'upload' | 'preview'>('selection');
    const [jobDraft, setJobDraft] = useState<Partial<Job>>({
        type: 'scratch',
        contacts: [],
        showObservation: false,
        hideCompany: false,
    });
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [showFooterInImage, setShowFooterInImage] = useState(false);
    const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
    const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
    const [savedContacts, setSavedContacts] = useState<any[]>([]);
    const [previewEmojis, setPreviewEmojis] = useState('🟡🔴🤣');
    const [emojiInput, setEmojiInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch saved contacts on mount/open
    useEffect(() => {
        if (isOpen) {
            fetchSavedContacts();
        }
    }, [isOpen]);

    // Initialize draft when editing
    useEffect(() => {
        if (jobToEdit) {
            setJobDraft({
                ...jobToEdit,
                type: jobToEdit.type === 'image' || jobToEdit.type === 'file' ? 'file' : 'scratch',
                contacts: jobToEdit.contacts || [],
                jobCode: jobToEdit.jobCode || jobToEdit.code,
                // Map other fields as needed
                role: jobToEdit.role || jobToEdit.title,
                companyName: jobToEdit.companyName || jobToEdit.company_name,
                imageUrl: jobToEdit.imageUrl || jobToEdit.file_url,
            });
            setJobCreationStep(jobToEdit.type === 'image' || jobToEdit.type === 'file' ? 'upload' : 'form');
            if (jobToEdit.type === 'image' || jobToEdit.type === 'file') {
                setShowFooterInImage(jobToEdit.footerEnabled);
            }
        } else {
            // Reset for new job
            setJobDraft({
                type: 'scratch',
                contacts: [],
                showObservation: false,
                hideCompany: false,
                jobCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
                companyName: company?.name || '',
            });
            setJobCreationStep('selection');
            setAttachedFile(null);
            setShowFooterInImage(false);
        }
    }, [jobToEdit, isOpen, company]);

    const fetchSavedContacts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('saved_job_contacts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setSavedContacts(data);
    };

    const scrollToCenter = (e: React.FocusEvent<HTMLElement>) => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachedFile(e.target.files[0]);
        }
    };

    const handleAddContactField = (type: JobContact['type']) => {
        // Find saved contact for this type (case insensitive matching)
        const saved = savedContacts.find(c =>
            c.type.toLowerCase() === type.toLowerCase() ||
            (type === 'Endereço' && c.type === 'address') ||
            (type === 'Link' && c.type === 'link')
        );

        const newContact: JobContact = {
            type,
            value: saved ? saved.value : ''
        };
        setJobDraft(prev => ({ ...prev, contacts: [...(prev.contacts || []), newContact] }));
    };

    const removeContact = (index: number) => {
        setJobDraft(prev => ({
            ...prev,
            contacts: prev.contacts?.filter((_, i) => i !== index)
        }));
    };

    const updateContactValue = (index: number, value: any, field: keyof JobContact = 'value') => {
        setJobDraft(prev => ({
            ...prev,
            contacts: prev.contacts?.map((c, i) => i === index ? { ...c, [field]: value } : c)
        }));
    };

    const generatePreviewText = () => {
        const code = jobDraft.jobCode || '---';
        const cvParts: string[] = [];
        const addressParts: string[] = [];
        const linkParts: string[] = [];

        jobDraft.contacts?.forEach((c) => {
            if (c.type === 'WhatsApp') cvParts.push(`WhatsApp ${c.value}`);
            else if (c.type === 'Email') cvParts.push(`e-mail ${c.value}`);
            else if (c.type === 'Link') linkParts.push(`Link ${c.value}`);
            else if (c.type === 'Endereço') {
                const addressBase = `${c.value}`;
                // Simple date format logic for preview
                if (!c.noDateTime) {
                    const dateStr = c.date ? new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
                    addressParts.push(`${addressBase} no dia ${dateStr} às ${c.time || '__:__'}`);
                } else {
                    addressParts.push(addressBase);
                }
            }
        });

        const joinList = (list: string[]) => {
            if (list.length === 0) return '';
            if (list.length === 1) return list[0];
            const last = list.pop();
            return `${list.join(', ')} ou ${last}`;
        };

        const cvText = cvParts.length > 0 ? `Enviar curriculo com o nome da vaga/codigo para: ${joinList(cvParts)}` : '';
        const addressText = addressParts.length > 0 ? `Compareça no endereço: ${joinList(addressParts)}` : '';
        const linkText = linkParts.length > 0 ? `Acesse: ${joinList(linkParts)}` : '';

        const finalParts = [cvText, addressText, linkText].filter(Boolean);
        const interessadosText = finalParts.length > 0 ? joinList(finalParts) : 'Entre em contato pelos canais oficiais.';

        if (jobDraft.type === 'file') {
            const observationText = jobDraft.showObservation && jobDraft.observation ? `\nObs: ${jobDraft.observation}\n` : '';
            return `*${jobDraft.companyName || 'Sua Empresa'}* ${previewEmojis}
-----------------------------
Função: *${jobDraft.role || ''}*
Cód. Vaga: *${code}*
-----------------------------${observationText}
*Interessados*
 ${interessadosText}`;
        }

        return `*${jobDraft.companyName || 'Sua Empresa'}* ${previewEmojis}
-----------------------------
Função: *${jobDraft.role || ''}*
Cód. Vaga: *${code}*
-----------------------------  
*Vínculo:* ${jobDraft.bond || 'CLT'}
*Empresa:* ${jobDraft.hideCompany ? '(Oculto)' : jobDraft.companyName || ''}
*Cidade/Bairro:* ${jobDraft.city || ''} - ${jobDraft.region || ''}
*Requisitos:* ${jobDraft.requirements || ''}
*Benefícios:* ${jobDraft.benefits || ''}
*Atividades:* ${jobDraft.activities || ''}

*Interessados*
 ${interessadosText}
----------------------------- 

*Mais informações:*
➞ ${company?.name || 'Lepps |Conecta'}
➞ ${company?.whatsapp || '11946610753'}
➞ ${company?.website || 'leppsconecta.com.br'}`;
    };

    const handleSaveJob = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            let finalImageUrl = jobDraft.imageUrl;

            if (attachedFile) {
                const fileExt = attachedFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('job-images').upload(`${user.id}/${fileName}`, attachedFile);
                if (uploadError) throw uploadError;
                const { data: publicUrl } = supabase.storage.from('job-images').getPublicUrl(`${user.id}/${fileName}`);
                finalImageUrl = publicUrl.publicUrl;
            }

            const jobData = {
                user_id: user.id,
                code: jobDraft.jobCode,
                title: jobDraft.role,
                role: jobDraft.role, // Saving to both just in case
                company_name: jobDraft.companyName,
                hide_company: jobDraft.hideCompany,
                city: jobDraft.city,
                region: jobDraft.region,
                job_type: jobDraft.type === 'file' ? 'image' : 'text', // Mapping back to DB enum
                employment_type: jobDraft.bond === 'CLT ( Fixo )' ? 'CLT' : jobDraft.bond, // Mapping back
                requirements: jobDraft.requirements,
                benefits: jobDraft.benefits,
                activities: jobDraft.activities,
                observation: jobDraft.observation,
                show_observation: jobDraft.showObservation,
                footer_enabled: showFooterInImage,
                file_url: finalImageUrl,
                image_url: finalImageUrl, // Saving to both
                status: 'Ativa', // Default status

                // New flat columns for contacts (taking the first of each type found)
                contact_whatsapp: jobDraft.contacts?.find(c => c.type === 'WhatsApp')?.value || null,
                contact_email: jobDraft.contacts?.find(c => c.type === 'Email')?.value || null,
                contact_link: jobDraft.contacts?.find(c => c.type === 'Link')?.value || null,
                contact_address: jobDraft.contacts?.find(c => c.type === 'Endereço')?.value || null,
                contact_address_date: jobDraft.contacts?.find(c => c.type === 'Endereço')?.date || null,
                contact_address_time: jobDraft.contacts?.find(c => c.type === 'Endereço')?.time || null,
            };

            let resultId = jobToEdit?.id;

            if (jobToEdit?.id) {
                const { error } = await supabase.from('jobs').update(jobData).eq('id', jobToEdit.id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('jobs').insert(jobData).select('id').single();
                if (error) throw error;
                resultId = data.id;
            }

            // Handle contacts
            if (resultId) {
                // Delete existing contacts if editing
                if (jobToEdit?.id) {
                    await supabase.from('job_contacts').delete().eq('job_id', resultId);
                }
                // Insert new contacts
                if (jobDraft.contacts && jobDraft.contacts.length > 0) {
                    const contactsToInsert = jobDraft.contacts.map(c => ({
                        job_id: resultId,
                        type: c.type, // keeping original case (WhatsApp, Endereço, etc)
                        value: c.value,
                        date: c.date,
                        time: c.time,
                        no_date_time: c.noDateTime
                    }));
                    await supabase.from('job_contacts').insert(contactsToInsert);
                }
            }

            onSave();
            onClose();

        } catch (error: any) {
            alert(`Erro ao salvar vaga: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };


    if (!isOpen) return null;

    const renderContactSection = () => (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest ml-1">Canais de Contato</h4>
                    <button
                        onClick={() => setIsContactsModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                        <Info size={12} />
                        Configurar
                    </button>
                </div>

                {/* Contact Selection Area - Side by side icons ONLY */}
                <div className="flex items-center gap-3">
                    {[
                        { type: 'WhatsApp', icon: <OfficialWhatsAppIcon size={24} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                        { type: 'Email', icon: <Mail size={24} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                        { type: 'Endereço', icon: <MapPin size={24} />, color: 'bg-rose-50 text-rose-600 border-rose-100' },
                        { type: 'Link', icon: <LinkIcon size={24} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
                    ].map((item) => (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => handleAddContactField(item.type as JobContact['type'])}
                            className={`flex-1 flex items-center justify-center p-5 rounded-[1.5rem] border transition-all hover:scale-105 active:scale-95 shadow-sm ${item.color}`}
                            title={`Adicionar ${item.type}`}
                        >
                            {item.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contact List */}
            <div className="space-y-3">
                {jobDraft.contacts?.map((c, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm relative group animate-scaleUp">
                        <button
                            onClick={() => removeContact(i)}
                            className="absolute -top-1.5 -right-1.5 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors z-10"
                        >
                            <X size={10} />
                        </button>

                        <div className="flex flex-col gap-3">
                            {c.type === 'Endereço' ? (
                                // Custom Layout for Address
                                <div className="space-y-3 pt-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            O interessado deve comparecer no endereço
                                        </span>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={c.value}
                                            onChange={e => updateContactValue(i, e.target.value)}
                                            placeholder="Endereço completo..."
                                            className="w-full bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-full px-5 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500/20 transition-all"
                                            onFocus={scrollToCenter}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">no dia</span>
                                        {!c.noDateTime ? (
                                            <>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        min={new Date().toISOString().split('T')[0]}
                                                        value={c.date || ''}
                                                        onChange={e => updateContactValue(i, e.target.value, 'date')}
                                                        className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">às</span>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        value={c.time || ''}
                                                        onChange={e => updateContactValue(i, e.target.value, 'time')}
                                                        className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:ring-2 ring-blue-500/20 transition-all appearance-none"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">Data e hora ocultas</span>
                                        )}

                                        <div className="ml-auto">
                                            <button
                                                onClick={() => updateContactValue(i, !c.noDateTime, 'noDateTime')}
                                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${c.noDateTime ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Sem Data/Hora
                                                <div className={`w-8 h-4 rounded-full relative transition-colors ${c.noDateTime ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${c.noDateTime ? 'left-[18px]' : 'left-0.5'}`} />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Generic Layout for Others
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg text-slate-500">
                                        {c.type === 'WhatsApp' && <OfficialWhatsAppIcon size={14} />}
                                        {c.type === 'Email' && <Mail size={14} />}
                                        {c.type === 'Link' && <LinkIcon size={14} />}
                                    </div>
                                    <input
                                        type="text"
                                        value={c.value}
                                        onChange={e => updateContactValue(i, e.target.value)}
                                        placeholder={`Informe o ${c.type}...`}
                                        className="flex-1 bg-transparent border-none px-2 py-1 text-base font-medium outline-none"
                                        onFocus={scrollToCenter}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 bg-blue-950 text-white flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-blue-950 shadow-lg shadow-yellow-400/20">
                            {jobCreationStep === 'preview' ? <CheckCircle2 size={24} /> : <Plus size={24} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">
                                {jobCreationStep === 'selection' ? 'Novo Anúncio' :
                                    jobCreationStep === 'preview' ? 'Confirmar Publicação' : 'Detalhes da Vaga'}
                            </h3>
                            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Cód: {jobDraft.jobCode}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {jobCreationStep === 'selection' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full items-center py-4">
                            <button onClick={() => { setJobDraft({ ...jobDraft, type: 'scratch' }); setJobCreationStep('form'); }} className="group p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-yellow-400 transition-all text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-400 group-hover:text-blue-950 transition-colors">
                                    <FileText size={28} />
                                </div>
                                <span className="font-black text-slate-800 dark:text-white block text-lg uppercase tracking-tight">Criar por Texto</span>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Gera o template automático de text.</p>
                            </button>
                            <button onClick={() => { setJobDraft({ ...jobDraft, type: 'file' }); setJobCreationStep('upload'); }} className="group p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-yellow-400 transition-all text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-400 group-hover:text-blue-950 transition-colors">
                                    <ImageIcon size={28} />
                                </div>
                                <span className="font-black text-slate-800 dark:text-white block text-lg uppercase tracking-tight">Já tenho a Vaga</span>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Anexa uma arte/imagem pronta.</p>
                            </button>
                        </div>
                    )}

                    {jobCreationStep === 'form' && (
                        <div className="space-y-8">
                            {/* Form implementation mirrors Vagas.tsx logic but cleaned up for component usage */}
                            {/* ... (This is a simplified placeholde. In real implementation, full fields are here) ... */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Row 1 */}
                                <div className="md:col-span-6 space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Função / Cargo <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"><Briefcase size={18} /></div>
                                        <input type="text" value={jobDraft.role || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, role: e.target.value })} placeholder="Ex: Auxiliar de Limpeza"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                                    </div>
                                </div>
                                <div className="md:col-span-6 space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-semibold">Empresa</label>
                                        <button
                                            onClick={() => setJobDraft({ ...jobDraft, hideCompany: !jobDraft.hideCompany, companyName: jobDraft.hideCompany ? jobDraft.companyName : '' })}
                                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                            {jobDraft.hideCompany ? (
                                                <><Eye size={12} /> Mostrar Nome</>
                                            ) : (
                                                <><EyeOff size={12} /> Ocultar na Vaga</>
                                            )}
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                            <Building2 size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            disabled={jobDraft.hideCompany}
                                            onFocus={scrollToCenter}
                                            value={jobDraft.companyName || ''}
                                            onChange={e => setJobDraft({ ...jobDraft, companyName: e.target.value })}
                                            placeholder={jobDraft.hideCompany ? "Nome oculto na divulgação" : "Nome da empresa"}
                                            className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600
                            ${jobDraft.hideCompany ? 'opacity-60 cursor-not-allowed select-none bg-slate-100 dark:bg-slate-900/50' : 'border-slate-100 dark:border-slate-800'}
                            `}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Vínculo (30%), Cidade (30%), Região (40%) */}
                                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-10 gap-6">
                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Vínculo</label>
                                        <div className="relative group">
                                            <select value={jobDraft.bond} onChange={e => setJobDraft({ ...jobDraft, bond: e.target.value as any })}
                                                className="w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 ring-blue-500 outline-none transition-all"
                                            >
                                                <option value="CLT ( Fixo )">CLT ( Fixo )</option>
                                                <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                                                <option value="Freelance">Freelance</option>
                                                <option value="Temporário">Temporário</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Cidade</label>
                                        <div className="relative group">
                                            <input type="text" value={jobDraft.city || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, city: e.target.value })} placeholder="Sorocaba"
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-4 space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Região / Bairro</label>
                                        <div className="relative group">
                                            <input type="text" value={jobDraft.region || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, region: e.target.value })} placeholder="Ex: Campolim, Centro..."
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Fields Area */}
                                <div className="md:col-span-12 space-y-4 pt-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">REQUISITOS</label>
                                        <textarea value={jobDraft.requirements || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, requirements: e.target.value })} rows={3} placeholder="O que o candidato precisa ter?"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">BENEFÍCIOS</label>
                                        <textarea value={jobDraft.benefits || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, benefits: e.target.value })} rows={3} placeholder="O que a empresa oferece?"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">ATIVIDADES</label>
                                        <textarea value={jobDraft.activities || ''} onFocus={scrollToCenter} onChange={e => setJobDraft({ ...jobDraft, activities: e.target.value })} rows={3} placeholder="O que o candidato irá fazer?"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none" />
                                    </div>
                                </div>
                            </div>
                            {renderContactSection()}
                        </div>
                    )}

                    {jobCreationStep === 'upload' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Nome da Vaga <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"><Briefcase size={18} /></div>
                                        <input
                                            type="text"
                                            value={jobDraft.role || ''}
                                            onChange={e => setJobDraft({ ...jobDraft, role: e.target.value })}
                                            placeholder="Ex: Auxiliar Administrativo"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Cidade</label>
                                        <div className="relative group">
                                            <input type="text" value={jobDraft.city || ''} onChange={e => setJobDraft({ ...jobDraft, city: e.target.value })} placeholder="Sorocaba"
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest ml-1 text-slate-600 dark:text-slate-400 font-semibold">Região / Bairro</label>
                                        <div className="relative group">
                                            <input type="text" value={jobDraft.region || ''} onChange={e => setJobDraft({ ...jobDraft, region: e.target.value })} placeholder="Ex: Campolim, Centro..."
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                                        </div>
                                    </div>
                                </div>


                                <label className="flex flex-col items-center justify-center w-full aspect-video bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] cursor-pointer hover:border-blue-500 transition-all group overflow-hidden">
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    {attachedFile || jobDraft.imageUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={attachedFile ? URL.createObjectURL(attachedFile) : jobDraft.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <p className="text-white font-black uppercase text-xs">Trocar Imagem</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-10">
                                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <Upload size={32} />
                                            </div>
                                            <p className="font-bold text-slate-700 dark:text-slate-300">Carregar arte da vaga</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Formatos suportados: JPG, PNG</p>
                                        </div>
                                    )}
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center"><Smartphone size={18} /></div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Adicionar rodapé de contato na imagem?</span>
                                        </div>
                                        <button onClick={() => setShowFooterInImage(!showFooterInImage)} className={`w-12 h-6 rounded-full transition-all relative ${showFooterInImage ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${showFooterInImage ? 'left-6.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center"><CheckCircle2 size={18} /></div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Deseja adicionar observação?</span>
                                        </div>
                                        <button
                                            onClick={() => setJobDraft({ ...jobDraft, showObservation: !jobDraft.showObservation })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${jobDraft.showObservation ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${jobDraft.showObservation ? 'left-6.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    {jobDraft.showObservation && (
                                        <div className="animate-fadeIn pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 font-semibold ml-1">Observação</label>
                                            <textarea
                                                value={jobDraft.observation || ''}
                                                onChange={e => setJobDraft({ ...jobDraft, observation: e.target.value })}
                                                rows={2}
                                                placeholder="Informe a observação..."
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    )}

                                    {showFooterInImage && (
                                        <div className="animate-fadeIn pt-4 border-t border-slate-100 dark:border-slate-800">
                                            {renderContactSection()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {jobCreationStep === 'preview' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-900 shadow-inner relative">
                                <div className="absolute top-6 right-8 flex items-center gap-3">
                                    <button
                                        onClick={() => { setEmojiInput(previewEmojis); setIsEmojiModalOpen(true); }}
                                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all"
                                    >
                                        Alterar Emojis
                                    </button>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Prévia do Texto</span>
                                </div>
                                {(attachedFile || jobDraft.imageUrl) && (
                                    <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-w-sm mx-auto shadow-xl">
                                        <img src={attachedFile ? URL.createObjectURL(attachedFile) : jobDraft.imageUrl} className="w-full h-auto" alt="Job Visual" />
                                    </div>
                                )}
                                <pre className="whitespace-pre-wrap font-mono text-[11px] font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                                    {generatePreviewText().split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                                part.startsWith('*') && part.endsWith('*') ? (
                                                    <strong key={j}>{part.slice(1, -1)}</strong>
                                                ) : (
                                                    <span key={j}>{part}</span>
                                                )
                                            ))}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between gap-4 flex-shrink-0">
                    {(!hideBackButton || jobCreationStep === 'preview') ? (
                        <button
                            onClick={() => {
                                if (jobCreationStep === 'form' || jobCreationStep === 'upload') setJobCreationStep('selection');
                                else if (jobCreationStep === 'preview') setJobCreationStep(jobDraft.type === 'file' ? 'upload' : 'form');
                                else onClose();
                            }}
                            className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                        >
                            {jobCreationStep === 'selection' ? 'Cancelar' : 'Voltar'}
                        </button>
                    ) : (
                        <div />
                    )}

                    {jobCreationStep !== 'selection' && (
                        <button
                            onClick={() => {
                                if (jobCreationStep === 'preview') handleSaveJob();
                                else {
                                    if (jobCreationStep === 'form') {
                                        if (!jobDraft.role?.trim()) {
                                            const input = document.querySelector('[name="role"], input[type="text"][placeholder*="Auxiliar"]') as HTMLInputElement;
                                            if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                            return;
                                        }
                                        if (jobDraft.type !== 'file') {
                                            if (!jobDraft.hideCompany && !jobDraft.companyName?.trim()) {
                                                const input = document.querySelector('[name="companyName"], input[placeholder*="nome da empresa"]') as HTMLInputElement;
                                                if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                                return;
                                            }
                                            if (!jobDraft.city?.trim()) {
                                                const input = document.querySelector('[name="city"], input[placeholder*="Sorocaba"]') as HTMLInputElement;
                                                if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                                return;
                                            }
                                            if (!jobDraft.region?.trim()) {
                                                const input = document.querySelector('[name="region"], input[placeholder*="Campolim"]') as HTMLInputElement;
                                                if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                                return;
                                            }
                                            if (!jobDraft.requirements?.trim()) {
                                                const textarea = document.querySelector('textarea[placeholder*="requisitos"]') as HTMLTextAreaElement;
                                                if (textarea) { textarea.focus(); textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                                return;
                                            }
                                            if (!jobDraft.benefits?.trim()) {
                                                const textarea = document.querySelector('textarea[placeholder*="oferece"]') as HTMLTextAreaElement;
                                                if (textarea) { textarea.focus(); textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                                return;
                                            }
                                            if (!jobDraft.activities?.trim()) {
                                                const textarea = document.querySelector('textarea[placeholder*="candidato"]') as HTMLTextAreaElement;
                                                if (textarea) { textarea.focus(); textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                                return;
                                            }
                                        }
                                    }

                                    if (jobDraft.type === 'file' && !attachedFile && !jobDraft.imageUrl && jobCreationStep === 'upload') {
                                        const fileLabel = document.querySelector('label[class*="aspect-video"]') as HTMLElement;
                                        if (fileLabel) fileLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        return;
                                    }

                                    // Contact validation
                                    if ((jobCreationStep === 'form' || (jobCreationStep === 'upload' && showFooterInImage))) {
                                        if (!jobDraft.contacts || jobDraft.contacts.length === 0) {
                                            const contactSection = document.querySelector('[class*="Contatos"]') as HTMLElement;
                                            if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            return;
                                        }
                                        if (jobDraft.contacts.some(c => !c.value.trim())) {
                                            const emptyContactInput = Array.from(document.querySelectorAll('input[placeholder*="WhatsApp"], input[placeholder*="E-mail"], input[placeholder*="Link"], input[placeholder*="endereço"]')).find(input => !(input as HTMLInputElement).value.trim()) as HTMLInputElement;
                                            if (emptyContactInput) { emptyContactInput.focus(); emptyContactInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                            return;
                                        }
                                        // Validate Address Date/Time if active
                                        const addressContacts = jobDraft.contacts.filter(c => c.type === 'Endereço');
                                        for (const ac of addressContacts) {
                                            if (!ac.noDateTime) {
                                                if (!ac.date || !ac.time) {
                                                    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                                                    if (dateInput) { dateInput.focus(); dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                                                    return;
                                                }
                                            }
                                        }
                                    }

                                    setJobCreationStep('preview');
                                }
                            }}
                            disabled={isSaving}
                            className={`px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            {jobCreationStep === 'preview'
                                ? (isSaving ? 'Salvando...' : 'Finalizar e Salvar')
                                : 'Próximo Passo'}
                        </button>
                    )}
                </div>
            </div >
            <SavedContactsModal
                isOpen={isContactsModalOpen}
                onClose={() => setIsContactsModalOpen(false)}
                savedContacts={savedContacts}
                onUpdate={fetchSavedContacts}
            />
            {
                isEmojiModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsEmojiModalOpen(false)} />
                        <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-scaleUp">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Personalizar Emojis</h3>
                            <input
                                type="text"
                                value={emojiInput}
                                onChange={(e) => setEmojiInput(e.target.value)}
                                placeholder="Cole os emojis aqui..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xl outline-none focus:ring-2 ring-blue-500 mb-6 text-center"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setIsEmojiModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest">Cancelar</button>
                                <button onClick={() => { setPreviewEmojis(emojiInput); setIsEmojiModalOpen(false); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20">Salvar</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
