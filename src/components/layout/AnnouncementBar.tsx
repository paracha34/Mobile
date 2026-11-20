import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const announcements = [
    '⚡ FLASH TECH SALE: UP TO 35% OFF ON FLAGSHIP SMARTPHONES, AUDIO & WEARABLES',
    '🚚 FREE EXPRESS INSURED DELIVERY ACROSS PAKISTAN ON ORDERS OVER PKR 100,000',
    '🛡️ 100% GENUINE PTA APPROVED STOCK WITH 7-DAY EASY REPLACEMENT WARRANTY',
    '✨ NEW ARRIVALS: TITANIUM SMARTWATCHES & ACTIVE NOISE CANCELING HEADPHONES LIVE',
    '💬 NEED RECOMMENDATIONS? ASK OUR LIVE AI TECH ADVISOR FOR INSTANT HELP',
  ];

  const fullText = announcements.join('   •   ') + '   •   ';

  return (
    <div
      className="relative z-50 w-full bg-gradient-to-r from-emerald-950 via-[#064e3b] to-teal-950 border-b border-emerald-500/30 text-emerald-200 text-[11px] sm:text-xs font-semibold py-1.5 overflow-hidden shadow-inner select-none"
      role="region"
      aria-label="Store Announcement"
    >
      <div className="flex items-center">
        {/* Fixed subtle badge on the left for context */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 bg-emerald-900/90 border-r border-emerald-500/30 text-emerald-300 font-extrabold text-[10px] tracking-wider uppercase shrink-0 z-10 shadow-sm">
          <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
          <span>Updates</span>
        </div>

        {/* Infinite Marquee Track */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee-track whitespace-nowrap cursor-default">
            <span className="inline-block px-4 tracking-wide">
              {fullText}
            </span>
            <span className="inline-block px-4 tracking-wide" aria-hidden="true">
              {fullText}
            </span>
          </div>
        </div>

        {/* Ambient emerald neon glow indicators */}
        <div className="hidden md:flex items-center gap-1.5 px-3 text-[10px] font-bold text-emerald-300 shrink-0 z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Deals</span>
        </div>
      </div>
    </div>
  );
};
