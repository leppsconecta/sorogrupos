import React from 'react';
import { ImageIcon, Edit2, Check } from 'lucide-react';

interface WhatsAppPreviewCardProps {
    type: 'file' | 'text' | 'scratch';
    imageUrl?: string;
    attachedFile?: File | null;
    previewText: string;
    onEmojiClick: () => void;
    showEmojiButton?: boolean;
}

export const WhatsAppPreviewCard: React.FC<WhatsAppPreviewCardProps> = ({
    type,
    imageUrl,
    attachedFile,
    previewText,
    onEmojiClick,
    showEmojiButton = true
}) => {
    return (
        <div className="space-y-6">
            <div
                className="bg-[#F0F2F5] dark:bg-[#0b141a] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-900 shadow-inner relative min-h-[400px]"
                style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >

                <div className="bg-white dark:bg-[#202c33] p-1.5 rounded-lg rounded-tl-none shadow-sm max-w-[330px] mx-auto mt-8 border border-slate-100 dark:border-slate-700 relative scale-[0.85] sm:scale-100 origin-top">
                    {/* Triangle Tail */}
                    <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -left-2 text-white dark:text-[#202c33] fill-current"><path opacity="0.13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path><path d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path></svg>

                    {/* Content */}
                    {type === 'file' ? (
                        <div className="space-y-1">
                            {(attachedFile || imageUrl) ? (
                                <div className="rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 relative shadow-sm">
                                    <img
                                        src={attachedFile ? URL.createObjectURL(attachedFile) : imageUrl}
                                        alt="Vaga"
                                        className="w-full h-auto object-cover max-h-[300px]"
                                    />
                                </div>
                            ) : (
                                <div className="h-32 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 border border-dashed border-slate-300 dark:border-slate-700">
                                    <ImageIcon size={24} className="opacity-50 mb-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Sem Imagem</span>
                                </div>
                            )}

                            <div className="px-1.5 pb-1 pt-1">
                                <div className="text-[14.2px] text-slate-800 dark:text-slate-200 leading-[1.3] whitespace-pre-wrap font-sans">
                                    {previewText.split('\n').map((line, i) => (
                                        <div key={i} className="flex items-start flex-wrap gap-1 min-h-[20px]">
                                            {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                                part.startsWith('*') && part.endsWith('*') ? (
                                                    <strong key={j} className="font-bold">{part.slice(1, -1)}</strong>
                                                ) : (
                                                    <span key={j}>{part}</span>
                                                )
                                            ))}
                                            {i === 0 && showEmojiButton && (
                                                <button
                                                    onClick={onEmojiClick}
                                                    className="ml-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all hover:scale-105 active:scale-95 flex items-center gap-1 flex-shrink-0"
                                                >
                                                    <Edit2 size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-1 gap-1 items-center opacity-60 float-right relative -bottom-0.5">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <Check size={14} className="text-blue-500" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-1.5 pb-1 pt-1">
                            <div className="text-[14.2px] text-slate-800 dark:text-slate-200 leading-[1.3] whitespace-pre-wrap font-sans">
                                {previewText.split('\n').map((line, i) => (
                                    <div key={i} className="flex items-start flex-wrap gap-1 min-h-[20px]">
                                        {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                            part.startsWith('*') && part.endsWith('*') ? (
                                                <strong key={j} className="font-bold">{part.slice(1, -1)}</strong>
                                            ) : (
                                                <span key={j}>{part}</span>
                                            )
                                        ))}
                                        {i === 0 && showEmojiButton && (
                                            <button
                                                onClick={onEmojiClick}
                                                className="ml-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all hover:scale-105 active:scale-95 flex items-center gap-1 flex-shrink-0"
                                            >
                                                <Edit2 size={10} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-1 gap-1 items-center opacity-60 float-right relative -bottom-0.5">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <Check size={14} className="text-blue-500" />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
