import { useEffect, useRef, useState } from 'react';

interface FeatureDef {
  id: string;
  label: string;
  headline: string;
  subline: string;
  bullets: string[];
  nodeColor: string;
  accentColor: string;
  nodePositions: Array<{ x: number; y: number; r: number; delay: number }>;
  edges: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

const features: FeatureDef[] = [
  {
    id: 'coaching',
    label: 'AI Coaching',
    headline: 'Coaching that understands the whole picture.',
    subline: "Generic advice ignores context. Sapien Eleven's AI coach synthesizes every signal before delivering guidance.",
    bullets: [
      'Daily check-ins and adaptive guidance',
      'Context-aware adjustments based on sleep, stress, and recovery',
      'Consistency and accountability built into every interaction',
      'Simple, actionable next steps — no noise',
    ],
    nodeColor: 'rgba(14,213,237,',
    accentColor: 'hsl(191 100% 60%)',
    nodePositions: [
      { x: 60, y: 60, r: 8, delay: 0 },
      { x: 120, y: 30, r: 5, delay: 0.3 },
      { x: 40, y: 120, r: 4, delay: 0.6 },
      { x: 140, y: 90, r: 6, delay: 0.9 },
      { x: 90, y: 150, r: 5, delay: 1.2 },
    ],
    edges: [
      { x1: 60, y1: 60, x2: 120, y2: 30 },
      { x1: 60, y1: 60, x2: 40, y2: 120 },
      { x1: 60, y1: 60, x2: 140, y2: 90 },
      { x1: 60, y1: 60, x2: 90, y2: 150 },
    ],
  },
  {
    id: 'nutrition',
    label: 'AI Nutrition',
    headline: "Nutrition tools that don't guess.",
    subline: 'From meal logging to personalized plans, every recommendation is grounded in your actual data — not averages.',
    bullets: [
      'Meal logging with scan and photo support',
      'Macro and micronutrient guidance calibrated to your goals',
      'Personalized meal plan generation that updates with you',
      'Habit-based coaching to build sustainable patterns',
    ],
    nodeColor: 'rgba(80,200,120,',
    accentColor: 'hsl(145 60% 55%)',
    nodePositions: [
      { x: 80, y: 80, r: 8, delay: 0 },
      { x: 30, y: 50, r: 4, delay: 0.2 },
      { x: 140, y: 50, r: 5, delay: 0.4 },
      { x: 50, y: 140, r: 4, delay: 0.6 },
      { x: 130, y: 130, r: 6, delay: 0.8 },
      { x: 90, y: 30, r: 3, delay: 1.0 },
    ],
    edges: [
      { x1: 80, y1: 80, x2: 30, y2: 50 },
      { x1: 80, y1: 80, x2: 140, y2: 50 },
      { x1: 80, y1: 80, x2: 50, y2: 140 },
      { x1: 80, y1: 80, x2: 130, y2: 130 },
      { x1: 80, y1: 80, x2: 90, y2: 30 },
    ],
  },
  {
    id: 'fitness',
    label: 'AI Fitness',
    headline: 'Training that adapts to real life.',
    subline: 'Life changes week to week. Your training program should too — adjusting for recovery, stress, and progress automatically.',
    bullets: [
      'Personalized workout programming based on your physiology',
      'Recovery-aware adjustments so you train smart, not just hard',
      'Progressive overload calibrated to your actual capacity',
      'Sustainable long-term programming — not just 30-day plans',
    ],
    nodeColor: 'rgba(255,140,60,',
    accentColor: 'hsl(25 90% 60%)',
    nodePositions: [
      { x: 70, y: 70, r: 8, delay: 0 },
      { x: 140, y: 60, r: 5, delay: 0.25 },
      { x: 30, y: 130, r: 4, delay: 0.5 },
      { x: 130, y: 140, r: 6, delay: 0.75 },
      { x: 80, y: 160, r: 4, delay: 1.0 },
    ],
    edges: [
      { x1: 70, y1: 70, x2: 140, y2: 60 },
      { x1: 70, y1: 70, x2: 30, y2: 130 },
      { x1: 70, y1: 70, x2: 130, y2: 140 },
      { x1: 70, y1: 70, x2: 80, y2: 160 },
    ],
  },
  {
    id: 'mental-health',
    label: 'AI Mental Health',
    headline: 'Mental fitness, integrated.',
    subline: "Your mental state shapes every other health outcome. Sapien Eleven doesn't treat it as separate — it's woven into every recommendation.",
    bullets: [
      'Mood and stress signal tracking across the day',
      'Breathwork and meditation support built into the flow',
      'Friction-reducing prompts that meet you where you are',
      'Coaching that accounts for your mental state before advising on the physical',
    ],
    nodeColor: 'rgba(160,110,240,',
    accentColor: 'hsl(270 70% 65%)',
    nodePositions: [
      { x: 90, y: 80, r: 8, delay: 0 },
      { x: 150, y: 50, r: 4, delay: 0.3 },
      { x: 40, y: 60, r: 5, delay: 0.5 },
      { x: 60, y: 150, r: 4, delay: 0.7 },
      { x: 150, y: 140, r: 5, delay: 0.9 },
      { x: 100, y: 170, r: 3, delay: 1.1 },
    ],
    edges: [
      { x1: 90, y1: 80, x2: 150, y2: 50 },
      { x1: 90, y1: 80, x2: 40, y2: 60 },
      { x1: 90, y1: 80, x2: 60, y2: 150 },
      { x1: 90, y1: 80, x2: 150, y2: 140 },
      { x1: 90, y1: 80, x2: 100, y2: 170 },
    ],
  },
];

function FeatureNodeDiagram({ feature, visible }: { feature: FeatureDef; visible: boolean }) {
  return (
    <div className="relative w-full" style={{ height: 200 }}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Edges */}
        {feature.edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={`${feature.nodeColor}0.2)`}
            strokeWidth="0.8"
            style={{
              strokeDasharray: '200',
              strokeDashoffset: visible ? '0' : '200',
              transition: `stroke-dashoffset 0.8s ease ${i * 0.1}s`,
            }}
          />
        ))}
        {/* Nodes */}
        {feature.nodePositions.map((n, i) => (
          <g key={i}>
            <circle
              cx={n.x} cy={n.y} r={n.r * 2}
              fill={`${feature.nodeColor}0.08)`}
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.4s ease ${n.delay}s`,
              }}
            />
            <circle
              cx={n.x} cy={n.y} r={n.r}
              fill="rgba(8,14,26,0.8)"
              stroke={`${feature.nodeColor}0.7)`}
              strokeWidth="1"
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.4s ease ${n.delay}s`,
                filter: `drop-shadow(0 0 4px ${feature.nodeColor}0.6))`,
              }}
            />
            <circle
              cx={n.x} cy={n.y} r={n.r * 0.4}
              fill={`${feature.nodeColor}0.9)`}
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.4s ease ${n.delay + 0.1}s`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: FeatureDef; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visibleRef.current) {
            visibleRef.current = true;
            setVisible(true);
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100);
            });
          }
        });
      },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <section
      id={feature.id}
      ref={ref}
      className="relative min-h-screen flex items-center py-24 px-6"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${isEven ? '20%' : '80%'} 50%, ${feature.nodeColor}0.04) 0%, transparent 65%)`,
        }}
      />

      <div className={`max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}>
        {/* Diagram side */}
        <div className={`reveal ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
          <div
            className="relative p-8 rounded"
            style={{
              background: 'rgba(8,14,26,0.6)',
              border: `1px solid ${feature.nodeColor}0.15)`,
            }}
          >
            <FeatureNodeDiagram feature={feature} visible={visible} />

            {/* Decorative corner marks */}
            <div className="absolute top-3 left-3 w-3 h-3" style={{ borderTop: `1px solid ${feature.accentColor}`, borderLeft: `1px solid ${feature.accentColor}`, opacity: 0.5 }} />
            <div className="absolute top-3 right-3 w-3 h-3" style={{ borderTop: `1px solid ${feature.accentColor}`, borderRight: `1px solid ${feature.accentColor}`, opacity: 0.5 }} />
            <div className="absolute bottom-3 left-3 w-3 h-3" style={{ borderBottom: `1px solid ${feature.accentColor}`, borderLeft: `1px solid ${feature.accentColor}`, opacity: 0.5 }} />
            <div className="absolute bottom-3 right-3 w-3 h-3" style={{ borderBottom: `1px solid ${feature.accentColor}`, borderRight: `1px solid ${feature.accentColor}`, opacity: 0.5 }} />
          </div>
        </div>

        {/* Copy side */}
        <div className={`space-y-6 ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
          <div className="reveal">
            <p className="section-label mb-4" style={{ color: feature.accentColor }}>{feature.label}</p>
            <h2
              className="font-display text-3xl lg:text-4xl font-bold leading-tight"
              style={{ color: 'hsl(210 20% 93%)' }}
            >
              {feature.headline}
            </h2>
          </div>

          <p className="reveal font-body text-base leading-relaxed" style={{ color: 'hsl(220 15% 55%)' }}>
            {feature.subline}
          </p>

          <ul className="reveal space-y-3">
            {feature.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: feature.accentColor, boxShadow: `0 0 6px ${feature.accentColor}` }}
                />
                <span className="font-ui text-sm leading-relaxed" style={{ color: 'hsl(220 15% 62%)' }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function FeatureSections() {
  return (
    <>
      {features.map((f, i) => (
        <FeatureCard key={f.id} feature={f} index={i} />
      ))}
    </>
  );
}
