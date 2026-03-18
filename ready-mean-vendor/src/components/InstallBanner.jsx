import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallBanner() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem('vendor-install-dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      setDismissed(true);
    } else {
      localStorage.removeItem('vendor-install-dismissed');
    }
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('vendor-install-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) handleDismiss();
  };

  if (isInstalled || dismissed || (!isInstallable && !isIOS)) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/80 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center ring-1 ring-primary-100">
              <img src="/logo-transparent.png" alt="" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-surface-900 text-sm">Install Ready മീൻ Vendor</h3>
              <p className="text-xs text-surface-400 mt-0.5">
                {isIOS
                  ? 'Tap Share, then "Add to Home Screen"'
                  : 'Quick access from your home screen · ഹോം സ്ക്രീനിൽ ചേർക്കൂ'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors text-surface-300"
            >
              <X size={16} />
            </button>
          </div>

          {!isIOS && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 min-h-[44px] px-4 py-2 text-sm font-medium text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-xl transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 min-h-[44px] px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary-600/20 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
              >
                <Download size={16} />
                Install App
              </button>
            </div>
          )}

          {isIOS && (
            <div className="mt-3 space-y-2.5">
              <p className="text-[11px] text-surface-400 text-center font-medium">Follow these steps to install:</p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center ring-1 ring-primary-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06c6b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold text-surface-600">1. Tap Share</span>
                  <span className="text-[9px] text-surface-400">Bottom of Safari</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cdd4db" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center ring-1 ring-primary-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06c6b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold text-surface-600">2. Add to Home</span>
                  <span className="text-[9px] text-surface-400">Scroll in menu</span>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full min-h-[40px] text-xs font-medium text-surface-400 hover:text-surface-600 transition-colors"
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
