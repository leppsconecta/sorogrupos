import React from 'react';
import { X, Copy, ExternalLink, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';


interface ContactActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'whatsapp' | 'email' | 'address' | 'phone' | 'socials';
    value: any;
}

const ContactActionSheet: React.FC<ContactActionSheetProps> = ({ isOpen, onClose, type, value }) => {
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        // Assuming a toast function exists or simple feedback
        // For now, using alert or console if no global toast available in this context
        // But usually there is one. I will skip the toast call inside here and let UI handle it or assume user sees 'Copied'.
        // Better: Show a small "Copiado!" text locally? 
        // I will use a simple visually feedback or callback.
        onClose();
    };

    const getActions = () => {
        switch (type) {
            case 'whatsapp':
            case 'phone':
                const phone = value.replace(/\D/g, '');
                return [
                    {
                        label: 'Abrir WhatsApp',
                        icon: <ExternalLink size={20} />,
                        onClick: () => window.open(`https://wa.me/${phone}`, '_blank'),
                        primary: true
                    },
                    {
                        label: 'Copiar Número',
                        icon: <Copy size={20} />,
                        onClick: handleCopy
                    }
                ];
            case 'email':
                return [
                    {
                        label: 'Abrir Email',
                        icon: <ExternalLink size={20} />,
                        onClick: () => window.open(`mailto:${value}`, '_blank'),
                        primary: true
                    },
                    {
                        label: 'Copiar Email',
                        icon: <Copy size={20} />,
                        onClick: handleCopy
                    }
                ];
            case 'address':
                const encoded = encodeURIComponent(value);
                return [
                    {
                        label: 'Google Maps',
                        icon: <MapPin size={20} />,
                        onClick: () => window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank'),
                        primary: true
                    },
                    {
                        label: 'Waze',
                        icon: <img src="/icon-waze.png" alt="Waze" className="w-5 h-5 object-contain" />,
                        onClick: () => window.open(`https://waze.com/ul?q=${encoded}`, '_blank')
                    },
                    {
                        label: 'Uber',
                        icon: <img src="/icon-uber.png" alt="Uber" className="w-5 h-5 object-contain" />,
                        onClick: () => window.open(`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encoded}`, '_blank')
                    },
                    {
                        label: 'Copiar Endereço',
                        icon: <Copy size={20} />,
                        onClick: handleCopy
                    }
                ];
            case 'socials':
                const socialLinks = value as { facebook?: string, instagram?: string, linkedin?: string };
                const socialActions = [];

                if (socialLinks.instagram) {
                    socialActions.push({
                        label: 'Instagram',
                        icon: <Instagram size={20} />,
                        onClick: () => window.open(socialLinks.instagram, '_blank'),
                        primary: true
                    });
                }
                if (socialLinks.facebook) {
                    socialActions.push({
                        label: 'Facebook',
                        icon: <Facebook size={20} />,
                        onClick: () => window.open(socialLinks.facebook, '_blank'),
                        primary: true
                    });
                }
                if (socialLinks.linkedin) {
                    socialActions.push({
                        label: 'LinkedIn',
                        icon: <Linkedin size={20} />,
                        onClick: () => window.open(socialLinks.linkedin, '_blank'),
                        primary: true
                    });
                }
                return socialActions;
            default:
                return [];
        }
    };

    const actions = getActions();

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-slideUp sm:animate-scaleIn">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800">
                        {type === 'whatsapp' ? 'WhatsApp' :
                            type === 'email' ? 'Email' :
                                type === 'address' ? 'Endereço' :
                                    type === 'socials' ? 'Redes Sociais' : 'Contato'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-2 gap-1 flex flex-col">
                    {actions.map((action, i) => (
                        <button
                            key={i}
                            onClick={action.onClick}
                            className={`w-full p-4 rounded-xl flex items-center gap-3 font-medium transition-all ${action.primary
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : 'hover:bg-slate-50 text-slate-700'
                                }`}
                        >
                            <span className={`${action.primary ? 'text-blue-600' : 'text-slate-400'}`}>
                                {action.icon}
                            </span>
                            {action.label}
                        </button>
                    ))}
                </div>
                {/* Value Display */}
                {/* Value Display - Hide for socials as it is not a single value */}
                {type !== 'socials' && (
                    <div className="p-4 pt-0 text-center">
                        <p className="text-xs text-slate-400 border-t border-slate-100 pt-3 break-all bg-slate-50/50 p-2 rounded">
                            {value}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactActionSheet;
