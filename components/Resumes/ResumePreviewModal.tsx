import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Ban, Download, FileText, ChevronRight, ChevronLeft, ZoomIn, ZoomOut, AlertCircle, MessageCircle, Mail, Copy, ExternalLink, Phone } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    resume_url: string;
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
    email?: string;
    phone?: string;
    age?: number;
    city?: string;
    sex?: string;
    [key: string]: any;
}

interface ResumePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onStatusUpdate: (id: string, status: string) => void;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ isOpen, onClose, candidate, onStatusUpdate }) => {
    if (!isOpen || !candidate) return null;

    const [scale, setScale] = useState(1);
    const [activeModal, setActiveModal] = useState<'whatsapp' | 'email' | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isImage = candidate.resume_url?.match(/\.(jpeg|jpg|png)($|\?)/i);
    const isPdf = candidate.resume_url?.match(/\.pdf($|\?)/i);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{candidate.name}</h3>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                    {candidate.age && <span>{candidate.age} anos</span>}
                                    {candidate.sex && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{candidate.sex === 'male' ? 'Masculino' : candidate.sex === 'female' ? 'Feminino' : candidate.sex}</span>
                                        </>
                                    )}
                                    {candidate.city && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{candidate.city}</span>
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href={candidate.resume_url}
                            download={`curriculo_${candidate.name.replace(/\s+/g, '_')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Baixar Arquivo</span>
                        </a>

                        <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>

                        <div className="bg-slate-100 p-1 rounded-lg flex items-center mr-4">
                            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-500"><ZoomOut size={16} /></button>
                            <span className="text-xs font-mono w-12 text-center text-slate-500">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-500"><ZoomIn size={16} /></button>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-100 overflow-hidden relative flex flex-col">
                    <div className="flex-1 overflow-auto flex flex-col items-center p-8 custom-scrollbar">
                        {candidate.resume_url ? (
                            isImage ? (
                                <img
                                    src={candidate.resume_url}
                                    alt="Resume"
                                    className="max-w-none shadow-lg transition-all duration-200"
                                    style={{ width: `${scale * 100}%`, height: 'auto', display: 'block' }}
                                />
                            ) : isPdf ? (
                                <iframe
                                    src={`${candidate.resume_url}#toolbar=0&navpanes=0&scrollbar=1`}
                                    className="w-full max-w-4xl h-full shadow-lg bg-white"
                                    title="Resume PDF"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 mt-20">
                                    <FileText size={64} className="mb-4 opacity-50" />
                                    <p>Visualização não disponível para este formato.</p>
                                    <a href={candidate.resume_url} download className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold">
                                        Baixar para visualizar
                                    </a>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 mt-20">
                                <AlertCircle size={48} className="mb-2" />
                                <p>Nenhum currículo anexado.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
                    <div className="text-sm text-slate-500 font-medium">
                        Status atual: <span className="uppercase font-bold text-slate-700">
                            {candidate.status === 'pending' ? 'Pendente' :
                                candidate.status === 'approved' ? 'Aprovado' :
                                    candidate.status === 'rejected' ? 'Reprovado' :
                                        candidate.status}
                        </span>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex items-center gap-2">
                        {candidate.phone && (
                            <button
                                onClick={() => setActiveModal('whatsapp')}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-sm hover:shadow-green-500/30"
                                title="WhatsApp"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </button>
                        )}
                        {candidate.email && (
                            <button
                                onClick={() => setActiveModal('email')}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                                title="Enviar Email"
                            >
                                <Mail size={20} />
                            </button>
                        )}
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-2"></div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { onStatusUpdate(candidate.id, 'rejected'); onClose(); }}
                            className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <XCircle size={18} /> Rejeitar
                        </button>

                        <button
                            onClick={() => { onStatusUpdate(candidate.id, 'approved'); onClose(); }}
                            className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> Aprovar Candidato
                        </button>
                    </div>
                </div>
            </div>

            {/* Contact Action Modal */}
            {activeModal && (
                <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn" onClick={() => setActiveModal(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                {activeModal === 'whatsapp' ? (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="#25D366" className="w-6 h-6">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        WhatsApp
                                    </>
                                ) : (
                                    <>
                                        <Mail className="text-blue-500" />
                                        Email
                                    </>
                                )}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleCopy(
                                    activeModal === 'whatsapp' ? (candidate.phone || '') : (candidate.email || '')
                                )}
                                className="w-full flex flex-col p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left relative overflow-hidden"
                            >
                                <div className="w-full flex items-center justify-between">
                                    <span className="font-normal text-slate-600 text-sm group-hover:text-blue-700">
                                        {activeModal === 'whatsapp'
                                            ? `Copiar número (${candidate.phone})`
                                            : 'Copiar email'}
                                    </span>
                                    {copied ? <CheckCircle size={18} className="text-green-500 animate-in zoom-in spin-in" /> : <Copy size={18} className="text-slate-400 group-hover:text-blue-500" />}
                                </div>
                                {activeModal === 'email' && (
                                    <span className="text-sm text-slate-500 mt-1 break-all">
                                        {candidate.email}
                                    </span>
                                )}
                                {copied && (
                                    <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center text-green-600 font-bold backdrop-blur-sm transition-all animate-in fade-in">
                                        Copiado!
                                    </div>
                                )}
                            </button>

                            {activeModal === 'whatsapp' && (
                                <a
                                    href={`https://wa.me/${candidate.phone?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-500/20"
                                    onClick={() => setActiveModal(null)}
                                >
                                    <span className="font-bold">Chamar no WhatsApp</span>
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
