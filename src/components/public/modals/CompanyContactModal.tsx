import React, { useState } from 'react';
import { CompanyProfile } from '../../../types';
import { Mail, MapPin, Globe, X, Phone, Share2, BadgeCheck } from 'lucide-react';
import { OfficialWhatsAppIcon } from '../../ui/OfficialWhatsAppIcon';
import ContactActionSheet from './ContactActionSheet';

interface CompanyContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: CompanyProfile | null;
}

const CompanyContactModal: React.FC<CompanyContactModalProps> = ({ isOpen, onClose, company }) => {
    // Action Sheet State
    const [actionSheet, setActionSheet] = useState<{
        open: boolean;
        type: 'whatsapp' | 'email' | 'address' | 'phone' | 'socials';
        value: any;
    }>({ open: false, type: 'whatsapp', value: '' });

    if (!isOpen || !company) return null;

    const openAction = (type: 'whatsapp' | 'email' | 'address' | 'phone' | 'socials', value: any) => {
        setActionSheet({ open: true, type, value });
    };

    const formattedAddress = [
        company.address,        // Rua
        company.number,         // Numero
        company.neighborhood,   // Bairro
        company.city,           // Cidade
        company.zip_code        // CEP
    ].filter(Boolean).join(', ');

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">

                {/* Header: Expanded Profile (Mobile Only) */}
                <div className="pt-8 pb-4 px-6 text-center flex flex-col items-center md:hidden">
                    {company.logo_url && (
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4 overflow-hidden relative bg-white">
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2 justify-center">
                        {company.name}
                        <BadgeCheck size={20} className="text-blue-500 fill-blue-50" />
                    </h3>

                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {company.city} - {company.state}
                    </p>

                    <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <BadgeCheck size={12} className="fill-emerald-100" />
                        Empresa Verificada
                    </div>
                </div>

                {/* Header: Simple Title (Desktop Only) */}
                <div className="hidden md:block pt-6 pb-2 px-6 text-center">
                    <h3 className="font-bold text-slate-800 text-lg">
                        Canais de Atendimento
                    </h3>
                </div>

                {/* Close Button (Global) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                >
                    <X size={18} />
                </button>

                <div className="p-4 space-y-2">
                    {/* WhatsApp */}
                    {(company.whatsapp || company.phone) && (
                        <button
                            onClick={() => openAction('whatsapp', company.whatsapp || company.phone || '')}
                            className="group w-full p-3 rounded-2xl flex items-center gap-3 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                <OfficialWhatsAppIcon size={18} />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-green-700 transition-colors">WhatsApp</span>
                        </button>
                    )}

                    {/* Email */}
                    {company.email && (
                        <button
                            onClick={() => openAction('email', company.email)}
                            className="group w-full p-3 rounded-2xl flex items-center gap-3 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                <Mail size={18} className="text-red-500" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-red-700 transition-colors">Email</span>
                        </button>
                    )}

                    {/* Address */}
                    {company.address && (
                        <button
                            onClick={() => openAction('address', formattedAddress)}
                            className="group w-full p-3 rounded-2xl flex items-center gap-3 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                                <MapPin size={18} className="text-orange-500" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-orange-700 transition-colors">Endereço</span>
                        </button>
                    )}

                    {/* Redes Sociais */}
                    {(company.instagram || company.facebook || company.linkedin) && (
                        <button
                            onClick={() => openAction('socials', {
                                instagram: company.instagram,
                                facebook: company.facebook,
                                linkedin: company.linkedin
                            })}
                            className="group w-full p-3 rounded-2xl flex items-center gap-3 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-pink-100 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                                <Share2 size={18} className="text-pink-500" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-pink-700 transition-colors">Redes Sociais</span>
                        </button>
                    )}

                    {/* Website */}
                    {company.website && (
                        <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="group w-full p-3 rounded-2xl flex items-center gap-3 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                <Globe size={18} className="text-indigo-600" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Website</span>
                        </a>
                    )}
                </div>

                <div className="pb-6 pt-2 text-center">
                    <a href="https://sorocaba.com" target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors font-medium">
                        Mais informações em sorocaba.com
                    </a>
                </div>
            </div>

            <ContactActionSheet
                isOpen={actionSheet.open}
                onClose={() => setActionSheet(prev => ({ ...prev, open: false }))}
                type={actionSheet.type}
                value={actionSheet.value}
            />
        </div>
    );
};

export default CompanyContactModal;
