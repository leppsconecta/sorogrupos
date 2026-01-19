import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Ban, Download, FileText, ChevronRight, ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    resume_url: string;
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
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

    const isImage = candidate.resume_url?.match(/\.(jpeg|jpg|png)$/i);
    const isPdf = candidate.resume_url?.match(/\.pdf$/i);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{candidate.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Currículo</span>
                                <span className="text-slate-300">•</span>
                                <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                    <Download size={14} /> Baixar Arquivo
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                    <div className="flex-1 overflow-auto flex justify-center p-8 custom-scrollbar">
                        {candidate.resume_url ? (
                            isImage ? (
                                <img
                                    src={candidate.resume_url}
                                    alt="Resume"
                                    className="max-w-none shadow-lg transition-transform duration-200"
                                    style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
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
                        Status atual: <span className="uppercase font-bold text-slate-700">{candidate.status === 'pending' ? 'Pendente' : candidate.status}</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { onStatusUpdate(candidate.id, 'rejected'); onClose(); }}
                            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <XCircle size={18} /> Rejeitar
                        </button>
                        <button
                            onClick={() => { onStatusUpdate(candidate.id, 'blocked'); onClose(); }}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <Ban size={18} /> Bloquear
                        </button>
                        <button
                            onClick={() => { onStatusUpdate(candidate.id, 'approved'); onClose(); }}
                            className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> Aprovar Candidato
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
