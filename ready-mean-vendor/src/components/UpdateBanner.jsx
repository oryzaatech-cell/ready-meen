import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Listen for new service worker taking control
    const onControllerChange = () => setShow(true);
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);
    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] bg-teal-600 text-white text-center py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold animate-slide-down"
      style={{ paddingTop: 'calc(0.375rem + env(safe-area-inset-top, 0px))' }}
    >
      <RefreshCw size={13} />
      New version available
      <button
        onClick={() => window.location.reload()}
        className="ml-2 bg-white text-teal-700 px-2.5 py-0.5 rounded-full text-xs font-bold hover:bg-teal-50 transition-colors"
      >
        Update
      </button>
    </div>
  );
}
