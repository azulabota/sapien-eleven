import { useEffect, useRef } from 'react';

type MouseState = {
  x: number;
  y: number;
  active: boolean;
  lastClickAt: number;
};

interface NodeData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
  opacity: number;
  type: 'red' | 'silver';
}

const RED = 'rgba(202, 60, 61,';
const SILVER = 'rgba(160, 160, 160,';

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function GraphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<NodeData[]>([]);
  const sectionsRef = useRef<Array<{ id: string; top: number; height: number }>>([]);
  const mouseRef = useRef<MouseState>({ x: -9999, y: -9999, active: false, lastClickAt: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getViewport = () => ({ w: window.innerWidth, h: window.innerHeight });

    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let worldH = Math.max(getViewport().h, document.documentElement.scrollHeight || 0);

    const refreshSections = () => {
      // Capture section top offsets for section-aware emphasis.
      const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
      sectionsRef.current = sections
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const top = rect.top + (window.scrollY || 0);
          return { id: el.id, top, height: rect.height };
        })
        .filter((s) => Number.isFinite(s.top) && s.height > 0);
    };

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const { w, h } = getViewport();
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      worldH = Math.max(h, document.documentElement.scrollHeight || 0);
      refreshSections();
      initGraph();
    };

    const initGraph = () => {
      const W = getViewport().w;
      const H = worldH;
      const nodes: NodeData[] = [];

      // Density is tuned to the *viewport* so each screen feels alive (not sparse).
      const viewArea = getViewport().w * getViewport().h;
      // More particles + a few soft “clusters”.
      const nodeCount = Math.min(Math.max(Math.floor((viewArea / 15000) * 1.65), 95), 320);

      const clusterCount = clamp(Math.floor(nodeCount / 55), 2, 7);
      const clusters = Array.from({ length: clusterCount }).map(() => ({
        cx: Math.random() * W,
        cy: Math.random() * H,
        r: (Math.min(W, getViewport().h) * 0.18) * (0.7 + Math.random() * 0.8),
      }));

      const spawnNode = (x: number, y: number, burst = false) => {
        const v = burst ? 0.75 : 0.30;
        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * v,
          vy: (Math.random() - 0.5) * v,
          radius: Math.random() * (burst ? 1.8 : 1.6) + (burst ? 1.0 : 0.9),
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.007 + Math.random() * 0.013,
          opacity: (burst ? 0.42 : 0.26) + Math.random() * 0.44,
          type: 'silver',
        });
      };

      // Seed clusters (denser pockets)
      const clusterNodes = Math.floor(nodeCount * 0.62);
      for (let i = 0; i < clusterNodes; i++) {
        const c = clusters[i % clusters.length];
        const a = Math.random() * Math.PI * 2;
        const rr = c.r * Math.sqrt(Math.random());
        const x = clamp(c.cx + Math.cos(a) * rr, 0, W);
        const y = clamp(c.cy + Math.sin(a) * rr, 0, H);
        spawnNode(x, y);
      }

      // Fill remaining nodes uniformly
      while (nodes.length < nodeCount) {
        spawnNode(Math.random() * W, Math.random() * H);
      }

      nodesRef.current = nodes;
    };

    const draw = () => {
      const vw = getViewport().w;
      const vh = getViewport().h;
      const scrollY = window.scrollY || 0;
      const mouse = mouseRef.current;

      const nodes = nodesRef.current;

      ctx.clearRect(0, 0, vw, vh);

      // Section-aware emphasis: gently brighten when a section is centered.
      const centerY = scrollY + vh / 2;
      const sections = sectionsRef.current;
      let nearestDist = Infinity;
      let nearestId = '';
      for (const s of sections) {
        const sCenter = s.top + s.height / 2;
        const d = Math.abs(centerY - sCenter);
        if (d < nearestDist) {
          nearestDist = d;
          nearestId = s.id;
        }
      }

      const sectionT = nearestDist === Infinity ? 0 : Math.max(0, 1 - nearestDist / (vh * 0.9));
      const sectionEmphasis = sectionT * sectionT * (3 - 2 * sectionT); // smoothstep

      const isKey = nearestId === 'hero' || nearestId === 'data-layer' || nearestId === 'cta';
      const keyBoost = isKey ? 1 : 0;

      // Mobile contrast bump.
      const mobile = vw < 640;
      const contrast = mobile ? 1.18 : 1;

      // Mouse interaction: repulsion that “pushes” particles around.
      const influenceRadius = mobile ? 125 : 150;
      const influenceRadius2 = influenceRadius * influenceRadius;
      const pushStrength = mobile ? 0.08 : 0.09;

      // Only draw what's in view (world-space nodes are spread across the full page height).
      const viewTop = scrollY - 140;
      const viewBottom = scrollY + vh + 140;

      // Connection vectors between nearby grey nodes (no fast traveling packets).
      // “2–3 cm” on most screens is roughly ~80–120 CSS px; we pick a tuned midpoint.
      const connectionDistPx = (vw < 640 ? 95 : 110) * (mobile ? 0.95 : 1);
      const connDist2 = connectionDistPx * connectionDistPx;

      // Only consider nodes in view for connections to keep it cheap.
      const viewNodes: Array<{ idx: number; x: number; y: number }> = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.y < viewTop || n.y > viewBottom) continue;
        viewNodes.push({ idx: i, x: n.x, y: n.y - scrollY });
      }

      for (let i = 0; i < viewNodes.length; i++) {
        const a = viewNodes[i];
        for (let j = i + 1; j < viewNodes.length; j++) {
          const b = viewNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > connDist2) continue;

          const dist = Math.sqrt(d2);
          const t = 1 - dist / connectionDistPx;
          const alpha = (0.035 + 0.035 * t) * (0.85 + 0.35 * sectionEmphasis + 0.2 * keyBoost) * contrast;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `${SILVER} ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        // Mouse push (viewport coords → world coords)
        if (mouse.active) {
          const mx = mouse.x;
          const my = mouse.y + scrollY;
          const dx = node.x - mx;
          const dy = node.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 > 1 && d2 < influenceRadius2) {
            const dist = Math.sqrt(d2);
            const t = 1 - dist / influenceRadius;
            // Repel outward, with a tiny swirl so it feels organic.
            const nx = dx / dist;
            const ny = dy / dist;
            const swirl = 0.22;
            const sx = -ny;
            const sy = nx;
            node.vx += (nx + sx * swirl) * (pushStrength * t);
            node.vy += (ny + sy * swirl) * (pushStrength * t);
          }
        }

        // Damping to keep things calm.
        node.vx *= 0.992;
        node.vy *= 0.992;

        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > vw) node.vx *= -1;
        if (node.y < 0 || node.y > worldH) node.vy *= -1;
        node.x = Math.max(0, Math.min(vw, node.x));
        node.y = Math.max(0, Math.min(worldH, node.y));

        if (node.y < viewTop || node.y > viewBottom) continue;

        node.pulsePhase += node.pulseSpeed;
        const pulse = 0.5 + 0.5 * Math.sin(node.pulsePhase);
        const alpha = node.opacity * (0.6 + 0.4 * pulse);
        const col = node.type === 'red' ? RED : SILVER;

        const sx = node.x;
        const sy = node.y - scrollY;

        const glowRadius = node.radius * (3.0 + pulse * 1.9) * (1 + 0.08 * sectionEmphasis) * (mobile ? 1.12 : 1);
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
        gradient.addColorStop(0, `${col} ${alpha * (0.3 + 0.08 * sectionEmphasis + 0.06 * keyBoost)})`);
        gradient.addColorStop(1, `${col} 0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${col} ${alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    const spawnBurstAt = (clientX: number, clientY: number) => {
      const nodes = nodesRef.current;
      const vw = getViewport().w;
      const scrollY = window.scrollY || 0;
      const worldX = clamp(clientX, 0, vw);
      const worldY = clamp(clientY + scrollY, 0, worldH);

      // Throttle rapid-fire taps.
      const now = performance.now();
      if (now - mouseRef.current.lastClickAt < 120) return;
      mouseRef.current.lastClickAt = now;

      const burstCount = vw < 640 ? 10 : 14;
      for (let i = 0; i < burstCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const rr = (vw < 640 ? 26 : 34) * Math.sqrt(Math.random());
        nodes.push({
          x: clamp(worldX + Math.cos(a) * rr, 0, vw),
          y: clamp(worldY + Math.sin(a) * rr, 0, worldH),
          vx: (Math.random() - 0.5) * 1.0,
          vy: (Math.random() - 0.5) * 1.0,
          radius: Math.random() * 1.8 + 1.0,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.010 + Math.random() * 0.016,
          opacity: 0.36 + Math.random() * 0.48,
          type: 'silver',
        });
      }

      // Keep a soft cap.
      if (nodes.length > 420) nodesRef.current = nodes.slice(nodes.length - 420);
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onPointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    const onPointerDown = (e: PointerEvent) => {
      // Create new particles on click/tap.
      spawnBurstAt(e.clientX, e.clientY);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', refreshSections, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('blur', onPointerLeave);
    document.addEventListener('mouseleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', refreshSections);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.65 }}
    />
  );
}
