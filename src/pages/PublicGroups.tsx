import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, Zap, MapPin, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type GroupType = 'CLT' | 'FREELANCE';

interface WhatsAppGroup {
    id: string;
    name_group: string;
    link_invite: string;
    description: string | null;
    image: string | null;
}

const WaIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

export const PublicGroups = () => {
    const [selectedType, setSelectedType] = useState<GroupType | null>(null);
    const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [citySearch, setCitySearch] = useState('');

    useEffect(() => {
        if (!selectedType) return;
        setLoading(true);
        setCitySearch('');

        // Filter by name_group containing the type keyword as a fallback
        // since the table doesn't have a dedicated type column yet
        const keyword = selectedType === 'CLT' ? 'CLT' : 'Freelance';

        supabase
            .from('whatsapp_groups')
            .select('id, name_group, link_invite, description, image')
            .or(`name_group.ilike.%${keyword}%,description.ilike.%${keyword}%`)
            .order('name_group', { ascending: true })
            .then(({ data }) => {
                setGroups((data as WhatsAppGroup[]) || []);
                setLoading(false);
            });
    }, [selectedType]);

    const filtered = groups.filter(g => {
        if (citySearch.trim() === '') return true;
        const search = citySearch.toLowerCase();
        return (
            g.name_group?.toLowerCase().includes(search) ||
            g.description?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-20">
            {/* Header */}
            <header className="h-20 bg-blue-950 fixed top-0 left-0 w-full z-50 px-6 md:px-12 flex items-center shadow-xl">
                <Link to="/" className="text-white hover:text-yellow-400 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft size={16} /> Voltar
                </Link>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Hero */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[#25D366] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 rotate-3">
                        <WaIcon size={36} color="white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-blue-950 mb-2">
                        Escolha a categoria
                    </h2>
                    <p className="text-slate-500">
                        Selecione o tipo de vaga para ver os grupos disponíveis.
                    </p>
                </div>

                {/* Type selector tabs */}
                <div className="flex gap-3 justify-center mb-10">
                    {(['CLT', 'FREELANCE'] as GroupType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all border-2 ${selectedType === type
                                ? type === 'CLT'
                                    ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20'
                                    : 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                                }`}
                        >
                            {type === 'CLT' ? <Briefcase size={18} /> : <Zap size={18} />}
                            {type === 'CLT' ? 'Vagas CLT' : 'Freelance & Bicos'}
                        </button>
                    ))}
                </div>

                {!selectedType && (
                    <div className="text-center py-16 text-slate-400">
                        <WaIcon size={48} color="#cbd5e1" />
                        <p className="mt-4 font-medium">Selecione uma categoria acima para ver os grupos.</p>
                    </div>
                )}

                {selectedType && (
                    <div>
                        {/* City / keyword search */}
                        <div className="relative mb-6 max-w-md mx-auto">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={citySearch}
                                onChange={e => setCitySearch(e.target.value)}
                                placeholder="Pesquisar cidade ou nome do grupo..."
                                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-slate-800 placeholder:text-slate-400 transition-all"
                            />
                            {citySearch && (
                                <button onClick={() => setCitySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-16 text-slate-400">
                                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <p className="font-medium">Carregando grupos...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <MapPin size={40} className="mx-auto mb-3 opacity-40" />
                                <p className="font-medium">
                                    {citySearch ? `Nenhum grupo encontrado para "${citySearch}".` : 'Nenhum grupo disponível no momento.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {filtered.map(group => (
                                    <div
                                        key={group.id}
                                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-green-400 hover:shadow-md hover:shadow-green-500/10 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-green-50 text-[#25D366] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                                {group.image ? (
                                                    <img src={group.image} alt={group.name_group} className="w-full h-full object-cover" />
                                                ) : (
                                                    <WaIcon size={20} color="#25D366" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-tight">{group.name_group}</p>
                                                {group.description && (
                                                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                                                        <MapPin size={11} /> {group.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={group.link_invite}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-3 shrink-0 px-4 py-2 bg-[#25D366] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#128C7E] transition-colors shadow-md shadow-green-500/20"
                                        >
                                            Entrar
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
