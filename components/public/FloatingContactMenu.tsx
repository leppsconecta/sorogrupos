import React, { useState } from 'react';
import { MessageCircle, MapPin, Mail, Phone, X, Globe } from 'lucide-react';
import { CompanyProfile } from './types';
import { OfficialWhatsAppIcon } from '../OfficialWhatsAppIcon';

interface FloatingContactMenuProps {
    company: CompanyProfile | null;
}

const FloatingContactMenu: React.FC<FloatingContactMenuProps> = ({ company }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!company) return null;

    const hasContact = company.whatsapp || company.phone || company.email || company.address || company.website;

    if (!hasContact) return null;

    const handleWhatsAppClick = () => {
        const phone = company.whatsapp?.replace(/\D/g, '') || company.phone?.replace(/\D/g, '');
        if (phone) {
            window.open(`https://wa.me/${phone}`, '_blank');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Expanded Menu */}
            <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}`}>

                {/* Website */}
                {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="bg-white text-slate-700 p-3 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-transform flex items-center gap-2 group">
                        <span className="text-sm font-bold pr-2 pl-1 group-hover:block hidden whitespace-nowrap">Site</span>
                        <Globe size={24} className="text-indigo-600" />
                    </a>
                )}

                {/* Email */}
                {company.email && (
                    <a href={`mailto:${company.email}`} className="bg-white text-slate-700 p-3 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-transform flex items-center gap-2 group">
                        <span className="text-sm font-bold pr-2 pl-1 group-hover:block hidden whitespace-nowrap">Email</span>
                        <Mail size={24} className="text-red-500" />
                    </a>
                )}

                {/* Address */}
                {company.address && (
                    <a href={`https://maps.google.com/?q=${company.address}`} target="_blank" rel="noreferrer" className="bg-white text-slate-700 p-3 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-transform flex items-center gap-2 group">
                        <span className="text-sm font-bold pr-2 pl-1 group-hover:block hidden whitespace-nowrap">Endereço</span>
                        <MapPin size={24} className="text-orange-500" />
                    </a>
                )}

                {/* WhatsApp (Secondary if listed) */}
                {(company.whatsapp || company.phone) && (
                    <button onClick={handleWhatsAppClick} className="bg-white text-slate-700 p-3 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-transform flex items-center gap-2 group">
                        <span className="text-sm font-bold pr-2 pl-1 group-hover:block hidden whitespace-nowrap">WhatsApp</span>
                        <OfficialWhatsAppIcon size={24} />
                    </button>
                )}
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-[#25D366] hover:bg-[#20ba5a]'}`}
            >
                {isOpen ? (
                    <X size={28} className="text-white" />
                ) : (
                    <MessageCircle size={28} className="text-white fill-white" />
                )}
            </button>
        </div>
    );
};

export default FloatingContactMenu;
