import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Save, Image as ImageIcon } from 'lucide-react';

interface LogoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    onSave: (croppedBlob: Blob) => void;
}

const LogoUploadModal: React.FC<LogoUploadModalProps> = ({ isOpen, onClose, imageFile, onSave }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setImageSrc(url);
            setScale(1);
            setPosition({ x: 0, y: 0 });
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        if (!imageRef.current || !containerRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Output size (e.g., 400x400 for good quality)
        const OUTPUT_SIZE = 400;
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;

        // Draw background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        const img = imageRef.current;
        const container = containerRef.current; // 256px

        // Calculate ratios
        const ratio = OUTPUT_SIZE / container.clientWidth;

        // Draw image transformed
        // We need to map the visible container area to the canvas
        // The image is translated by 'position' and scaled by 'scale' relative to top-left of container (conceptually)
        // Actually, CSS transform origin is center usually, but here default is 50% 50%? No, default is center? 
        // Let's rely on standard flow. If I use `transform: translate(...) scale(...)` I need to match that logic.
        // Simplest logic:
        // dx = position.x
        // dy = position.y
        // dWidth = img.naturalWidth * (scale * (container.width / img.width? No))
        // Let's look at how CSS renders it.
        // It's probably easier to just assume the user sees what they see.

        // Let's calibrate:
        // We rendered the image with `w-full` inside container? No, `max-w-none`.
        // To make this robust without a library:
        // 1. Determine render width/height of image on screen (after scale).
        // 2. Determine offset (x, y).

        // renderWidth = img.width * scale (where img.width is the CSS rendered width before scale)
        // If image is just `max-w-none` and natural size? 
        // Let's force image to match container width initially?

        // Re-render strategy for consistency:
        // Force image width to match container width (or height to match container height) to start "fit".
        // Then apply transforms.

        // Let's assume image fits width initially.
        const renderedWidth = img.width * scale;
        const renderedHeight = img.height * scale;

        // Map to canvas
        ctx.drawImage(
            img,
            position.x * ratio,
            position.y * ratio,
            renderedWidth * ratio,
            renderedHeight * ratio
        );

        canvas.toBlob((blob) => {
            if (blob) onSave(blob);
        }, 'image/jpeg', 0.95);
    };

    if (!isOpen || !imageFile) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ImageIcon size={20} className="text-indigo-600" />
                        Ajustar Logo
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        Arraste e zoom para ajustar. A área branca será preenchida.
                    </p>

                    {/* Viewport */}
                    <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-xl overflow-hidden shadow-inner border-2 border-dashed border-gray-300">
                        {/* Container ref for dimensions */}
                        <div
                            ref={containerRef}
                            className="w-full h-full relative cursor-move touch-none bg-white"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                        >
                            {imageSrc && (
                                <img
                                    ref={imageRef}
                                    src={imageSrc}
                                    alt="Preview"
                                    draggable={false}
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                        transformOrigin: 'top left', // IMPORTANT for simple x/y mapping
                                        maxWidth: 'none',
                                        // Initial fit logic
                                        width: '100%', // Start fitting width
                                        // height: 'auto'
                                    }}
                                    className="select-none pointer-events-none"
                                />
                            )}
                        </div>

                        {/* Overlay grid (optional) */}
                        <div className="absolute inset-0 pointer-events-none border border-white/20"></div>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/20"></div>
                        <div className="absolute left-1/2 top-0 w-px h-full bg-white/20"></div>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomOut size={16} className="text-gray-400" />
                            <input
                                type="range"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="flex-1 accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <ZoomIn size={16} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Salvar Logo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoUploadModal;
