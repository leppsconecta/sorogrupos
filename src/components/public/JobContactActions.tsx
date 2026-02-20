import React, { useState } from 'react';
import { MessageCircle, Mail, MapPin, Copy, ExternalLink, Phone } from 'lucide-react';
import { AddressActionModal } from './modals/AddressActionModal';

interface JobContactActionsProps {
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
    jobTitle?: string;
}

export const JobContactActions: React.FC<JobContactActionsProps> = ({ whatsapp, email, address, jobTitle }) => {
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isWhatsModalOpen, setIsWhatsModalOpen] = useState(false);

    const handleCopyEmail = () => {
        if (email) {
            navigator.clipboard.writeText(email);
            alert('E-mail copiado!');
        }
    };

    const handleWhatsApp = () => {
        if (!whatsapp) return;
        setIsWhatsModalOpen(true);
    };

    const openWhatsApp = () => {
        if (!whatsapp) return;
        const message = encodeURIComponent(`Olá, vi a vaga de *${jobTitle}* na SoroEmpregos e gostaria de mais informações.`);
        window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
        setIsWhatsModalOpen(false);
    };

    const copyWhatsApp = () => {
        if (whatsapp) {
            navigator.clipboard.writeText(whatsapp);
            alert('Número copiado!');
            setIsWhatsModalOpen(false);
        }
    };

    if (!whatsapp && !email && !address) return null;

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {whatsapp && (
                    <button
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors font-bold text-xs uppercase tracking-wider"
                    >
                        <MessageCircle size={18} /> WhatsApp
                    </button>
                )}

                {email && (
                    <button
                        onClick={handleCopyEmail}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-bold text-xs uppercase tracking-wider"
                    >
                        <Mail size={18} /> Copiar E-mail
                    </button>
                )}

                {address && (
                    <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-xs uppercase tracking-wider"
                    >
                        <MapPin size={18} /> Ver Endereço
                    </button>
                )}
            </div>

            <AddressActionModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                address={address || ''}
            />

            {/* Simple Inline WhatsApp Modal for now, can be extracted if complex */}
            {isWhatsModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-scaleUp">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Contato WhatsApp</h3>
                            <p className="text-sm text-slate-500 mt-2">{whatsapp}</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={openWhatsApp}
                                className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#128C7E] shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18} /> Abrir WhatsApp
                            </button>
                            <button
                                onClick={copyWhatsApp}
                                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Copy size={18} /> Copiar Número
                            </button>
                            <button
                                onClick={() => setIsWhatsModalOpen(false)}
                                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
