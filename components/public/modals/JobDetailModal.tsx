import React from 'react';
import { Job } from '../types';
import {
    X,
    Send,
    HelpCircle,
    AlertTriangle,
    Briefcase,
    MapPin,
    DollarSign,
    CheckCircle2,
    Hash,
    Share2,
    Clock,
    Star
} from 'lucide-react';

interface JobDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: Job | null;
    onApply: () => void;
    onReport: () => void;
    showFooter?: boolean;
    brandColor?: string;
    customFooter?: React.ReactNode;
}

interface JobDetailContentProps {
    job: Job;
    onApply: () => void;
    onReport: () => void;
    showFooter?: boolean;
    onClose?: () => void; // Optional for content view
    brandColor?: string;
    customFooter?: React.ReactNode;
}

export const JobDetailContent: React.FC<JobDetailContentProps> = ({
    job,
    onApply,
    onReport,
    showFooter = true,
    onClose,
    brandColor,
    customFooter
}) => {
    const [isShared, setIsShared] = React.useState(false);

    const handleShare = async () => {
        const text = `*${job.title}*\n* Vaga publicada ${job.postedAt.toLowerCase()}\n* ${job.location}\nAcesse: soroempregos.com e insira o código da vaga para se candidatar.\nCódigo: *${job.code}*\n\nBoa sorte 🍀`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Vaga: ${job.title}`,
                    text: text,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(text).then(() => {
                setIsShared(true);
                setTimeout(() => setIsShared(false), 2000);
            }).catch(err => console.error("Failed to copy", err));
        }
    };

    return (
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn ring-1 ring-slate-100">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 relative bg-white">
                <div className="absolute top-4 left-6">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
                        <Hash size={12} className="text-slate-400" />
                        {job.code}
                    </div>
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}

                <div className="mt-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 pr-8 mb-3 leading-tight">
                        {job.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                            <MapPin size={14} className="text-red-500" />
                            {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                            <DollarSign size={14} className="text-green-500" />
                            {job.salary || 'A combinar'}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                            <Clock size={14} className="text-orange-500" />
                            {job.postedAt}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-600">

                {/* Description */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Sobre a vaga</h3>
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                        {job.description}
                    </div>
                </div>

                {/* Simple Lists Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                    {(job.requirements?.length ?? 0) > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-indigo-500" /> Requisitos
                            </h3>
                            <ul className="space-y-2">
                                {job.requirements.map((req, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2 leading-snug">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(job.benefits?.length ?? 0) > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" /> Benefícios
                            </h3>
                            <ul className="space-y-2">
                                {job.benefits.map((benefit, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2 leading-snug">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-200 mt-1.5 shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(job.activities?.length ?? 0) > 0 && (
                        <div className="sm:col-span-2">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Briefcase size={16} className="text-violet-500" /> Atividades
                            </h3>
                            <ul className="space-y-2">
                                {job.activities.map((act, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2 leading-snug">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-300 mt-1.5 shrink-0" />
                                        {act}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

            </div>

            {/* Compact Footer */}
            {customFooter ? (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {customFooter}
                </div>
            ) : showFooter && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    <button
                        onClick={onApply}
                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                        style={brandColor ? { backgroundColor: brandColor } : {}}
                    >
                        <Send size={16} /> Enviar Currículo
                    </button>

                    <button
                        onClick={handleShare}
                        className={`h-11 px-4 flex items-center justify-center rounded-xl border transition-all font-medium text-sm gap-2 ${isShared
                            ? 'bg-green-50 border-green-200 text-green-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600'
                            }`}
                        title="Compartilhar Vaga"
                    >
                        {isShared ? (
                            <>
                                <CheckCircle2 size={18} className="text-green-600" />
                                <span className="hidden sm:inline">Copiado!</span>
                            </>
                        ) : (
                            <>
                                <Share2 size={18} />
                                <span className="hidden sm:inline">Compartilhar</span>
                            </>
                        )}
                    </button>



                    <button
                        onClick={onReport}
                        className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors bg-white"
                        title="Reportar"
                    >
                        <AlertTriangle size={18} />
                    </button>
                </div>
            )}

        </div>
    );
};

const JobDetailModal: React.FC<JobDetailModalProps> = ({
    isOpen,
    onClose,
    job,
    onApply,
    onReport,
    showFooter = true,
    brandColor,
    customFooter
}) => {
    if (!isOpen || !job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <JobDetailContent
                job={job}
                onApply={onApply}
                onReport={onReport}
                showFooter={showFooter}
                onClose={onClose}
                brandColor={brandColor}
                customFooter={customFooter}
            />
        </div>
    );
};

export default JobDetailModal;
