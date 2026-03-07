import { useEffect, useRef } from 'react';

interface SphereNode {
  x: number;
  y: number;
  z: number;
  baseSize: number;
  isRed: boolean;
  pulseOffset: number;
}

interface DataPulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  isRed: boolean;
}

function DataSphereAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let size = 400;

    const computeSize = () => {
      const parent = canvas.parentElement;
      const rect = parent?.getBoundingClientRect();
      // Slightly bigger, still subtle. Scale with container, clamp for sanity.
      const target = rect?.width ? rect.width : 400;
      size = Math.max(320, Math.min(520, target));
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const getGeom = () => {
      const cx = size / 2;
      const cy = size / 2;
      const sphereRadius = size * 0.34;
      return { cx, cy, sphereRadius };
    };

    // Initial geometry
    computeSize();
    let { cx, cy, sphereRadius } = getGeom();

    const perspective = 650;
    let nodeCount = size >= 480 ? 150 : 120;
    const connectionDist = 0.7; // max distance ratio for connections

    const ro = new ResizeObserver(() => {
      computeSize();
      ;({ cx, cy, sphereRadius } = getGeom());
      nodeCount = size >= 480 ? 150 : 120;
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Generate fibonacci sphere points
    const nodes: SphereNode[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      nodes.push({
        x: Math.cos(theta) * radiusAtY,
        y: y,
        z: Math.sin(theta) * radiusAtY,
        baseSize: 1.2 + Math.random() * 1.8,
        isRed: Math.random() < 0.4,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Pre-compute connections (pairs of node indices that are close enough)
    const connections: [number, number][] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < connectionDist) {
          connections.push([i, j]);
        }
      }
    }

    // Data pulses that travel along connections
    const pulses: DataPulse[] = [];
    const maxPulses = 25;

    function spawnPulse() {
      if (pulses.length >= maxPulses || connections.length === 0) return;
      const connIdx = Math.floor(Math.random() * connections.length);
      const [from, to] = connections[connIdx];
      pulses.push({
        fromIdx: from,
        toIdx: to,
        progress: 0,
        speed: 0.005 + Math.random() * 0.012,
        isRed: Math.random() < 0.5,
      });
    }

    // Seed initial pulses
    for (let i = 0; i < 15; i++) {
      spawnPulse();
      // randomize initial progress
      if (pulses[i]) pulses[i].progress = Math.random();
    }

    let rotY = 0;
    let rotX = 0.3; // slight tilt
    let time = 0;

    function project(x: number, y: number, z: number): { px: number; py: number; scale: number; depth: number } {
      const scale = perspective / (perspective + z * sphereRadius);
      return {
        px: cx + x * sphereRadius * scale,
        py: cy + y * sphereRadius * scale,
        scale,
        depth: z,
      };
    }

    function rotatePoint(x: number, y: number, z: number, angleY: number, angleX: number) {
      // Rotate around Y axis
      let cosA = Math.cos(angleY);
      let sinA = Math.sin(angleY);
      const nx = x * cosA + z * sinA;
      let nz = -x * sinA + z * cosA;

      // Rotate around X axis
      cosA = Math.cos(angleX);
      sinA = Math.sin(angleX);
      const ny = y * cosA - nz * sinA;
      nz = y * sinA + nz * cosA;

      return { x: nx, y: ny, z: nz };
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      time += 0.016;
      rotY += 0.003;
      rotX = 0.3 + Math.sin(time * 0.2) * 0.1; // gentle wobble

      // Outer glow ring
      const ringGlow = ctx.createRadialGradient(cx, cy, sphereRadius * 0.95, cx, cy, sphereRadius * 1.35);
      ringGlow.addColorStop(0, 'rgba(202,60,61,0)');
      ringGlow.addColorStop(0.5, `rgba(202,60,61,${0.04 + Math.sin(time * 0.8) * 0.02})`);
      ringGlow.addColorStop(0.7, `rgba(202,60,61,${0.02 + Math.sin(time * 0.8) * 0.01})`);
      ringGlow.addColorStop(1, 'rgba(202,60,61,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.35, 0, Math.PI * 2);
      ctx.fillStyle = ringGlow;
      ctx.fill();

      // Subtle ambient glow at center
      const ambientGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sphereRadius * 0.8);
      ambientGlow.addColorStop(0, 'rgba(202,60,61,0.03)');
      ambientGlow.addColorStop(0.5, 'rgba(202,60,61,0.01)');
      ambientGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = ambientGlow;
      ctx.fill();

      // Transform and project all nodes
      const projected: { px: number; py: number; scale: number; depth: number; idx: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const r = rotatePoint(n.x, n.y, n.z, rotY, rotX);
        const p = project(r.x, r.y, r.z);
        projected.push({ ...p, idx: i });
      }

      // Sort by depth (back to front)
      projected.sort((a, b) => a.depth - b.depth);

      // Build lookup for fast access by index
      const projMap = new Map<number, { px: number; py: number; scale: number; depth: number }>();
      for (const p of projected) {
        projMap.set(p.idx, p);
      }

      // Draw connections (lines between nearby nodes)
      for (const [i, j] of connections) {
        const pA = projMap.get(i);
        const pB = projMap.get(j);
        if (!pA || !pB) continue;

        // Fade based on average depth (back nodes are more transparent)
        const avgDepth = (pA.depth + pB.depth) / 2;
        const depthFactor = (avgDepth + 1) / 2; // 0 (back) to 1 (front)
        const alpha = 0.03 + depthFactor * 0.08;

        const nodeA = nodes[i];
        const nodeB = nodes[j];
        const isRedConnection = nodeA.isRed && nodeB.isRed;

        ctx.beginPath();
        ctx.moveTo(pA.px, pA.py);
        ctx.lineTo(pB.px, pB.py);
        ctx.strokeStyle = isRedConnection
          ? `rgba(202,60,61,${alpha})`
          : `rgba(160,160,160,${alpha * 0.7})`;
        ctx.lineWidth = 0.4 + depthFactor * 0.3;
        ctx.stroke();
      }

      // Draw data pulses traveling along connections
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          spawnPulse();
          continue;
        }

        const pFrom = projMap.get(pulse.fromIdx);
        const pTo = projMap.get(pulse.toIdx);
        if (!pFrom || !pTo) continue;

        const px = pFrom.px + (pTo.px - pFrom.px) * pulse.progress;
        const py = pFrom.py + (pTo.py - pFrom.py) * pulse.progress;
        const avgDepth = (pFrom.depth + pTo.depth) / 2;
        const depthFactor = (avgDepth + 1) / 2;
        const pulseAlpha = 0.3 + depthFactor * 0.5;
        const pulseSize = 1.5 + depthFactor * 1.5;

        // Pulse glow
        const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, pulseSize * 4);
        if (pulse.isRed) {
          pulseGrad.addColorStop(0, `rgba(202,60,61,${pulseAlpha * 0.5})`);
        } else {
          pulseGrad.addColorStop(0, `rgba(220,220,220,${pulseAlpha * 0.4})`);
        }
        pulseGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, pulseSize * 4, 0, Math.PI * 2);
        ctx.fillStyle = pulseGrad;
        ctx.fill();

        // Pulse core
        ctx.beginPath();
        ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = pulse.isRed
          ? `rgba(202,60,61,${pulseAlpha})`
          : `rgba(220,220,220,${pulseAlpha})`;
        ctx.fill();
      }

      // Spawn new pulses periodically
      if (Math.random() < 0.04) {
        spawnPulse();
      }

      // Draw nodes (sorted back to front for proper layering)
      for (const p of projected) {
        const node = nodes[p.idx];
        const depthFactor = (p.depth + 1) / 2; // 0..1
        const pulse = Math.sin(time * 2 + node.pulseOffset) * 0.3 + 0.7;
        const size = node.baseSize * p.scale * pulse;
        const alpha = (0.15 + depthFactor * 0.65) * pulse;

        // Node glow
        const glowRadius = size * 4;
        const nodeGlow = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, glowRadius);
        if (node.isRed) {
          nodeGlow.addColorStop(0, `rgba(202,60,61,${alpha * 0.35})`);
          nodeGlow.addColorStop(0.5, `rgba(202,60,61,${alpha * 0.1})`);
        } else {
          nodeGlow.addColorStop(0, `rgba(180,180,180,${alpha * 0.25})`);
          nodeGlow.addColorStop(0.5, `rgba(160,160,160,${alpha * 0.08})`);
        }
        nodeGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(p.px, p.py, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeGlow;
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fillStyle = node.isRed
          ? `rgba(202,60,61,${alpha})`
          : `rgba(190,190,190,${alpha})`;
        ctx.fill();

        // Bright center highlight for front-facing nodes
        if (depthFactor > 0.6) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = node.isRed
            ? `rgba(255,120,120,${(depthFactor - 0.6) * 0.8})`
            : `rgba(255,255,255,${(depthFactor - 0.6) * 0.6})`;
          ctx.fill();
        }
      }

      // Outer ring stroke (subtle)
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.08, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(202,60,61,${0.06 + Math.sin(time * 1.2) * 0.03})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Second outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160,160,160,${0.03 + Math.sin(time * 0.9) * 0.015})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 'min(520px, 92vw)', aspectRatio: '1 / 1' }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
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
            <h1 className="hero-reveal leading-none" style={{ fontSize: 'clamp(3.2rem, 9vw, 7rem)' }}>
              <span className="font-brand s11-wordmark" style={{ display: 'block', fontWeight: 400 }}>
                SAPIEN ELEVEN
              </span>
              <span className="s11-platforms" style={{ display: 'block', fontSize: 'clamp(2.5rem, 7vw, 5.4rem)' }}>
                Platforms
              </span>
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

        {/* Right: animated data sphere visualization */}
        <div className="hero-reveal flex items-center justify-center lg:justify-end">
          <DataSphereAnimation />
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
