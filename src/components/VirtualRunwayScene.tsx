import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface VirtualRunwaySceneProps {
  className?: string;
  onSceneReady?: () => void;
}

export default function VirtualRunwayScene({ className = '', onSceneReady }: VirtualRunwaySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Detect WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    let isVisible = true;

    // 2. Three.js Scene, Camera, Renderer — Haute Couture Pure Black
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.045);

    const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 768;
    const camera = new THREE.PerspectiveCamera(
      isMobileInitial ? 58 : 46,
      container.clientWidth / container.clientHeight,
      0.1,
      80
    );
    camera.position.set(0, 2.2, 9.5);
    camera.lookAt(0, 1.2, -12);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 3. Runway Architectural Elements
    const runwayWidth = 3.8;
    const runwayLength = 36;

    // Main Runway Catwalk Floor (High-Gloss Obsidian Slab)
    const runwayGeo = new THREE.PlaneGeometry(runwayWidth, runwayLength, 32, 32);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0x090b10,
      roughness: 0.14,
      metalness: 0.90,
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0, -runwayLength / 2 + 5);
    runway.receiveShadow = true;
    scene.add(runway);

    // Deep Black Hallway Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x030304,
      roughness: 0.85,
      metalness: 0.3,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, -15);
    scene.add(ground);

    // Glowing Electric Lime LED Lines along runway edges
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xc6ff00 });
    const ledGeo = new THREE.BoxGeometry(0.06, 0.04, runwayLength);

    const leftLed = new THREE.Mesh(ledGeo, ledMat);
    leftLed.position.set(-runwayWidth / 2 + 0.04, 0.02, -runwayLength / 2 + 5);
    scene.add(leftLed);

    const rightLed = new THREE.Mesh(ledGeo, ledMat);
    rightLed.position.set(runwayWidth / 2 - 0.04, 0.02, -runwayLength / 2 + 5);
    scene.add(rightLed);

    // Symmetrical Architectural Portals / Arches
    const archGroup = new THREE.Group();
    const archCount = 7;
    const archSpacing = 4.5;
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x12141c,
      roughness: 0.5,
      metalness: 0.7,
    });
    const silverTrimMat = new THREE.MeshStandardMaterial({
      color: 0xbfc3c7,
      roughness: 0.25,
      metalness: 0.95,
    });

    for (let i = 0; i < archCount; i++) {
      const zPos = -i * archSpacing + 2;

      // Left Pillar
      const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.5, 0.3), archMat);
      leftPillar.position.set(-runwayWidth / 2 - 1.2, 2.7, zPos);
      archGroup.add(leftPillar);

      // Right Pillar
      const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.5, 0.3), archMat);
      rightPillar.position.set(runwayWidth / 2 + 1.2, 2.7, zPos);
      archGroup.add(rightPillar);

      // Top Crossbar
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(runwayWidth + 2.8, 0.25, 0.3), archMat);
      crossbar.position.set(0, 5.5, zPos);
      archGroup.add(crossbar);

      // Silver Trim Accent Line
      const trim = new THREE.Mesh(new THREE.BoxGeometry(runwayWidth + 2.7, 0.05, 0.32), silverTrimMat);
      trim.position.set(0, 5.35, zPos);
      archGroup.add(trim);
    }
    scene.add(archGroup);

    // 4. Lights
    // Ambient soft lighting
    const ambientLight = new THREE.AmbientLight(0x181a24, 0.85);
    scene.add(ambientLight);

    // Main Overhead Fashion Spotlight
    const mainSpot = new THREE.SpotLight(0xffffff, 4.6);
    mainSpot.position.set(0, 10, 2);
    mainSpot.angle = Math.PI / 5;
    mainSpot.penumbra = 0.5;
    mainSpot.decay = 1.2;
    mainSpot.distance = 45;
    mainSpot.castShadow = true;
    mainSpot.target.position.set(0, 0, -8);
    scene.add(mainSpot);
    scene.add(mainSpot.target);

    // Electric Lime Accent Backlight
    const limeLight = new THREE.PointLight(0xc6ff00, 2.4, 22);
    limeLight.position.set(0, 3.5, -18);
    scene.add(limeLight);

    // Subtle Amber Warm Fill
    const amberFill = new THREE.PointLight(0xf59e0b, 1.2, 25);
    amberFill.position.set(-4, 4, -4);
    scene.add(amberFill);

    // 5. Interactive Mouse & Touch Parallax
    let targetX = 0;
    let targetY = 2.2;
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.2;
      targetY = 2.2 - y * 0.4;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return;
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) / rect.width - 0.5;
      const y = (touch.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.9;
      targetY = 2.2 - y * 0.3;
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 7. Responsive Resize Observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.fov = width < 768 ? 58 : 46;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Viewport Visibility & Scroll Tracking
    let currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const handleScroll = () => {
      currentScrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 9. Animation Render Loop (Continuous Movie-Screen Runway Tracking)
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Smooth camera crane glide along catwalk on scroll (Both Down & Back Up)
      const scrollFactor = Math.min(currentScrollY / 750, 1.6);
      const targetCamZ = 9.5 - scrollFactor * 4.2;
      camera.position.z += (targetCamZ - camera.position.z) * 0.07;

      // Vertical crane dip & perspective shift on scroll
      const targetCamY = 2.2 - scrollFactor * 0.35;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;

      // Smooth camera interpolation based on cursor / touch
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - 2.2) * 0.04;

      // Subtle atmospheric breathing motion
      camera.position.y += Math.sin(elapsed * 0.8) * 0.001;
      camera.lookAt(0, 1.2 - scrollFactor * 0.2, -14);

      // Pulse the electric lime back light
      limeLight.intensity = 2.0 + Math.sin(elapsed * 2) * 0.4;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);
    if (onSceneReady) onSceneReady();

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      runwayGeo.dispose();
      runwayMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      ledGeo.dispose();
      ledMat.dispose();
      archMat.dispose();
      silverTrimMat.dispose();
      renderer.dispose();
    };
  }, [onSceneReady]);

  if (!webGlSupported) {
    return (
      <div 
        className={`relative w-full h-full bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url('/images/runway-1.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#050507] transition-opacity duration-700" />
      )}
    </div>
  );
}
