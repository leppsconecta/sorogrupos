import React, { useState } from 'react';
import { X, Mail, MapPin, Link as LinkIcon, Settings } from 'lucide-react';
import { SavedJobContact } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const OfficialWhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

interface SavedContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    savedContacts: SavedJobContact[];
    onUpdate: () => void;
}

export const SavedContactsModal = ({ isOpen, onClose, savedContacts, onUpdate }: SavedContactsModalProps) => {
    const { user } = useAuth();
    // Initialize form state
    const [formData, setFormData] = useState({
        WhatsApp: '',
        Email: '',
        'Endereço': '',
        Link: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Load initial data when modal opens or contacts change
    React.useEffect(() => {
        if (isOpen) {
            const newFormData = {
                WhatsApp: '',
                Email: '',
                'Endereço': '',
                Link: ''
            };

            savedContacts.forEach(c => {
                if (c.type in newFormData) {
                    newFormData[c.type as keyof typeof newFormData] = c.value;
                }
            });

            setFormData(newFormData);
        }
    }, [isOpen, savedContacts]);

    if (!isOpen) return null;

    const handleChange = (type: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [type]: value }));
    };

    const handleSave = async () => {
        if (!user) return; // Guard clause

        setIsLoading(true);

        // Types allowed
        const types: (keyof typeof formData)[] = ['WhatsApp', 'Email', 'Endereço', 'Link'];

        // Supabase queries are thenable
        const updates: any[] = [];

        for (const type of types) {
            const value = formData[type];
            const existing = savedContacts.find(c => c.type === type);

            if (!value && existing) {
                updates.push(supabase.from('saved_job_contacts').delete().eq('id', existing.id));
            } else if (value && existing) {
                if (value !== existing.value) {
                    updates.push(supabase.from('saved_job_contacts').update({ value }).eq('id', existing.id));
                }
            } else if (value && !existing) {
                updates.push(supabase.from('saved_job_contacts').insert({
                    user_id: user.id, // Explicitly linking to user
                    type,
                    value,
                    label: getTypeLabel(type as string)
                }));
            }
        }


        await Promise.all(updates);
        setIsLoading(false);
        onUpdate();
        onClose();
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'WhatsApp': return 'WhatsApp';
            case 'Email': return 'E-mail';
            case 'Endereço': return 'Endereço';
            case 'Link': return 'Link';
            default: return type;
        }
    };

    const getIcon = (type: string, size: number = 20) => {
        switch (type) {
            case 'WhatsApp': return <OfficialWhatsAppIcon size={size} />;
            case 'Email': return <Mail size={size} />;
            case 'Endereço': return <MapPin size={size} />;
            case 'Link': return <LinkIcon size={size} />;
            default: return null;
        }
    };

    // Render a field
    const renderField = (type: keyof typeof formData) => (
        <div key={type} className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <div className="text-blue-500">
                    {getIcon(type as string, 16)}
                </div>
                <label className="text-xs font-bold uppercase tracking-wide">
                    {getTypeLabel(type as string)}
                </label>
            </div>
            <input
                type="text"
                value={formData[type]}
                onChange={e => handleChange(type, e.target.value)}
                placeholder={`Informe o ${getTypeLabel(type as string)}...`}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Settings size={22} className="text-blue-600" />
                            Configurar Contatos
                        </h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {renderField('WhatsApp')}
                        {renderField('Email')}
                        {renderField('Endereço')}
                        {renderField('Link')}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl py-3 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-[2] bg-blue-600 text-white rounded-xl py-3 font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Salvar Configurações'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
