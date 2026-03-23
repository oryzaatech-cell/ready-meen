import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const configs = {
  success: {
    icon: <CheckCircle className="text-primary-500" size={20} />,
    border: 'border-l-primary-500',
    bg: 'bg-primary-50/30',
  },
  error: {
    icon: <AlertCircle className="text-red-500" size={20} />,
    border: 'border-l-red-500',
    bg: 'bg-red-50/30',
  },
};

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true);
  const config = configs[type] || configs.success;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 left-4 sm:left-auto sm:min-w-[320px] z-50 flex items-center gap-3 bg-white/95 backdrop-blur-xl border border-surface-100 border-l-4 ${config.border} shadow-elevated rounded-xl px-4 py-3.5 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
    >
      <div className={`p-1 rounded-lg ${config.bg}`}>{config.icon}</div>
      <span className="text-sm font-medium text-surface-800 flex-1">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded-lg transition-colors flex-shrink-0">
        <X size={16} className="text-surface-400" />
      </button>
    </div>
  );
}
