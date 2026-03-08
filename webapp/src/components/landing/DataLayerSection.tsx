import { useEffect, useMemo, useRef, useState } from 'react';

const inputs = [
  { label: 'Sleep', x: 60, y: 60, color: 'rgba(190,190,190,' },
  { label: 'Meal Plan', x: 60, y: 130, color: 'rgba(160,160,160,' },
  { label: 'Workout', x: 60, y: 200, color: 'rgba(202,60,61,' },
  { label: 'Vitals', x: 60, y: 270, color: 'rgba(200,200,200,' },
  { label: 'Coaching', x: 60, y: 340, color: 'rgba(160,160,160,' },
  { label: 'Mood', x: 60, y: 410, color: 'rgba(202,60,61,' },
];

const outputNodes = [
  { label: 'Nutrition Plan', x: 440, y: 100, color: 'rgba(200,200,200,' },
  { label: 'Workout Plan', x: 440, y: 190, color: 'rgba(202,60,61,' },
  { label: 'Mental Health', x: 440, y: 280, color: 'rgba(160,160,160,' },
  { label: 'Recovery', x: 440, y: 370, color: 'rgba(180,180,180,' },
];

const hubX = 250;
const hubY = 235;

// Example cross-signal queries that animate through
const queries = [
  { from: 0, to: 0, text: 'Low sleep → reduce workout intensity' },
  { from: 1, to: 1, text: 'High stress → adjust macros' },
  { from: 4, to: 3, text: 'Mood dip → add recovery prompts' },
  { from: 2, to: 2, text: 'Training load → recalculate nutrition' },
];

// Ambient particle configuration
interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.15 + 0.05,
      driftX: (Math.random() - 0.5) * 40,
      driftY: (Math.random() - 0.5) * 30,
      duration: Math.random() * 12 + 14,
      delay: Math.random() * -20,
    });
  }
  return particles;
}

function AmbientParticles({ visible }: { visible: boolean }) {
  const particles = useMemo(() => generateParticles(28), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: i % 3 === 0 ? 'rgba(202,60,61,0.5)' : 'rgba(160,160,160,0.4)',
            opacity: p.opacity,
            animation: `particle-drift-${i % 6} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Keyframes injected once via a style tag
const INJECTED_KEYFRAMES = `
@keyframes radar-ping {
  0% {
    transform: scale(1);
    opacity: 0.45;
    stroke-width: 1.5;
  }
  100% {
    transform: scale(2.15);
    opacity: 0;
    stroke-width: 0.3;
  }
}

@keyframes particle-drift-0 {
  0%, 100% { transform: translate(0px, 0px); opacity: 0.08; }
  25% { transform: translate(12px, -18px); opacity: 0.18; }
  50% { transform: translate(-8px, -30px); opacity: 0.06; }
  75% { transform: translate(16px, -10px); opacity: 0.14; }
}
@keyframes particle-drift-1 {
  0%, 100% { transform: translate(0px, 0px); opacity: 0.06; }
  25% { transform: translate(-15px, 10px); opacity: 0.15; }
  50% { transform: translate(10px, 22px); opacity: 0.05; }
  75% { transform: translate(-20px, 8px); opacity: 0.12; }
}
@keyframes particle-drift-2 {
  0%, 100% { transform: translate(0px, 0px); opacity: 0.1; }
  33% { transform: translate(18px, -14px); opacity: 0.04; }
  66% { transform: translate(-12px, 16px); opacity: 0.16; }
}
@keyframes particle-drift-3 {
  0%, 100% { transform: translate(0px, 0px); opacity: 0.07; }
  30% { transform: translate(-10px, -20px); opacity: 0.14; }
  60% { transform: translate(14px, 12px); opacity: 0.05; }
}
@keyframes particle-drift-4 {
  0%, 100% { transform: translate(0px, 0px); opacity: 0.12; }
  40% { transform: translate(20px, 8px); opacity: 0.06; }
  70% { transform: translate(-6px, -18px); opacity: 0.16; }
}
@keyframes particle-drift-5 {
  0%, 100% { transform: translate(0px, 0px); opacity: 0.05; }
  35% { transform: translate(-14px, 14px); opacity: 0.13; }
  65% { transform: translate(8px, -22px); opacity: 0.07; }
}

@keyframes ticker-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes ticker-text-enter {
  0% { opacity: 0; transform: translateY(6px); filter: blur(3px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes card-glow-red {
  0%, 100% { box-shadow: 0 0 0px rgba(202,60,61,0), border-color: rgba(160,160,160,0.08); }
  50% { box-shadow: 0 0 12px rgba(202,60,61,0.15); }
}

@keyframes card-enter {
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

function DataLayerDiagram({ visible }: { visible: boolean }) {
  const [activeQuery, setActiveQuery] = useState(0);
  const [packetPos, setPacketPos] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setActiveQuery((q) => (q + 1) % queries.length);
      setPacketPos(0);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const animate = () => {
      setPacketPos((p) => {
        if (p >= 1) return 0;
        return p + 0.012;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [visible, activeQuery]);

  const q = queries[activeQuery];

  return (
    <div className="relative w-full" style={{ height: 480 }}>
      <svg viewBox="0 0 500 470" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Input -> Hub lines */}
        {inputs.map((inp, i) => {
          const isActive = q.from === i;
          return (
            <g key={`in-line-${i}`}>
              <line
                x1={inp.x + 20} y1={inp.y}
                x2={hubX - 28} y2={hubY}
                stroke={`${inp.color}${isActive ? '0.4' : '0.12'})`}
                strokeWidth={isActive ? '1.2' : '0.6'}
                style={{ transition: 'stroke-width 0.3s, stroke 0.3s' }}
              />
              {/* Traveling packet on active line */}
              {isActive && visible && (
                <circle
                  cx={(inp.x + 20) + ((hubX - 28) - (inp.x + 20)) * Math.min(packetPos * 2, 1)}
                  cy={inp.y + (hubY - inp.y) * Math.min(packetPos * 2, 1)}
                  r="3"
                  fill={`${inp.color}0.9)`}
                  style={{ filter: `drop-shadow(0 0 4px ${inp.color}0.8))` }}
                />
              )}
            </g>
          );
        })}

        {/* Hub -> Output lines */}
        {outputNodes.map((out, i) => {
          const isActive = q.to === i;
          return (
            <g key={`out-line-${i}`}>
              <line
                x1={hubX + 28} y1={hubY}
                x2={out.x - 18} y2={out.y}
                stroke={`${out.color}${isActive ? '0.5' : '0.12'})`}
                strokeWidth={isActive ? '1.2' : '0.6'}
                style={{ transition: 'stroke-width 0.3s, stroke 0.3s' }}
              />
              {/* Traveling packet on output */}
              {isActive && visible && packetPos > 0.5 && (
                <circle
                  cx={(hubX + 28) + ((out.x - 18) - (hubX + 28)) * ((packetPos - 0.5) * 2)}
                  cy={hubY + (out.y - hubY) * ((packetPos - 0.5) * 2)}
                  r="3"
                  fill={`${out.color}0.9)`}
                  style={{ filter: `drop-shadow(0 0 4px ${out.color}0.8))` }}
                />
              )}
            </g>
          );
        })}

        {/* Hub outer rings */}
        <circle cx={hubX} cy={hubY} r="50" stroke="rgba(160,160,160,0.06)" strokeWidth="0.6" strokeDasharray="3 5" style={{ animation: 'spin-slow 30s linear infinite' }} />
        <circle cx={hubX} cy={hubY} r="36" stroke="rgba(160,160,160,0.12)" strokeWidth="0.8" />
        <circle cx={hubX} cy={hubY} r="28" fill="rgba(10,10,10,0.92)" stroke="rgba(202,60,61,0.55)" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 16px rgba(202,60,61,0.35))' }} />
        <circle cx={hubX} cy={hubY} r="8" fill="rgba(202,60,61,0.9)" style={{ animation: 'broken-pulse 2s ease-in-out infinite' }} />

        {/* Radar ping / heartbeat rings */}
        {visible && (
          <>
            <circle
              cx={hubX}
              cy={hubY}
              r="28"
              fill="none"
              stroke="rgba(202,60,61,0.45)"
              strokeWidth="1.5"
              style={{
                animation: 'radar-ping 2.8s ease-out infinite',
                transformOrigin: `${hubX}px ${hubY}px`,
              }}
            />
            <circle
              cx={hubX}
              cy={hubY}
              r="28"
              fill="none"
              stroke="rgba(202,60,61,0.25)"
              strokeWidth="1"
              style={{
                animation: 'radar-ping 2.8s ease-out infinite',
                animationDelay: '1.4s',
                transformOrigin: `${hubX}px ${hubY}px`,
              }}
            />
          </>
        )}

        <text x={hubX} y={hubY - 36} textAnchor="middle" fill="rgba(160,160,160,0.5)" fontSize="6" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.8">AI + DATA LAYER</text>
        <text x={hubX} y={hubY + 44} textAnchor="middle" fill="rgba(120,120,120,0.4)" fontSize="5.5" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.5">SAPIEN ELEVEN</text>

        {/* Input nodes */}
        {inputs.map((inp, i) => (
          <g key={`in-${i}`} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.08}s` }}>
            <rect x={inp.x - 34} y={inp.y - 12} width={68} height={22} rx="2" fill="rgba(10,10,10,0.85)" stroke={`${inp.color}0.25)`} strokeWidth="0.7" />
            <circle cx={inp.x + 24} cy={inp.y} r="3.5" fill={`${inp.color}0.8)`} />
            <text x={inp.x - 28} y={inp.y + 4} fill={`${inp.color}0.65)`} fontSize="6" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.5">{inp.label.toUpperCase()}</text>
          </g>
        ))}

        {/* Output nodes */}
        {outputNodes.map((out, i) => (
          <g key={`out-${i}`} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.1 + 0.3}s` }}>
            <rect x={out.x - 18} y={out.y - 12} width={78} height={22} rx="2" fill="rgba(10,10,10,0.85)" stroke={`${out.color}0.25)`} strokeWidth="0.7" />
            <circle cx={out.x - 18} cy={out.y} r="3.5" fill={`${out.color}0.8)`} />
            <text x={out.x - 12} y={out.y + 4} fill={`${out.color}0.65)`} fontSize="6" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.4">{out.label.toUpperCase()}</text>
          </g>
        ))}

        {/* Labels */}
        <text x="36" y="20" fill="rgba(120,120,120,0.35)" fontSize="7" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="1">INPUTS</text>
        <text x="420" y="20" fill="rgba(120,120,120,0.35)" fontSize="7" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="1">OUTPUTS</text>
      </svg>

      {/* Query ticker with cursor blink and entrance animation */}
      {visible && (
        <div
          className="absolute bottom-0 left-0 right-0 text-center py-2.5 px-4"
          style={{ borderTop: '1px solid rgba(202,60,61,0.1)' }}
        >
          <p
            className="font-ui text-xs inline-flex items-center gap-1 justify-center"
            style={{
              color: 'rgba(202,60,61,0.7)',
              letterSpacing: '0.1em',
              fontStyle: 'italic',
              animation: 'ticker-text-enter 0.45s ease-out',
            }}
            key={activeQuery}
          >
            <span
              style={{
                display: 'inline-block',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'rgba(202,60,61,0.8)',
                marginRight: '6px',
                animation: 'broken-pulse 1.2s ease-in-out infinite',
              }}
            />
            {queries[activeQuery].text}
            <span
              style={{
                display: 'inline-block',
                width: '1.5px',
                height: '13px',
                background: 'rgba(202,60,61,0.65)',
                marginLeft: '2px',
                animation: 'ticker-cursor-blink 0.9s step-end infinite',
              }}
            />
          </p>
        </div>
      )}
    </div>
  );
}

export function DataLayerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Inject custom keyframes once
  useEffect(() => {
    const styleId = 'data-layer-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = INJECTED_KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
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

  // Separate observer for cross-signal cards staggered entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCardsVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (cardsRef.current) observer.observe(cardsRef.current);
    return () => observer.disconnect();
  }, []);

  const crossSignals = [
    { a: 'Sleep quality', b: 'Training intensity', c: 'less is more on low-recovery days', accent: 'red' as const },
    { a: 'Stress markers', b: 'Nutritional needs', c: 'cortisol affects appetite and metabolism', accent: 'silver' as const },
    { a: 'Workout load', b: 'Recovery protocols', c: 'muscle repair needs fuel and rest', accent: 'red' as const },
    { a: 'Mood signals', b: 'Coaching tone', c: 'meet people where they are, not where they should be', accent: 'silver' as const },
  ];

  return (
    <section
      id="data-layer"
      ref={sectionRef}
      className="relative py-24 px-6"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(202,60,61,0.04) 0%, transparent 65%)',
        }}
      />

      {/* Ambient particles */}
      <AmbientParticles visible={visible} />

      <div className="max-w-7xl mx-auto w-full space-y-20">
        {/* Header */}
        <div className="text-center space-y-5 reveal">
          <p className="section-label">The Core Technology</p>
          <h2
            className="font-display text-3xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'rgba(225,225,225,0.92)' }}
          >
            The AI + Data Layer{' '}
            <br />
            <span className="text-glow" style={{ color: '#CA3C3D' }}>
              connecting every signal.
            </span>
          </h2>
          <p
            className="font-body text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(120,120,120,1)' }}
          >
            Every data point flows into one unified system. The AI cross-references signals
            across domains to produce recommendations that reflect your complete health picture — not just one slice of it.
          </p>
        </div>

        {/* Main diagram */}
        <div className="reveal">
          <div
            className="relative rounded p-4 lg:p-8"
            style={{
              background: 'rgba(10,10,10,0.75)',
              border: '1px solid rgba(160,160,160,0.1)',
              boxShadow: '0 0 60px rgba(202,60,61,0.03)',
            }}
          >
            <DataLayerDiagram visible={visible} />
          </div>
        </div>

        {/* Cross-signal explanations */}
        <div className="reveal" ref={cardsRef}>
          <p className="section-label mb-8 text-center">Cross-Signal Intelligence</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crossSignals.map((s, i) => {
              const isRed = s.accent === 'red';
              const glowColor = isRed ? 'rgba(202,60,61,' : 'rgba(180,180,180,';

              return (
                <div
                  key={i}
                  className="p-5 rounded transition-all duration-300 cursor-default"
                  style={{
                    background: 'rgba(202,60,61,0.03)',
                    border: `1px solid rgba(160,160,160,0.08)`,
                    boxShadow: 'none',
                    opacity: cardsVisible ? 1 : 0,
                    transform: cardsVisible ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s, box-shadow 0.3s ease, border-color 0.3s ease`,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.boxShadow = `0 0 20px ${glowColor}0.12), inset 0 0 20px ${glowColor}0.04)`;
                    el.style.borderColor = `${glowColor}0.25)`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.boxShadow = 'none';
                    el.style.borderColor = 'rgba(160,160,160,0.08)';
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="font-ui text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(202,60,61,0.08)', color: '#CA3C3D', letterSpacing: '0.06em' }}
                    >
                      {s.a}
                    </span>
                    <span style={{ color: 'rgba(160,160,160,0.3)', fontSize: '10px' }}>→</span>
                    <span
                      className="font-ui text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(160,160,160,0.06)', color: 'rgba(180,180,180,0.75)', letterSpacing: '0.06em' }}
                    >
                      {s.b}
                    </span>
                  </div>
                  <p className="font-ui text-sm" style={{ color: 'rgba(110,110,110,1)', fontStyle: 'italic' }}>
                    "{s.c}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
