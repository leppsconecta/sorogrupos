import React, { useState, useMemo } from 'react';
import { X, CheckCircle, XCircle, Download, FileText, ZoomIn, ZoomOut, AlertCircle, Mail, Copy, ExternalLink, Phone, Briefcase, Plus, Search, MapPin, User, Calendar } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    resume_url: string;
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
    email?: string;
    phone?: string;
    age?: number;
    city?: string;
    state?: string;
    sex?: string;
    cargo_principal?: string;
    cargos_extras?: string[];
    [key: string]: any;
}

interface Job {
    id: string;
    title: string;
    code?: string;
}

interface ResumePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onStatusUpdate: (id: string, status: string) => void;
    availableJobs?: Job[];
    onLinkJob?: (candidateId: string, jobId: string) => Promise<void>;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ isOpen, onClose, candidate, onStatusUpdate, availableJobs = [], onLinkJob }) => {
    if (!isOpen || !candidate) return null;

    const [scale, setScale] = useState(1);
    const [activeModal, setActiveModal] = useState<'whatsapp' | 'email' | null>(null);
    const [copied, setCopied] = useState(false);
    const [selectedJob, setSelectedJob] = useState<string>('');
    const [jobSearch, setJobSearch] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLinkJob = async () => {
        if (!selectedJob || !onLinkJob) return;
        setIsLinking(true);
        try {
            await onLinkJob(candidate.id, selectedJob);
            setSelectedJob('');
            // Optional: Show success feedback here or close modal? User might want to keep viewing.
        } catch (error) {
            console.error("Error linking job", error);
        } finally {
            setIsLinking(false);
        }
    };

    const filteredJobs = useMemo(() => {
        if (!jobSearch) return availableJobs;
        const lower = jobSearch.toLowerCase();
        return availableJobs.filter(job =>
            job.title.toLowerCase().includes(lower) ||
            (job.code && job.code.toLowerCase().includes(lower))
        );
    }, [availableJobs, jobSearch]);

    const isImage = candidate.resume_url?.match(/\.(jpeg|jpg|png)($|\?)/i);
    const isPdf = candidate.resume_url?.match(/\.pdf($|\?)/i);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-scaleIn">

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-md text-white rounded-full lg:hidden"
                >
                    <X size={20} />
                </button>

                {/* LEFT SIDE: Resume Preview */}
                <div className="flex-1 lg:w-2/3 bg-slate-100 dark:bg-slate-950/50 relative flex flex-col h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
                    {/* Zoom Controls Overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10 transition-opacity hover:opacity-100 opacity-0 lg:opacity-100">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300"><ZoomOut size={16} /></button>
                        <span className="text-xs font-mono w-12 text-center text-slate-600 dark:text-slate-300 font-bold">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300"><ZoomIn size={16} /></button>
                    </div>

                    <div className="flex-1 overflow-auto flex items-start justify-center p-4 lg:p-8 custom-scrollbar">
                        {candidate.resume_url ? (
                            isImage ? (
                                <img
                                    src={candidate.resume_url}
                                    alt="Resume"
                                    className="max-w-none shadow-xl transition-all duration-200 rounded-sm"
                                    style={{ width: `${scale * 100}%`, height: 'auto', display: 'block' }}
                                />
                            ) : isPdf ? (
                                <iframe
                                    src={`${candidate.resume_url}#toolbar=0&navpanes=0&scrollbar=1`}
                                    className="w-full h-full shadow-xl bg-white rounded-sm"
                                    title="Resume PDF"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 mt-20 text-center">
                                    <FileText size={64} className="mb-4 opacity-50" />
                                    <p className="mb-4">Visualização não disponível para este formato.</p>
                                    <a href={candidate.resume_url} download className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center gap-2">
                                        <Download size={16} /> Baixar para visualizar
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

                {/* RIGHT SIDE: Info & Actions */}
                <div className="lg:w-1/3 bg-white dark:bg-slate-900 flex flex-col h-1/2 lg:h-full">

                    {/* Header / Summary */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                        <div>
                            <h2 className="font-bold text-xl text-slate-800 dark:text-white leading-tight">{candidate.name}</h2>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                {candidate.age && (
                                    <span className="flex items-center gap-1"><User size={14} /> {candidate.age} anos</span>
                                )}
                                {(candidate.city || candidate.state) && (
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {candidate.city}{candidate.state ? `/${candidate.state}` : ''}</span>
                                )}
                            </div>
                            {candidate.cargo_principal && (
                                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide">
                                    {candidate.cargo_principal}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hidden lg:block"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">

                        {/* Download Button */}
                        <a
                            href={candidate.resume_url}
                            download={`curriculo_${candidate.name.replace(/\s+/g, '_')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                            Baixar Currículo
                        </a>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

                        {/* Job Linking Section */}
                        {onLinkJob && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Briefcase size={14} className="text-blue-500" />
                                    Vincular a Vaga
                                </h3>

                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar vaga..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] transition-all"
                                        value={jobSearch}
                                        onChange={(e) => setJobSearch(e.target.value)}
                                    />
                                </div>

                                <div className="max-h-[200px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                                    {filteredJobs.length > 0 ? (
                                        <div className="space-y-1">
                                            {filteredJobs.map(job => (
                                                <button
                                                    key={job.id}
                                                    onClick={() => setSelectedJob(selectedJob === job.id ? '' : job.id)}
                                                    className={`w-full text-left p-2.5 rounded-md text-sm transition-all flex items-center justify-between group ${selectedJob === job.id
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                        }`}
                                                >
                                                    <span className="truncate pr-2 font-medium">
                                                        {job.code ? <span className="opacity-70 mr-1 text-xs">[{job.code}]</span> : ''}
                                                        {job.title}
                                                    </span>
                                                    {selectedJob === job.id && <CheckCircle size={14} className="shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-400">
                                            Nenhuma vaga encontrada.
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleLinkJob}
                                    disabled={!selectedJob || isLinking}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLinking ? 'Vinculando...' : <><Plus size={16} /> Vincular Candidato</>}
                                </button>
                            </div>
                        )}

                        <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                Contato
                            </h3>
                            {candidate.phone && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Phone size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">WhatsApp/Tel</span>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{candidate.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleCopy(candidate.phone || '')} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors" title="Copiar"><Copy size={14} /></button>
                                        <a href={`https://wa.me/${candidate.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-green-500 hover:text-green-600 transition-colors" title="Abrir WhatsApp"><ExternalLink size={14} /></a>
                                    </div>
                                </div>
                            )}
                            {candidate.email && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Mail size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Email</span>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]" title={candidate.email}>{candidate.email}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCopy(candidate.email || '')} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors" title="Copiar"><Copy size={14} /></button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Footer Actions (Sticky Bottom) */}
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex gap-2">
                        <button
                            onClick={() => { onStatusUpdate(candidate.id, 'rejected'); onClose(); }}
                            className="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <XCircle size={16} /> Rejeitar
                        </button>
                        <button
                            onClick={() => { onStatusUpdate(candidate.id, 'approved'); onClose(); }}
                            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <CheckCircle size={16} /> Aprovar
                        </button>
                    </div>

                </div>

            </div>

            {/* Copy Feedback Toast */}
            {copied && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm font-medium">Copiado para a área de transferência!</span>
                </div>
            )}
        </div>
    );
};
