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

const RED = 'rgba(220, 40, 40,';
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 5;
      initGraph();
    };

    const initGraph = () => {
      const W = canvas.width;
      const H = canvas.height;
      const nodes: NodeData[] = [];
      const edges: EdgeData[] = [];

      const nodeCount = Math.min(Math.max(Math.floor((W * H) / 28000), 40), 110);

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          radius: Math.random() * 1.5 + 1,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.007 + Math.random() * 0.01,
          opacity: 0.25 + Math.random() * 0.35,
          // mix: mostly silver, occasional red
          type: Math.random() < 0.25 ? 'red' : 'silver',
        });
      }

      const maxDist = Math.min(W, 600) * 0.22;
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
      const W = canvas.width;
      const H = canvas.height;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      ctx.clearRect(0, 0, W, H);

      for (const edge of edges) {
        const nA = nodes[edge.from];
        const nB = nodes[edge.to];
        if (!nA || !nB) continue;

        const dx = nB.x - nA.x;
        const dy = nB.y - nA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(W, 600) * 0.22;
        // Use red for edges between red nodes, silver otherwise
        const isRedEdge = nA.type === 'red' && nB.type === 'red';
        const col = isRedEdge ? RED : SILVER;
        const alpha = (1 - dist / maxDist) * 0.07;

        ctx.beginPath();
        ctx.moveTo(nA.x, nA.y);
        ctx.lineTo(nB.x, nB.y);
        ctx.strokeStyle = `${col} ${alpha})`;
        ctx.lineWidth = 0.5;
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
          const px = nA.x + dx * edge.travelProgress;
          const py = nA.y + dy * edge.travelProgress;
          const packetAlpha = Math.sin(edge.travelProgress * Math.PI) * 0.8;
          const packetCol = isRedEdge ? RED : SILVER;

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${packetCol} ${packetAlpha})`;
          ctx.fill();

          const trail1x = nA.x + dx * (edge.travelProgress - 0.05);
          const trail1y = nA.y + dy * (edge.travelProgress - 0.05);
          ctx.beginPath();
          ctx.moveTo(trail1x, trail1y);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `${packetCol} ${packetAlpha * 0.4})`;
          ctx.lineWidth = 0.7;
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
        if (node.x < 0 || node.x > W) node.vx *= -1;
        if (node.y < 0 || node.y > H) node.vy *= -1;
        node.x = Math.max(0, Math.min(W, node.x));
        node.y = Math.max(0, Math.min(H, node.y));

        node.pulsePhase += node.pulseSpeed;
        const pulse = 0.5 + 0.5 * Math.sin(node.pulsePhase);
        const alpha = node.opacity * (0.6 + 0.4 * pulse);
        const col = node.type === 'red' ? RED : SILVER;

        const glowRadius = node.radius * (2.5 + pulse * 1.5);
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        gradient.addColorStop(0, `${col} ${alpha * 0.3})`);
        gradient.addColorStop(1, `${col} 0)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
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
