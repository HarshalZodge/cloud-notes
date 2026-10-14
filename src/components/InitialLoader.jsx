import React, { useEffect, useState } from 'react';

export function InitialLoader({ onComplete }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // 700ms splash then fade out
    const timer = setTimeout(() => {
      setFadingOut(true);
    }, 700);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 950);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`initial-loader-overlay ${fadingOut ? 'fade-out' : ''}`}>
      <div className="initial-loader-content">
        <div className="loader-logo-wrap">
          <svg viewBox="0 0 48 48" className="loader-logo-svg">
            <defs>
              <linearGradient id="loadGrad" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8"/>
                <stop offset="100%" stopColor="#2563EB"/>
              </linearGradient>
            </defs>
            <path d="M14 36H35C39.4183 36 43 32.4183 43 28C43 23.8291 39.7997 20.4074 35.7061 20.0402C34.7212 13.7317 29.2882 9 22.7 9C15.4206 9 9.47953 14.6186 9.02534 21.7828C5.64157 22.8465 3.2 25.9868 3.2 29.7C3.2 33.7317 6.46832 36 10.5 36H14Z" fill="url(#loadGrad)"/>
            <rect x="18" y="17" width="16" height="20" rx="3" fill="#FFFFFF" fillOpacity="0.95"/>
            <line x1="22" y1="22" x2="30" y2="22" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
            <line x1="22" y1="26" x2="28" y2="26" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
            <line x1="22" y1="30" x2="26" y2="30" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="loader-title">CloudNotes</div>
        <div className="loader-tagline">Write. Sync. Anywhere.</div>

        <div className="loader-progress-track">
          <div className="loader-progress-bar" />
        </div>
      </div>
    </div>
  );
}
