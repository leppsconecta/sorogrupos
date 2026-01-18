import React from 'react';
import { FilterType } from './types';
import { Search } from 'lucide-react';

interface FiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedType: FilterType;
    setSelectedType: (val: FilterType) => void;
}

const Filters: React.FC<FiltersProps> = ({ searchTerm, setSearchTerm, selectedType, setSelectedType }) => {
    const types = Object.values(FilterType);

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Cargo, empresa ou cidade..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:outline-none bg-white shadow-sm transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide px-1">
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
        </div>
    );
};

export default Filters;
