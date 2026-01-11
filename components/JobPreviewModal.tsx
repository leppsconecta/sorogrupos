import React, { useState } from 'react';
import { ArrowLeft, Check, ImageIcon } from 'lucide-react';
import { Vaga, Company } from '../types';

interface JobPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: Vaga | null;
    companyName?: string;
    previewEmojis?: string;
    onEmojiChange?: (emojis: string) => void;
}

export const JobPreviewModal: React.FC<JobPreviewModalProps> = ({
    isOpen,
    onClose,
    job,
    companyName = 'Sorogrupos',
    previewEmojis = '🟡🔴🔵'
}) => {
    if (!isOpen || !job) return null;

    const generatePreviewText = (j: Vaga) => {
        const code = j.jobCode || '---';

        const channelStrings: string[] = [];

        j.contacts?.forEach(c => {
            if (!c.value?.trim()) return;

            if (c.type === 'WhatsApp') {
                channelStrings.push(`WhatsApp ${c.value}`);
            } else if (c.type === 'Email') {
                channelStrings.push(`e-mail ${c.value}`);
            } else if (c.type === 'Link') {
                channelStrings.push(`Link ${c.value}`);
            } else if (c.type === 'Endereço') {
                let addr = `${c.value}`;
                // Note: Using simple format effectively here to avoid dependency on external helpers
                if (!c.noDateTime) {
                    const d = c.date;
                    const t = c.time;
                    if (d && t) {
                        addr += ` no dia ${d.split('-').reverse().join('/')} às ${t}`;
                    }
                }
                channelStrings.push(addr);
            }
        });

        const joinChannels = (list: string[]) => {
            if (list.length === 0) return '';
            if (list.length === 1) return list[0];
            const last = list.pop();
            return `${list.join(', ')} ou ${last}`;
        };

        const channelsText = joinChannels(channelStrings);
        const interessadosText = channelsText
            ? (j.type === 'file' ? channelsText : `Enviar curriculo com o nome da vaga/codigo para: ${channelsText}`)
            : 'Entre em contato pelos canais oficiais.';

        if (j.type === 'file') {
            const observationText = j.showObservation && j.observation ? `\nObs: ${j.observation}\n` : '';
            return `*${companyName}* ${previewEmojis}
-----------------------------
Função: *${j.role || j.title || ''}*
Cód. Vaga: *${code}*
-----------------------------${observationText}
*Interessados*
 ${interessadosText}`;
        }

        // Text job
        return `*${companyName}* ${previewEmojis}
-----------------------------
Função: *${j.role || j.title || ''}*
Cód. Vaga: *${code}*
-----------------------------  
*Vínculo:* ${j.bond || 'CLT'}
*Empresa:* ${j.hideCompany ? '(Oculto)' : j.companyName || ''}
*Cidade/Bairro:* ${j.city || ''} - ${j.region || ''}
*Requisitos:* ${j.requirements || ''}
*Benefícios:* ${j.benefits || ''}
*Atividades:* ${j.activities || ''}

*Interessados*
 ${interessadosText}
----------------------------- 

*Mais informações:*
➞ ${companyName}
➞ 11946610753
➞ sorogrupos.com.br`;
    };

    const previewText = generatePreviewText(job);

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#F0F2F5] dark:bg-[#0b141a] w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-scaleUp">

                {/* WhatsApp Header Mock */}
                <div className="bg-[#008069] dark:bg-[#202c33] h-16 px-4 flex items-center justify-between shadow-sm relative z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-white">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-white/10">
                            <img src="https://ui-avatars.com/api/?name=Sorogrupos&background=random" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm leading-tight line-clamp-1">{companyName}</span>
                            <span className="text-white/80 text-[10px] truncate max-w-[120px]">Verificado</span>
                        </div>
                    </div>
                    <div className="flex gap-4 text-white opacity-80">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>

                {/* Message Area */}
                <div className="p-4 pt-6 relative min-h-[400px] max-h-[80vh] overflow-y-auto custom-scrollbar" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    <div className="flex justify-center mb-4">
                        <span className="bg-[#FFF5C4] dark:bg-[#202c33] text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg shadow-sm font-medium uppercase tracking-wide">
                            Visualização da Vaga
                        </span>
                    </div>

                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-[#202c33] p-3 rounded-lg rounded-tl-none shadow-sm max-w-[95%] relative w-full">
                            {/* Triangle Tail */}
                            <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -left-2 text-white dark:text-[#202c33] fill-current"><path opacity="0.13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path><path d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path></svg>

                            {/* Content */}
                            <div className="space-y-2">
                                {job.type === 'file' && (
                                    job.imageUrl ? (
                                        <div className="rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 mb-2 relative">
                                            <img
                                                src={job.imageUrl}
                                                alt="Vaga"
                                                className="w-full h-auto object-contain max-h-[400px]"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-40 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 mb-2">
                                            <ImageIcon size={32} className="opacity-50 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">Sem Imagem</span>
                                        </div>
                                    )
                                )}

                                <div className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug whitespace-pre-wrap">
                                    {previewText.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line.split(/(\*[^*]+\*)/g).map((part, j) => (
                                                part.startsWith('*') && part.endsWith('*') ? (
                                                    <strong key={j}>{part.slice(1, -1)}</strong>
                                                ) : (
                                                    <span key={j}>{part}</span>
                                                )
                                            ))}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end mt-1 gap-1 items-center opacity-60">
                                <span className="text-[10px] text-slate-500 font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <Check size={14} className="text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
