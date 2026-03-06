import { useEffect, useRef, useState } from 'react';

// Animated SVG showing disconnected clusters → connecting into central hub
function HeroGraphAnimation() {
  const [phase, setPhase] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('connecting'), 800);
    const t2 = setTimeout(() => setPhase('connected'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const clusters = [
    { label: 'Wearables', x: 80, y: 80, color: 'rgba(14,213,237,0.9)' },
    { label: 'Nutrition', x: 380, y: 60, color: 'rgba(14,213,237,0.9)' },
    { label: 'Workouts', x: 60, y: 240, color: 'rgba(14,213,237,0.9)' },
    { label: 'Sleep', x: 400, y: 250, color: 'rgba(14,213,237,0.9)' },
    { label: 'Mood', x: 220, y: 40, color: 'rgba(14,213,237,0.9)' },
    { label: 'Coach', x: 230, y: 280, color: 'rgba(14,213,237,0.9)' },
  ];

  const hubX = 230;
  const hubY = 162;

  const outputs = [
    { label: 'Nutrition', dx: 100, dy: -30 },
    { label: 'Fitness', dx: 110, dy: 10 },
    { label: 'Recovery', dx: 90, dy: 50 },
    { label: 'Mental Health', dx: 80, dy: 90 },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ height: 340 }}>
      <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Connection lines — animate in on connecting phase */}
        {clusters.map((c, i) => (
          <line
            key={`line-${i}`}
            x1={c.x}
            y1={c.y}
            x2={hubX}
            y2={hubY}
            stroke="rgba(14,213,237,0.35)"
            strokeWidth="0.8"
            strokeDasharray="4 3"
            style={{
              opacity: phase === 'disconnected' ? 0 : 1,
              transition: `opacity 0.4s ease ${i * 0.15}s`,
            }}
          />
        ))}

        {/* Output lines from hub */}
        {outputs.map((o, i) => (
          <line
            key={`out-${i}`}
            x1={hubX}
            y1={hubY}
            x2={hubX + o.dx}
            y2={hubY + o.dy}
            stroke="rgba(14,213,237,0.5)"
            strokeWidth="1"
            style={{
              opacity: phase === 'connected' ? 1 : 0,
              transition: `opacity 0.4s ease ${i * 0.1 + 0.2}s`,
            }}
          />
        ))}

        {/* Output labels */}
        {outputs.map((o, i) => (
          <g key={`outnode-${i}`} style={{ opacity: phase === 'connected' ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.1 + 0.4}s` }}>
            <rect
              x={hubX + o.dx + 2}
              y={hubY + o.dy - 9}
              width={62}
              height={16}
              rx="2"
              fill="rgba(14,213,237,0.08)"
              stroke="rgba(14,213,237,0.3)"
              strokeWidth="0.6"
            />
            <text
              x={hubX + o.dx + 5}
              y={hubY + o.dy + 2}
              fill="rgba(14,213,237,0.85)"
              fontSize="6.5"
              fontFamily="Orbitron, sans-serif"
              letterSpacing="0.8"
            >
              {o.label.toUpperCase()}
            </text>
          </g>
        ))}

        {/* Hub ring — outer */}
        <circle
          cx={hubX}
          cy={hubY}
          r="36"
          stroke="rgba(14,213,237,0.15)"
          strokeWidth="0.6"
          strokeDasharray="3 4"
          style={{
            opacity: phase !== 'disconnected' ? 1 : 0,
            transition: 'opacity 0.5s ease',
            animation: phase === 'connected' ? 'spin-slow 25s linear infinite' : 'none',
          }}
        />

        {/* Hub ring — inner */}
        <circle
          cx={hubX}
          cy={hubY}
          r="24"
          stroke="rgba(14,213,237,0.25)"
          strokeWidth="0.8"
          style={{
            opacity: phase !== 'disconnected' ? 1 : 0,
            transition: 'opacity 0.5s ease 0.2s',
          }}
        />

        {/* Hub core */}
        <circle
          cx={hubX}
          cy={hubY}
          r="14"
          fill="rgba(8,14,26,0.9)"
          stroke="rgba(14,213,237,0.7)"
          strokeWidth="1.5"
          style={{
            opacity: phase !== 'disconnected' ? 1 : 0,
            transition: 'opacity 0.5s ease 0.3s',
            filter: phase === 'connected' ? 'drop-shadow(0 0 12px rgba(14,213,237,0.8))' : 'none',
          }}
        />
        <circle
          cx={hubX}
          cy={hubY}
          r="5"
          fill="rgba(14,213,237,0.9)"
          style={{
            opacity: phase === 'connected' ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* Hub label */}
        <text
          x={hubX}
          y={hubY + 28}
          textAnchor="middle"
          fill="rgba(14,213,237,0.7)"
          fontSize="5.5"
          fontFamily="Orbitron, sans-serif"
          letterSpacing="0.6"
          style={{ opacity: phase !== 'disconnected' ? 1 : 0, transition: 'opacity 0.4s ease 0.5s' }}
        >
          AI + DATA LAYER
        </text>

        {/* Cluster nodes */}
        {clusters.map((c, i) => (
          <g key={`cluster-${i}`}>
            <circle
              cx={c.x}
              cy={c.y}
              r="6"
              fill="rgba(8,14,26,0.8)"
              stroke={c.color}
              strokeWidth="1"
              style={{
                filter: `drop-shadow(0 0 4px ${c.color})`,
                animation: 'broken-pulse 3s ease-in-out infinite',
                animationDelay: `${i * 0.4}s`,
              }}
            />
            <circle cx={c.x} cy={c.y} r="2.5" fill={c.color} />
            {/* Sub-nodes */}
            <circle cx={c.x - 14} cy={c.y + 12} r="2.5" fill="rgba(14,213,237,0.3)" />
            <circle cx={c.x + 14} cy={c.y + 8} r="2" fill="rgba(14,213,237,0.25)" />
            <line x1={c.x} y1={c.y} x2={c.x - 14} y2={c.y + 12} stroke="rgba(14,213,237,0.2)" strokeWidth="0.6" />
            <line x1={c.x} y1={c.y} x2={c.x + 14} y2={c.y + 8} stroke="rgba(14,213,237,0.2)" strokeWidth="0.6" />

            <text
              x={c.x}
              y={c.y - 12}
              textAnchor="middle"
              fill="rgba(14,213,237,0.5)"
              fontSize="6"
              fontFamily="Orbitron, sans-serif"
              letterSpacing="0.5"
            >
              {c.label.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Staggered entry
    const els = sectionRef.current?.querySelectorAll('.hero-reveal');
    els?.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 0.12 + 0.2}s`;
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.animation = `fade-in-up 0.8s ease forwards`;
    });
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-32 px-6"
    >
      {/* Radial glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(14,213,237,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="space-y-8">
          <div>
            <p className="section-label hero-reveal mb-5">Sapien Eleven Platforms</p>
            <h1
              className="hero-reveal font-display font-bold leading-none"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', color: 'hsl(210 20% 95%)' }}
            >
              Your health.{' '}
              <span
                className="text-glow"
                style={{ color: 'hsl(191 100% 60%)' }}
              >
                Connected.
              </span>
            </h1>
          </div>

          <p
            className="hero-reveal font-body text-lg leading-relaxed max-w-xl"
            style={{ color: 'hsl(220 15% 60%)' }}
          >
            Sapien Eleven connects nutrition, fitness, mental health, and biometrics
            into a single AI system that cross-references every signal — so your
            guidance improves as your data grows.
          </p>

          <div className="hero-reveal flex flex-wrap gap-4">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Sign up for updates
            </button>
            <button
              className="btn-ghost"
              onClick={() => document.getElementById('data-layer')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See the Data Layer
            </button>
          </div>

          {/* Stats row */}
          <div className="hero-reveal flex flex-wrap gap-8 pt-4" style={{ borderTop: '1px solid rgba(14,213,237,0.08)' }}>
            {[
              { label: 'Data Sources', value: '6+' },
              { label: 'AI Domains', value: '4' },
              { label: 'Integrated', value: '1 Layer' },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: 'hsl(191 100% 60%)' }}
                >
                  {s.value}
                </p>
                <p className="font-ui text-xs tracking-wider mt-1" style={{ color: 'hsl(220 15% 45%)' }}>
                  {s.label.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: animated graph */}
        <div className="hero-reveal">
          <HeroGraphAnimation />
        </div>
      </div>
    </section>
  );
}
