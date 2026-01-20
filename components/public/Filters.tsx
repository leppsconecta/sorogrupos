import React from 'react';
import { FilterType, CompanyProfile } from './types';
import { Search } from 'lucide-react';

interface FiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedType: FilterType;
    setSelectedType: (val: FilterType) => void;
    company: CompanyProfile | null;
    compact?: boolean;
    onEditLogo?: () => void;
}

const Filters: React.FC<FiltersProps> = ({ searchTerm, setSearchTerm, selectedType, setSelectedType, company, compact = false, onEditLogo }) => {
    const types = Object.values(FilterType);

    return (
        <div className={`w-full flex items-center bg-gray-50 rounded-2xl border border-gray-100 transition-all ${compact ? 'p-2 gap-2 flex-row' : 'p-2 md:p-4 gap-4 flex-col md:flex-row'}`}>
            <div className={`relative flex items-center ${compact ? 'flex-1 w-auto gap-2' : 'flex-1 w-full md:flex-none md:w-[40%] gap-3'}`}>
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${compact ? 'left-3' : 'left-4'}`} size={compact ? 16 : 18} />
                    <input
                        type="text"
                        placeholder="Cargo, empresa..."
                        className={`w-full rounded-xl border-2 border-transparent focus:border-blue-400 focus:outline-none bg-white shadow-sm transition-all text-sm ${compact ? 'pl-9 pr-3 py-1.5 h-9' : 'pl-12 pr-4 py-3'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Mobile Company Profile */}
                {company && (
                    <div className={`flex items-center gap-2 ${compact ? 'hidden' : 'md:hidden'}`}>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-700 leading-none">{company.name}</p>
                        </div>
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full border-2 border-white shadow-sm object-cover`}
                            />
                        ) : (
                            <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-slate-200 border-2 border-white shadow-sm`} />
                        )}
                    </div>
                )}
            </div>
            <div className={`flex flex-wrap items-center justify-center ${compact ? 'gap-1.5 w-auto' : 'gap-2 w-full md:w-auto md:justify-start'}`}>
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`whitespace-nowrap rounded-xl font-bold uppercase transition-all border ${selectedType === type
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-100 border-gray-200'
                            } ${compact ? 'px-3 py-1 text-[10px]' : 'px-5 py-2.5 text-[10px] tracking-widest'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Desktop Company Profile (or Compact Profile) */}
            {company && (
                <div className={`${compact ? 'flex' : 'hidden md:flex'} items-center gap-2 border-l border-gray-200 ml-auto ${compact ? 'pl-2' : 'pl-4 gap-3'}`}>
                    <div className="text-right">
                        <p className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-gray-800 leading-none`}>{company.name}</p>
                        {(!compact && company.city && company.state) && (
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">{company.city} - {company.state}</p>
                        )}
                    </div>
                    <div className="relative group">
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full border-2 border-white shadow-sm object-cover bg-white`}
                            />
                        ) : (
                            <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-slate-200 border-2 border-white shadow-sm`} />
                        )}

                        {onEditLogo && (
                            <button
                                onClick={onEditLogo}
                                className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 transition-all z-20"
                                title="Alterar Logo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                            </button>
                        )}
                    </div>
                    {/* Explicit Button above logo request */}

                </div>
            )}
        </div>
    );
};

export default Filters;
