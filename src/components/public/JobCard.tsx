
import React, { useState } from 'react';
import { Job } from '../../types';
import { Clock, MapPin, ChevronDown, Send, HelpCircle, AlertTriangle, Briefcase, DollarSign, Plus, Star, Eye, EyeOff, Hash, Copy, Check } from 'lucide-react';

interface JobCardProps {
    job: Job;
    onApply: () => void;
    onReport: () => void;
    onQuestion: () => void;
    showAdminControls?: boolean;
    onToggleFeatured?: () => void;
    onToggleHidden?: () => void;
    onViewDetails?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onReport, onQuestion, showAdminControls, onToggleFeatured, onToggleHidden, onViewDetails }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(job.jobCode || job.id);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'CLT': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Freelance': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'PJ': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const isJobHidden = job.status === 'Pausada';

    const formatList = (item: string | string[]) => {
        if (Array.isArray(item)) return item.join(', ');
        return item;
    };

    return (
        <div
            onClick={() => {
                if (onViewDetails) {
                    onViewDetails();
                } else {
                    setIsExpanded(!isExpanded);
                }
            }}
            className={`group rounded-[32px] border transition-all duration-300 cursor-pointer overflow-hidden relative ${isJobHidden
                ? 'bg-red-50 border-red-200 hover:border-red-300'
                : 'bg-white'
                } ${isExpanded && !onViewDetails
                    ? 'border-blue-500 shadow-xl ring-4 ring-blue-50 z-20'
                    : 'shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1'
                } ${(!isExpanded || onViewDetails) && !isJobHidden ? 'border-gray-100' : ''}`}
        >
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Job Code Badge with Copy */}
                            {!showAdminControls && (
                                <div
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase cursor-pointer hover:bg-slate-200 hover:border-slate-300 transition-colors group/code"
                                    title="Copiar código da vaga"
                                >
                                    <Hash size={10} className="text-slate-400" />
                                    {job.jobCode}
                                    {isCopied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-slate-400 group-hover/code:text-blue-500" />}
                                </div>
                            )}

                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getTypeStyles(job.type)}`}>
                                {job.type}
                            </span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                <Clock size={12} /> {job.date}
                            </span>
                            {/* Job doesn't have isFeatured in Vaga yet, omitting or assuming false */}

                            {/* Hidden Badge */}
                            {isJobHidden && (
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border border-red-200">
                                    <EyeOff size={10} /> ( Removida do site )
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-[#1a234a] leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-gray-500 flex items-center gap-1.5">
                                    <Briefcase size={14} className="text-blue-500" /> {job.companyName}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="font-medium text-gray-400 flex items-center gap-1.5">
                                    <MapPin size={14} /> {job.city && job.region ? `${job.city} - ${job.region}` : job.city || job.region}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {showAdminControls && (
                            <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                                {onToggleFeatured && (
                                    <button
                                        onClick={onToggleFeatured}
                                        title={"Adicionar Destaque"}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-blue-500`}
                                    >
                                        <Plus size={20} className="stroke-[3]" />
                                    </button>
                                )}

                                {onToggleHidden && (
                                    <button
                                        onClick={onToggleHidden}
                                        title={isJobHidden ? "Exibir Vaga" : "Ocultar Vaga"}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border ${isJobHidden
                                            ? 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200'
                                            : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                                            }`}
                                    >
                                        {isJobHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                )}
                            </div>
                        )}

                        {!showAdminControls && (
                            <div className={`hidden md:flex shrink-0 items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${isExpanded && !onViewDetails ? 'bg-blue-600 border-blue-600 text-white rotate-180' : 'bg-gray-50 border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                                }`}>
                                {onViewDetails ? <Eye size={20} /> : <ChevronDown size={20} />}
                            </div>
                        )}
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-gray-100 animate-slideDown space-y-8" onClick={(e) => e.stopPropagation()}>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-3 bg-blue-500 rounded-full" /> Descrição
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{job.activities || job.observation}</p>
                                </div>
                                {job.requirements && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-3 bg-indigo-500 rounded-full" /> Requisitos
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{formatList(job.requirements)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {job.benefits && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-3 bg-green-500 rounded-full" /> Benefícios
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{formatList(job.benefits)}</p>
                                    </div>
                                )}
                                <div className="space-y-2 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign size={12} /> Salário
                                    </h4>
                                    <p className="text-lg text-blue-900 font-bold">{job.salary || 'A combinar'}</p>
                                </div>
                            </div>
                        </div>

                        {!showAdminControls && (
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onApply(); }}
                                    className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 hover:scale-[1.02] shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-xs uppercase flex items-center justify-center gap-2"
                                >
                                    <Send size={16} strokeWidth={2.5} /> Enviar Currículo
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onQuestion(); }}
                                        className="h-12 w-12 sm:w-auto sm:px-6 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        title="Tirar Dúvida"
                                    >
                                        <HelpCircle size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Dúvida</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onReport(); }}
                                        className="h-12 w-12 sm:w-auto sm:px-6 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 hover:text-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        title="Reportar Vaga"
                                    >
                                        <AlertTriangle size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Reportar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobCard;
