
import React, { useState, useMemo } from 'react';
import { Search, Check, X, AlertCircle } from 'lucide-react';

interface Job {
    id: string;
    role: string;
    companyName: string;
    jobCode: string;
    type: string;
    created_at: string;
}

interface JobSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    vagas: Job[];
    selectedVagaIds: string[];
    onToggleVaga: (id: string) => void;
    onClearSelection: () => void;
}

export const JobSelectorModal: React.FC<JobSelectorModalProps> = ({
    isOpen,
    onClose,
    vagas,
    selectedVagaIds,
    onToggleVaga,
    onClearSelection
}) => {
    const [search, setSearch] = useState('');

    const filteredVagas = useMemo(() => {
        return vagas.filter(v =>
            v.role.toLowerCase().includes(search.toLowerCase()) ||
            v.jobCode.toLowerCase().includes(search.toLowerCase()) ||
            v.companyName.toLowerCase().includes(search.toLowerCase())
        );
    }, [vagas, search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            {/* Mobile optimization: max-h-[95vh] and rounded-2xl to fit better */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh] md:max-h-[85vh]">

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white leading-tight">Selecionar Vagas</h3>
                            <p className="text-xs md:text-sm text-slate-500 font-medium">Escolha as vagas que deseja divulgar</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                        >
                            <X size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors md:w-5 md:h-5" />
                        <input
                            type="text"
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por cargo ou código..."
                            className="w-full bg-slate-50 dark:bg-slate-800 pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/50">
                    {filteredVagas.length > 0 ? (
                        filteredVagas.map(vaga => {
                            const isSelected = selectedVagaIds.includes(vaga.id);
                            const date = new Date(vaga.created_at).toLocaleDateString('pt-BR');

                            return (
                                <div
                                    key={vaga.id}
                                    onClick={() => onToggleVaga(vaga.id)}
                                    className={`group relative p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all border-2
                    ${isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 shadow-md shadow-blue-500/10'
                                            : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}`}
                                >
                                    <div className="flex items-start justify-between gap-3 md:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black text-slate-500 tracking-wider">
                                                    {vaga.jobCode}
                                                </span>
                                                <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${vaga.type === 'file' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                    {vaga.type === 'file' ? 'IMG' : 'TXT'}
                                                </span>
                                            </div>

                                            <h4 className={`text-sm md:text-base font-bold mb-0.5 md:mb-1 truncate ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {vaga.role}
                                            </h4>

                                            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                <span className="truncate max-w-[120px]">{vaga.companyName}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                                                <span>{date}</span>
                                            </div>
                                        </div>

                                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                      ${isSelected ? 'bg-blue-500 border-blue-500 scale-100 md:scale-110' : 'border-slate-200 dark:border-slate-700 group-hover:border-blue-300'}`}>
                                            {isSelected && <Check size={12} className="text-white md:w-3.5 md:h-3.5" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 md:py-12 text-slate-400">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Search size={20} className="md:w-6 md:h-6 opacity-50" />
                            </div>
                            <p className="font-bold text-sm md:text-base">Nenhuma vaga encontrada</p>
                            <p className="text-xs md:text-sm opacity-60">Tente buscar por outro termo</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300">
                            {selectedVagaIds.length} <span className="hidden sm:inline">selecionadas</span><span className="sm:hidden">selec.</span>
                        </span>
                        {selectedVagaIds.length > 0 && (
                            <button
                                onClick={onClearSelection}
                                className="text-[10px] md:text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                            >
                                Limpar
                            </button>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:px-8 md:py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        <span className="hidden sm:inline">Confirmar Seleção</span>
                        <span className="sm:hidden">Confirmar</span>
                    </button>
                </div>

            </div>
        </div>
    );
};
