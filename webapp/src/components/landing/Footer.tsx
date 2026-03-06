export function Footer() {
  return (
    <footer
      className="relative py-12 px-6"
      style={{ borderTop: '1px solid rgba(160,160,160,0.07)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="3" fill="rgba(220,40,40,0.85)" />
            <circle cx="3" cy="3" r="1.5" fill="rgba(160,160,160,0.35)" />
            <circle cx="15" cy="3" r="1.5" fill="rgba(160,160,160,0.35)" />
            <circle cx="3" cy="15" r="1.5" fill="rgba(160,160,160,0.35)" />
            <circle cx="15" cy="15" r="1.5" fill="rgba(160,160,160,0.35)" />
            <line x1="9" y1="9" x2="3" y2="3" stroke="rgba(160,160,160,0.2)" strokeWidth="0.7" />
            <line x1="9" y1="9" x2="15" y2="3" stroke="rgba(160,160,160,0.2)" strokeWidth="0.7" />
            <line x1="9" y1="9" x2="3" y2="15" stroke="rgba(160,160,160,0.2)" strokeWidth="0.7" />
            <line x1="9" y1="9" x2="15" y2="15" stroke="rgba(160,160,160,0.2)" strokeWidth="0.7" />
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
