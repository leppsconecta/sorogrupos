import React, { ReactNode } from 'react';
import { CompanyProfile, Job } from './types';
import { Building2, BadgeCheck, MapPin, Globe, Phone, Instagram, Facebook, Linkedin, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import ContactOptionsModal from './modals/ContactOptionsModal';
import AddressModal from './modals/AddressModal';

import { OfficialWhatsAppIcon } from '../OfficialWhatsAppIcon';

interface PublicProfileLayoutProps {
    company: CompanyProfile | null;
    loading: boolean;
    error?: string;
    children: ReactNode;
}

const PublicProfileLayout: React.FC<PublicProfileLayoutProps> = ({ company, loading, error, children }) => {
    const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

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

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            {/* Top Cover Removed */}

            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-0 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* START SIDEBAR (Right/Top on Mobile) */}
                    {/* On Desktop: Col Span 4, Sticky. On Mobile: Col Span 12, Stacked */}
                    <div className={`lg:col-span-4 lg:order-2 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-[80px] lg:col-span-1' : ''}`}>
                        {/* Collapse Toggle (Desktop Only) */}
                        <div className="hidden lg:flex justify-end mb-2">
                            <button
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition-colors"
                                title={isSidebarCollapsed ? "Expandir Informações" : "Ocultar Informações"}
                            >
                                {isSidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            </button>
                        </div>

                        <div className={`bg-white rounded-[32px] shadow-lg border border-white/50 p-5 md:p-6 sticky top-4 text-center lg:text-left transition-all hover:shadow-xl ${isSidebarCollapsed ? 'lg:p-4 lg:flex lg:flex-col lg:items-center lg:gap-4' : ''}`}>

                            {/* Logo */}
                            <div className={`relative z-20 mx-auto lg:mx-0 bg-white rounded-[24px] border-4 border-white shadow-md overflow-hidden mb-4 transition-all ${isSidebarCollapsed ? 'w-12 h-12 lg:mb-2 border-2 -mt-0' : 'w-24 h-24 -mt-12'}`}>
                                {company.logo_url ? (
                                    <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gray-50 text-gray-300">
                                        <Building2 size={isSidebarCollapsed ? 20 : 32} />
                                    </div>
                                )}
                            </div>

                            {/* Collapsed Content (Icons Only) */}
                            {isSidebarCollapsed && (
                                <div className="flex flex-col gap-3 items-center animate-fadeIn w-full">
                                    {(company.phone || company.whatsapp) && (
                                        <button
                                            onClick={() => setIsContactModalOpen(true)}
                                            className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/20 hover:scale-110 transition-transform"
                                            title="WhatsApp"
                                        >
                                            <OfficialWhatsAppIcon size={20} />
                                        </button>
                                    )}

                                    {company.address && (
                                        <button
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-red-500 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                            title="Endereço"
                                        >
                                            <MapPin size={20} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Expanded Content */}
                            {!isSidebarCollapsed && (
                                <div className="animate-fadeIn">
                                    <div className="flex flex-col gap-1 mb-4">
                                        <h1 className="text-xl font-black text-[#1a234a] leading-tight">
                                            {company.name}
                                        </h1>
                                        <div className="flex items-center gap-1 justify-center lg:justify-start bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit border border-blue-100 mx-auto lg:mx-0">
                                            <BadgeCheck size={12} strokeWidth={3} /> Empresa Verificada
                                        </div>
                                    </div>

                                    <p className="text-gray-500 text-xs font-medium leading-relaxed mb-5">
                                        {company.description || 'Empresa parceira SoroEmpregos.'}
                                    </p>

                                    {/* Contact Buttons */}
                                    <div className="flex flex-col gap-2.5 mb-3">
                                        {(company.phone || company.whatsapp) && (
                                            <button
                                                onClick={() => setIsContactModalOpen(true)}
                                                className="w-full h-11 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a] shadow-md shadow-green-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                            >
                                                <OfficialWhatsAppIcon size={20} /> WhatsApp
                                            </button>
                                        )}

                                        {company.address && (
                                            <button
                                                onClick={() => setIsAddressModalOpen(true)}
                                                className="w-full h-11 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                            >
                                                <MapPin size={16} strokeWidth={2.5} className="text-red-500" /> Endereço
                                            </button>
                                        )}

                                        {company.website && (
                                            <a
                                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full h-11 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                            >
                                                <Globe size={16} strokeWidth={2.5} /> Website
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
                                            className="w-full h-11 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                        >
                                            <Share2 size={16} strokeWidth={2.5} /> Compartilhar
                                        </button>
                                    </div>

                                    {/* City - State Display */}
                                    {cityState && (
                                        <div className="text-center lg:text-left mb-6">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                                                <MapPin size={10} /> {cityState}
                                            </span>
                                        </div>
                                    )}

                                    {/* Socials Row */}
                                    <div className="space-y-3 pt-6 border-t border-gray-100 text-xs font-semibold text-gray-500">
                                        <div className="flex gap-2 justify-center lg:justify-start pt-2">
                                            {company.instagram && (
                                                <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-[#E1306C] flex items-center justify-center transition-colors">
                                                    <Instagram size={18} />
                                                </a>
                                            )}
                                            {company.facebook && (
                                                <a href={company.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-[#1877F2] flex items-center justify-center transition-colors">
                                                    <Facebook size={18} />
                                                </a>
                                            )}
                                            {company.linkedin && (
                                                <a href={company.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-[#0A66C2] flex items-center justify-center transition-colors">
                                                    <Linkedin size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* END SIDEBAR */}

                    {/* START MAIN CONTENT (Left) */}
                    <div className={`${isSidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'} lg:order-1 space-y-8 animate-slideUpFade delay-100 transition-all duration-300`}>
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
