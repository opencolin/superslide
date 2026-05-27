"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Scene = "torus" | "sphere" | "ribbon" | "particles" | "wireframe";

/**
 * Raw three.js hero scene. We bypass @react-three/fiber here because its mount
 * lifecycle in React 19 + Next 16 was leaving the WebGL context alive but
 * never running the render loop (`onCreated` never fired, frames stayed
 * transparent). Direct three.js mount-in-effect is reliable.
 */
export function Hero3DScene({
  scene = "torus",
  accent = "#e0ff4f",
  className = "",
}: {
  scene?: Scene;
  accent?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";

    const threeScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(5, 5, 5);
    const fill = new THREE.DirectionalLight(new THREE.Color(accent), 0.6);
    fill.position.set(-4, -3, -2);
    threeScene.add(ambient, key, fill);

    const mesh = buildMesh(scene, accent);
    threeScene.add(mesh);

    let pointerX = 0;
    let pointerY = 0;
    function onPointer(e: PointerEvent) {
      const r = container!.getBoundingClientRect();
      pointerX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointerY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    window.addEventListener("pointermove", onPointer);

    function resize() {
      const w = container!.clientWidth || 1;
      const h = container!.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let raf = 0;
    let t0 = performance.now();
    function tick() {
      const t = (performance.now() - t0) / 1000;
      mesh.rotation.y = t * 0.22 + pointerX * 0.35;
      mesh.rotation.x = Math.sin(t * 0.4) * 0.15 + pointerY * 0.2;
      // gentle floating
      mesh.position.y = Math.sin(t * 1.1) * 0.08;
      renderer.render(threeScene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      disposeMesh(mesh);
    };
  }, [scene, accent]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${className}`}
      style={{ minHeight: 0 }}
    />
  );
}

function buildMesh(scene: Scene, accent: string): THREE.Object3D {
  const color = new THREE.Color(accent);
  switch (scene) {
    case "torus": {
      const g = new THREE.TorusKnotGeometry(1.2, 0.36, 220, 32, 2, 3);
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.22,
        metalness: 0.55,
      });
      return new THREE.Mesh(g, m);
    }
    case "sphere": {
      const g = new THREE.IcosahedronGeometry(1.6, 4);
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.18,
        metalness: 0.6,
        flatShading: true,
      });
      return new THREE.Mesh(g, m);
    }
    case "wireframe": {
      const g = new THREE.IcosahedronGeometry(1.7, 1);
      const m = new THREE.MeshBasicMaterial({ color, wireframe: true });
      return new THREE.Mesh(g, m);
    }
    case "ribbon": {
      const group = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(1.4, 0.06, 16, 200);
      const ringMat = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.7,
        roughness: 0.2,
      });
      group.add(new THREE.Mesh(ringGeo, ringMat));
      const r2 = new THREE.Mesh(ringGeo, ringMat);
      r2.rotation.set(Math.PI / 2.4, 0.4, 0);
      group.add(r2);
      const r3 = new THREE.Mesh(ringGeo, ringMat);
      r3.rotation.set(Math.PI / 1.6, -0.5, 0);
      group.add(r3);
      return group;
    }
    case "particles":
    default: {
      const g = new THREE.IcosahedronGeometry(1.4, 2);
      const m = new THREE.MeshBasicMaterial({ color, wireframe: true });
      return new THREE.Mesh(g, m);
    }
  }
}

function disposeMesh(o: THREE.Object3D) {
  o.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else if (mat) (mat as THREE.Material).dispose();
  });
}
