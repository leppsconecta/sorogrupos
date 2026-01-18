import React from 'react';
import { X, MapPin, Copy, Check } from 'lucide-react';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: string;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, address }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <MapPin size={18} className="text-red-500" /> Endereço Completo
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-slate-700 text-sm font-medium leading-relaxed text-center">
                            {address}
                        </p>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                        {copied ? 'Endereço Copiado!' : 'Copiar Endereço'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
