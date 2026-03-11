import { useEffect, useRef, useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FeatureDef {
  id: string;
  label: string;
  headline: string;
  subline: string;
  bullets: string[];
  nodeColor: string;        // rgba prefix without closing alpha, e.g. "rgba(202,60,61,"
  accentColor: string;
  theme: 'red' | 'silver';
  speed: number;             // animation speed multiplier (1 = normal)
}

interface CanvasNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  isHub: boolean;
  pulsePhase: number;
  pulseSpeed: number;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface CanvasEdge {
  from: number;
  to: number;
}

interface DataParticle {
  edgeIdx: number;
  progress: number;
  speed: number;
  forward: boolean;
}

interface BackgroundDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
}

type SpotlightItem =
  | { kind: 'text'; text: string }
  | { kind: 'icon'; name: string; src: string; img?: HTMLImageElement };

interface SpotlightParticle {
  item: SpotlightItem;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

/* ------------------------------------------------------------------ */
/*  Feature definitions (text content identical to original)           */
/* ------------------------------------------------------------------ */

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
    nodeColor: 'rgba(255,255,255,',
    accentColor: 'rgba(202,60,61,0.9)',
    theme: 'red',
    speed: 1.3,
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
    nodeColor: 'rgba(255,255,255,',
    accentColor: 'rgba(202,60,61,0.9)',
    theme: 'silver',
    speed: 0.9,
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
    nodeColor: 'rgba(255,255,255,',
    accentColor: 'rgba(202,60,61,0.9)',
    theme: 'red',
    speed: 1.5,
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
    nodeColor: 'rgba(255,255,255,',
    accentColor: 'rgba(202,60,61,0.9)',
    theme: 'silver',
    speed: 0.6,
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: generate node layout for a feature                        */
/* ------------------------------------------------------------------ */

function generateNodeLayout(
  W: number,
  H: number,
  nodeCount: number,
  theme: 'red' | 'silver',
  variant: FeatureDef['id'],
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  // Subtle per-section shape variation while staying “abstract tech-network”.
  // (No literal icons—just different geometry: slightly offset hub, ellipse vs circle, edge density.)
  const baseCx = W / 2;
  const baseCy = H / 2;

  let cx = baseCx;
  let cy = baseCy;
  let spread = Math.min(W, H) * 0.38;
  let ellipseX = 1;
  let ellipseY = 1;

  if (variant === 'coaching') {
    // Slightly larger spread + denser connectivity
    spread *= 1.03;
  } else if (variant === 'nutrition') {
    // Slight offset + slight horizontal ellipse (suggests “flow”)
    cx = baseCx - W * 0.03;
    cy = baseCy + H * 0.01;
    ellipseX = 1.08;
    ellipseY = 0.96;
  } else if (variant === 'fitness') {
    // Slight vertical ellipse (suggests intensity/verticality)
    ellipseX = 0.96;
    ellipseY = 1.10;
    spread *= 1.02;
  } else if (variant === 'mental-health') {
    // Tighter, calmer cluster
    spread *= 0.95;
  }

  const nodes: CanvasNode[] = [];

  // Hub node in center
  nodes.push({
    baseX: cx,
    baseY: cy,
    x: cx,
    y: cy,
    radius: theme === 'red' ? 10 : 9,
    isHub: true,
    pulsePhase: 0,
    pulseSpeed: 0.025,
    orbitAngle: 0,
    orbitRadius: 0,
    orbitSpeed: 0,
  });

  // Satellite nodes arranged in rings
  const ringCount = 2;
  const nodesPerRing = [Math.floor((nodeCount - 1) * 0.45), Math.ceil((nodeCount - 1) * 0.55)];
  const ringRadii = [spread * 0.45, spread * 0.85];

  for (let ring = 0; ring < ringCount; ring++) {
    const count = nodesPerRing[ring];
    const baseRadius = ringRadii[ring];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + ring * 0.3;
      const jitter = (Math.random() - 0.5) * spread * 0.15;
      const r = baseRadius + jitter;
      const bx = cx + Math.cos(angle) * r * ellipseX;
      const by = cy + Math.sin(angle) * r * ellipseY;
      nodes.push({
        baseX: bx,
        baseY: by,
        x: bx,
        y: by,
        radius: 3 + Math.random() * 3,
        isHub: false,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: 2 + Math.random() * 4,
        orbitSpeed: (0.003 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1),
      });
    }
  }

  // Edges: hub connects to all, and nearby satellites connect to each other
  const edges: CanvasEdge[] = [];
  for (let i = 1; i < nodes.length; i++) {
    edges.push({ from: 0, to: i });
  }

  // Interconnect nearby satellites (density varies subtly per feature)
  const density =
    variant === 'coaching' ? 0.62 :
    variant === 'fitness' ? 0.58 :
    variant === 'nutrition' ? 0.54 :
    0.50; // mental-health: calmest

  for (let i = 1; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].baseX - nodes[j].baseX;
      const dy = nodes[i].baseY - nodes[j].baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < spread * density) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/*  Canvas-based animated diagram component                            */
/* ------------------------------------------------------------------ */

function FeatureCanvasDiagram({ feature, isVisible }: { feature: FeatureDef; isVisible: boolean }) {
  const getSpotlightItems = (id: string): SpotlightItem[] => {
    switch (id) {
      case 'coaching':
        // Text + (later) icons that appear only under the mouse “spotlight”.
        return [
          { kind: 'text', text: 'NUTRITION' },
          { kind: 'text', text: 'FITNESS' },
          { kind: 'text', text: 'MENTAL HEALTH' },
          { kind: 'text', text: 'HAi' },
          { kind: 'icon', name: 'DCI', src: '/spotlight/dci.svg' },
          { kind: 'icon', name: 'FCoach', src: '/spotlight/fcoach.svg' },
        ];
      case 'nutrition':
        return [
          { kind: 'text', text: 'PHOTO LOG' },
          { kind: 'text', text: 'MACROS' },
          { kind: 'text', text: 'MEAL PLAN' },
        ];
      case 'fitness':
        return [
          { kind: 'text', text: 'WORKOUTS' },
          { kind: 'text', text: 'RECOVERY' },
          { kind: 'text', text: 'PROGRESS' },
        ];
      case 'mental-health':
        return [
          { kind: 'text', text: 'MOOD' },
          { kind: 'text', text: 'BREATHWORK' },
          { kind: 'text', text: 'MINDSET' },
        ];
      default:
        return [];
    }
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const stateRef = useRef<{
    nodes: CanvasNode[];
    edges: CanvasEdge[];
    particles: DataParticle[];
    bgDots: BackgroundDot[];
    time: number;
    initialized: boolean;
    canvasW: number;
    canvasH: number;
    spotlight: SpotlightParticle[];
  }>({
    nodes: [],
    edges: [],
    particles: [],
    bgDots: [],
    spotlight: [],
    time: 0,
    initialized: false,
    canvasW: 0,
    canvasH: 0,
  });

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const W = rect.width;
    const H = rect.height;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const nodeCount = 10;
    const { nodes, edges } = generateNodeLayout(W, H, nodeCount, feature.theme, feature.id);

    // Create data particles
    const particles: DataParticle[] = [];
    const particleCount = Math.min(edges.length, 18);
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        edgeIdx: Math.floor(Math.random() * edges.length),
        progress: Math.random(),
        speed: (0.003 + Math.random() * 0.006) * feature.speed,
        forward: Math.random() > 0.5,
      });
    }

    // Create background dots
    const bgDots: BackgroundDot[] = [];
    const dotCount = 30;
    for (let i = 0; i < dotCount; i++) {
      const speedMult = feature.theme === 'silver'
        ? (feature.id === 'mental-health' ? 0.08 : 0.15)
        : (feature.id === 'fitness' ? 0.25 : 0.2);
      bgDots.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * speedMult,
        vy: (Math.random() - 0.5) * speedMult,
        radius: 0.5 + Math.random() * 1,
        opacity: 0.1 + Math.random() * 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Create “spotlight” items (free-floating text/icons that only appear under mouse glow)
    const spotlightItems = getSpotlightItems(feature.id);

    // Preload any spotlight icons as images (SVGs in /public).
    for (const it of spotlightItems) {
      if (it.kind === 'icon') {
        const img = new Image();
        img.src = it.src;
        it.img = img;
      }
    }

    const spotlight: SpotlightParticle[] = spotlightItems.map((item, i) => {
      const pad = 36;
      const x = pad + Math.random() * Math.max(1, W - pad * 2);
      const y = pad + Math.random() * Math.max(1, H - pad * 2);
      const baseSpeed = feature.id === 'mental-health' ? 0.06 : 0.09;
      const vx = (Math.random() - 0.5) * baseSpeed;
      const vy = (Math.random() - 0.5) * baseSpeed;
      return { item, x, y, vx, vy, phase: i * 1.7 + Math.random() * 2 };
    });

    stateRef.current = {
      nodes,
      edges,
      particles,
      bgDots,
      spotlight,
      time: 0,
      initialized: true,
      canvasW: W,
      canvasH: H,
    };
  }, [feature]);

  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Mouse interaction handlers
    const canvas = canvasRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, active: false };
    };
    canvas?.addEventListener('mousemove', handleMouseMove);
    canvas?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas?.removeEventListener('mousemove', handleMouseMove);
      canvas?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, [initCanvas]);

  useEffect(() => {
    if (!isVisible) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const col = feature.nodeColor;
    const isRed = feature.theme === 'red';
    const speedMult = feature.speed;

    const draw = () => {
      const st = stateRef.current;
      if (!st.initialized) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const { nodes, edges, particles, bgDots, canvasW: W, canvasH: H } = st;
      st.time += 0.016 * speedMult;
      const t = st.time;

      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      /* --- Background particle field --- */
      const mouse = mouseRef.current;
      const mouseInfluenceRadius = 120;

      for (const dot of bgDots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0) dot.x = W;
        if (dot.x > W) dot.x = 0;
        if (dot.y < 0) dot.y = H;
        if (dot.y > H) dot.y = 0;

        // Mouse attraction for background dots
        if (mouse.active) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseInfluenceRadius && dist > 1) {
            const force = (1 - dist / mouseInfluenceRadius) * 0.15;
            dot.x += dx / dist * force;
            dot.y += dy / dist * force;
          }
        }

        dot.pulsePhase += 0.01;
        const pulse = 0.5 + 0.5 * Math.sin(dot.pulsePhase);
        const alpha = dot.opacity * (0.4 + 0.6 * pulse);

        // Brighten near mouse
        let dotBrightness = 1;
        if (mouse.active) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseInfluenceRadius) {
            dotBrightness = 1 + (1 - dist / mouseInfluenceRadius) * 2;
          }
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius * (0.8 + dotBrightness * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = `${col}${Math.min(alpha * dotBrightness, 0.9)})`;
        ctx.fill();
      }

      // Draw mouse glow if active
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseInfluenceRadius);
        mouseGlow.addColorStop(0, `${col}0.06)`);
        mouseGlow.addColorStop(0.5, `${col}0.02)`);
        mouseGlow.addColorStop(1, `${col}0)`);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouseInfluenceRadius, 0, Math.PI * 2);
        ctx.fillStyle = mouseGlow;
        ctx.fill();
      }

      /* --- Update node positions (orbital drift + mouse interaction) --- */
      for (const node of nodes) {
        if (node.isHub) continue;
        node.orbitAngle += node.orbitSpeed * speedMult;
        let targetX = node.baseX + Math.cos(node.orbitAngle) * node.orbitRadius;
        let targetY = node.baseY + Math.sin(node.orbitAngle) * node.orbitRadius;

        // Mouse: attract nodes toward cursor
        if (mouse.active) {
          const dx = mouse.x - targetX;
          const dy = mouse.y - targetY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseInfluenceRadius && dist > 1) {
            const force = (1 - dist / mouseInfluenceRadius) * 18;
            targetX += dx / dist * force;
            targetY += dy / dist * force;
          }
        }

        // Smooth lerp toward target
        node.x += (targetX - node.x) * 0.12;
        node.y += (targetY - node.y) * 0.12;
      }

      /* --- Draw edges (brighter near mouse) --- */
      for (const edge of edges) {
        const nA = nodes[edge.from];
        const nB = nodes[edge.to];
        if (!nA || !nB) continue;

        const isHubEdge = nA.isHub || nB.isHub;
        let lineAlpha = isHubEdge ? 0.15 : 0.08;

        // Brighten edges near mouse
        if (mouse.active) {
          const midX = (nA.x + nB.x) / 2;
          const midY = (nA.y + nB.y) / 2;
          const dx = mouse.x - midX;
          const dy = mouse.y - midY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseInfluenceRadius) {
            const boost = (1 - dist / mouseInfluenceRadius) * 0.3;
            lineAlpha += boost;
          }
        }

        ctx.beginPath();
        ctx.moveTo(nA.x, nA.y);
        ctx.lineTo(nB.x, nB.y);
        ctx.strokeStyle = `${col}${lineAlpha})`;
        ctx.lineWidth = isHubEdge ? 0.8 : 0.5;
        ctx.stroke();
      }

      // Draw temporary connection lines from mouse to nearby nodes
      if (mouse.active) {
        for (const node of nodes) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseInfluenceRadius * 0.8 && dist > 5) {
            const alpha = (1 - dist / (mouseInfluenceRadius * 0.8)) * 0.2;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `${col}${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      /* --- Draw data particles traveling along edges --- */
      for (const particle of particles) {
        const edge = edges[particle.edgeIdx];
        if (!edge) continue;
        const nA = nodes[edge.from];
        const nB = nodes[edge.to];
        if (!nA || !nB) continue;

        particle.progress += particle.speed;
        if (particle.progress >= 1) {
          particle.progress = 0;
          particle.edgeIdx = Math.floor(Math.random() * edges.length);
          particle.forward = Math.random() > 0.5;
        }

        const prog = particle.forward ? particle.progress : 1 - particle.progress;
        const px = nA.x + (nB.x - nA.x) * prog;
        const py = nA.y + (nB.y - nA.y) * prog;
        const packetAlpha = Math.sin(particle.progress * Math.PI) * 0.85;

        // Glow
        const glowR = isRed ? 8 : 6;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        grad.addColorStop(0, `${col}${packetAlpha * 0.5})`);
        grad.addColorStop(1, `${col}0)`);
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${col}${packetAlpha})`;
        ctx.fill();

        // Trail
        const trailProg = Math.max(0, prog - 0.06);
        const tx = nA.x + (nB.x - nA.x) * trailProg;
        const ty = nA.y + (nB.y - nA.y) * trailProg;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `${col}${packetAlpha * 0.35})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      /* --- Draw nodes --- */
      for (const node of nodes) {
        node.pulsePhase += node.pulseSpeed * speedMult;
        const pulse = 0.5 + 0.5 * Math.sin(node.pulsePhase);

        // Mouse proximity factor for this node
        let mouseProximity = 0;
        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseInfluenceRadius) {
            mouseProximity = 1 - dist / mouseInfluenceRadius;
          }
        }

        if (node.isHub) {
          // Hub node: large with prominent glow halo
          const hubPulse = 0.7 + 0.3 * Math.sin(t * 1.5);
          const hubRadius = node.radius * hubPulse * (1 + mouseProximity * 0.3);

          // Outer halo glow (bigger when mouse near)
          const haloR = hubRadius * (5 + mouseProximity * 3);
          const haloGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, haloR);
          haloGrad.addColorStop(0, `${col}${0.18 + mouseProximity * 0.2})`);
          haloGrad.addColorStop(0.3, `${col}${0.08 + mouseProximity * 0.08})`);
          haloGrad.addColorStop(0.6, `${col}${0.03 + mouseProximity * 0.03})`);
          haloGrad.addColorStop(1, `${col}0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();

          // Inner glow ring
          const innerHaloR = hubRadius * 2.5;
          const innerGrad = ctx.createRadialGradient(node.x, node.y, hubRadius * 0.5, node.x, node.y, innerHaloR);
          innerGrad.addColorStop(0, `${col}0.25)`);
          innerGrad.addColorStop(0.5, `${col}0.1)`);
          innerGrad.addColorStop(1, `${col}0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, innerHaloR, 0, Math.PI * 2);
          ctx.fillStyle = innerGrad;
          ctx.fill();

          // Core body
          ctx.beginPath();
          ctx.arc(node.x, node.y, hubRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10,10,10,0.9)';
          ctx.fill();
          ctx.strokeStyle = `${col}0.7)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bright inner dot
          ctx.beginPath();
          ctx.arc(node.x, node.y, hubRadius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `${col}0.9)`;
          ctx.fill();

          // Pulsing ring
          const ringR = hubRadius * (1.6 + pulse * 0.6);
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `${col}${0.1 + pulse * 0.12})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        } else {
          // Satellite nodes: pulsing glow, enhanced near mouse
          const nodeAlpha = 0.5 + 0.5 * pulse + mouseProximity * 0.4;
          const r = node.radius * (0.85 + 0.15 * pulse) * (1 + mouseProximity * 0.5);

          // Glow (larger and brighter near mouse)
          const glowR = r * (3.5 + mouseProximity * 3);
          const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
          glowGrad.addColorStop(0, `${col}${nodeAlpha * 0.2})`);
          glowGrad.addColorStop(0.5, `${col}${nodeAlpha * 0.06})`);
          glowGrad.addColorStop(1, `${col}0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          // Body
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10,10,10,0.85)';
          ctx.fill();
          ctx.strokeStyle = `${col}${nodeAlpha * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Inner highlight
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `${col}${nodeAlpha * 0.8})`;
          ctx.fill();
        }
      }

      /* --- Spotlight-revealed floating text/icons (only visible under the mouse glow) --- */
      if (mouse.active && state.spotlight.length) {
        const radius = 135;
        const pad = 28;

        // Update spotlight item motion (more “unlocked”, free-floating)
        for (const sp of state.spotlight) {
          // Gentle wandering via sinusoidal nudge
          const nudge = feature.id === 'mental-health' ? 0.008 : 0.012;
          sp.vx += Math.cos(t * 0.55 + sp.phase) * nudge;
          sp.vy += Math.sin(t * 0.50 + sp.phase) * nudge;

          // Damp to prevent runaway speeds
          sp.vx *= 0.98;
          sp.vy *= 0.98;

          sp.x += sp.vx;
          sp.y += sp.vy;

          // Bounce within bounds
          if (sp.x < pad) {
            sp.x = pad;
            sp.vx = Math.abs(sp.vx);
          } else if (sp.x > W - pad) {
            sp.x = W - pad;
            sp.vx = -Math.abs(sp.vx);
          }

          if (sp.y < pad) {
            sp.y = pad;
            sp.vy = Math.abs(sp.vy);
          } else if (sp.y > H - pad) {
            sp.y = H - pad;
            sp.vy = -Math.abs(sp.vy);
          }
        }

        ctx.font = '500 9px Plus Jakarta Sans, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';

        for (const sp of state.spotlight) {
          const sx = sp.x;
          const sy = sp.y;

          const dx = mouse.x - sx;
          const dy = mouse.y - sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;

          const tSpot = 1 - dist / radius;
          const alpha = (0.02 + 0.28 * tSpot * tSpot) * 0.9;

          // Very subtle shadow-grey glow behind item
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 44);
          glow.addColorStop(0, `rgba(120,120,120,${alpha * 0.12})`);
          glow.addColorStop(1, 'rgba(120,120,120,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(sx, sy, 50, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.shadowColor = `rgba(0,0,0,${Math.min(0.45, 0.18 + alpha * 0.4)})`;
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;

          if (sp.item.kind === 'text') {
            ctx.fillStyle = `rgba(150,150,150,${alpha})`;
            ctx.fillText(sp.item.text, sx, sy);
          } else {
            // Icon rendering will be wired up once SVGs are provided.
            // (We keep the slot here so it can float/spotlight like text.)
            // Intentionally no-op if img isn't ready.
            const img = sp.item.img;
            if (img && img.complete) {
              const size = 10; // ~same height as 9px text
              ctx.globalAlpha = alpha;
              ctx.drawImage(img, sx - size * 0.5, sy - size * 0.5, size, size);
              ctx.globalAlpha = 1;
            }
          }

          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isVisible, feature]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: 360 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: 'none' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature card component                                             */
/* ------------------------------------------------------------------ */

function FeatureCard({ feature, index }: { feature: FeatureDef; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [canvasActive, setCanvasActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Observer for reveal animations (one-time trigger at 25% visibility)
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visible) {
            setVisible(true);
            entry.target.querySelectorAll('.reveal').forEach((revealEl, i) => {
              setTimeout(() => revealEl.classList.add('visible'), i * 100);
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    // Observer for canvas activation (start/pause based on viewport presence)
    const canvasObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setCanvasActive(entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );

    revealObserver.observe(el);
    canvasObserver.observe(el);

    return () => {
      revealObserver.disconnect();
      canvasObserver.disconnect();
    };
  }, [visible]);

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
              background: 'rgba(10,10,10,0.7)',
              border: `1px solid ${feature.nodeColor}0.15)`,
            }}
          >
            <FeatureCanvasDiagram feature={feature} isVisible={canvasActive} />

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
              style={{ color: 'rgba(225,225,225,0.92)' }}
            >
              {feature.headline}
            </h2>
          </div>

          <p className="reveal font-body text-base leading-relaxed" style={{ color: 'rgba(120,120,120,1)' }}>
            {feature.subline}
          </p>

          <ul className="reveal space-y-3">
            {feature.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: feature.accentColor, boxShadow: `0 0 6px ${feature.accentColor}` }}
                />
                <span className="font-ui text-sm leading-relaxed" style={{ color: 'rgba(120,120,120,1)' }}>
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

/* ------------------------------------------------------------------ */
/*  Public export                                                      */
/* ------------------------------------------------------------------ */

export function FeatureSections() {
  return (
    <>
      {features.map((f, i) => (
        <FeatureCard key={f.id} feature={f} index={i} />
      ))}
    </>
  );
}
