import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallBanner() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if dismissed before — reset after 24 hours
    const dismissedAt = localStorage.getItem('install-banner-dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      setDismissed(true);
    } else {
      localStorage.removeItem('install-banner-dismissed');
    }
    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('install-banner-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) handleDismiss();
  };

  // Don't show if already installed, dismissed, or not installable (and not iOS)
  if (isInstalled || dismissed || (!isInstallable && !isIOS)) return null;

  return (
    <div className="fixed bottom-[5.5rem] md:bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-96 z-50 animate-fade-up">
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-900/15 border border-gray-100 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-primary-500 via-teal-500 to-primary-600" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <img src="/logo-transparent.png" alt="" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">Install Ready മീൻ</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isIOS
                  ? 'Tap the share button, then "Add to Home Screen"'
                  : 'Get quick access from your home screen'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          {!isIOS && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 min-h-[44px] px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 min-h-[44px] px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary-600/20 transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <Download size={16} />
                Install App
              </button>
            </div>
          )}

          {isIOS && (
            <div className="mt-3 space-y-2.5">
              <p className="text-xs text-gray-500 text-center">Follow these steps to install:</p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600">1. Tap Share</span>
                  <span className="text-[9px] text-gray-400">Bottom of Safari</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600">2. Add to Home</span>
                  <span className="text-[9px] text-gray-400">Scroll down in menu</span>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full min-h-[40px] text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
