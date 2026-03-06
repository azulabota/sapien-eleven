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
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full opacity-15 group-hover:opacity-30 transition-opacity"
                style={{ background: 'rgba(220,40,40,1)' }}
              />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="3" fill="rgba(220,40,40,0.9)" />
                <circle cx="3" cy="3" r="1.5" fill="rgba(160,160,160,0.5)" />
                <circle cx="15" cy="3" r="1.5" fill="rgba(160,160,160,0.5)" />
                <circle cx="3" cy="15" r="1.5" fill="rgba(160,160,160,0.5)" />
                <circle cx="15" cy="15" r="1.5" fill="rgba(160,160,160,0.5)" />
                <line x1="9" y1="9" x2="3" y2="3" stroke="rgba(160,160,160,0.3)" strokeWidth="0.8" />
                <line x1="9" y1="9" x2="15" y2="3" stroke="rgba(160,160,160,0.3)" strokeWidth="0.8" />
                <line x1="9" y1="9" x2="3" y2="15" stroke="rgba(160,160,160,0.3)" strokeWidth="0.8" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="rgba(160,160,160,0.3)" strokeWidth="0.8" />
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
