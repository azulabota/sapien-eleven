export function Footer() {
  return (
    <footer
      className="relative py-12 px-6"
      style={{ borderTop: '1px solid rgba(160,160,160,0.07)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}>
            <defs>
              <linearGradient id="ftTopFace" x1="50" y1="12" x2="66" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#CA3C3D"/>
                <stop offset="100%" stopColor="#A82F30"/>
              </linearGradient>
              <linearGradient id="ftLeftFace" x1="34" y1="30" x2="34" y2="71" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6B1A1A"/>
                <stop offset="100%" stopColor="#3A1010"/>
              </linearGradient>
              <linearGradient id="ftRightFace" x1="66" y1="30" x2="66" y2="71" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3A0E0E"/>
                <stop offset="100%" stopColor="#1A0606"/>
              </linearGradient>
              <radialGradient id="ftBg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#140303"/>
                <stop offset="100%" stopColor="#080808"/>
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#ftBg)" rx="18"/>
            <polygon points="50,48 82,30 82,53 50,71" fill="url(#ftRightFace)"/>
            <polygon points="18,30 50,48 50,71 18,53" fill="url(#ftLeftFace)"/>
            <polygon points="50,12 82,30 50,48 18,30" fill="url(#ftTopFace)"/>
            <line x1="50" y1="12" x2="18" y2="30" stroke="#D94F50" strokeWidth="0.9" strokeOpacity="0.5" strokeLinecap="round"/>
          </svg>
          <span
            className="font-display text-xs tracking-widest"
            style={{ color: 'rgba(80,80,80,1)', letterSpacing: '0.15em' }}
          >
            SAPIEN ELEVEN PLATFORMS
          </span>
        </div>

        <p className="font-ui text-xs" style={{ color: 'rgba(60,60,60,1)', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} Sapien Eleven Platforms. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
