import React from 'react';
import { Job } from '../types';
import {
    X,
    Send,
    HelpCircle,
    AlertTriangle,
    Briefcase,
    MapPin,
    Clock,
    Star,
    DollarSign,
    CheckCircle2
} from 'lucide-react';

interface JobDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: Job | null;
    onApply: () => void;
    onReport: () => void;
    onQuestion: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({
    isOpen,
    onClose,
    job,
    onApply,
    onReport,
    onQuestion
}) => {
    if (!isOpen || !job) return null;

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'CLT': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Freelance': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'PJ': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">

                {/* Header */}
                <div className="relative bg-slate-50 border-b border-slate-100 p-6 sm:p-8 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm border border-slate-100"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getTypeStyles(job.type)}`}>
                                {job.type}
                            </span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                                <Clock size={12} /> {job.postedAt}
                            </span>
                            {job.isFeatured && (
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border border-yellow-200">
                                    <Star size={10} className="fill-yellow-500 text-yellow-500" /> Destaque
                                </span>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-[#1a234a] leading-tight mb-2">
                                {job.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="font-bold text-gray-500 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                    <Briefcase size={16} className="text-blue-500" /> {job.company}
                                </span>
                                <span className="font-medium text-gray-400 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                    <MapPin size={16} /> {job.location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Description */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full" /> Descrição da Vaga
                                </h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    {job.description}
                                </div>
                            </div>

                            {/* Requirements */}
                            {(job.requirements?.length ?? 0) > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Requisitos
                                    </h3>
                                    <ul className="grid gap-2">
                                        {job.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                <CheckCircle2 size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Activities */}
                            {(job.activities?.length ?? 0) > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-4 bg-violet-500 rounded-full" /> Atividades
                                    </h3>
                                    <ul className="grid gap-2">
                                        {job.activities.map((act, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                                <span>{act}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Salary Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <DollarSign size={80} className="transform rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Salário</p>
                                    <p className="text-2xl font-black">{job.salary || 'A combinar'}</p>
                                </div>
                            </div>

                            {/* Benefits */}
                            {(job.benefits?.length ?? 0) > 0 && (
                                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <Star size={14} className="fill-emerald-500 text-emerald-500" /> Benefícios
                                    </h3>
                                    <ul className="space-y-2">
                                        {job.benefits.map((benefit, i) => (
                                            <li key={i} className="text-sm text-emerald-800 font-medium flex items-center gap-2">
                                                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3 flex-shrink-0 z-10">
                    <button
                        onClick={onApply}
                        className="flex-1 h-14 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 hover:scale-[1.01] shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase flex items-center justify-center gap-2"
                    >
                        <Send size={18} strokeWidth={2.5} /> Candidatar-se Agora
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onQuestion}
                            className="h-14 px-6 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-blue-600 border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                            title="Tirar Dúvida"
                        >
                            <HelpCircle size={20} strokeWidth={2.5} /> <span className="hidden sm:inline">Dúvida</span>
                        </button>
                        <button
                            onClick={onReport}
                            className="h-14 px-6 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 hover:text-red-600 border border-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                            title="Reportar Vaga"
                        >
                            <AlertTriangle size={20} strokeWidth={2.5} /> <span className="hidden sm:inline">Reportar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;
