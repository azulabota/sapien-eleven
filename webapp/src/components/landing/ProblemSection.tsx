import { useEffect, useRef, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  r: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
  pulsePhase: number;
}

interface Cluster {
  label: string;
  cx: number;
  cy: number;
  nodes: Node[];
  driftAngle: number;
  driftSpeed: number;
  driftRadius: number;
}


interface GlitchState {
  active: boolean;
  timer: number;
  cooldown: number;
  rows: { y: number; offset: number; height: number }[];
}

// ── Canvas Visualization ───────────────────────────────────────────────────

function BrokenGraphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{
    clusters: Cluster[];
    glitch: GlitchState;
    time: number;
    dpr: number;
  } | null>(null);

  const initState = useCallback((width: number, height: number) => {
    // Wearables in the center, other domains around it.
    const center = { cx: width * 0.5, cy: height * 0.5 };
    const ring = {
      // Spread clusters out a bit more so they don't feel cramped.
      r: Math.min(width, height) * 0.34,
      cx: center.cx,
      cy: center.cy,
    };

    const ringLabels = ['NUTRITION', 'FITNESS', 'MENTAL HEALTH', 'SLEEP', 'RECOVERY', "WOMEN'S HEALTH"];
    const ringDefs = ringLabels.map((label, i) => {
      const a = (-Math.PI / 2) + (i * (Math.PI * 2)) / ringLabels.length;
      return {
        label,
        cx: ring.cx + Math.cos(a) * ring.r,
        cy: ring.cy + Math.sin(a) * ring.r,
      };
    });

    const clusterDefs = [{ label: 'WEARABLES', ...center }, ...ringDefs];

    const clusters: Cluster[] = clusterDefs.map((def) => {
      const nodeCount = 5 + Math.floor(Math.random() * 3); // 5-7 nodes
      const nodes: Node[] = [];
      for (let i = 0; i < nodeCount; i++) {
        const angle = (Math.PI * 2 * i) / nodeCount + (Math.random() - 0.5) * 0.6;
        const dist = 18 + Math.random() * 28;
        nodes.push({
          baseX: Math.cos(angle) * dist,
          baseY: Math.sin(angle) * dist,
          x: 0,
          y: 0,
          r: 2.5 + Math.random() * 3.5,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: 0.2 + Math.random() * 0.4,
          orbitRadius: 2 + Math.random() * 4,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
      return {
        ...def,
        nodes,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: 0.15 + Math.random() * 0.15,
        driftRadius: 4 + Math.random() * 6,
      };
    });


    const glitch: GlitchState = {
      active: false,
      timer: 4 + Math.random() * 4,
      cooldown: 5 + Math.random() * 6,
      rows: [],
    };

    return { clusters, glitch, time: 0, dpr: 1 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const newState = initState(rect.width, rect.height);
      newState.dpr = dpr;
      stateRef.current = newState;
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap delta at 50ms
      lastTime = now;

      const state = stateRef.current;
      if (!state || !ctx || !canvas) return;

      state.time += dt;
      const t = state.time;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // ── Update clusters ─────────────────────────────────────────────
      for (const cluster of state.clusters) {
        cluster.driftAngle += cluster.driftSpeed * dt;
        const driftX = Math.cos(cluster.driftAngle) * cluster.driftRadius;
        const driftY = Math.sin(cluster.driftAngle * 0.7) * cluster.driftRadius;

        for (const node of cluster.nodes) {
          node.orbitAngle += node.orbitSpeed * dt;
          node.x = cluster.cx + driftX + node.baseX + Math.cos(node.orbitAngle) * node.orbitRadius;
          node.y = cluster.cy + driftY + node.baseY + Math.sin(node.orbitAngle) * node.orbitRadius;
        }
      }

      // ── Draw intra-cluster connections ──────────────────────────────
      for (const cluster of state.clusters) {
        const nodes = cluster.nodes;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 70) {
              const alpha = 0.12 + 0.08 * (1 - dist / 70);
              const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + nodes[i].pulsePhase);
              ctx.strokeStyle = `rgba(160,160,160,${alpha * (0.7 + 0.3 * pulse)})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // No fast red “shooting star” sparks here — keep this section calm.

      // ── Draw nodes (on top) ─────────────────────────────────────────
      for (const cluster of state.clusters) {
        for (const node of cluster.nodes) {
          const pulse = 0.6 + 0.4 * Math.sin(t * 2 + node.pulsePhase);

          // Glow
          const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 3);
          grd.addColorStop(0, `rgba(160,160,160,${0.08 * pulse})`);
          grd.addColorStop(1, `rgba(160,160,160,0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `rgba(160,160,160,${0.3 + 0.2 * pulse})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Draw cluster labels ─────────────────────────────────────────
      ctx.textAlign = 'center';
      ctx.font = '600 8px Plus Jakarta Sans, sans-serif';
      for (const cluster of state.clusters) {
        const driftX = Math.cos(cluster.driftAngle) * cluster.driftRadius;
        const driftY = Math.sin(cluster.driftAngle * 0.7) * cluster.driftRadius;
        const labelPulse = 0.35 + 0.15 * Math.sin(t * 0.8);
        ctx.fillStyle = `rgba(140,140,140,${labelPulse})`;
        ctx.letterSpacing = '2px';
        ctx.fillText(cluster.label, cluster.cx + driftX, cluster.cy + driftY + 55);
      }

      // ── Glitch effect ───────────────────────────────────────────────
      const gl = state.glitch;
      gl.timer -= dt;
      if (gl.timer <= 0 && !gl.active) {
        gl.active = true;
        gl.timer = 0.06 + Math.random() * 0.08; // glitch lasts 60-140ms
        // Generate glitch rows
        const rowCount = 2 + Math.floor(Math.random() * 3);
        gl.rows = [];
        for (let i = 0; i < rowCount; i++) {
          gl.rows.push({
            y: Math.floor(Math.random() * h),
            offset: (Math.random() - 0.5) * 12,
            height: 2 + Math.floor(Math.random() * 6),
          });
        }
      }
      if (gl.active) {
        gl.timer -= dt;
        if (gl.timer <= 0) {
          gl.active = false;
          gl.timer = gl.cooldown + Math.random() * 4;
        } else {
          // Apply glitch: copy horizontal slices with displacement
          const dpr = state.dpr;
          for (const row of gl.rows) {
            const srcY = Math.max(0, Math.floor(row.y * dpr));
            const sliceH = Math.max(1, Math.floor(row.height * dpr));
            const offset = Math.floor(row.offset * dpr);
            if (srcY + sliceH <= canvas.height && srcY >= 0) {
              try {
                const imgData = ctx.getImageData(0, srcY, canvas.width, sliceH);
                ctx.putImageData(imgData, offset, srcY);
              } catch (_e) {
                // ignore security errors on getImageData
              }
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initState]);

  return (
    <div className="relative w-full max-w-lg mx-auto" style={{ height: 420 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
}

// ── ProblemSection ─────────────────────────────────────────────────────────

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
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(202,60,61,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: visual */}
        <div className="reveal order-2 lg:order-1">
          <BrokenGraphCanvas />
          <p
            className="text-center mt-4 font-ui text-xs tracking-widest"
            style={{ color: 'rgba(202,60,61,0.5)', letterSpacing: '0.2em' }}
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
              <span style={{ color: '#CA3C3D' }}>But it isn't connected.</span>
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
                  background: 'rgba(202,60,61,0.03)',
                  border: '1px solid rgba(202,60,61,0.1)',
                }}
              >
                <div
                  className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'rgba(202,60,61,0.12)', color: 'rgba(202,60,61,0.8)' }}
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
