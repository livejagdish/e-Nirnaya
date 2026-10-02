import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  lang?: 'ne' | 'en';
}

export const PWAInstallButton: React.FC<Props> = ({ lang = 'ne' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone PWA mode, show subtle badge or hide
  if (isInstalled) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>{lang === 'ne' ? 'PWA सक्रिय' : 'PWA Installed'}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all cursor-pointer"
        title="Install Progressive Web App"
      >
        <Download className="w-4 h-4 text-slate-950" />
        <span>{lang === 'ne' ? 'एप स्थापना गर्नुहोस् (Install PWA)' : 'Install App (PWA)'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{lang === 'ne' ? 'iPhone मा राख्नुहोस्' : 'Install on iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 font-bold">
                  🇳🇵
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ne' ? 'iPhone / iPad मा स्थापना' : 'Install on iOS Device'}
                  </h3>
                  <p className="text-xs text-slate-400">e-Nirnaya Progressive Web App</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span>
                    {lang === 'ne' 
                      ? 'सफारी (Safari) ब्राउजरको तल्लो भागमा रहेको शेयर (Share) बटन थिच्नुहोस्।' 
                      : 'Tap the Share icon at the bottom of Safari.'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span>
                    {lang === 'ne' 
                      ? 'सूचीमा तल सरेर "Add to Home Screen" (गृह स्क्रिनमा थप्नुहोस्) मा ट्याप गर्नुहोस्।' 
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <span>
                    {lang === 'ne' 
                      ? 'माथि दायाँ "Add" थिच्नुहोस्। एप सिधै गृह स्क्रिनबाट अफलाइन पनि चल्नेछ।' 
                      : 'Tap Add in the top right. The app will launch like a native application with offline support!'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                {lang === 'ne' ? 'बुझें (बन्द गर्नुहोस्)' : 'Got it (Close)'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / standard button (shows manual guide or ready state)
  return (
    <button
      onClick={() => {
        alert(lang === 'ne' 
          ? 'यो एप PWA प्रमाणित छ। तपाईं आफ्नो ब्राउजरको ठेगाना बार (URL bar) मा रहेको इन्स्टल आइकन वा मेनु (⋮) बाट "Install e-Nirnaya App" छनौट गरी स्थापना गर्न सक्नुहुन्छ।' 
          : 'This app is PWA ready! You can install it directly by clicking the Install icon in your browser address bar or menu.');
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
      title="PWA Ready"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>{lang === 'ne' ? 'एप स्थापना' : 'Install PWA'}</span>
    </button>
  );
};
