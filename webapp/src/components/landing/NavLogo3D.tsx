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

    // Create a dedicated canvas + WebGL2 context explicitly.
    // Avoids errors like: "Canvas has an existing context of a different type".
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    } as any);

    const showFallback = () => {
      host.innerHTML = '';
      const img = document.createElement('img');
      img.src = '/brand/icon-red.png';
      img.alt = '';
      img.style.width = '36px';
      img.style.height = '36px';
      img.style.display = 'block';
      // Crop any transparent padding inside the PNG so it doesn't look like a black "missing" block on dark nav.
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
      host.appendChild(img);
    };

    // If WebGL2 isn't available, fall back to a static icon (never blank page).
    if (!gl) {
      showFallback();
      return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, context: gl as any, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.max(1, Math.min(2, window.devicePixelRatio || 1)));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // Insert canvas
    host.innerHTML = '';
    // Ensure the canvas behaves like a centered block element inside the fixed-size nav box.
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Orthographic camera keeps the logo visually “pinned” (no perspective drift while tilting)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 0, 12);
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

    let hasModel = false;

    loader.load(
      '/brand/logo-3d.gltf',
      (gltf) => {
        if (disposed) return;
        hasModel = true;
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
            side: THREE.DoubleSide,
          });
        });

        // Normalize scale/center
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        model.position.sub(center);

        // Recompute and re-center once more (some GLTFs have nested transforms that make the first centering slightly off).
        const box2 = new THREE.Box3().setFromObject(model);
        const center2 = new THREE.Vector3();
        box2.getCenter(center2);
        model.position.sub(center2);
        const maxDim = Math.max(size.x, size.y, size.z);
        // Normalize transforms (some exports carry rotations)
        model.rotation.set(0, 0, 0);
        // Correct baked orientation so the mark sits upright and forward-facing in the navbar.
        // (These are asset-dependent; tuned by eye for this GLTF.)
        model.rotation.y = THREE.MathUtils.degToRad(-40);
        model.rotation.z = THREE.MathUtils.degToRad(0);
        model.scale.setScalar(1);

        // Sizing tuned for a standard navbar icon.
        camera.zoom = 0.03;
        camera.updateProjectionMatrix();

        group.add(model);
        group.position.set(0, 0, 0);
        // Slightly larger in navbar.
        group.scale.setScalar(0.78);

        // Initial pose (base pose handles the default)
      },
      undefined,
      () => {
        // If load fails, never leave a blank area.
        if (!disposed) showFallback();
      },
    );

    // If it hasn't loaded quickly, show fallback (avoids the “nothing there” feeling on slow networks)
    const loadTimeout = window.setTimeout(() => {
      if (!disposed && !hasModel) showFallback();
    }, 1800);

    const mouse: MouseState = { x: -9999, y: -9999, active: false };

    // Keep it subtle in the navbar so it doesn't feel like it "moves".
    const maxTiltDeg = 22;
    const maxTilt = THREE.MathUtils.degToRad(maxTiltDeg);

    // Base pose so the logo isn't edge-on.
    // Baseline: forward-facing.
    const baseRx = THREE.MathUtils.degToRad(0);
    const baseRy = THREE.MathUtils.degToRad(0);

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
      const frustumH = 3.6;
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
        const follow = 0.20;
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
      window.clearTimeout(loadTimeout);
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
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'pointer',
        willChange: 'transform',
        overflow: 'hidden',
      }}
    />
  );
}
