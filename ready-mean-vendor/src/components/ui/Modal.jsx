import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="fixed inset-0 bg-surface-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto overscroll-contain pl-safe pr-safe animate-slide-up">
        <div className="sticky top-0 glass flex items-center justify-between p-4 border-b border-surface-100 rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-surface-900">{title}</h3>
          <button onClick={onClose} className="p-2 -mr-1 rounded-xl hover:bg-surface-100 active:bg-surface-200 transition-colors">
            <X size={20} className="text-surface-400" />
          </button>
        </div>
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      </div>
    </div>
  );
}
