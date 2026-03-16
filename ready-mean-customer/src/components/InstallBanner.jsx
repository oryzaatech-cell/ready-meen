import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallBanner() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    if (localStorage.getItem('install-banner-dismissed')) {
      setDismissed(true);
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
    <div className="fixed bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-96 z-50 animate-fade-up">
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
            <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <Smartphone size={16} className="text-primary-600 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                Tap <span className="font-semibold">Share</span> → <span className="font-semibold">Add to Home Screen</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
