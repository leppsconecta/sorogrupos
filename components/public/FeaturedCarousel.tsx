import React from 'react';
import { Job } from './types';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight } from 'lucide-react';

interface FeaturedCarouselProps {
    jobs: Job[];
    onApply: (job: Job) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ jobs, onApply }) => {
    if (jobs.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-[#1a234a] mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-600 rounded-full block"></span>
                Vagas em Destaque
            </h3>

            {/* Carousel Container */}
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory gap-4">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="snap-center shrink-0 w-[85%] sm:w-[350px] bg-white rounded-[24px] border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer relative"
                        onClick={() => onApply(job)}
                    >
                        {/* Gradient Header */}
                        <div className="h-24 bg-gradient-to-br from-[#1a234a] to-[#2a3560] p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Briefcase size={64} className="text-white transform rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <span className="inline-block px-2 py-1 rounded-lg bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-2 backdrop-blur-sm border border-white/10">
                                    {job.type}
                                </span>
                                <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">
                                    {job.title}
                                </h4>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                    <MapPin size={16} className="text-indigo-500 shrink-0" />
                                    <span className="truncate">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                    <DollarSign size={16} className="text-emerald-500 shrink-0" />
                                    <span className="truncate">{job.salary || 'A combinar'}</span>
                                </div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                                Ver Detalhes <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedCarousel;
