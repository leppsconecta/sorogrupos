import React, { useState, useEffect } from 'react';
import { Link, Check, Building2, Globe, Phone, Instagram, Facebook, Linkedin, MapPin, BadgeCheck } from 'lucide-react';

interface HeaderProps {
    company: {
        name: string;
        username: string;
        description?: string;
        logo_url?: string;
        cover_url?: string;
        profile_header_color?: string;
        website?: string;
        phone?: string;
        instagram?: string;
        facebook?: string;
        linkedin?: string;
        zip_code?: string;
        address?: string;
        number?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
    };
}

const Header: React.FC<HeaderProps> = ({ company }) => {
    const [copied, setCopied] = useState(false);
    const [headerColor, setHeaderColor] = useState(company.profile_header_color || '#1a234a');

    useEffect(() => {
        if (company.profile_header_color) {
            setHeaderColor(company.profile_header_color);
        }
    }, [company.profile_header_color]);

    const handleCopy = () => {
        const link = `soroempregos.com/${company.username}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatAddress = () => {
        const parts = [];
        if (company.address) parts.push(company.address);
        if (company.number) parts.push(company.number);
        if (company.neighborhood) parts.push(company.neighborhood);
        if (company.city && company.state) parts.push(`${company.city}/${company.state}`);
        return parts.join(', ');
    };

    return (
        <div className="relative bg-[#FAFAFA]">
            {/* Top Bar - Glassmorphism */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm px-4 md:px-8 py-3 flex justify-between items-center transition-all">
                <span className="hidden md:inline text-xs font-semibold text-gray-400 uppercase tracking-widest">Perfil Profissional</span>

                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 transition-all group hover:border-blue-200 hover:shadow-sm w-full md:w-auto">
                        <span className="text-gray-400 text-[10px] md:text-xs whitespace-nowrap select-none font-medium">soroempregos.com/</span>
                        <span className="text-gray-700 text-[10px] md:text-xs font-bold truncate ml-0.5">{company.username}</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`h-8 px-4 rounded-full flex items-center gap-1.5 transition-all text-[10px] uppercase font-bold tracking-wider shrink-0 shadow-sm ${copied ? 'bg-green-500 text-white shadow-green-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        {copied ? <Check size={12} strokeWidth={3} /> : <Link size={12} strokeWidth={2.5} />}
                        {copied ? 'Copiado' : 'Link'}
                    </button>

                    {/* Profile Image */}
                    {company.logo_url && (
                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-white shadow-sm bg-white"
                        />
                    )}
                </div>
            </div>

            {/* Cover Image Removed */}

            {/* Content Container Removed - Info is now in Sidebar */}
        </div>
    );
};

export default Header;
