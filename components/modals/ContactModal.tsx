import React from 'react';
import { Phone, X, Copy } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    phone: string;
    candidateName: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
    isOpen,
    onClose,
    phone,
    candidateName
}) => {
    if (!isOpen) return null;

    const cleanPhone = phone.replace(/\D/g, '');
    // Remove +55 if present and format as (XX) XXXXX-XXXX
    const cleanedForWhatsApp = cleanPhone.startsWith('55') && cleanPhone.length === 13
        ? cleanPhone
        : `55${cleanPhone}`;

    const formattedPhone = cleanPhone.length === 13
        ? cleanPhone.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
        : cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');

    const handleCopy = () => {
        navigator.clipboard.writeText(cleanPhone);
        alert('Telefone copiado!');
        onClose();
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/${cleanedForWhatsApp}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Phone className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100">Contato</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{candidateName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Phone Display */}
                <div className="p-6">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
                        <p className="text-center text-2xl font-mono font-bold text-slate-800 dark:text-gray-100">
                            {formattedPhone}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleCopy}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                        >
                            <Copy size={18} />
                            Copiar Contato
                        </button>

                        <button
                            onClick={handleWhatsApp}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                            <Phone size={18} />
                            Abrir no WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
