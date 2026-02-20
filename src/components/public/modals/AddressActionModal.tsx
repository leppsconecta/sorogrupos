import React from 'react';
import { MapPin, Copy, X, ExternalLink } from 'lucide-react';

interface AddressActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: string;
}

export const AddressActionModal: React.FC<AddressActionModalProps> = ({ isOpen, onClose, address }) => {
    if (!isOpen) return null;

    const encodedAddress = encodeURIComponent(address);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        alert('Endereço copiado!');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-scaleUp">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MapPin className="text-red-500" /> Como chegar?
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    {address}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors gap-2 font-bold text-xs uppercase tracking-wider"
                    >
                        <MapPin size={24} /> Google Maps
                    </a>
                    <a
                        href={`https://waze.com/ul?q=${encodedAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors gap-2 font-bold text-xs uppercase tracking-wider"
                    >
                        <ExternalLink size={24} /> Waze
                    </a>
                    <a
                        href={`https://m.uber.com/ul/?action=setPickup&client_id=YOUR_CLIENT_ID&pickup=my_location&dropoff[formatted_address]=${encodedAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors gap-2 font-bold text-xs uppercase tracking-wider col-span-2 sm:col-span-1"
                    >
                        <ExternalLink size={24} /> Uber
                    </a>
                    <button
                        onClick={handleCopy}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors gap-2 font-bold text-xs uppercase tracking-wider col-span-2 sm:col-span-1"
                    >
                        <Copy size={24} /> Copiar
                    </button>
                </div>
            </div>
        </div>
    );
};
