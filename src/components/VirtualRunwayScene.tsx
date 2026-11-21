import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../lib/theme';

interface VirtualRunwaySceneProps {
  className?: string;
  onSceneReady?: () => void;
}

export default function VirtualRunwayScene({ className = '', onSceneReady }: VirtualRunwaySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  // References to dynamic Three.js objects for theme switching
  const sceneRef = useRef<THREE.Scene | null>(null);
  const runwayMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const groundMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const ledMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const archMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const silverTrimMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const mainSpotRef = useRef<THREE.SpotLight | null>(null);
  const limeLightRef = useRef<THREE.PointLight | null>(null);

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

    // 2. Three.js Scene, Camera, Renderer
    const isLightInitial = resolvedTheme === 'light';
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isLightInitial ? 0xf6f6f2 : 0x080808, 0.045);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      48,
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // 3. Runway Architectural Elements
    const runwayWidth = 3.8;
    const runwayLength = 36;

    // Main Runway Catwalk Floor
    const runwayGeo = new THREE.PlaneGeometry(runwayWidth, runwayLength, 32, 32);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: isLightInitial ? 0xdcdde2 : 0x0c0f16,
      roughness: isLightInitial ? 0.22 : 0.18,
      metalness: isLightInitial ? 0.6 : 0.85,
    });
    runwayMatRef.current = runwayMat;

    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(0, 0, -runwayLength / 2 + 5);
    runway.receiveShadow = true;
    scene.add(runway);

    // Dark / Light Hallway Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isLightInitial ? 0xedeef2 : 0x040508,
      roughness: 0.85,
      metalness: 0.3,
    });
    groundMatRef.current = groundMat;

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, -15);
    scene.add(ground);

    // Glowing Electric Lime LED Lines along runway edges
    const ledMat = new THREE.MeshBasicMaterial({ color: isLightInitial ? 0x789900 : 0xc6ff00 });
    ledMatRef.current = ledMat;
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
      color: isLightInitial ? 0xb0b5be : 0x141824,
      roughness: 0.5,
      metalness: 0.7,
    });
    archMatRef.current = archMat;

    const silverTrimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      metalness: 0.95,
    });
    silverTrimMatRef.current = silverTrimMat;

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
    const ambientLight = new THREE.AmbientLight(isLightInitial ? 0xe8ebf0 : 0x1a1e28, isLightInitial ? 1.8 : 0.8);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    // Main Overhead Fashion Spotlight
    const mainSpot = new THREE.SpotLight(0xffffff, isLightInitial ? 3.2 : 4.5);
    mainSpot.position.set(0, 10, 2);
    mainSpot.angle = Math.PI / 5;
    mainSpot.penumbra = 0.5;
    mainSpot.decay = 1.2;
    mainSpot.distance = 45;
    mainSpot.castShadow = true;
    mainSpot.target.position.set(0, 0, -8);
    mainSpotRef.current = mainSpot;
    scene.add(mainSpot);
    scene.add(mainSpot.target);

    // Electric Lime Accent Backlight
    const limeLight = new THREE.PointLight(isLightInitial ? 0x789900 : 0xc6ff00, isLightInitial ? 1.2 : 2.2, 20);
    limeLight.position.set(0, 3.5, -18);
    limeLightRef.current = limeLight;
    scene.add(limeLight);

    // Subtle Amber Warm Fill
    const amberFill = new THREE.PointLight(0xf59e0b, 1.2, 25);
    amberFill.position.set(-4, 4, -4);
    scene.add(amberFill);

    // 5. Ambient Atmospheric Glitter / Floating Dust Particles
    const particlesCount = 220;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = Math.random() * 6 + 0.2;
      particlePositions[i * 3 + 2] = -Math.random() * 28 + 4;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: isLightInitial ? 0x789900 : 0xc6ff00,
      size: 0.045,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse Parallax
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

    // 7. Responsive Resize Observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Viewport Visibility Tracking (Pause render loop when scrolled offscreen)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 9. Animation Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;

      // Subtle breathing motion
      camera.position.y += Math.sin(elapsed * 0.8) * 0.001;
      camera.lookAt(0, 1.2, -14);

      // Subtle particle float
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsed + i) * 0.0015;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Pulse the electric lime back light
      limeLight.intensity = (isLightInitial ? 1.0 : 2.0) + Math.sin(elapsed * 2) * 0.3;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);
    if (onSceneReady) onSceneReady();

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      // Dispose Three.js objects
      runwayGeo.dispose();
      runwayMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      ledGeo.dispose();
      ledMat.dispose();
      archMat.dispose();
      silverTrimMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [onSceneReady]);

  // 10. Smooth Dynamic Theme Updates (Lightweight material & light updates without recreating scene)
  useEffect(() => {
    if (!sceneRef.current || !runwayMatRef.current) return;
    const isLight = resolvedTheme === 'light';

    // Update Fog
    sceneRef.current.fog = new THREE.FogExp2(isLight ? 0xf6f6f2 : 0x080808, 0.045);

    // Update Runway Material
    runwayMatRef.current.color.setHex(isLight ? 0xdcdde2 : 0x0c0f16);
    runwayMatRef.current.roughness = isLight ? 0.22 : 0.18;
    runwayMatRef.current.metalness = isLight ? 0.6 : 0.85;

    // Update Ground Material
    if (groundMatRef.current) {
      groundMatRef.current.color.setHex(isLight ? 0xedeef2 : 0x040508);
    }

    // Update LED Trim Material
    if (ledMatRef.current) {
      ledMatRef.current.color.setHex(isLight ? 0x789900 : 0xc6ff00);
    }

    // Update Arch Materials
    if (archMatRef.current) {
      archMatRef.current.color.setHex(isLight ? 0xb0b5be : 0x141824);
    }

    // Update Lighting
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(isLight ? 0xe8ebf0 : 0x1a1e28);
      ambientLightRef.current.intensity = isLight ? 1.8 : 0.8;
    }
    if (mainSpotRef.current) {
      mainSpotRef.current.intensity = isLight ? 3.2 : 4.5;
    }
    if (limeLightRef.current) {
      limeLightRef.current.color.setHex(isLight ? 0x789900 : 0xc6ff00);
      limeLightRef.current.intensity = isLight ? 1.2 : 2.2;
    }
  }, [resolvedTheme]);

  if (!webGlSupported) {
    const isLight = resolvedTheme === 'light';
    return (
      <div 
        className={`relative w-full h-full bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${isLight ? '/images/runway-2.jpg' : '/images/runway-1.jpg'})` }}
      >
        <div className={`absolute inset-0 ${isLight ? 'bg-[#F6F6F2]/75 backdrop-blur-sm' : 'bg-[#080808]/75 backdrop-blur-sm'}`} />
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
        <div className={`absolute inset-0 transition-opacity duration-700 ${resolvedTheme === 'light' ? 'bg-[#F6F6F2]' : 'bg-[#080808]'}`} />
      )}
    </div>
  );
}
