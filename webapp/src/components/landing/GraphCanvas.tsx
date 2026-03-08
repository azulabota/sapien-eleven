import { useEffect, useRef } from 'react';

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

export function GraphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<NodeData[]>([]);
  const sectionsRef = useRef<Array<{ id: string; top: number; height: number }>>([]);

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
      // +40% density (user request) since we're removing the fast “shooting star” packets.
      const nodeCount = Math.min(Math.max(Math.floor((viewArea / 18000) * 1.4), 55), 200);

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          radius: Math.random() * 1.9 + 1.2,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.012,
          opacity: 0.28 + Math.random() * 0.42,
          // Only floating grey nodes (no red “shooting stars” / packets)
          type: 'silver',
        });
      }

      nodesRef.current = nodes;
    };

    const draw = () => {
      const vw = getViewport().w;
      const vh = getViewport().h;
      const scrollY = window.scrollY || 0;

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

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', refreshSections, { passive: true });
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', refreshSections);
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
