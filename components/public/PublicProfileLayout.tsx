import React, { ReactNode, useState, useEffect } from 'react';
import { CompanyProfile, Job } from './types';
import { Building2, BadgeCheck, MapPin, Globe, Phone, Instagram, Facebook, Linkedin, ChevronLeft, ChevronRight, Share2, X, ChevronDown, Camera } from 'lucide-react';
import ContactOptionsModal from './modals/ContactOptionsModal';
import AddressModal from './modals/AddressModal';

import { OfficialWhatsAppIcon } from '../OfficialWhatsAppIcon';
import FloatingContactMenu from './FloatingContactMenu';

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

    // Address constants removed as they are handled inside CompanyProfileCard now



    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            {/* Top Cover Removed */}

            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-20 relative z-10">

                {/* Main Content (Jobs) */}
                <div className="animate-slideUpFade delay-100">
                    {children}
                </div>
            </div>

            <FloatingContactMenu company={company} />
        </div>
    );
};

export default PublicProfileLayout;
