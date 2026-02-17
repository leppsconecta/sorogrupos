import React from 'react';
import { X, FileText } from 'lucide-react';

interface NoteViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: string;
    candidateName: string;
    onSave: (note: string) => void;
}

export const NoteViewModal: React.FC<NoteViewModalProps> = ({
    isOpen,
    onClose,
    note,
    candidateName,
    onSave
}) => {
    const [currentNote, setCurrentNote] = React.useState(note);

    React.useEffect(() => {
        setCurrentNote(note);
    }, [note]);

    const handleSave = () => {
        onSave(currentNote);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-blue-50 dark:bg-blue-900/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Nota Interna</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">{candidateName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            className="w-full h-40 bg-transparent resize-none focus:outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400"
                            placeholder="Adicione uma nota interna..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Sair
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 transition-all"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};
