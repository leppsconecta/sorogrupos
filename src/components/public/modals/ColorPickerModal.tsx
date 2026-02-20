import React, { useState, useEffect } from 'react';
import { X, Check, Save } from 'lucide-react';

interface ColorPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialColor?: string;
    onSave: (color: string) => void;
}

const PRESET_COLORS = [
    { name: 'Ardósia', value: '#1e293b' },
    { name: 'Azul', value: '#2563eb' },
    { name: 'Índigo', value: '#4f46e5' },
    { name: 'Violeta', value: '#7c3aed' },
    { name: 'Rosa', value: '#db2777' },
    { name: 'Vermelho', value: '#dc2626' },
    { name: 'Laranja', value: '#ea580c' },
    { name: 'Âmbar', value: '#d97706' },
    { name: 'Verde', value: '#16a34a' },
    { name: 'Verde-azulado', value: '#0d9488' },
    { name: 'Ciano', value: '#0891b2' },
    { name: 'Preto', value: '#000000' }
];

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
    isOpen,
    onClose,
    initialColor = '#1e293b',
    onSave
}) => {
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [customColor, setCustomColor] = useState(initialColor);

    useEffect(() => {
        if (isOpen) {
            setSelectedColor(initialColor);
            setCustomColor(initialColor);
        }
    }, [isOpen, initialColor]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(selectedColor);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Escolher Cor da Marca</h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Preview */}
                        <div
                            className="h-24 rounded-2xl w-full shadow-inner flex items-center justify-center transition-colors duration-300"
                            style={{ backgroundColor: selectedColor }}
                        >
                            <span className="bg-white/20 backdrop-blur-md text-white font-mono text-sm px-3 py-1 rounded-full font-bold shadow-sm border border-white/20">
                                {selectedColor}
                            </span>
                        </div>

                        {/* Presets */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Cores Padrão</label>
                            <div className="grid grid-cols-6 gap-3">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => {
                                            setSelectedColor(color.value);
                                            setCustomColor(color.value);
                                        }}
                                        className={`w-10 h-10 rounded-full shadow-sm transition-all hover:scale-110 flex items-center justify-center relative ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        {selectedColor === color.value && <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Cor Personalizada</label>
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => {
                                        setCustomColor(e.target.value);
                                        setSelectedColor(e.target.value);
                                    }}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">Seletor de Cores</p>
                                    <p className="text-xs text-slate-500">Escolha qualquer cor hexadecimal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Salvar Cor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPickerModal;
