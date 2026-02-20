import React from 'react';
import { X, ArrowRight, MessageCircle } from 'lucide-react';

interface InactiveJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRedirect: () => void;
}

const InactiveJobModal: React.FC<InactiveJobModalProps> = ({ isOpen, onClose, onRedirect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn ring-1 ring-slate-100">

                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={32} />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                        Processo Seletivo Encerrado
                    </h2>

                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Esta vaga já foi preenchida ou o processo seletivo foi encerrado.
                        Mas não desanime! Temos muitas outras oportunidades esperando por você em nossos grupos exclusivos.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={onRedirect}
                            className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold tracking-wide shadow-lg shadow-green-500/20 hover:bg-[#128C7E] hover:transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            Ver Vagas no WhatsApp <ArrowRight size={16} />
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm"
                        >
                            Fechar
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default InactiveJobModal;
