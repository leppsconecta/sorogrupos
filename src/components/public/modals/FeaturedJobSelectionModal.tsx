import React, { useState } from 'react';
import { Job } from '../../../types';
import { X, Star, Plus, Check, Briefcase, MapPin, Search } from 'lucide-react';

interface FeaturedJobSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobs: any[]; // Using any to match existing Perfil.tsx structure, but could be Job[]
    onToggleFeatured: (job: any) => void;
}

const FeaturedJobSelectionModal: React.FC<FeaturedJobSelectionModalProps> = ({ isOpen, onClose, jobs, onToggleFeatured }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    // Filter out jobs that are already featured
    const eligibleJobs = jobs.filter(j => !j.is_featured);

    // Filter by search term
    const filteredJobs = eligibleJobs.filter(job => {
        const title = job.role || job.title || '';
        const location = job.city || '';
        const searchLower = searchTerm.toLowerCase();
        return title.toLowerCase().includes(searchLower) || location.toLowerCase().includes(searchLower);
    });

    const featuredCount = jobs.filter(j => j.is_featured).length;
    const remainingSlots = 5 - featuredCount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-scaleIn">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Star className="text-yellow-500 fill-yellow-500" size={24} />
                                Adicionar Destaques
                            </h3>
                            {remainingSlots > 0 ? (
                                <p className="text-sm text-slate-500 font-medium">
                                    Você pode destacar mais <span className="text-indigo-600 font-bold">{remainingSlots}</span> vagas.
                                </p>
                            ) : (
                                <p className="text-sm text-amber-600 font-bold flex items-center gap-1">
                                    Limite de destaques atingido (5/5).
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Pesquisar vaga por título ou cidade..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50 flex-1">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-600 dark:text-slate-400">Nenhuma vaga encontrada</h4>
                            <p className="text-slate-400 text-sm">
                                {eligibleJobs.length === 0
                                    ? "Todas as suas vagas já estão destacadas ou você ainda não criou nenhuma."
                                    : "Tente buscar por outro termo."}
                            </p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div
                                key={job.id}
                                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-200 hover:shadow-lg transition-all"
                            >
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-indigo-600 transition-colors">
                                        {job.role || job.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                            <Briefcase size={12} /> {job.type}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} /> {job.city || 'Sorocaba, SP'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onToggleFeatured(job)}
                                    disabled={remainingSlots <= 0}
                                    className={`
h - 10 px - 5 rounded - full font - bold text - sm flex items - center gap - 2 transition - all
                                        ${remainingSlots > 0
                                            ? 'bg-slate-900 text-white hover:bg-indigo-600 hover:scale-105 shadow-md shadow-slate-900/10'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }
`}
                                >
                                    {remainingSlots > 0 ? (
                                        <>
                                            <Plus size={16} strokeWidth={3} /> Destacar
                                        </>
                                    ) : (
                                        <span className="text-xs">Limite</span>
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default FeaturedJobSelectionModal;
