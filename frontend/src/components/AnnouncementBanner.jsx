import React from 'react';
import { Link } from 'react-router-dom';

import sylitheLogo from '../assets/treee13.png';

/**
 * Site-wide notification banner.
 * The entire strip is clickable and points at whatever we're currently launching.
 */
export default function AnnouncementBanner() {
  return (
    <Link
      to="/signup"
      className="group block w-full bg-[#08292f] text-white hover:bg-[#062125] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3 text-center flex-wrap">
        <span className="banner-blink shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F8F5E4] text-[#3B2F2A] text-[10px] font-extrabold tracking-[0.06em] uppercase pl-1 pr-2 py-0.5">
          <img
            src={sylitheLogo}
            alt=""
            aria-hidden="true"
            className="banner-mark h-3.5 w-3.5 shrink-0 object-contain"
          />
          New
        </span>
        <span className="text-xs sm:text-sm font-medium leading-snug">
          Start your ARR, Biochar or REDD+ project with Sylithe | Satellite dMRV from baseline to audit-ready evidence
        </span>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F8F5E4] text-[#3B2F2A] text-[10px] font-extrabold tracking-[0.06em] uppercase px-2 py-0.5 group-hover:gap-2 transition-all">
          Get started
          <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* Own keyframe name: the footer defines its own sylSpin at a different speed. */}
      <style>{`
        @keyframes bannerMarkSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes bannerBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.45; }
        }
        .banner-mark  { animation: bannerMarkSpin 14s linear infinite; }
        .banner-blink { animation: bannerBlink 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .banner-mark, .banner-blink { animation: none; }
        }
      `}</style>
    </Link>
  );
}
