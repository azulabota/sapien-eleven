import { useEffect, useRef, useState } from 'react';

function HexLogoAnimated() {
  const [phase, setPhase] = useState<'idle' | 'pulse'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase('pulse'), 600);
    return () => clearTimeout(t);
  }, []);

  // Small orbiting particles around the hex logo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const particles: { angle: number; radius: number; speed: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 18; i++) {
      particles.push({
        angle: (Math.PI * 2 * i) / 18 + Math.random() * 0.5,
        radius: 120 + Math.random() * 60,
        speed: (0.004 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1),
        size: 1 + Math.random() * 2,
        opacity: 0.15 + Math.random() * 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw orbital rings
      ctx.beginPath();
      ctx.arc(cx, cy, 148, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(202,60,61,0.06)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 178, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160,160,160,0.04)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Draw particles
      for (const p of particles) {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;

        const isRed = Math.abs(p.speed) > 0.007;
        const col = isRed ? `rgba(202,60,61,${p.opacity})` : `rgba(160,160,160,${p.opacity})`;

        // Glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
        grad.addColorStop(0, isRed ? `rgba(202,60,61,${p.opacity * 0.4})` : `rgba(160,160,160,${p.opacity * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }

      // Thin connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pA = particles[i];
          const pB = particles[j];
          const ax = cx + Math.cos(pA.angle) * pA.radius;
          const ay = cy + Math.sin(pA.angle) * pA.radius;
          const bx = cx + Math.cos(pB.angle) * pB.radius;
          const by = cy + Math.sin(pB.angle) * pB.radius;
          const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(160,160,160,${0.04 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 360, height: 360 }}>
      {/* Particle orbit canvas */}
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Hex S logo */}
      <div
        style={{
          position: 'relative',
          transition: 'filter 0.8s ease',
          filter: phase === 'pulse'
            ? 'drop-shadow(0 0 40px rgba(202,60,61,0.55)) drop-shadow(0 0 80px rgba(202,60,61,0.2))'
            : 'drop-shadow(0 0 12px rgba(202,60,61,0.3))',
        }}
      >
        <svg width="200" height="220" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hexTop" x1="100" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#CA3C3D"/>
              <stop offset="100%" stopColor="#8B1A1A"/>
            </linearGradient>
            <linearGradient id="hexBottom" x1="100" y1="110" x2="100" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7A1515"/>
              <stop offset="100%" stopColor="#CA3C3D"/>
            </linearGradient>
            <linearGradient id="sGrad" x1="60" y1="60" x2="140" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1a0505"/>
              <stop offset="100%" stopColor="#0d0202"/>
            </linearGradient>
          </defs>

          {/* Outer hexagon */}
          <polygon
            points="100,4 186,52 186,148 100,196 14,148 14,52"
            fill="url(#hexTop)"
          />

          {/* Inner dark hex cutout offset for 3D depth */}
          <polygon
            points="100,18 172,60 172,144 100,182 28,144 28,60"
            fill="#0d0202"
          />

          {/* S shape — built from two arcs/rectangles to mimic the brand S */}
          {/* Top arc of S */}
          <path
            d="M 78,72 C 78,60 88,54 100,54 C 116,54 128,62 128,76 C 128,88 118,95 104,100 L 96,104 C 80,110 70,118 70,134 C 70,150 82,160 100,160 C 118,160 132,150 132,136"
            stroke="#CA3C3D"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Top bar */}
          <line x1="78" y1="72" x2="128" y2="72" stroke="#CA3C3D" strokeWidth="14" strokeLinecap="round"/>
          {/* Bottom bar */}
          <line x1="68" y1="148" x2="130" y2="148" stroke="#CA3C3D" strokeWidth="14" strokeLinecap="round"/>

          {/* Shine overlay */}
          <polygon
            points="100,4 186,52 143,52 80,20 56,34 14,52 100,4"
            fill="rgba(255,255,255,0.07)"
          />
        </svg>
      </div>

      {/* Pulsing ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          border: '1px solid rgba(202,60,61,0.15)',
          animation: 'glow-pulse 3s ease-in-out infinite',
        }}
      />
    </div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.hero-reveal');
    els?.forEach((el, i) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.animation = `fade-in-up 0.9s ease forwards`;
      (el as HTMLElement).style.animationDelay = `${i * 0.15 + 0.1}s`;
    });
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center"
      style={{ paddingTop: '7rem', paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
    >
      {/* Subtle red glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(202,60,61,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

        {/* Left: headline + copy */}
        <div className="space-y-8">
          {/* Main title */}
          <div className="space-y-2">
            <h1 className="hero-reveal font-display font-black leading-none" style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)' }}>
              <span style={{ color: '#CA3C3D', display: 'block' }}>SAPIEN ELEVEN</span>
              <span style={{ color: 'rgba(245,245,245,0.95)', display: 'block', fontWeight: 300, fontSize: 'clamp(2.8rem, 7vw, 5.6rem)' }}>Platforms</span>
            </h1>
          </div>

          {/* Tagline */}
          <p
            className="hero-reveal font-body leading-relaxed max-w-lg"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(155,155,155,1)' }}
          >
            The Decentralized Health Economy built to unify your data,
            reward prevention, and return control of health to the individual.
          </p>

          {/* CTA buttons */}
          <div className="hero-reveal flex flex-wrap gap-4">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Become a Beta Tester
            </button>
            <button
              className="btn-ghost"
              onClick={() => document.getElementById('data-layer')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See the Data Layer
            </button>
          </div>

          {/* Stats strip */}
          <div
            className="hero-reveal flex flex-wrap gap-10 pt-6"
            style={{ borderTop: '1px solid rgba(160,160,160,0.08)' }}
          >
            {[
              { value: '6+', label: 'Data Sources' },
              { value: '4', label: 'AI Domains' },
              { value: '1', label: 'Unified Layer' },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="font-display font-bold"
                  style={{ fontSize: '1.75rem', color: '#CA3C3D', lineHeight: 1 }}
                >
                  {s.value}
                </p>
                <p
                  className="font-ui text-xs tracking-widest mt-1"
                  style={{ color: 'rgba(100,100,100,1)', letterSpacing: '0.12em' }}
                >
                  {s.label.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: animated hex logo with orbiting nodes */}
        <div className="hero-reveal flex items-center justify-center lg:justify-end">
          <HexLogoAnimated />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2"
        style={{ transform: 'translateX(-50%)', animation: 'fade-in-up 1s ease forwards 1.4s', opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, transparent, rgba(202,60,61,0.5))' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(202,60,61,0.6)' }} />
        </div>
      </div>
    </section>
  );
}
