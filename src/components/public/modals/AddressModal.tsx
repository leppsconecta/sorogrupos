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

    const encodedAddress = encodeURIComponent(address);

    const openGoogleMaps = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    const openWaze = () => {
        window.open(`https://waze.com/ul?q=${encodedAddress}&navigate=yes`, '_blank');
    };

    const openUber = () => {
        // Uber Universal Link - Note: dropoff[formatted_address] attempts to set destination
        window.open(`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodedAddress}`, '_blank');
    };

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
                        <MapPin size={18} className="text-red-500" /> Como chegar?
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                        <p className="text-slate-700 text-sm font-medium leading-relaxed">
                            {address}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {/* Google Maps */}
                        <button
                            onClick={openGoogleMaps}
                            className="flex flex-col items-center gap-2 group"
                            title="Google Maps"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all overflow-hidden p-2">
                                <img src="/icon-maps.png" alt="Google Maps" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Maps</span>
                        </button>

                        {/* Waze */}
                        <button
                            onClick={openWaze}
                            className="flex flex-col items-center gap-2 group"
                            title="Waze"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all overflow-hidden p-2">
                                <img src="/icon-waze.png" alt="Waze" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Waze</span>
                        </button>

                        {/* Uber */}
                        <button
                            onClick={openUber}
                            className="flex flex-col items-center gap-2 group"
                            title="Uber"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all overflow-hidden p-2">
                                <img src="/icon-uber.png" alt="Uber" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Uber</span>
                        </button>

                        {/* Copy */}
                        <button
                            onClick={handleCopy}
                            className="flex flex-col items-center gap-2 group"
                            title="Copiar"
                        >
                            <div className={`w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all ${copied ? 'bg-green-50 border-green-200 text-green-500' : 'bg-white border-slate-100 text-slate-600'}`}>
                                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">Copiar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
