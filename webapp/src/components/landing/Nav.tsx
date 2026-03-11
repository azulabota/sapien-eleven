import { useState, useEffect, useRef } from 'react';
import { WordmarkSvg } from './WordmarkSvg';
import NavLogo3D from './NavLogo3D';

export function Nav() {
  const logoRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reduceMotion.current = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Logo interaction is handled inside <NavLogo3D />.

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
        borderBottom: scrolled ? '1px solid rgba(202, 60, 61, 0.12)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group" aria-label="Sapien Eleven Platforms">
            <div
              ref={logoRef}
              className="relative flex items-center justify-center s11-logoMotion"
              style={{ width: 32, height: 32, willChange: 'transform' }}
            >
              {/* 3D logo (no glow/spotlight behind it) */}
              <NavLogo3D />
            </div>

            <WordmarkSvg className="hidden sm:block" height={12} />
          </a>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <span
              className="font-ui text-xs tracking-wider"
              style={{ color: 'rgba(160,160,160,0.7)', letterSpacing: '0.1em' }}
            >
              Mobile App Coming Soon!
            </span>
            <button
              className="font-ui text-xs tracking-wider px-4 py-1.5 rounded transition-all duration-200"
              style={{
                color: 'rgba(220,220,220,0.9)',
                border: '1px solid rgba(202,60,61,0.7)',
                background: 'transparent',
                letterSpacing: '0.1em',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(202,60,61,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = '#CA3C3D';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(202,60,61,0.7)';
              }}
              onClick={handleCTA}
            >
              Become a Beta Tester
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1.5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className="block h-px w-5 transition-all" style={{ background: menuOpen ? 'rgba(202,60,61,0.9)' : 'rgba(200,200,200,0.7)', transform: menuOpen ? 'rotate(45deg) translateY(4px)' : '' }} />
              <span className="block h-px w-5 transition-all" style={{ background: menuOpen ? 'rgba(202,60,61,0.9)' : 'rgba(200,200,200,0.7)', opacity: menuOpen ? 0 : 1 }} />
              <span className="block h-px w-5 transition-all" style={{ background: menuOpen ? 'rgba(202,60,61,0.9)' : 'rgba(200,200,200,0.7)', transform: menuOpen ? 'rotate(-45deg) translateY(-4px)' : '' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden px-6 pb-6 pt-2 space-y-4"
          style={{ background: 'rgba(8,8,8,0.97)', borderBottom: '1px solid rgba(202,60,61,0.12)' }}
        >
          <button className="btn-primary w-full mt-4" onClick={handleCTA}>
            Become a Beta Tester
          </button>
        </div>
      )}
    </nav>
  );
}
