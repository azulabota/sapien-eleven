import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type MouseState = { x: number; y: number; active: boolean };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function NavLogo3D() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.max(1, Math.min(2, window.devicePixelRatio || 1)));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // Insert canvas
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Orthographic camera keeps the logo visually “pinned” (no perspective drift while tilting)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);

    // Lighting (no “spotlight glow” backdrop; just subtle key/fill/ambient)
    const amb = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(2.4, 2.6, 3.2);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.45);
    fill.position.set(-2.2, -0.4, 3.2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(-2.8, 2.4, -2.8);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    // Load the model
    const loader = new GLTFLoader();
    let disposed = false;

    loader.load(
      '/brand/logo-3d.gltf',
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        // Force a bright, readable material (prevents “black metal” on dark UI)
        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#CA3C3D'),
            emissive: new THREE.Color('#7a1f20'),
            emissiveIntensity: 0.55,
            metalness: 0.25,
            roughness: 0.35,
          });
        });

        // Normalize scale/center
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 1.55 / Math.max(0.001, maxDim);
        model.scale.setScalar(s);

        group.add(model);

        // Initial pose (base pose handles the default)
      },
      undefined,
      () => {
        // no-op (keep empty if load fails)
      },
    );

    const mouse: MouseState = { x: -9999, y: -9999, active: false };

    // Requested: max 40% left/right/down → interpret as max 40deg.
    const maxTiltDeg = 40;
    const maxTilt = THREE.MathUtils.degToRad(maxTiltDeg);

    // Base pose so the logo isn't edge-on.
    const baseRx = THREE.MathUtils.degToRad(12);
    const baseRy = THREE.MathUtils.degToRad(-28);

    let targetRx = 0;
    let targetRy = 0;
    let rx = 0;
    let ry = 0;

    // Click spin: 2 full rotations quickly
    let spinRemaining = 0; // radians
    const spinSpeed = THREE.MathUtils.degToRad(1440) / 0.55; // 720deg over 0.55s

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h, false);

      // Fit ortho frustum to aspect
      const aspect = w / Math.max(1, h);
      const frustumH = 2.0;
      camera.top = frustumH / 2;
      camera.bottom = -frustumH / 2;
      camera.right = (frustumH * aspect) / 2;
      camera.left = -(frustumH * aspect) / 2;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      const rect = host.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // normalized offsets [-1..1]
      const dx = (e.clientX - cx) / Math.max(1, window.innerWidth * 0.5);
      const dy = (e.clientY - cy) / Math.max(1, window.innerHeight * 0.5);

      targetRy = clamp(dx, -1, 1) * maxTilt;
      // Only tilt down (positive rotateX)
      targetRx = clamp(dy, 0, 1) * maxTilt;
    };

    const onLeave = () => {
      mouse.active = false;
      targetRx = 0;
      targetRy = 0;
    };

    const onClick = () => {
      if (reduceMotion) return;
      spinRemaining = THREE.MathUtils.degToRad(720);
    };

    window.addEventListener('pointermove', onMove, { passive: true } as any);
    window.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onClick, { passive: true });

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduceMotion) {
        const follow = 0.12;
        rx += (targetRx - rx) * follow;
        ry += (targetRy - ry) * follow;

        group.rotation.x = baseRx + rx;
        group.rotation.y = baseRy + ry;

        if (spinRemaining > 0) {
          const step = Math.min(spinRemaining, spinSpeed * dt);
          spinRemaining -= step;
          group.rotation.y += step;
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove as any);
      window.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onClick as any);
      ro.disconnect();

      renderer.dispose();
      // Best-effort cleanup
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose?.();
        const mat = (mesh as any).material;
        if (mat) {
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
          else mat.dispose?.();
        }
      });

      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        width: 48,
        height: 48,
        display: 'block',
        cursor: 'pointer',
        willChange: 'transform',
      }}
    />
  );
}
