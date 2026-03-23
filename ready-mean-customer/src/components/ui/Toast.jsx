import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-green-500" size={20} />,
  error: <AlertCircle className="text-red-500" size={20} />,
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
      className={`fixed top-4 right-4 left-4 sm:left-auto sm:min-w-[300px] z-50 flex items-center gap-3 bg-white border shadow-lg rounded-xl px-4 py-3 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
    >
      {icons[type]}
      <span className="text-sm text-gray-800">{message}</span>
      <button onClick={onClose} className="p-0.5 hover:bg-gray-100 rounded">
        <X size={16} />
      </button>
    </div>
  );
}
