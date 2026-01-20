import React from 'react';
import { CompanyProfile } from './types';
import { OfficialWhatsAppIcon } from '../OfficialWhatsAppIcon';

interface FloatingContactMenuProps {
    company: CompanyProfile | null;
    onOpen: () => void;
}

const FloatingContactMenu: React.FC<FloatingContactMenuProps> = ({ company, onOpen }) => {
    if (!company) return null;

    const hasContact = company.whatsapp || company.phone || company.email || company.address || company.website;

    if (!hasContact) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            {/* Main Toggle Button */}
            <button
                onClick={onOpen}
                className="p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center bg-[#25D366] hover:bg-[#20ba5a]"
            >
                <div className="text-white">
                    <OfficialWhatsAppIcon size={28} />
                </div>
            </button>
        </div>
    );
};

export default FloatingContactMenu;
