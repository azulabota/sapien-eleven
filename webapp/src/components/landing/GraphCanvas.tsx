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

interface EdgeData {
  from: number;
  to: number;
  travelProgress: number;
  travelSpeed: number;
  travelActive: boolean;
  travelTimer: number;
}

const RED = 'rgba(202, 60, 61,';
const SILVER = 'rgba(160, 160, 160,';

export function GraphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<NodeData[]>([]);
  const edgesRef = useRef<EdgeData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getViewport = () => ({ w: window.innerWidth, h: window.innerHeight });

    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let worldH = Math.max(getViewport().h, document.documentElement.scrollHeight || 0);

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const { w, h } = getViewport();
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      worldH = Math.max(h, document.documentElement.scrollHeight || 0);
      initGraph();
    };

    const initGraph = () => {
      const W = getViewport().w;
      const H = worldH;
      const nodes: NodeData[] = [];
      const edges: EdgeData[] = [];

      // Density is tuned to the *viewport* so each screen feels alive (not sparse).
      const viewArea = getViewport().w * getViewport().h;
      const nodeCount = Math.min(Math.max(Math.floor(viewArea / 18000), 55), 140);

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
          // mix: mostly silver, occasional red
          type: Math.random() < 0.25 ? 'red' : 'silver',
        });
      }

      const maxDist = Math.min(W, 720) * 0.26;
      for (let i = 0; i < nodes.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          if (connections >= 3) break;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < maxDist) {
            edges.push({
              from: i,
              to: j,
              travelProgress: 0,
              travelSpeed: 0.004 + Math.random() * 0.005,
              travelActive: false,
              travelTimer: Math.random() * 320,
            });
            connections++;
          }
        }
      }

      nodesRef.current = nodes;
      edgesRef.current = edges;
    };

    const draw = () => {
      const vw = getViewport().w;
      const vh = getViewport().h;
      const scrollY = window.scrollY || 0;

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      ctx.clearRect(0, 0, vw, vh);

      // Only draw what's in view (world-space nodes are spread across the full page height).
      const viewTop = scrollY - 120;
      const viewBottom = scrollY + vh + 120;

      for (const edge of edges) {
        const nA = nodes[edge.from];
        const nB = nodes[edge.to];
        if (!nA || !nB) continue;

        // Quick reject if both endpoints are far outside view
        if ((nA.y < viewTop && nB.y < viewTop) || (nA.y > viewBottom && nB.y > viewBottom)) continue;

        const ax = nA.x;
        const ay = nA.y - scrollY;
        const bx = nB.x;
        const by = nB.y - scrollY;

        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(vw, 720) * 0.26;

        const isRedEdge = nA.type === 'red' && nB.type === 'red';
        const col = isRedEdge ? RED : SILVER;
        const alpha = (1 - dist / maxDist) * 0.085;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `${col} ${alpha})`;
        ctx.lineWidth = 0.55;
        ctx.stroke();

        // Traveling packet
        edge.travelTimer--;
        if (edge.travelTimer <= 0 && !edge.travelActive) {
          edge.travelActive = true;
          edge.travelProgress = 0;
          edge.travelTimer = 180 + Math.random() * 380;
        }
        if (edge.travelActive) {
          edge.travelProgress += edge.travelSpeed;
          const px = ax + dx * edge.travelProgress;
          const py = ay + dy * edge.travelProgress;
          const packetAlpha = Math.sin(edge.travelProgress * Math.PI) * 0.85;
          const packetCol = isRedEdge ? RED : SILVER;

          ctx.beginPath();
          ctx.arc(px, py, 1.7, 0, Math.PI * 2);
          ctx.fillStyle = `${packetCol} ${packetAlpha})`;
          ctx.fill();

          const trail1x = ax + dx * (edge.travelProgress - 0.05);
          const trail1y = ay + dy * (edge.travelProgress - 0.05);
          ctx.beginPath();
          ctx.moveTo(trail1x, trail1y);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `${packetCol} ${packetAlpha * 0.4})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();

          if (edge.travelProgress >= 1) {
            edge.travelActive = false;
            edge.travelProgress = 0;
          }
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

        const glowRadius = node.radius * (3.0 + pulse * 1.9);
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
        gradient.addColorStop(0, `${col} ${alpha * 0.32})`);
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
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
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
