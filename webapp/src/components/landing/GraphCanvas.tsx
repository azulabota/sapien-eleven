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
  cluster: number;
}

interface EdgeData {
  from: number;
  to: number;
  travelProgress: number;
  travelSpeed: number;
  travelActive: boolean;
  travelTimer: number;
}

const CYAN = 'rgba(14, 213, 237,';
const CYAN_DIM = 'rgba(14, 213, 237,';

export function GraphCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<NodeData[]>([]);
  const edgesRef = useRef<EdgeData[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 5; // tall enough for full page
      initGraph();
    };

    const initGraph = () => {
      const W = canvas.width;
      const H = canvas.height;
      const nodes: NodeData[] = [];
      const edges: EdgeData[] = [];

      // Create distributed nodes across the full canvas height
      const nodeCount = Math.floor((W * H) / 28000);
      const clamped = Math.min(Math.max(nodeCount, 40), 120);

      for (let i = 0; i < clamped; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          radius: Math.random() * 1.5 + 1,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.012,
          opacity: 0.3 + Math.random() * 0.4,
          cluster: Math.floor(Math.random() * 6),
        });
      }

      // Build edges: connect nearby nodes
      const maxDist = Math.min(W, 600) * 0.22;
      for (let i = 0; i < nodes.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          if (connections >= 3) break;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            edges.push({
              from: i,
              to: j,
              travelProgress: 0,
              travelSpeed: 0.004 + Math.random() * 0.006,
              travelActive: false,
              travelTimer: Math.random() * 300,
            });
            connections++;
          }
        }
      }

      nodesRef.current = nodes;
      edgesRef.current = edges;
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      timeRef.current += 1;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      // Draw edges
      for (const edge of edges) {
        const nA = nodes[edge.from];
        const nB = nodes[edge.to];
        if (!nA || !nB) continue;

        const dx = nB.x - nA.x;
        const dy = nB.y - nA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(W, 600) * 0.22;
        const alpha = (1 - dist / maxDist) * 0.08;

        // Draw static edge
        ctx.beginPath();
        ctx.moveTo(nA.x, nA.y);
        ctx.lineTo(nB.x, nB.y);
        ctx.strokeStyle = `${CYAN_DIM} ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Traveling data packet
        edge.travelTimer--;
        if (edge.travelTimer <= 0 && !edge.travelActive) {
          edge.travelActive = true;
          edge.travelProgress = 0;
          edge.travelTimer = 200 + Math.random() * 400;
        }

        if (edge.travelActive) {
          edge.travelProgress += edge.travelSpeed;
          const px = nA.x + dx * edge.travelProgress;
          const py = nA.y + dy * edge.travelProgress;

          const packetAlpha = Math.sin(edge.travelProgress * Math.PI) * 0.9;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${CYAN} ${packetAlpha})`;
          ctx.fill();

          // Trail
          const trail1x = nA.x + dx * (edge.travelProgress - 0.05);
          const trail1y = nA.y + dy * (edge.travelProgress - 0.05);
          ctx.beginPath();
          ctx.moveTo(trail1x, trail1y);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `${CYAN} ${packetAlpha * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          if (edge.travelProgress >= 1) {
            edge.travelActive = false;
            edge.travelProgress = 0;
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > W) node.vx *= -1;
        if (node.y < 0 || node.y > H) node.vy *= -1;

        node.x = Math.max(0, Math.min(W, node.x));
        node.y = Math.max(0, Math.min(H, node.y));

        // Pulse
        node.pulsePhase += node.pulseSpeed;
        const pulse = 0.5 + 0.5 * Math.sin(node.pulsePhase);
        const alpha = node.opacity * (0.6 + 0.4 * pulse);

        // Outer glow
        const glowRadius = node.radius * (2.5 + pulse * 1.5);
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowRadius
        );
        gradient.addColorStop(0, `${CYAN} ${alpha * 0.4})`);
        gradient.addColorStop(1, `${CYAN} 0)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${CYAN} ${alpha})`;
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
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  );
}
