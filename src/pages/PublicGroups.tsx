import React, { useState } from 'react';
import { ArrowLeft, Briefcase, Zap, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicGroups = () => {
    const [selectedGroupType, setSelectedGroupType] = useState<'CLT' | 'FREELANCE' | null>(null);

    // Mock Groups Data (To be replaced by DB or Config if needed)
    const groupsCLT = [
        { name: 'Vagas Sorocaba Oficial', location: 'Sorocaba e Região', link: '#' },
        { name: 'Vagas Itu e Salto', location: 'Itu e Região', link: '#' },
        { name: 'Empregos Araçoiaba', location: 'Araçoiaba e Região', link: '#' },
        { name: 'Votorantim Vagas', location: 'Votorantim e Região', link: '#' },
    ];

    const groupsFreelance = [
        { name: 'Bicos & Freelance Sorocaba', location: 'Sorocaba e Região', link: '#' },
        { name: 'Freelance SP Interior', location: 'Interior de SP', link: '#' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-20">
            {/* Header */}
            <header className="h-20 bg-blue-950 fixed top-0 left-0 w-full z-50 px-6 md:px-12 flex items-center shadow-xl">
                <Link to="/" className="text-white hover:text-yellow-400 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft size={16} /> Voltar
                </Link>
                <div className="flex-1 flex justify-center">
                    <h1 className="text-xl font-bold text-white">Grupos de WhatsApp</h1>
                </div>
                <div className="w-16"></div> {/* Spacer for centering */}
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#25D366] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 rotate-3">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    </div>
                    <p className="text-slate-500 max-w-2xl mx-auto">Selecione uma categoria para ver os grupos disponíveis.</p>
                </div>

                {!selectedGroupType ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        <button
                            onClick={() => setSelectedGroupType('CLT')}
                            className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/10 transition-all text-left overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[2.5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                            <div className="p-4 bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center text-green-600 mb-6 relative z-10 group-hover:scale-110 transition-transform">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-blue-950 mb-2 relative z-10">Vagas CLT</h3>
                            <p className="text-slate-500 relative z-10">Oportunidades com registro em carteira, benefícios e estabilidade.</p>
                            <div className="mt-8 flex items-center gap-2 text-green-600 font-bold uppercase text-sm tracking-wider group-hover:gap-4 transition-all">
                                Ver Grupos <ArrowRight size={18} />
                            </div>
                        </button>

                        <button
                            onClick={() => setSelectedGroupType('FREELANCE')}
                            className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/10 transition-all text-left overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-[2.5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                            <div className="p-4 bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center text-yellow-600 mb-6 relative z-10 group-hover:scale-110 transition-transform">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-blue-950 mb-2 relative z-10">Freelance e Bicos</h3>
                            <p className="text-slate-500 relative z-10">Trabalhos temporários, diárias e oportunidades autônomas.</p>
                            <div className="mt-8 flex items-center gap-2 text-yellow-600 font-bold uppercase text-sm tracking-wider group-hover:gap-4 transition-all">
                                Ver Grupos <ArrowRight size={18} />
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                        <button onClick={() => setSelectedGroupType(null)} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-950 transition-colors font-medium">
                            <ArrowLeft size={20} /> Voltar para categorias
                        </button>

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`p-4 rounded-2xl ${selectedGroupType === 'CLT' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {selectedGroupType === 'CLT' ? <Briefcase size={32} /> : <Zap size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-blue-950">
                                        {selectedGroupType === 'CLT' ? 'Grupos de Vagas CLT' : 'Grupos de Freelance & Bicos'}
                                    </h3>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                                        {selectedGroupType === 'CLT' ? 'Selecione sua região' : 'Encontre oportunidades rápidas'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {(selectedGroupType === 'CLT' ? groupsCLT : groupsFreelance).map((group, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-green-400 hover:bg-green-50/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white shadow-sm text-[#25D366] rounded-full flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{group.name}</p>
                                                <div className="flex items-center gap-1 text-slate-400 text-xs">
                                                    <MapPin size={12} /> {group.location}
                                                </div>
                                            </div>
                                        </div>
                                        <a href={group.link} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20">
                                            Entrar
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
