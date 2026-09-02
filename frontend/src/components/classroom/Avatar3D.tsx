import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, Sparkles, User, RefreshCw, Eye, Orbit } from 'lucide-react';

interface Avatar3DProps {
  agentState: 'listening' | 'processing' | 'speaking' | 'idle';
  audioElementRef?: React.RefObject<HTMLAudioElement | null>;
  spokenText?: string;
  isAudioMuted?: boolean;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  agentState,
  spokenText = '',
  isAudioMuted = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Model part refs for dynamic animation
  const headGroupRef = useRef<THREE.Group | null>(null);
  const jawRef = useRef<THREE.Mesh | null>(null);
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const haloRingRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Mouse tracking
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentHeadRotRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Blinking timer
  const blinkStateRef = useRef<{ isBlinking: boolean; blinkProgress: number; nextBlinkTime: number }>({
    isBlinking: false,
    blinkProgress: 0,
    nextBlinkTime: Date.now() + 3000
  });

  // State tracking for smooth transitions
  const agentStateRef = useRef(agentState);
  agentStateRef.current = agentState;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 280;
    const height = container.clientHeight || 280;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.2);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    // Key Light (Warm golden)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    // Fill Light (Cool cyan)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    // Rim/Back Light (Electric purple/neon blue for edge separation)
    const rimLight = new THREE.DirectionalLight(0x818cf8, 2.8);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.2);
    scene.add(ambientLight);

    // 5. Build 3D Human Avatar (Procedural high-detail Stylized Mentor Bust)
    const avatarRoot = new THREE.Group();
    avatarRoot.position.set(0, -0.4, 0);
    scene.add(avatarRoot);

    // --- MATERIALS ---
    // Realistic Indian Skin Tone Material
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0x8d5524, // Warm South Asian tone
      roughness: 0.55,
      metalness: 0.05
    });

    const suitMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep Navy Suit
      roughness: 0.7,
      metalness: 0.1
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp White Shirt
      roughness: 0.4
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x171717, // Natural Jet Black
      roughness: 0.65,
      metalness: 0.1
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x3b1d0c, // Deep brown iris
      roughness: 0.1,
      metalness: 0.2
    });

    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0x000000
    });

    const lipMaterial = new THREE.MeshStandardMaterial({
      color: 0x6e3b26,
      roughness: 0.4
    });

    // --- TORSO / SUIT BODY ---
    const torsoGroup = new THREE.Group();
    
    // Shoulders / Blazer
    const blazerGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.9, 32);
    const blazerMesh = new THREE.Mesh(blazerGeo, suitMaterial);
    blazerMesh.position.set(0, -0.25, 0);
    blazerMesh.scale.set(1.15, 1, 0.7);
    torsoGroup.add(blazerMesh);

    // Shirt Collar & Tie Area
    const shirtGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 16);
    const shirtMesh = new THREE.Mesh(shirtGeo, shirtMaterial);
    shirtMesh.position.set(0, 0.05, 0.08);
    shirtMesh.scale.set(0.9, 0.8, 0.5);
    torsoGroup.add(shirtMesh);

    avatarRoot.add(torsoGroup);

    // --- HEAD & NECK GROUP (Articulated for rotation) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.35, 0);
    headGroupRef.current = headGroup;

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.19, 0.22, 0.4, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.set(0, -0.1, 0);
    headGroup.add(neckMesh);

    // Head Base (Cranium & Face)
    const headGeo = new THREE.SphereGeometry(0.44, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.scale.set(0.95, 1.15, 1.0);
    headMesh.position.set(0, 0.26, 0);
    headGroup.add(headMesh);

    // Cheekbones & Chin definition
    const chinGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const chinMesh = new THREE.Mesh(chinGeo, skinMaterial);
    chinMesh.scale.set(0.85, 0.8, 0.9);
    chinMesh.position.set(0, 0.02, 0.22);
    headGroup.add(chinMesh);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.065, 0.22, 16);
    const noseMesh = new THREE.Mesh(noseGeo, skinMaterial);
    noseMesh.rotation.x = Math.PI / 2.3;
    noseMesh.position.set(0, 0.24, 0.44);
    headGroup.add(noseMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, skinMaterial);
    leftEar.scale.set(0.4, 0.9, 0.6);
    leftEar.position.set(-0.43, 0.24, 0.02);
    headGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.43;
    headGroup.add(rightEar);

    // Modern Haircut (Top Volume & Fade)
    const hairTopGeo = new THREE.SphereGeometry(0.46, 24, 24);
    const hairTopMesh = new THREE.Mesh(hairTopGeo, hairMaterial);
    hairTopMesh.scale.set(0.98, 1.05, 1.05);
    hairTopMesh.position.set(0, 0.38, -0.04);
    headGroup.add(hairTopMesh);

    // Forehead Hairline Bangs
    const bangsGeo = new THREE.BoxGeometry(0.55, 0.12, 0.2);
    const bangsMesh = new THREE.Mesh(bangsGeo, hairMaterial);
    bangsMesh.position.set(0, 0.58, 0.32);
    bangsMesh.rotation.x = -0.3;
    headGroup.add(bangsMesh);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.14, 0.03, 0.04);
    const leftBrow = new THREE.Mesh(browGeo, hairMaterial);
    leftBrow.position.set(-0.16, 0.38, 0.41);
    leftBrow.rotation.z = 0.08;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, hairMaterial);
    rightBrow.position.set(0.16, 0.38, 0.41);
    rightBrow.rotation.z = -0.08;
    headGroup.add(rightBrow);

    // --- EYES & EYELIDS ---
    const eyeRadius = 0.065;
    
    // Left Eye Assembly
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.15, 0.28, 0.37);

    const leftEyeBall = new THREE.Mesh(new THREE.SphereGeometry(eyeRadius, 16, 16), eyeWhiteMat);
    leftEyeGroup.add(leftEyeBall);

    const leftIris = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.01, 16), irisMat);
    leftIris.rotation.x = Math.PI / 2;
    leftIris.position.set(0, 0, eyeRadius * 0.9);
    leftEyeGroup.add(leftIris);

    const leftPupil = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 16), pupilMat);
    pupilMat.depthTest = true;
    leftPupil.rotation.x = Math.PI / 2;
    leftPupil.position.set(0, 0, eyeRadius * 0.95);
    leftEyeGroup.add(leftPupil);

    // Left Eyelid (for dynamic blinking)
    const leftEyelid = new THREE.Mesh(
      new THREE.SphereGeometry(eyeRadius * 1.05, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      skinMaterial
    );
    leftEyelid.rotation.x = Math.PI; // open by default
    leftEyeGroup.add(leftEyelid);
    leftEyelidRef.current = leftEyelid;
    leftEyeRef.current = leftEyeBall;

    headGroup.add(leftEyeGroup);

    // Right Eye Assembly
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.15, 0.28, 0.37);

    const rightEyeBall = leftEyeBall.clone();
    rightEyeGroup.add(rightEyeBall);

    const rightIris = leftIris.clone();
    rightEyeGroup.add(rightIris);

    const rightPupil = leftPupil.clone();
    rightEyeGroup.add(rightPupil);

    const rightEyelid = leftEyelid.clone();
    rightEyeGroup.add(rightEyelid);
    rightEyelidRef.current = rightEyelid;
    rightEyeRef.current = rightEyeBall;

    headGroup.add(rightEyeGroup);

    // --- ARTICULATED MOUTH & JAW (For Lip-Sync) ---
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, 0.12, 0.35);

    // Upper Lip
    const upperLipGeo = new THREE.BoxGeometry(0.15, 0.024, 0.05);
    const upperLip = new THREE.Mesh(upperLipGeo, lipMaterial);
    upperLip.position.set(0, 0.015, 0.04);
    jawGroup.add(upperLip);

    // Lower Lip / Dynamic Jaw
    const lowerLipGeo = new THREE.BoxGeometry(0.14, 0.026, 0.06);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipMaterial);
    lowerLip.position.set(0, -0.02, 0.04);
    jawGroup.add(lowerLip);
    jawRef.current = lowerLip;

    // Mouth Cavity (Dark interior)
    const cavityGeo = new THREE.BoxGeometry(0.12, 0.04, 0.04);
    const cavityMat = new THREE.MeshBasicMaterial({ color: 0x1c0b05 });
    const cavityMesh = new THREE.Mesh(cavityGeo, cavityMat);
    cavityMesh.position.set(0, -0.005, 0.02);
    jawGroup.add(cavityMesh);

    headGroup.add(jawGroup);
    avatarRoot.add(headGroup);

    // --- 6. HOLOGRAPHIC AMBIENT HALO & PARTICLES ---
    // Orbiting Glowing Ring
    const haloGeo = new THREE.TorusGeometry(0.95, 0.015, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4
    });
    const haloRing = new THREE.Mesh(haloGeo, haloMat);
    haloRing.rotation.x = Math.PI / 2.2;
    haloRing.position.set(0, -0.2, 0);
    scene.add(haloRing);
    haloRingRef.current = haloRing;

    // Floating Knowledge Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 3;
      particlePos[i + 1] = (Math.random() - 0.5) * 2.5 + 0.3;
      particlePos[i + 2] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.035,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // --- 7. Mouse-Look Listener ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTargetRef.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y))
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // --- 8. Animation & Render Loop ---
    let clock = new THREE.Clock();
    let speechTimer = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const currentState = agentStateRef.current;

      // 1. Organic Breathing & Idle Drift
      const breatheY = Math.sin(elapsedTime * 2.0) * 0.015;
      const breatheRot = Math.sin(elapsedTime * 1.2) * 0.01;
      avatarRoot.position.y = -0.4 + breatheY;

      // 2. Smooth Head Damping to Mouse Look
      const targetHeadX = mouseTargetRef.current.y * 0.18 + (currentState === 'listening' ? 0.05 : 0);
      const targetHeadY = mouseTargetRef.current.x * 0.28 + (currentState === 'listening' ? -0.08 : 0);
      
      currentHeadRotRef.current.x += (targetHeadX - currentHeadRotRef.current.x) * 0.08;
      currentHeadRotRef.current.y += (targetHeadY - currentHeadRotRef.current.y) * 0.08;

      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = currentHeadRotRef.current.x + breatheRot;
        headGroupRef.current.rotation.y = currentHeadRotRef.current.y;
        headGroupRef.current.rotation.z = (currentState === 'listening' ? 0.06 : 0);
      }

      // 3. Real-Time Lip-Sync & Speaking Animation
      if (jawRef.current) {
        if (currentState === 'speaking') {
          speechTimer += delta * 14;
          // Natural speech cadence combining fast viseme waves and slower vowel modulations
          const speechOpen = Math.abs(Math.sin(speechTimer) * 0.04 + Math.sin(speechTimer * 2.3) * 0.025);
          jawRef.current.position.y = -0.02 - Math.min(0.06, speechOpen);
          jawRef.current.scale.x = 1.0 + Math.sin(speechTimer * 1.5) * 0.15;
        } else {
          // Return smoothly to closed mouth
          jawRef.current.position.y += (-0.02 - jawRef.current.position.y) * 0.2;
          jawRef.current.scale.x += (1.0 - jawRef.current.scale.x) * 0.2;
        }
      }

      // 4. Natural Periodic Eye Blinking
      const now = Date.now();
      const blink = blinkStateRef.current;
      if (!blink.isBlinking && now > blink.nextBlinkTime) {
        blink.isBlinking = true;
        blink.blinkProgress = 0;
      }

      if (blink.isBlinking) {
        blink.blinkProgress += delta * 12; // fast blink speed
        const blinkAmount = Math.sin(blink.blinkProgress * Math.PI);

        if (leftEyelidRef.current && rightEyelidRef.current) {
          // Rotate eyelid to cover iris
          const lidAngle = Math.PI - blinkAmount * (Math.PI * 0.85);
          leftEyelidRef.current.rotation.x = lidAngle;
          rightEyelidRef.current.rotation.x = lidAngle;
        }

        if (blink.blinkProgress >= 1) {
          blink.isBlinking = false;
          blink.nextBlinkTime = now + 2500 + Math.random() * 3500; // Next blink in 2.5 - 6s
        }
      }

      // 5. Dynamic Ambient Halo & Color Shifts based on state
      if (haloRingRef.current) {
        haloRingRef.current.rotation.z = elapsedTime * 0.3;
        const haloMat = haloRingRef.current.material as THREE.MeshBasicMaterial;
        
        if (currentState === 'speaking') {
          haloMat.color.setHex(0x38bdf8); // Glowing Cyan
          haloMat.opacity = 0.6 + Math.sin(elapsedTime * 6) * 0.2;
        } else if (currentState === 'listening') {
          haloMat.color.setHex(0x34d399); // Attentive Emerald
          haloMat.opacity = 0.5 + Math.sin(elapsedTime * 3) * 0.15;
        } else if (currentState === 'processing') {
          haloMat.color.setHex(0xa855f7); // Cognitive Purple
          haloMat.opacity = 0.7;
          haloRingRef.current.rotation.z = elapsedTime * 1.5;
        } else {
          haloMat.color.setHex(0x818cf8); // Indigo
          haloMat.opacity = 0.35;
        }
      }

      // 6. Floating Particles Slow Drift
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.05;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // --- 9. Window Resize Handling ---
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- 10. Cleanup on Unmount ---
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[260px] sm:min-h-[280px] flex items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 select-none">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating State Badge Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
        <span className={`w-2 h-2 rounded-full ${
          agentState === 'speaking'
            ? 'bg-cyan-400 animate-ping'
            : agentState === 'listening'
            ? 'bg-emerald-400 animate-pulse'
            : agentState === 'processing'
            ? 'bg-purple-400 animate-spin'
            : 'bg-indigo-400'
        }`} />
        <span className="text-slate-200 uppercase tracking-wider">
          {agentState === 'speaking' ? '3D Voice Active' : agentState === 'listening' ? '3D Listening' : agentState === 'processing' ? 'Thinking' : '3D Ready'}
        </span>
      </div>

      {/* Interactive Mouse Look Tooltip Hint */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] text-slate-400 border border-slate-800">
        <Orbit className="w-2.5 h-2.5 text-cyan-400" />
        <span>3D Head Tracking</span>
      </div>

      {/* Real-Time Audio Equalizer Bar when Speaking */}
      {agentState === 'speaking' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-950/85 px-4 py-1.5 rounded-full border border-cyan-400/50 backdrop-blur-md shadow-lg">
          <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
          <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
          <span className="w-1.5 h-7 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '360ms' }} />
          <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '480ms' }} />
          <span className="text-[11px] font-extrabold text-cyan-200 ml-1.5">3D Lip-Sync Active</span>
        </div>
      )}

      {/* Listening Glow Indicator when Student Speaks */}
      {agentState === 'listening' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/85 px-4 py-1.5 rounded-full border border-emerald-400/50 backdrop-blur-md shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-extrabold text-emerald-300">Hearing your Voice...</span>
        </div>
      )}

    </div>
  );
};
