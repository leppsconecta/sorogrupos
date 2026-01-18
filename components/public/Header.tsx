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
                </div>
            </div>

            {/* Cover Image - Adjusted Height */}
            <div className="sticky top-0 z-0">
                <div
                    className="h-40 md:h-56 w-full relative bg-cover bg-center transition-all duration-700"
                    style={{
                        backgroundColor: headerColor,
                        backgroundImage: company.cover_url ? `url(${company.cover_url})` : undefined
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                </div>
            </div>

            {/* Content Container - Overlapping Glass Card */}
            <div className="relative z-10 px-4 md:px-6 -mt-16 md:-mt-20 pb-8">
                <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-[32px] md:rounded-[40px] shadow-xl border border-white/50 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end">

                    {/* Logo - Floating & Premium Border */}
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-[24px] md:rounded-[28px] bg-white border-4 border-white shadow-2xl flex items-center justify-center text-center overflow-hidden flex-shrink-0 relative -mt-14 md:-mt-16 transform hover:scale-105 transition-transform duration-300">
                        {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-1" />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 text-gray-300">
                                <Building2 size={32} className="mb-2 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Sem Logo</span>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0 md:pb-2 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 justify-center md:justify-start">
                            <h1 className="text-[#1a234a] text-2xl md:text-3xl font-black tracking-tight leading-tight">
                                {company.name}
                            </h1>
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mx-auto md:mx-0 border border-blue-100">
                                <BadgeCheck size={12} strokeWidth={3} /> Verified
                            </div>
                        </div>

                        <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed mb-4 max-w-2xl mx-auto md:mx-0">
                            {company.description || 'Empresa parceira SoroEmpregos. Entre em contato para saber mais sobre nossas vagas e oportunidades.'}
                        </p>

                        {/* Address Display (Static) */}
                        {formatAddress() && (
                            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-semibold text-gray-500 mb-4 md:mb-0">
                                <MapPin size={14} className="text-red-500 shrink-0" />
                                <span>{formatAddress()}</span>
                            </div>
                        )}
                    </div>

                    {/* Contact Actions - Buttons */}
                    <div className="flex flex-col gap-3 w-full md:w-auto items-center md:items-end min-w-[200px]">

                        {company.phone && (
                            <a
                                href={`https://wa.me/${company.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full h-11 px-4 rounded-xl bg-green-50 text-[#25D366] font-bold hover:bg-green-100 border border-green-200 hover:-translate-y-0.5 shadow-sm hover:shadow-green-100 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                            >
                                <Phone size={16} strokeWidth={2.5} /> WhatsApp
                            </a>
                        )}

                        {formatAddress() && (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formatAddress()}, ${company.zip_code || ''}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full h-11 px-4 rounded-xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 border border-gray-200 hover:-translate-y-0.5 shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                            >
                                <MapPin size={16} strokeWidth={2.5} /> Ver no Mapa
                            </a>
                        )}

                        {company.website && (
                            <a
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full h-11 px-4 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 border border-blue-200 hover:-translate-y-0.5 shadow-sm hover:shadow-blue-100 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                            >
                                <Globe size={16} strokeWidth={2.5} /> Acessar Site
                            </a>
                        )}

                        {/* Social Mini Icons Row */}
                        {(company.instagram || company.facebook || company.linkedin) && (
                            <div className="flex gap-2 mt-1 py-1 px-3 bg-gray-50/50 rounded-full border border-dashed border-gray-200">
                                {company.instagram && (
                                    <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-colors"><Instagram size={16} /></a>
                                )}
                                {company.facebook && (
                                    <a href={company.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors"><Facebook size={16} /></a>
                                )}
                                {company.linkedin && (
                                    <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors"><Linkedin size={16} /></a>
                                )}
                            </div>
                        )}

                        <a href="/" target="_blank" className="mt-2 text-[10px] font-bold text-gray-300 hover:text-blue-500 flex items-center gap-1 transition-colors">
                            Criar perfil profissional <Globe size={10} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
