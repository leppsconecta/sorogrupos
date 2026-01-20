import React, { useState } from 'react';
import { Job } from './types';
import { Briefcase, MapPin, Clock, Eye, Hash } from 'lucide-react';

interface CompactJobCardProps {
    job: Job;
    onViewDetails: () => void;
}

const CompactJobCard: React.FC<CompactJobCardProps> = ({ job, onViewDetails }) => {

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'CLT': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Freelance': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'PJ': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getInitials = (title: string) => {
        return title
            .split(' ')
            .map(word => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getRandomColor = (id: string) => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-indigo-100 text-indigo-600',
            'bg-purple-100 text-purple-600',
            'bg-emerald-100 text-emerald-600',
            'bg-orange-100 text-orange-600',
            'bg-cyan-100 text-cyan-600'
        ];
        const index = id.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div
            onClick={onViewDetails}
            className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
            <div className="flex items-start gap-4 flex-1 w-full">
                {/* Job Logo (Initials) */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${getRandomColor(job.id)}`}>
                    {getInitials(job.title)}
                </div>

                <div className="space-y-3 flex-1 w-full">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2">


                        {/* Type Badge */}
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getTypeStyles(job.type)}`}>
                            {job.type}
                        </span>

                        {/* Date Badge */}
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-400 text-[10px] font-bold uppercase border border-slate-100">
                            <Clock size={10} /> {job.postedAt}
                        </span>
                    </div>

                    {/* Main Info */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors mb-1">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1">
                                <Briefcase size={12} className="text-indigo-400" />
                                {job.company}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400" />
                                {job.location}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="self-end sm:self-center">
                <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors flex items-center justify-center">
                    <Eye size={20} />
                </button>
            </div>
        </div>
    );
};

export default CompactJobCard;
