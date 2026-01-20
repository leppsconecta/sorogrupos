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
        <div className="w-full flex flex-col sm:flex-row gap-2 items-center bg-gray-50 p-1.5 sm:p-2 rounded-2xl border border-gray-100">
            <div className="relative flex-1 w-full sm:w-auto flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Cargo, empresa..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-transparent focus:border-blue-400 focus:outline-none bg-white shadow-sm transition-all text-sm h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Mobile Company Profile */}
                {company && (
                    <div className="flex items-center gap-2 sm:hidden">
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className="w-8 h-8 rounded-full border border-white shadow-sm object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm" />
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto px-1 justify-center sm:justify-start">
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wide transition-all border ${selectedType === type
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-500 hover:bg-gray-100 border-gray-200'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Desktop Company Profile */}
            {company && (
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 ml-auto">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-800 leading-none">{company.name}</p>
                    </div>
                    {company.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-8 h-8 rounded-full border border-white shadow-sm object-cover bg-white"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm" />
                    )}
                </div>
            )}
        </div>
    );
};

export default Filters;
