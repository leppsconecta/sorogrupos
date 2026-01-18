import React, { ReactNode, useState, useEffect } from 'react';
import { CompanyProfile, Job } from './types';
import { Building2, BadgeCheck, MapPin, Globe, Phone, Instagram, Facebook, Linkedin, ChevronLeft, ChevronRight, Share2, X, ChevronDown, Camera } from 'lucide-react';
import ContactOptionsModal from './modals/ContactOptionsModal';
import AddressModal from './modals/AddressModal';

import { OfficialWhatsAppIcon } from '../OfficialWhatsAppIcon';

interface PublicProfileLayoutProps {
    company: CompanyProfile | null;
    loading: boolean;
    error?: string;
    children: ReactNode;
    isOwner?: boolean;
    onLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploadingLogo?: boolean;
}

const PublicProfileLayout: React.FC<PublicProfileLayoutProps> = ({ company, loading, error, children, isOwner, onLogoUpload, isUploadingLogo }) => {
    const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMobileContactsOpen, setIsMobileContactsOpen] = React.useState(false);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-[#FAFAFA]"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (error || !company) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
                <Building2 size={64} className="text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
            </div>
        );
    }

    const fullAddress = `${company.address || ''}${company.number ? `, ${company.number}` : ''}${company.neighborhood ? ` - ${company.neighborhood}` : ''}${company.city ? ` - ${company.city}` : ''}${company.state ? `/${company.state}` : ''}`;
    const cityState = company.city && company.state ? `${company.city} - ${company.state}` : null;

    // Auto-collapse sidebar after 1 minute (Desktop Only)
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (!isSidebarCollapsed) {
            timeout = setTimeout(() => {
                // Only collapse on desktop
                if (window.innerWidth >= 1024) {
                    setIsSidebarCollapsed(true);
                }
            }, 60000); // 60 seconds
        }
        return () => clearTimeout(timeout);
    }, [isSidebarCollapsed]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            {/* Top Cover Removed */}

            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-0 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-8">

                    {/* START SIDEBAR (Right/Top on Mobile, Left on Desktop) */}
                    {/* On Desktop: Col Span 4, Sticky. On Mobile: Col Span 12, Stacked */}
                    <div className={`lg:col-span-4 lg:order-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-[80px] lg:col-span-1' : ''}`}>


                        <div className={`bg-white rounded-[24px] shadow-lg border border-white/50 p-4 lg:p-0 lg:sticky lg:top-24 text-center lg:text-left transition-all hover:shadow-xl overflow-hidden ${isSidebarCollapsed ? 'lg:p-3 lg:flex lg:flex-col lg:items-center lg:gap-3 lg:w-[70px]' : ''}`}>

                            {/* Desktop Cover Area (Hidden on Mobile) */}
                            {!isSidebarCollapsed && (
                                <div
                                    className="hidden lg:block w-full h-32 bg-slate-800 relative"
                                    style={{ backgroundColor: company.profile_header_color || '#1e293b' }}
                                >
                                    {/* Optional: Add a subtle overlay or pattern here if desired */}
                                </div>
                            )}

                            {/* Close Button (Expanded Desktop Only) */}
                            {!isSidebarCollapsed && (
                                <button
                                    onClick={() => setIsSidebarCollapsed(true)}
                                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors hidden lg:block"
                                    title="Fechar"
                                >
                                    <X size={18} strokeWidth={2.5} />
                                </button>
                            )}

                            {/* Logo */}
                            <label
                                className={`relative z-20 mx-auto lg:mx-0 bg-white rounded-[20px] border-4 border-white shadow-md overflow-hidden mb-3 transition-all block
                                ${isSidebarCollapsed ? 'w-10 h-10 lg:mb-2 border-2 -mt-0' : 'w-52 h-52 lg:w-32 lg:h-32 lg:-mt-16 lg:ml-6'}
                                ${isOwner ? 'cursor-pointer group' : ''}`}
                            >
                                {isOwner && !isUploadingLogo && (
                                    <>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={onLogoUpload}
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                            <div className="text-white flex flex-col items-center gap-1">
                                                <Camera size={20} />
                                                <span className="text-[10px] font-bold uppercase">Alterar</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isUploadingLogo && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-40">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                {company.logo_url ? (
                                    <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-1.5" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gray-50 text-gray-300">
                                        <Building2 size={isSidebarCollapsed ? 18 : 28} />
                                    </div>
                                )}
                            </label>

                            {/* Desktop Collapsed Content (Icons Only) - HIDDEN ON MOBILE */}
                            {isSidebarCollapsed && (
                                <div className="hidden lg:flex flex-col gap-2 items-center animate-fadeIn w-full">
                                    {(company.phone || company.whatsapp) && (
                                        <button
                                            onClick={() => setIsContactModalOpen(true)}
                                            className="w-9 h-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-green-500/20 hover:scale-110 transition-transform"
                                            title="WhatsApp"
                                        >
                                            <OfficialWhatsAppIcon size={18} />
                                        </button>
                                    )}

                                    {company.address && (
                                        <button
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-red-500 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                            title="Endereço"
                                        >
                                            <MapPin size={18} />
                                        </button>
                                    )}

                                    {/* Discrete Expand Button (Collapsed Only) */}
                                    <button
                                        onClick={() => setIsSidebarCollapsed(false)}
                                        className="w-9 h-9 mt-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-all hover:scale-110"
                                        title="Expandir"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                </div>
                            )}

                            {/* Main Content (Mobile Always Visible / Desktop Expanded) */}
                            {/* Uses CSS to handle visibility instead of JS to prevent hydration mismatch */}
                            <div className={`animate-fadeIn pt-1 ${isSidebarCollapsed ? 'block lg:hidden' : 'block'}`}>

                                {/* Header Info (Always Visible on Mobile) */}
                                <div className={`flex flex-col gap-0.5 mb-3 ${!isSidebarCollapsed ? 'lg:px-6 lg:mt-2' : ''}`}>
                                    <h1 className="text-lg font-black text-[#1a234a] leading-tight">
                                        {company.name}
                                    </h1>
                                    <div className="flex items-center gap-1 justify-center lg:justify-start bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider w-fit border border-blue-100 mx-auto lg:mx-0">
                                        <BadgeCheck size={10} strokeWidth={3} /> Empresa Verificada
                                    </div>
                                </div>

                                <p className={`text-gray-500 text-[11px] font-medium leading-relaxed mb-4 line-clamp-3 ${!isSidebarCollapsed ? 'lg:px-6' : ''}`}>
                                    {company.description || 'Empresa parceira SoroEmpregos.'}
                                </p>

                                {/* Mobile Toggle Button (Visible only on Mobile) */}
                                <button
                                    onClick={() => setIsMobileContactsOpen(!isMobileContactsOpen)}
                                    className="lg:hidden w-full flex items-center justify-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 py-2 rounded-xl mb-4 hover:bg-blue-100 transition-colors"
                                >
                                    {isMobileContactsOpen ? 'Ocultar Contatos' : 'Ver Informações de Contato'}
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileContactsOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Contacts Section (Hidden on Mobile unless expanded, Visible on Desktop) */}
                                <div className={`${isMobileContactsOpen ? 'block' : 'hidden'} lg:block transition-all`}>

                                    {/* Contact Buttons */}
                                    <div className={`flex flex-col gap-2 mb-3 ${!isSidebarCollapsed ? 'lg:px-6' : ''}`}>
                                        {(company.phone || company.whatsapp) && (
                                            <button
                                                onClick={() => setIsContactModalOpen(true)}
                                                className="w-full h-10 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] shadow-md shadow-green-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                            >
                                                <OfficialWhatsAppIcon size={18} /> WhatsApp
                                            </button>
                                        )}

                                        {company.address && (
                                            <button
                                                onClick={() => setIsAddressModalOpen(true)}
                                                className="w-full h-10 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                            >
                                                <MapPin size={15} strokeWidth={2.5} className="text-red-500" /> Endereço
                                            </button>
                                        )}

                                        {company.website && (
                                            <a
                                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full h-10 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                            >
                                                <Globe size={15} strokeWidth={2.5} /> Website
                                            </a>
                                        )}

                                        <button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: company.name,
                                                        text: `Confira as vagas da ${company.name} no SoroEmpregos!`,
                                                        url: window.location.href,
                                                    });
                                                } else {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    alert('Link copiado para a área de transferência!');
                                                }
                                            }}
                                            className="w-full h-10 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                        >
                                            <Share2 size={15} strokeWidth={2.5} /> Compartilhar
                                        </button>
                                    </div>

                                    {/* City - State Display */}
                                    {cityState && (
                                        <div className={`text-center lg:text-left mb-4 ${!isSidebarCollapsed ? 'lg:px-6' : ''}`}>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                                <MapPin size={9} /> {cityState}
                                            </span>
                                        </div>
                                    )}

                                    {/* Socials Row */}
                                    <div className={`space-y-2 pt-4 border-t border-gray-100 text-[10px] font-semibold text-gray-500 ${!isSidebarCollapsed ? 'lg:px-6 lg:pb-6' : ''}`}>
                                        <div className="flex gap-1.5 justify-center lg:justify-start pt-1">
                                            {company.instagram && (
                                                <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-[#E1306C] flex items-center justify-center transition-colors">
                                                    <Instagram size={15} />
                                                </a>
                                            )}
                                            {company.facebook && (
                                                <a href={company.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-[#1877F2] flex items-center justify-center transition-colors">
                                                    <Facebook size={15} />
                                                </a>
                                            )}
                                            {company.linkedin && (
                                                <a href={company.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-[#0A66C2] flex items-center justify-center transition-colors">
                                                    <Linkedin size={15} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* END SIDEBAR */}

                    {/* START MAIN CONTENT (Left content now moved to right visually by flex order, but structurally remains consistent) */}
                    <div className={`${isSidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'} lg:order-2 space-y-8 animate-slideUpFade delay-100 transition-all duration-300`}>
                        {children}
                    </div>
                    {/* END MAIN CONTENT */}

                </div>
            </div>

            {/* Modals */}
            <ContactOptionsModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                contactNumber={company.whatsapp || company.phone || ''}
                type={company.whatsapp ? 'whatsapp' : 'phone'}
            />

            {company.address && (
                <AddressModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    address={fullAddress}
                />
            )}
        </div>
    );
};

export default PublicProfileLayout;
