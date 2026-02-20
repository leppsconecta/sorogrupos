import React from 'react';
import { X, MessageCircle, Copy, Check } from 'lucide-react';

import { OfficialWhatsAppIcon } from '../../ui/OfficialWhatsAppIcon';

interface ContactOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactNumber: string;
    type: 'whatsapp' | 'phone';
}

const ContactOptionsModal: React.FC<ContactOptionsModalProps> = ({ isOpen, onClose, contactNumber, type }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const cleanNumber = contactNumber.replace(/\D/g, '');
    const isWhatsApp = type === 'whatsapp';

    // Format number for display (simple formatting)
    const formattedNumber = contactNumber;

    const handleCopy = () => {
        navigator.clipboard.writeText(cleanNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpen = () => {
        const url = isWhatsApp
            ? `https://wa.me/${cleanNumber}`
            : `tel:${cleanNumber}`;
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">
                        {isWhatsApp ? 'Contato via WhatsApp' : 'Contato Telefônico'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 text-center mb-4">
                        Como você deseja entrar em contato com esta empresa?
                    </p>

                    <button
                        onClick={handleOpen}
                        className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1 transition-all ${isWhatsApp ? 'bg-[#25D366] hover:bg-[#20bd5a] shadow-green-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                            }`}
                    >
                        {isWhatsApp ? <OfficialWhatsAppIcon size={20} /> : <MessageCircle size={20} />}
                        {isWhatsApp ? 'Abrir WhatsApp' : 'Ligar Agora'}
                    </button>

                    <button
                        onClick={handleCopy}
                        className="w-full py-3.5 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                        {copied ? 'Número Copiado!' : 'Copiar Número'}
                    </button>

                    <div className="text-center">
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                            {formattedNumber}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactOptionsModal;
