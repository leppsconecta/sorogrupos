import React, { useState } from 'react';
import { CompanyProfile } from '../../types';
import { Building2, BadgeCheck, MapPin, Globe, Phone, Instagram, Facebook, Linkedin, ChevronLeft, ChevronRight, Share2, X, ChevronDown, Camera, Pencil, Palette } from 'lucide-react';
import ContactOptionsModal from './modals/ContactOptionsModal';
import AddressModal from './modals/AddressModal';
import ColorPickerModal from './modals/ColorPickerModal';
import LogoUploadModal from './modals/LogoUploadModal';
import { OfficialWhatsAppIcon } from '../ui/OfficialWhatsAppIcon';

interface CompanyProfileCardProps {
    company: CompanyProfile;
    isOwner?: boolean;
    onLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploadingLogo?: boolean;
    isSidebarCollapsed?: boolean;
    onToggleCollapse?: (collapsed: boolean) => void;
    onUpdateDescription?: (newDescription: string) => Promise<void>;
    onColorChange?: (color: string) => void;
}

const CompanyProfileCard: React.FC<CompanyProfileCardProps> = ({
    company,
    isOwner,
    onLogoUpload,
    isUploadingLogo,
    isSidebarCollapsed = false,
    onToggleCollapse,
    onUpdateDescription,
    onColorChange
}) => {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isMobileContactsOpen, setIsMobileContactsOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    // Logo Cropper State
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setLogoFile(e.target.files[0]);
            setIsLogoModalOpen(true);
            e.target.value = ''; // Reset input
        }
    };

    const handleLogoSave = (blob: Blob) => {
        if (onLogoUpload && logoFile) {
            const file = new File([blob], logoFile.name, { type: 'image/jpeg' });
            // Create synthetic event
            const syntheticEvent = {
                target: {
                    files: [file]
                }
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            onLogoUpload(syntheticEvent);
            setIsLogoModalOpen(false);
            setLogoFile(null);
        }
    };

    // Description Editing State
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');
    const [isSavingDescription, setIsSavingDescription] = useState(false);

    const handleSaveDescription = async () => {
        if (onUpdateDescription) {
            setIsSavingDescription(true);
            try {
                await onUpdateDescription(tempDescription);
                setIsEditingDescription(false);
            } catch (error) {
                console.error("Failed to save description", error);
            } finally {
                setIsSavingDescription(false);
            }
        }
    };

    const fullAddress = `${company.address || ''}${company.number ? `, ${company.number}` : ''}${company.neighborhood ? ` - ${company.neighborhood}` : ''}${company.city ? ` - ${company.city}` : ''}${company.state ? `/${company.state}` : ''}`;
    const cityState = company.city && company.state ? `${company.city} - ${company.state}` : null;

    return (
        <>
            <div className={`bg-white rounded-[24px] shadow-lg border border-white/50 p-4 lg:p-0 text-center lg:text-left transition-all hover:shadow-xl overflow-hidden ${isSidebarCollapsed ? 'lg:p-3 lg:flex lg:flex-col lg:items-center lg:gap-3 lg:w-[70px]' : ''}`}>

                {/* Desktop Cover Area (Hidden on Mobile) */}
                {!isSidebarCollapsed && (
                    <div
                        className="hidden lg:block w-full h-32 bg-slate-800 relative"
                        style={{ backgroundColor: company.profile_header_color || '#1e293b' }}
                    >
                        {/* Optional: Add a subtle overlay or pattern here if desired */}
                    </div>
                )}

                {/* Color Picker (Owner Only) - Top Right of Cover */}
                {!isSidebarCollapsed && isOwner && (
                    <div className="absolute top-4 right-14 z-20 hidden lg:block">
                        <button
                            onClick={() => setIsColorPickerOpen(true)}
                            className="flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-3 py-1.5 rounded-full cursor-pointer transition-all border border-white/20 shadow-sm group"
                        >
                            <Palette size={16} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Alterar Cor</span>
                        </button>
                    </div>
                )}

                {/* Close Button (Expanded Desktop Only) */}
                {!isSidebarCollapsed && onToggleCollapse && (
                    <button
                        onClick={() => onToggleCollapse(true)}
                        className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors hidden lg:block z-10"
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
                                onChange={handleFileSelect}
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
                        <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain object-center bg-white" />
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
                        {onToggleCollapse && (
                            <button
                                onClick={() => onToggleCollapse(false)}
                                className="w-9 h-9 mt-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-all hover:scale-110"
                                title="Expandir"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Main Content (Mobile Always Visible / Desktop Expanded) */}
                <div className={`animate-fadeIn pt-1 relative ${isSidebarCollapsed ? 'block lg:hidden' : 'block'}`}>



                    {/* Header Info (Always Visible on Mobile) */}
                    <div className={`flex flex-col gap-0.5 mb-3 ${!isSidebarCollapsed ? 'lg:px-6 lg:mt-2' : ''}`}>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <h1 className="text-2xl lg:text-3xl font-black text-[#1a234a] leading-tight">
                                {company.name}
                            </h1>

                            {/* Desktop Right Side (Icons + Location) */}
                            <div className={`hidden lg:flex flex-col items-end gap-1 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                                {/* Desktop Icons Row (Socials + Actions) */}
                                <div className="flex items-center gap-3">
                                    {/* Contact Actions */}
                                    {(company.phone || company.whatsapp) && (
                                        <button
                                            onClick={() => setIsContactModalOpen(true)}
                                            className="text-slate-400 hover:text-[#25D366] transition-colors"
                                            title="WhatsApp"
                                        >
                                            <OfficialWhatsAppIcon size={28} />
                                        </button>
                                    )}
                                    {company.address && (
                                        <button
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                            title="Endereço"
                                        >
                                            <MapPin size={28} />
                                        </button>
                                    )}
                                    {company.website && (
                                        <a
                                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-slate-400 hover:text-blue-500 transition-colors"
                                            title="Website"
                                        >
                                            <Globe size={28} />
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
                                        className="text-slate-400 hover:text-indigo-500 transition-colors"
                                        title="Compartilhar"
                                    >
                                        <Share2 size={28} />
                                    </button>

                                    {/* Divider */}
                                    {(company.instagram || company.facebook || company.linkedin) && (
                                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                                    )}

                                    {/* Social Links */}
                                    {company.instagram && (
                                        <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors">
                                            <Instagram size={28} />
                                        </a>
                                    )}
                                    {company.facebook && (
                                        <a href={company.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
                                            <Facebook size={28} />
                                        </a>
                                    )}
                                    {company.linkedin && (
                                        <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors">
                                            <Linkedin size={28} />
                                        </a>
                                    )}
                                </div>

                                {/* City - State Display (Desktop) */}
                                {cityState && (
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                            <MapPin size={9} /> {cityState}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 justify-center lg:justify-start bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit border border-blue-100 mx-auto lg:mx-0 mt-1">
                            <BadgeCheck size={12} strokeWidth={3} /> {company.type_business === 'agencia' ? 'Agência de Empregos' : 'Empresa'} Verificada
                        </div>
                    </div>

                    {/* Description with Inline Edit */}
                    {isEditingDescription ? (
                        <div className="mb-6 animate-fadeIn">
                            <div className="relative">
                                <textarea
                                    className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-indigo-500 resize-none shadow-sm"
                                    rows={3}
                                    maxLength={150}
                                    value={tempDescription}
                                    onChange={(e) => setTempDescription(e.target.value)}
                                    placeholder="Descreva sua empresa em até 150 caracteres..."
                                    autoFocus
                                />
                                <div className={`absolute bottom-2 right-2 text-[10px] font-bold ${tempDescription.length >= 150 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {tempDescription.length}/150
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => {
                                        setIsEditingDescription(false);
                                        setTempDescription(company.description || '');
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveDescription}
                                    disabled={isSavingDescription}
                                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-70"
                                >
                                    {isSavingDescription ? 'Salvando...' : 'Salvar Descrição'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`group relative mb-6 flex gap-2 ${!isSidebarCollapsed ? 'lg:px-6' : 'justify-center'}`}>
                            {/* Edit Button (Visible only to owner) */}
                            {isOwner && onUpdateDescription && !isSidebarCollapsed && (
                                <button
                                    onClick={() => {
                                        setTempDescription(company.description || '');
                                        setIsEditingDescription(true);
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg transition-colors h-fit mt-0.5"
                                    title="Editar Descrição"
                                >
                                    <Pencil size={14} />
                                </button>
                            )}

                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                {company.description || 'Empresa parceira SoroEmpregos.'}
                            </p>
                        </div>
                    )}

                    {/* Mobile Toggle Button (Visible only on Mobile) */}
                    <button
                        onClick={() => setIsMobileContactsOpen(!isMobileContactsOpen)}
                        className="lg:hidden w-full flex items-center justify-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 py-2 rounded-xl mb-4 hover:bg-blue-100 transition-colors"
                    >
                        {isMobileContactsOpen ? 'Ocultar Contatos' : 'Ver Informações de Contato'}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileContactsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Contacts Section (Hidden on Mobile unless expanded, Visible on Desktop BUT Buttons hidden on desktop now) */}
                    <div className={`${isMobileContactsOpen ? 'block' : 'hidden'} lg:block transition-all`}>

                        {/* Contact Buttons (Mobile Only now - hidden lg:hidden) */}
                        <div className={`flex flex-col gap-2 mb-3 lg:hidden ${!isSidebarCollapsed ? 'lg:px-6' : ''}`}>
                            {(company.phone || company.whatsapp) && (
                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="w-full h-10 rounded-xl bg-[#25D366] text-white font-bold hover:brightness-110 shadow-md shadow-green-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                                    style={company.profile_header_color ? { backgroundColor: company.profile_header_color, boxShadow: `0 4px 6px -1px ${company.profile_header_color}33` } : {}}
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



                        {/* Socials Row (Mobile Only) */}
                        <div className={`lg:hidden space-y-2 pt-4 border-t border-gray-100 text-[10px] font-semibold text-gray-500`}>
                            <div className="flex gap-4 justify-center pt-1">
                                {company.instagram && (
                                    <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-colors">
                                        <Instagram size={20} />
                                    </a>
                                )}
                                {company.facebook && (
                                    <a href={company.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors">
                                        <Facebook size={20} />
                                    </a>
                                )}
                                {company.linkedin && (
                                    <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
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

            <ColorPickerModal
                isOpen={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
                initialColor={company.profile_header_color}
                onSave={(color) => {
                    if (onColorChange) onColorChange(color);
                }}
            />

            <LogoUploadModal
                isOpen={isLogoModalOpen}
                onClose={() => {
                    setIsLogoModalOpen(false);
                    setLogoFile(null);
                }}
                imageFile={logoFile}
                onSave={handleLogoSave}
            />
        </>
    );
};

export default CompanyProfileCard;
