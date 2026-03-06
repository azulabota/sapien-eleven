import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Problem', href: '#problem' },
  { label: 'Coaching', href: '#coaching' },
  { label: 'Nutrition', href: '#nutrition' },
  { label: 'Fitness', href: '#fitness' },
  { label: 'Mental Health', href: '#mental-health' },
  { label: 'Data Layer', href: '#data-layer' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = () => {
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8, 8, 8, 0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(220, 40, 40, 0.1)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* 3D cube mark — matches favicon */}
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 6px rgba(220,40,40,0.5))' }}>
                <defs>
                  <linearGradient id="navTopFace" x1="50" y1="12" x2="66" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF2828"/>
                    <stop offset="100%" stopColor="#CC1A1A"/>
                  </linearGradient>
                  <linearGradient id="navLeftFace" x1="34" y1="30" x2="34" y2="71" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#A81212"/>
                    <stop offset="100%" stopColor="#6B0808"/>
                  </linearGradient>
                  <linearGradient id="navRightFace" x1="66" y1="30" x2="66" y2="71" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6B0808"/>
                    <stop offset="100%" stopColor="#2E0303"/>
                  </linearGradient>
                  <linearGradient id="navShine" x1="30" y1="14" x2="55" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28"/>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                  </linearGradient>
                  <radialGradient id="navBg" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#1a0404"/>
                    <stop offset="100%" stopColor="#080808"/>
                  </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#navBg)" rx="18"/>
                <polygon points="50,48 82,30 82,53 50,71" fill="url(#navRightFace)"/>
                <polygon points="18,30 50,48 50,71 18,53" fill="url(#navLeftFace)"/>
                <polygon points="50,12 82,30 50,48 18,30" fill="url(#navTopFace)"/>
                <polygon points="50,12 82,30 50,48 18,30" fill="url(#navShine)"/>
                <line x1="50" y1="12" x2="18" y2="30" stroke="#FF7070" strokeWidth="0.9" strokeOpacity="0.65" strokeLinecap="round"/>
                <line x1="50" y1="12" x2="82" y2="30" stroke="#FF4444" strokeWidth="0.6" strokeOpacity="0.4" strokeLinecap="round"/>
                <line x1="50" y1="48" x2="50" y2="71" stroke="#880808" strokeWidth="0.7" strokeOpacity="0.9" strokeLinecap="round"/>
                <line x1="18" y1="30" x2="18" y2="53" stroke="#881010" strokeWidth="0.6" strokeOpacity="0.5" strokeLinecap="round"/>
                <line x1="82" y1="30" x2="82" y2="53" stroke="#440404" strokeWidth="0.6" strokeOpacity="0.4" strokeLinecap="round"/>
                <line x1="18" y1="53" x2="50" y2="71" stroke="#6B0808" strokeWidth="0.6" strokeOpacity="0.5" strokeLinecap="round"/>
                <line x1="82" y1="53" x2="50" y2="71" stroke="#330303" strokeWidth="0.6" strokeOpacity="0.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span
                className="font-display text-sm font-700 tracking-widest"
                style={{ color: 'rgba(220,40,40,0.9)', letterSpacing: '0.12em' }}
              >
                SAPIEN
              </span>
              <span
                className="font-display text-sm font-400 tracking-widest ml-1"
                style={{ color: 'rgba(200,200,200,0.7)', letterSpacing: '0.12em' }}
              >
                ELEVEN
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-ui text-xs tracking-widest uppercase transition-colors duration-200"
                style={{ color: 'rgba(130,130,130,1)', letterSpacing: '0.14em' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'rgba(220,200,200,1)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'rgba(130,130,130,1)'; }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:block">
            <button className="btn-primary" onClick={handleCTA}>
              Get Early Access
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className="block h-px w-5 transition-all" style={{ background: menuOpen ? 'rgba(220,40,40,0.9)' : 'rgba(200,200,200,0.7)', transform: menuOpen ? 'rotate(45deg) translateY(4px)' : '' }} />
              <span className="block h-px w-5 transition-all" style={{ background: menuOpen ? 'rgba(220,40,40,0.9)' : 'rgba(200,200,200,0.7)', opacity: menuOpen ? 0 : 1 }} />
              <span className="block h-px w-5 transition-all" style={{ background: menuOpen ? 'rgba(220,40,40,0.9)' : 'rgba(200,200,200,0.7)', transform: menuOpen ? 'rotate(-45deg) translateY(-4px)' : '' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden px-6 pb-6 pt-2 space-y-4"
          style={{ background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid rgba(220,40,40,0.12)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block font-ui text-xs tracking-widest uppercase py-2"
              style={{ color: 'rgba(130,130,130,1)', letterSpacing: '0.14em' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button className="btn-primary w-full mt-4" onClick={handleCTA}>
            Get Early Access
          </button>
        </div>
      )}
    </nav>
  );
}
