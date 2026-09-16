import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UIcon } from '../Common/UIcon';

interface ProfileCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileType: string;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
}

export const ProfileCropModal: React.FC<ProfileCropModalProps> = ({
  isOpen,
  imageSrc,
  fileType,
  onClose,
  onSave,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Reset transform when new image opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImgLoaded(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = () => {
    if (!imageRef.current) return;
    const { naturalWidth, naturalHeight } = imageRef.current;
    setImgNaturalSize({ width: naturalWidth, height: naturalHeight });
    setImgLoaded(true);
  };

  // Mouse & Touch Pan Handling
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Update live preview canvas
  const renderCroppedPreview = useCallback(() => {
    const previewCanvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!previewCanvas || !img || !imgLoaded) return;

    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const CROP_BOX_SIZE = 240; // viewport square size in px
    const OUTPUT_SIZE = 256; // output avatar resolution

    previewCanvas.width = OUTPUT_SIZE;
    previewCanvas.height = OUTPUT_SIZE;

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Calculate source rect
    // Image is rendered centered inside CROP_BOX_SIZE container with CSS transform:
    // scale(scale) and translate(position.x, position.y)
    const baseW = imgNaturalSize.width;
    const baseH = imgNaturalSize.height;
    if (baseW === 0 || baseH === 0) return;

    // Determine how CSS 'object-contain' or fit fits inside 240x240
    const fitRatio = Math.max(CROP_BOX_SIZE / baseW, CROP_BOX_SIZE / baseH);
    const displayedW = baseW * fitRatio * scale;
    const displayedH = baseH * fitRatio * scale;

    const centerX = CROP_BOX_SIZE / 2 + position.x;
    const centerY = CROP_BOX_SIZE / 2 + position.y;

    const imgLeftInBox = centerX - displayedW / 2;
    const imgTopInBox = centerY - displayedH / 2;

    // Draw to canvas scaled to OUTPUT_SIZE
    const canvasScale = OUTPUT_SIZE / CROP_BOX_SIZE;
    
    ctx.save();
    ctx.scale(canvasScale, canvasScale);
    ctx.drawImage(img, imgLeftInBox, imgTopInBox, displayedW, displayedH);
    ctx.restore();
  }, [imgLoaded, imgNaturalSize, scale, position]);

  useEffect(() => {
    if (isOpen && imgLoaded) {
      renderCroppedPreview();
    }
  }, [isOpen, imgLoaded, scale, position, renderCroppedPreview]);

  if (!isOpen || !imageSrc) return null;

  const handleSaveCrop = () => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    // Enforce PNG or JPEG format
    const isPng = fileType.includes('png');
    const mimeType = isPng ? 'image/png' : 'image/jpeg';
    const quality = isPng ? undefined : 0.92;
    const croppedUrl = previewCanvas.toDataURL(mimeType, quality);
    onSave(croppedUrl);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = 0.08;
    if (e.deltaY < 0) {
      setScale(prev => Math.min(3, prev + zoomStep));
    } else {
      setScale(prev => Math.max(0.6, prev - zoomStep));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-[#111111]">
              Crop Profile Picture
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag to position &bull; PNG, JPG, JPEG formats
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F7F6F3] hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition cursor-pointer"
            title="Cancel"
          >
            <UIcon name="cross" className="text-xs" />
          </button>
        </div>

        {/* Crop Viewport with Circular Mask */}
        <div className="flex flex-col items-center">
          <div 
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={e => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={e => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={e => {
              if (e.touches[0]) {
                handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={e => {
              if (e.touches[0]) {
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handlePointerUp}
            className="relative w-[240px] h-[240px] bg-slate-900 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none border-2 border-slate-300 shadow-inner flex items-center justify-center"
          >
            {/* Underlying Scaled & Panned Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                maxWidth: 'none',
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />

            {/* Circular Mask & Target Guidelines */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 240 240">
                <defs>
                  <mask id="crop-circle-mask">
                    <rect width="240" height="240" fill="white" />
                    <circle cx="120" cy="120" r="105" fill="black" />
                  </mask>
                </defs>
                {/* Dark Dimmed Outer Area */}
                <rect 
                  width="240" 
                  height="240" 
                  fill="rgba(0, 0, 0, 0.55)" 
                  mask="url(#crop-circle-mask)" 
                />
                {/* Target Circle Border */}
                <circle 
                  cx="120" 
                  cy="120" 
                  r="105" 
                  fill="none" 
                  stroke="#F6AF31" 
                  strokeWidth="2" 
                  strokeDasharray="4 3" 
                />
              </svg>
            </div>

            {/* Subtitle helper */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-medium pointer-events-none">
              Drag to Reposition
            </div>
          </div>

          {/* Hidden Canvas used for cropping calculations */}
          <canvas ref={previewCanvasRef} className="hidden" width={256} height={256} />
        </div>

        {/* Zoom Controls & Position Reset */}
        <div className="space-y-3 bg-[#F7F6F3] p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#111111]/70 flex items-center gap-1.5 text-[11px]">
              <UIcon name="zoom-in" className="text-xs text-[#111111]" />
              Zoom Scale
            </span>
            <span className="font-mono font-bold text-xs text-[#111111]">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScale(prev => Math.max(0.6, prev - 0.15))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <input
              type="range"
              min="0.6"
              max="3"
              step="0.05"
              value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-[#111111] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setScale(prev => Math.min(3, prev + 0.15))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-[#111111] transition cursor-pointer"
              title="Reset Zoom & Pan"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (imageSrc) {
                  onSave(imageSrc);
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
              title="Use original image directly without cropping"
            >
              Skip Cropping
            </button>

            <button
              type="button"
              onClick={handleSaveCrop}
              className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-black text-[#F6AF31] text-xs font-extrabold shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <UIcon name="check" className="text-xs" />
              <span>Crop & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
