import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="btn-futuristic-primary flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-900/30 hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-900/50 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] p-6 shadow-2xl text-left animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Install Gadget Zone</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Install this app on your iPhone or iPad home screen for instant full-screen browsing and offline deals:
              </p>
              <div className="space-y-3 bg-[#12121a] p-3.5 rounded-xl border border-[#2a2a3e] text-xs text-gray-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-purple-400" /> <strong>Share</strong> button in Safari toolbar.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
