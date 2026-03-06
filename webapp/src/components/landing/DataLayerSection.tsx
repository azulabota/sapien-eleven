import { useEffect, useRef, useState } from 'react';

const inputs = [
  { label: 'Sleep', x: 60, y: 60, color: 'rgba(160,110,240,' },
  { label: 'Nutrition', x: 60, y: 130, color: 'rgba(80,200,120,' },
  { label: 'Workouts', x: 60, y: 200, color: 'rgba(255,140,60,' },
  { label: 'Biometrics', x: 60, y: 270, color: 'rgba(14,213,237,' },
  { label: 'Mood', x: 60, y: 340, color: 'rgba(255,180,100,' },
  { label: 'Coach', x: 60, y: 410, color: 'rgba(14,213,237,' },
];

const outputNodes = [
  { label: 'Nutrition Plan', x: 440, y: 100, color: 'rgba(80,200,120,' },
  { label: 'Workout Plan', x: 440, y: 190, color: 'rgba(255,140,60,' },
  { label: 'Recovery', x: 440, y: 280, color: 'rgba(14,213,237,' },
  { label: 'Mental Health', x: 440, y: 370, color: 'rgba(160,110,240,' },
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
        {/* Input → Hub lines */}
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

        {/* Hub → Output lines */}
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
        <circle cx={hubX} cy={hubY} r="50" stroke="rgba(14,213,237,0.08)" strokeWidth="0.6" strokeDasharray="3 5" style={{ animation: 'spin-slow 30s linear infinite' }} />
        <circle cx={hubX} cy={hubY} r="36" stroke="rgba(14,213,237,0.15)" strokeWidth="0.8" />
        <circle cx={hubX} cy={hubY} r="28" fill="rgba(8,14,26,0.9)" stroke="rgba(14,213,237,0.5)" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 16px rgba(14,213,237,0.4))' }} />
        <circle cx={hubX} cy={hubY} r="8" fill="rgba(14,213,237,0.9)" style={{ animation: 'broken-pulse 2s ease-in-out infinite' }} />

        <text x={hubX} y={hubY - 36} textAnchor="middle" fill="rgba(14,213,237,0.6)" fontSize="6" fontFamily="Orbitron, sans-serif" letterSpacing="0.8">AI + DATA LAYER</text>
        <text x={hubX} y={hubY + 44} textAnchor="middle" fill="rgba(14,213,237,0.4)" fontSize="5.5" fontFamily="Orbitron, sans-serif" letterSpacing="0.5">SAPIEN ELEVEN</text>

        {/* Input nodes */}
        {inputs.map((inp, i) => (
          <g key={`in-${i}`} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.08}s` }}>
            <rect x={inp.x - 28} y={inp.y - 12} width={56} height={22} rx="2" fill="rgba(8,14,26,0.8)" stroke={`${inp.color}0.3)`} strokeWidth="0.7" />
            <circle cx={inp.x + 20} cy={inp.y} r="3.5" fill={`${inp.color}0.8)`} />
            <text x={inp.x - 22} y={inp.y + 4} fill={`${inp.color}0.7)`} fontSize="6" fontFamily="Orbitron, sans-serif" letterSpacing="0.5">{inp.label.toUpperCase()}</text>
          </g>
        ))}

        {/* Output nodes */}
        {outputNodes.map((out, i) => (
          <g key={`out-${i}`} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.1 + 0.3}s` }}>
            <rect x={out.x - 18} y={out.y - 12} width={62} height={22} rx="2" fill="rgba(8,14,26,0.8)" stroke={`${out.color}0.3)`} strokeWidth="0.7" />
            <circle cx={out.x - 18} cy={out.y} r="3.5" fill={`${out.color}0.8)`} />
            <text x={out.x - 12} y={out.y + 4} fill={`${out.color}0.7)`} fontSize="6" fontFamily="Orbitron, sans-serif" letterSpacing="0.4">{out.label.toUpperCase()}</text>
          </g>
        ))}

        {/* Labels */}
        <text x="36" y="20" fill="rgba(14,213,237,0.25)" fontSize="7" fontFamily="Orbitron, sans-serif" letterSpacing="1">INPUTS</text>
        <text x="420" y="20" fill="rgba(14,213,237,0.25)" fontSize="7" fontFamily="Orbitron, sans-serif" letterSpacing="1">OUTPUTS</text>
      </svg>

      {/* Query ticker */}
      {visible && (
        <div
          className="absolute bottom-0 left-0 right-0 text-center py-2 px-4"
          style={{ borderTop: '1px solid rgba(14,213,237,0.08)' }}
        >
          <p
            className="font-ui text-xs"
            style={{ color: 'rgba(14,213,237,0.55)', letterSpacing: '0.1em', fontStyle: 'italic' }}
            key={activeQuery}
          >
            {queries[activeQuery].text}
          </p>
        </div>
      )}
    </div>
  );
}

export function DataLayerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  const crossSignals = [
    { a: 'Sleep quality', b: 'Training intensity', c: 'less is more on low-recovery days' },
    { a: 'Stress markers', b: 'Nutritional needs', c: 'cortisol affects appetite and metabolism' },
    { a: 'Workout load', b: 'Recovery protocols', c: 'muscle repair needs fuel and rest' },
    { a: 'Mood signals', b: 'Coaching tone', c: 'meet people where they are, not where they should be' },
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
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(14,213,237,0.05) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto w-full space-y-20">
        {/* Header */}
        <div className="text-center space-y-5 reveal">
          <p className="section-label">The Core Technology</p>
          <h2
            className="font-display text-3xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'hsl(210 20% 93%)' }}
          >
            The AI + Data Layer{' '}
            <br />
            <span className="text-glow" style={{ color: 'hsl(191 100% 60%)' }}>
              connecting every signal.
            </span>
          </h2>
          <p
            className="font-body text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'hsl(220 15% 55%)' }}
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
              background: 'rgba(8,14,26,0.7)',
              border: '1px solid rgba(14,213,237,0.12)',
              boxShadow: '0 0 60px rgba(14,213,237,0.04)',
            }}
          >
            <DataLayerDiagram visible={visible} />
          </div>
        </div>

        {/* Cross-signal explanations */}
        <div className="reveal">
          <p className="section-label mb-8 text-center">Cross-Signal Intelligence</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crossSignals.map((s, i) => (
              <div
                key={i}
                className="p-5 rounded"
                style={{
                  background: 'rgba(14,213,237,0.02)',
                  border: '1px solid rgba(14,213,237,0.1)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="font-ui text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(14,213,237,0.1)', color: 'hsl(191 100% 65%)', letterSpacing: '0.06em' }}
                  >
                    {s.a}
                  </span>
                  <span style={{ color: 'rgba(14,213,237,0.3)', fontSize: '10px' }}>→</span>
                  <span
                    className="font-ui text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(14,213,237,0.1)', color: 'hsl(191 100% 65%)', letterSpacing: '0.06em' }}
                  >
                    {s.b}
                  </span>
                </div>
                <p className="font-ui text-sm" style={{ color: 'hsl(220 15% 55%)', fontStyle: 'italic' }}>
                  "{s.c}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
