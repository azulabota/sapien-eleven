import { useCallback, useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  opacity: number;
  color: 'red' | 'silver';
  trail: { x: number; y: number }[];
  life: number;
  maxLife: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
  color: 'red' | 'silver';
}

function createParticle(canvasW: number, canvasH: number, centerX: number, centerY: number): Particle {
  // Spawn from edges
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number;
  switch (edge) {
    case 0: x = Math.random() * canvasW; y = -10; break;
    case 1: x = canvasW + 10; y = Math.random() * canvasH; break;
    case 2: x = Math.random() * canvasW; y = canvasH + 10; break;
    default: x = -10; y = Math.random() * canvasH; break;
  }

  const maxLife = 200 + Math.random() * 300;
  return {
    x,
    y,
    targetX: centerX + (Math.random() - 0.5) * 80,
    targetY: centerY + (Math.random() - 0.5) * 40,
    speed: 0.4 + Math.random() * 0.8,
    size: 1 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.5,
    color: Math.random() > 0.5 ? 'red' : 'silver',
    trail: [],
    life: 0,
    maxLife,
  };
}

function createNode(canvasW: number, canvasH: number, centerX: number, centerY: number): Node {
  // Spawn further from center, drifting inward
  const angle = Math.random() * Math.PI * 2;
  const dist = 150 + Math.random() * 250;
  const x = centerX + Math.cos(angle) * dist;
  const y = centerY + Math.sin(angle) * dist;
  const inwardAngle = Math.atan2(centerY - y, centerX - x);

  return {
    x: Math.max(0, Math.min(canvasW, x)),
    y: Math.max(0, Math.min(canvasH, y)),
    vx: Math.cos(inwardAngle) * (0.1 + Math.random() * 0.2),
    vy: Math.sin(inwardAngle) * (0.1 + Math.random() * 0.2),
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.35,
    pulsePhase: Math.random() * Math.PI * 2,
    color: Math.random() > 0.4 ? 'red' : 'silver',
  };
}

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const timeRef = useRef(0);
  const logicalSizeRef = useRef({ w: 0, h: 0 });

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Canvas animation
  const animate = useCallback(() => {
    if (!isVisibleRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = logicalSizeRef.current.w;
    const h = logicalSizeRef.current.h;
    const centerX = w / 2;
    const centerY = h / 2;

    if (w === 0 || h === 0) {
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    timeRef.current += 1;

    // Fade previous frame
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, w, h);

    // Spawn new particles
    if (particlesRef.current.length < 50 && Math.random() < 0.15) {
      particlesRef.current.push(createParticle(w, h, centerX, centerY));
    }

    // Spawn nodes
    if (nodesRef.current.length < 12 && Math.random() < 0.02) {
      nodesRef.current.push(createNode(w, h, centerX, centerY));
    }

    // Draw and update particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.life += 1;
      if (p.life > p.maxLife) return false;

      // Move toward target
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) return false; // reached center

      const ax = (dx / dist) * p.speed;
      const ay = (dy / dist) * p.speed;
      p.x += ax;
      p.y += ay;

      // Store trail
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 20) p.trail.shift();

      // Fade as approaching center
      const fadeRatio = Math.min(1, dist / 200);
      const lifeRatio = 1 - p.life / p.maxLife;
      const currentOpacity = p.opacity * fadeRatio * lifeRatio;

      // Draw trail
      if (p.trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        const trailColor =
          p.color === 'red'
            ? `rgba(202, 60, 61, ${currentOpacity * 0.3})`
            : `rgba(160, 160, 160, ${currentOpacity * 0.25})`;
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();
      }

      // Draw particle head
      const headColor =
        p.color === 'red'
          ? `rgba(202, 60, 61, ${currentOpacity})`
          : `rgba(180, 180, 180, ${currentOpacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = headColor;
      ctx.fill();

      // Glow
      if (currentOpacity > 0.3) {
        const glowColor =
          p.color === 'red'
            ? `rgba(202, 60, 61, ${currentOpacity * 0.15})`
            : `rgba(180, 180, 180, ${currentOpacity * 0.1})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();
      }

      return true;
    });

    // Draw and update glowing nodes
    nodesRef.current = nodesRef.current.filter((n) => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulsePhase += 0.03;

      // Remove if too close to center or out of bounds
      const dxC = n.x - centerX;
      const dyC = n.y - centerY;
      const distC = Math.sqrt(dxC * dxC + dyC * dyC);
      if (distC < 30) return false;
      if (n.x < -20 || n.x > w + 20 || n.y < -20 || n.y > h + 20) return false;

      const pulse = 0.5 + 0.5 * Math.sin(n.pulsePhase);
      const currentOpacity = n.opacity * (0.6 + 0.4 * pulse);
      const currentSize = n.size * (0.8 + 0.2 * pulse);

      // Draw node glow
      const glowColor =
        n.color === 'red'
          ? `rgba(202, 60, 61, ${currentOpacity * 0.12})`
          : `rgba(160, 160, 160, ${currentOpacity * 0.08})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, currentSize * 4, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();

      // Draw node
      const nodeColor =
        n.color === 'red'
          ? `rgba(202, 60, 61, ${currentOpacity})`
          : `rgba(180, 180, 180, ${currentOpacity})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, currentSize, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();

      return true;
    });

    // Draw faint connecting lines between nearby nodes
    for (let i = 0; i < nodesRef.current.length; i++) {
      for (let j = i + 1; j < nodesRef.current.length; j++) {
        const a = nodesRef.current[i];
        const b = nodesRef.current[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const lineOpacity = (1 - dist / 200) * 0.08;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(202, 60, 61, ${lineOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Subtle center glow pulse
    const centerPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 0.015);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 120);
    gradient.addColorStop(0, `rgba(202, 60, 61, ${0.04 * centerPulse})`);
    gradient.addColorStop(1, 'rgba(202, 60, 61, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(centerX - 120, centerY - 120, 240, 240);

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Setup canvas + intersection observer
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const resizeCanvas = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      logicalSizeRef.current = { w: rect.width, h: rect.height };
      // Reset particles on resize
      particlesRef.current = [];
      nodesRef.current = [];
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Intersection observer for both reveal classes and canvas animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisibleRef.current = true;
            // Reveal text elements
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120);
            });
            // Start canvas animation
            if (!animFrameRef.current) {
              animFrameRef.current = requestAnimationFrame(animate);
            }
          } else {
            isVisibleRef.current = false;
            if (animFrameRef.current) {
              cancelAnimationFrame(animFrameRef.current);
              animFrameRef.current = 0;
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [animate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitted(true);
  };

  // Bottom decoration dot animation
  const [dotPulse, setDotPulse] = useState(0);
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      setDotPulse((ts - start) * 0.001);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Decoration dot values
  const dotLeftOpacity = 0.2 + 0.15 * Math.sin(dotPulse * 1.2);
  const dotCenterScale = 0.9 + 0.15 * Math.sin(dotPulse * 0.8);
  const dotCenterGlow = 6 + 6 * Math.sin(dotPulse * 0.8);
  const dotRightOpacity = 0.2 + 0.15 * Math.sin(dotPulse * 1.2 + 1.5);
  const lineLeftLength = 40 + 15 * Math.sin(dotPulse * 0.6);
  const lineRightLength = 40 + 15 * Math.sin(dotPulse * 0.6 + 1);

  // Pulsing glow ring for form container
  const glowRingOpacity = 0.12 + 0.08 * Math.sin(dotPulse * 0.5);
  const glowRingSpread = 20 + 10 * Math.sin(dotPulse * 0.5);

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Canvas background animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(202,60,61,0.06) 0%, transparent 65%)',
          zIndex: 1,
        }}
      />
      <div className="gradient-line absolute top-0 left-0 right-0" style={{ zIndex: 1 }} />

      <div className="max-w-2xl mx-auto w-full text-center space-y-8 relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="space-y-5">
          <p className="section-label reveal">Early Access</p>
          <h2
            className="reveal font-display text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'rgba(235,235,235,0.97)' }}
          >
            Get updates{' '}
            <span className="text-glow" style={{ color: '#CA3C3D' }}>
              as we build.
            </span>
          </h2>
          <p
            className="reveal font-body text-lg leading-relaxed"
            style={{ color: 'rgba(120,120,120,1)' }}
          >
            Early access, milestones, and launch announcements — delivered as Sapien Eleven comes to life.
          </p>
        </div>

        {/* Form with pulsing glow ring */}
        <div
          className="reveal relative rounded-xl p-[1px]"
          style={{
            boxShadow: `0 0 ${glowRingSpread}px rgba(202, 60, 61, ${glowRingOpacity}), inset 0 0 ${glowRingSpread * 0.5}px rgba(202, 60, 61, ${glowRingOpacity * 0.3})`,
            border: `1px solid rgba(202, 60, 61, ${glowRingOpacity * 0.8})`,
            borderRadius: '12px',
            background: `linear-gradient(135deg, rgba(202,60,61,${glowRingOpacity * 0.15}), rgba(20,20,20,0.9), rgba(160,160,160,${glowRingOpacity * 0.05}))`,
            transition: 'box-shadow 0.1s ease',
          }}
        >
          <div
            className="rounded-xl px-6 py-8 sm:px-8 sm:py-10"
            style={{
              background: 'rgba(10, 10, 10, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {submitted ? (
              <div
                className="p-8 rounded text-center"
                style={{
                  background: 'rgba(202,60,61,0.04)',
                  border: '1px solid rgba(202,60,61,0.2)',
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="node-dot" />
                  <p
                    className="font-display text-sm tracking-wider"
                    style={{ color: '#CA3C3D', letterSpacing: '0.12em' }}
                  >
                    YOU ARE CONNECTED.
                  </p>
                </div>
                <p className="font-body text-sm" style={{ color: 'rgba(120,120,120,1)' }}>
                  We have your email. You will hear from us when it matters.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-cyber flex-1"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Sign Up
                </button>
              </form>
            )}

            {error && (
              <p className="mt-3 font-ui text-xs" style={{ color: 'rgba(220,80,80,0.8)' }}>
                {error}
              </p>
            )}

            {!submitted && (
              <p
                className="mt-4 font-ui text-xs tracking-wider"
                style={{ color: 'rgba(90,90,90,1)', letterSpacing: '0.12em' }}
              >
                NO SPAM. EVER.
              </p>
            )}
          </div>
        </div>

        {/* Animated node decoration */}
        <div className="reveal pt-4">
          <svg
            width="100%"
            height="32"
            viewBox="0 0 400 32"
            preserveAspectRatio="xMidYMid meet"
            className="mx-auto max-w-sm"
          >
            {/* Left line */}
            <line
              x1={200 - 60 - lineLeftLength}
              y1="16"
              x2={200 - 60}
              y2="16"
              stroke="rgba(160,160,160,0.15)"
              strokeWidth="1"
            />
            {/* Animated segment on left line */}
            <line
              x1={200 - 60 - lineLeftLength * 0.6}
              y1="16"
              x2={200 - 60 - lineLeftLength * 0.2}
              y2="16"
              stroke={`rgba(202,60,61,${0.15 + 0.1 * Math.sin(dotPulse * 1.5)})`}
              strokeWidth="1"
            />

            {/* Left dot */}
            <circle
              cx={200 - 30}
              cy="16"
              r="3"
              fill={`rgba(160,160,160,${dotLeftOpacity})`}
            />
            <circle
              cx={200 - 30}
              cy="16"
              r="6"
              fill={`rgba(160,160,160,${dotLeftOpacity * 0.2})`}
            />

            {/* Line from left dot to center */}
            <line
              x1={200 - 25}
              y1="16"
              x2={200 - 8}
              y2="16"
              stroke={`rgba(202,60,61,${0.1 + 0.08 * Math.sin(dotPulse * 0.8)})`}
              strokeWidth="0.5"
            />

            {/* Center dot */}
            <circle
              cx="200"
              cy="16"
              r={5 * dotCenterScale}
              fill="rgba(202,60,61,0.7)"
            />
            <circle
              cx="200"
              cy="16"
              r={5 * dotCenterScale + 4}
              fill="none"
              stroke={`rgba(202,60,61,${0.15 + 0.1 * Math.sin(dotPulse * 0.8)})`}
              strokeWidth="0.5"
            />
            {/* Center glow */}
            <circle
              cx="200"
              cy="16"
              r={dotCenterGlow}
              fill={`rgba(202,60,61,${0.06 + 0.04 * Math.sin(dotPulse * 0.8)})`}
            />

            {/* Line from center to right dot */}
            <line
              x1={200 + 8}
              y1="16"
              x2={200 + 25}
              y2="16"
              stroke={`rgba(202,60,61,${0.1 + 0.08 * Math.sin(dotPulse * 0.8 + 1)})`}
              strokeWidth="0.5"
            />

            {/* Right dot */}
            <circle
              cx={200 + 30}
              cy="16"
              r="3"
              fill={`rgba(160,160,160,${dotRightOpacity})`}
            />
            <circle
              cx={200 + 30}
              cy="16"
              r="6"
              fill={`rgba(160,160,160,${dotRightOpacity * 0.2})`}
            />

            {/* Right line */}
            <line
              x1={200 + 60}
              y1="16"
              x2={200 + 60 + lineRightLength}
              y2="16"
              stroke="rgba(160,160,160,0.15)"
              strokeWidth="1"
            />
            {/* Animated segment on right line */}
            <line
              x1={200 + 60 + lineRightLength * 0.2}
              y1="16"
              x2={200 + 60 + lineRightLength * 0.6}
              y2="16"
              stroke={`rgba(202,60,61,${0.15 + 0.1 * Math.sin(dotPulse * 1.5 + 1)})`}
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
