
import React, { useState } from 'react';
import { Job } from './types';
import { Clock, MapPin, ChevronDown, ChevronUp, Send, HelpCircle, AlertTriangle, Briefcase, DollarSign } from 'lucide-react';

interface JobCardProps {
    job: Job;
    onApply: () => void;
    onReport: () => void;
    onQuestion: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onReport, onQuestion }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'CLT': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Freelance': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'PJ': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`group bg-white rounded-[32px] border transition-all duration-300 cursor-pointer overflow-hidden relative ${isExpanded
                    ? 'border-blue-500 shadow-xl ring-4 ring-blue-50 z-20'
                    : 'border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1'
                }`}
        >
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getTypeStyles(job.type)}`}>
                                {job.type}
                            </span>
                            <span className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                <Clock size={12} /> {job.postedAt}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-[#1a234a] leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-gray-500 flex items-center gap-1.5">
                                    <Briefcase size={14} className="text-blue-500" /> {job.company}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="font-medium text-gray-400 flex items-center gap-1.5">
                                    <MapPin size={14} /> {job.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${isExpanded ? 'bg-blue-600 border-blue-600 text-white rotate-180' : 'bg-gray-50 border-gray-200 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                        }`}>
                        <ChevronDown size={20} />
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
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{job.description}</p>
                                </div>
                                {(job.requirements?.length ?? 0) > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-3 bg-indigo-500 rounded-full" /> Requisitos
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{job.requirements.join(', ')}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {(job.benefits?.length ?? 0) > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-3 bg-green-500 rounded-full" /> Benefícios
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{job.benefits.join(', ')}</p>
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

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onApply(); }}
                                className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 hover:scale-[1.02] shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-xs uppercase flex items-center justify-center gap-2"
                            >
                                <Send size={16} strokeWidth={2.5} /> Candidatar-se Agora
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobCard;
