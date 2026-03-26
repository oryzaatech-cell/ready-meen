import { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageZoom({ src, alt, className = '' }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-pointer`}
        onClick={() => { setOpen(true); setZoom(1); }}
        draggable={false}
      />

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X size={22} />
          </button>

          <img
            src={src}
            alt={alt}
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-xl transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
            <button
              onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(1, z - 0.5)); }}
              disabled={zoom <= 1}
              className="p-1.5 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-white text-sm font-medium min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.5)); }}
              disabled={zoom >= 3}
              className="p-1.5 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
