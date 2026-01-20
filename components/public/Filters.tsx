import React from 'react';
import { FilterType, CompanyProfile } from './types';
import { Search } from 'lucide-react';

interface FiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedType: FilterType;
    setSelectedType: (val: FilterType) => void;
    company: CompanyProfile | null;
}

const Filters: React.FC<FiltersProps> = ({ searchTerm, setSearchTerm, selectedType, setSelectedType, company }) => {
    const types = Object.values(FilterType);

    return (
        <div className="w-full flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-2 md:p-4 rounded-3xl border border-gray-100">
            <div className="relative flex-1 w-full md:flex-none md:w-[40%] flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cargo, empresa ou cidade..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:outline-none bg-white shadow-sm transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Mobile Company Profile */}
                {company && (
                    <div className="flex items-center gap-2 md:hidden">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-700 leading-none">{company.name}</p>
                        </div>
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto px-1 justify-center md:justify-start">
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border ${selectedType === type
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-100 border-gray-200'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Desktop Company Profile */}
            {company && (
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200 ml-auto">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-800 leading-none">{company.name}</p>
                        {(company.city && company.state) && (
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">{company.city} - {company.state}</p>
                        )}
                    </div>
                    {company.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover bg-white"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                    )}
                </div>
            )}
        </div>
    );
};

export default Filters;
