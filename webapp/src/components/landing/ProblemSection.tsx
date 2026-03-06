import { useEffect, useRef } from 'react';

export function BrokenGraph() {
  return (
    <div className="relative w-full max-w-lg mx-auto" style={{ height: 280 }}>
      <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Cluster 1: Wearables */}
        <g style={{ animation: 'float-node 5s ease-in-out infinite' }}>
          <line x1="60" y1="60" x2="80" y2="90" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="80" y1="90" x2="50" y2="110" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <circle cx="60" cy="60" r="4" fill="rgba(160,160,160,0.45)" />
          <circle cx="80" cy="90" r="5" fill="rgba(160,160,160,0.35)" />
          <circle cx="50" cy="110" r="3" fill="rgba(160,160,160,0.3)" />
          <text x="58" y="130" fill="rgba(140,140,140,0.5)" fontSize="7" fontFamily="Orbitron, sans-serif" letterSpacing="1">WEARABLES</text>
        </g>

        {/* Cluster 2: Nutrition */}
        <g style={{ animation: 'float-node 6s ease-in-out infinite', animationDelay: '-2s' }}>
          <line x1="360" y1="50" x2="400" y2="80" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="400" y1="80" x2="370" y2="100" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <circle cx="360" cy="50" r="3" fill="rgba(160,160,160,0.45)" />
          <circle cx="400" cy="80" r="5" fill="rgba(160,160,160,0.35)" />
          <circle cx="370" cy="100" r="3.5" fill="rgba(160,160,160,0.3)" />
          <text x="350" y="118" fill="rgba(140,140,140,0.5)" fontSize="7" fontFamily="Orbitron, sans-serif" letterSpacing="1">NUTRITION</text>
        </g>

        {/* Cluster 3: Workouts */}
        <g style={{ animation: 'float-node 7s ease-in-out infinite', animationDelay: '-1s' }}>
          <line x1="80" y1="190" x2="110" y2="220" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="110" y1="220" x2="70" y2="240" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <circle cx="80" cy="190" r="4.5" fill="rgba(160,160,160,0.45)" />
          <circle cx="110" cy="220" r="3.5" fill="rgba(160,160,160,0.35)" />
          <circle cx="70" cy="240" r="3" fill="rgba(160,160,160,0.3)" />
          <text x="65" y="258" fill="rgba(140,140,140,0.5)" fontSize="7" fontFamily="Orbitron, sans-serif" letterSpacing="1">WORKOUTS</text>
        </g>

        {/* Cluster 4: Sleep */}
        <g style={{ animation: 'float-node 4.5s ease-in-out infinite', animationDelay: '-3s' }}>
          <line x1="350" y1="180" x2="390" y2="210" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="390" y1="210" x2="360" y2="240" stroke="rgba(160,160,160,0.2)" strokeWidth="0.8" strokeDasharray="3 4" />
          <circle cx="350" cy="180" r="4" fill="rgba(160,160,160,0.45)" />
          <circle cx="390" cy="210" r="5" fill="rgba(160,160,160,0.35)" />
          <circle cx="360" cy="240" r="3.5" fill="rgba(160,160,160,0.3)" />
          <text x="348" y="258" fill="rgba(140,140,140,0.5)" fontSize="7" fontFamily="Orbitron, sans-serif" letterSpacing="1">SLEEP</text>
        </g>

        {/* Cluster 5: Mood */}
        <g style={{ animation: 'float-node 5.5s ease-in-out infinite', animationDelay: '-0.5s' }}>
          <circle cx="240" cy="140" r="5.5" fill="rgba(160,160,160,0.3)" />
          <circle cx="220" cy="160" r="3" fill="rgba(160,160,160,0.22)" />
          <circle cx="260" cy="155" r="3.5" fill="rgba(160,160,160,0.22)" />
          <text x="220" y="178" fill="rgba(140,140,140,0.4)" fontSize="7" fontFamily="Orbitron, sans-serif" letterSpacing="1">MOOD</text>
        </g>

        {/* Broken connection indicators — red severed lines */}
        <line x1="100" y1="80" x2="160" y2="120" stroke="rgba(220,40,40,0.25)" strokeWidth="0.8" strokeDasharray="2 6" />
        <line x1="340" y1="80" x2="280" y2="120" stroke="rgba(220,40,40,0.25)" strokeWidth="0.8" strokeDasharray="2 6" />
        <line x1="120" y1="200" x2="200" y2="160" stroke="rgba(220,40,40,0.25)" strokeWidth="0.8" strokeDasharray="2 6" />
        <line x1="340" y1="200" x2="270" y2="160" stroke="rgba(220,40,40,0.25)" strokeWidth="0.8" strokeDasharray="2 6" />

        {/* X marks on broken connections */}
        <text x="136" y="106" fill="rgba(220,40,40,0.5)" fontSize="8">✕</text>
        <text x="305" y="106" fill="rgba(220,40,40,0.5)" fontSize="8">✕</text>
        <text x="157" y="183" fill="rgba(220,40,40,0.5)" fontSize="8">✕</text>
        <text x="302" y="183" fill="rgba(220,40,40,0.5)" fontSize="8">✕</text>
      </svg>
    </div>
  );
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120);
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const problems = [
    "Your fitness app doesn't know you barely slept.",
    "Your nutrition tracker doesn't know your cortisol is elevated.",
    "Your coach doesn't have your biometric data.",
    "Your wearable data doesn't inform your meal plan.",
  ];

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-24 px-6"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(220,40,40,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: visual */}
        <div className="reveal order-2 lg:order-1">
          <BrokenGraph />
          <p
            className="text-center mt-4 font-ui text-xs tracking-widest"
            style={{ color: 'rgba(220,40,40,0.5)', letterSpacing: '0.2em' }}
          >
            DISCONNECTED • SILOED • INCOMPLETE
          </p>
        </div>

        {/* Right: copy */}
        <div className="order-1 lg:order-2 space-y-8">
          <div className="reveal">
            <p className="section-label mb-4">The Problem</p>
            <h2
              className="font-display text-3xl lg:text-4xl font-bold leading-tight"
              style={{ color: 'rgba(230,230,230,0.95)' }}
            >
              Health data is everywhere.
              <br />
              <span style={{ color: 'rgba(220,40,40,0.9)' }}>But it isn't connected.</span>
            </h2>
          </div>

          <p
            className="reveal font-body text-base leading-relaxed"
            style={{ color: 'rgba(130,130,130,1)' }}
          >
            You use five different apps and two devices — and none of them talk to each other.
            Fragmented signals produce fragmented advice. You get generic recommendations
            that don't account for the full picture of your health.
          </p>

          <div className="reveal space-y-3">
            {problems.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded"
                style={{
                  background: 'rgba(220,40,40,0.03)',
                  border: '1px solid rgba(220,40,40,0.1)',
                }}
              >
                <div
                  className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'rgba(220,40,40,0.12)', color: 'rgba(220,60,60,0.8)' }}
                >
                  ✕
                </div>
                <p className="font-ui text-sm" style={{ color: 'rgba(120,120,120,1)' }}>{p}</p>
              </div>
            ))}
          </div>

          <div
            className="reveal p-5 rounded"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(160,160,160,0.1)',
            }}
          >
            <p
              className="font-body text-sm leading-relaxed"
              style={{ color: 'rgba(160,160,160,0.8)' }}
            >
              The result: inconsistent progress, conflicting advice, and a system that doesn't
              understand you. There is a better way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
