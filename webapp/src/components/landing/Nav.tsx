import { useState, useEffect, useRef } from 'react';
import { WordmarkSvg } from './WordmarkSvg';

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

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    if (reduceMotion.current) return;

    let raf = 0;
    let targetRx = 0;
    let targetRy = 0;
    let rx = 0;
    let ry = 0;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / Math.max(1, rect.width);
      const dy = (e.clientY - cy) / Math.max(1, rect.height);

      // Limited degrees: left/right + slight downward tilt only
      targetRy = clamp(dx * 10, -10, 10);
      targetRx = clamp(dy * 8, 0, 8);
    };

    const onLeave = () => {
      targetRx = 0;
      targetRy = 0;
    };

    const tick = () => {
      rx += (targetRx - rx) * 0.10;
      ry += (targetRy - ry) * 0.10;

      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener('pointermove', onMove, { passive: true } as any);
    el.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener('pointermove', onMove as any);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
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
        borderBottom: scrolled ? '1px solid rgba(202, 60, 61, 0.12)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group" aria-label="Sapien Eleven Platforms">
            <div
              ref={logoRef}
              className="relative flex items-center justify-center s11-logoMotion"
              style={{ width: 48, height: 48, willChange: 'transform' }}
            >
              {/* Subtle neutral glow (white/grey), no background circle */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
                  transform: 'scale(1.05)',
                }}
              />
              <img
                src="/brand/icon-red.png"
                alt=""
                className="object-contain relative"
                style={{
                  width: 46,
                  height: 46,
                  filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.09)) drop-shadow(0 0 12px rgba(255,0,41,0.20))',
                }}
              />
            </div>

            <WordmarkSvg className="hidden sm:block" height={15} />
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
              className="font-ui text-xs tracking-wider px-5 py-2 rounded transition-all duration-200"
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
            className="lg:hidden p-2"
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
