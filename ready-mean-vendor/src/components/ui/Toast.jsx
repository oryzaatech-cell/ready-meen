import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-emerald-500" size={20} />,
  error: <AlertCircle className="text-red-500" size={20} />,
};

const borderColors = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
};

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 left-4 sm:left-auto sm:min-w-[320px] z-50 flex items-center gap-3 bg-white border border-gray-100 border-l-4 ${borderColors[type]} shadow-xl rounded-xl px-4 py-3.5 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-gray-800 flex-1">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
        <X size={16} className="text-gray-400" />
      </button>
    </div>
  );
}
