import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onControllerChange = () => setShow(true);
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);
    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
        <RefreshCw size={28} className="text-primary-600" />
      </div>
      <h2 className="text-lg font-bold text-surface-900 mb-2">Update Available</h2>
      <p className="text-sm text-surface-500 mb-6 max-w-xs">
        A new version of Ready Meen is available. Please update to continue using the app.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-primary-600 text-white rounded-2xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
      >
        Update Now
      </button>
    </div>
  );
}
