import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Orbit } from 'lucide-react';

interface Avatar3DProps {
  agentState: 'listening' | 'processing' | 'speaking' | 'idle';
  presetId?: 'kishore' | 'sophia' | 'alex' | 'marcus' | 'cyber_bot' | 'custom';
  audioElementRef?: React.RefObject<HTMLAudioElement | null>;
  spokenText?: string;
  isAudioMuted?: boolean;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  agentState,
  presetId = 'kishore',
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
  const jawRef = useRef<THREE.Mesh | THREE.Group | null>(null);
  const morphMeshesRef = useRef<Array<{ mesh: THREE.Mesh; targetIndices: number[] }>>([]);
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

    // 2. Camera Setup (Optimized for Half-Body / Bust Portrait Framing)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.12, 2.5);
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
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x333355, 2.8);
    scene.add(hemiLight);

    const frontLight = new THREE.DirectionalLight(0xfff8f0, 2.2);
    frontLight.position.set(0, 1.2, 3.5);
    scene.add(frontLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    keyLight.position.set(2, 2.5, 2.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    fillLight.position.set(-2.5, 1.5, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 2.2);
    rimLight.position.set(0, 2.5, -2);
    scene.add(rimLight);

    // 5. Build Half-Body 3D Avatar Root
    const avatarRoot = new THREE.Group();
    avatarRoot.position.set(0, -0.05, 0);
    scene.add(avatarRoot);

    let torsoGroup: THREE.Group | null = null;
    let headGroup: THREE.Group | null = null;

    // --- MATERIALS ---
    const presetConfig = {
      kishore: { skin: 0x8d5524, suit: 0x0f172a, hair: 0x171717, iris: 0x3b1d0c, halo: 0x38bdf8 },
      custom: { skin: 0x8d5524, suit: 0x0f172a, hair: 0x171717, iris: 0x3b1d0c, halo: 0x38bdf8 },
      sophia: { skin: 0xc58c85, suit: 0x064e3b, hair: 0x4a2810, iris: 0x047857, halo: 0x34d399 },
      alex: { skin: 0x9f725f, suit: 0x18181b, hair: 0x262626, iris: 0x0f766e, halo: 0x22c55e },
      marcus: { skin: 0x5c3826, suit: 0x3b0764, hair: 0x0a0a0a, iris: 0x6b21a8, halo: 0xa855f7 },
      cyber_bot: { skin: 0x64748b, suit: 0x1e293b, hair: 0x06b6d4, iris: 0x00f2fe, halo: 0x00f2fe }
    }[presetId] || { skin: 0x8d5524, suit: 0x0f172a, hair: 0x171717, iris: 0x3b1d0c, halo: 0x38bdf8 };

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: presetConfig.skin,
      roughness: presetId === 'cyber_bot' ? 0.25 : 0.55,
      metalness: presetId === 'cyber_bot' ? 0.75 : 0.05
    });

    const suitMaterial = new THREE.MeshStandardMaterial({
      color: presetConfig.suit,
      roughness: 0.65,
      metalness: 0.1
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4
    });

    const tieMaterial = new THREE.MeshStandardMaterial({
      color: presetId === 'sophia' ? 0x059669 : (presetId === 'marcus' ? 0x9333ea : 0x0284c7),
      roughness: 0.3
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: presetConfig.hair,
      roughness: 0.8
    });

    const lipMaterial = new THREE.MeshStandardMaterial({
      color: presetId === 'cyber_bot' ? 0x0284c7 : 0xa55146,
      roughness: 0.4
    });

    // --- PROCEDURAL 3D AVATAR (Torso & Head) ---
    torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, -0.45, 0);

    const chestGeo = new THREE.BoxGeometry(0.72, 0.6, 0.38);
    const chest = new THREE.Mesh(chestGeo, suitMaterial);
    torsoGroup.add(chest);

    const shirtVGeo = new THREE.BufferGeometry();
    const vVertices = new Float32Array([
      -0.12, 0.3, 0.191,
       0.12, 0.3, 0.191,
       0.0, -0.05, 0.191
    ]);
    shirtVGeo.setAttribute('position', new THREE.BufferAttribute(vVertices, 3));
    const shirtV = new THREE.Mesh(shirtVGeo, shirtMaterial);
    torsoGroup.add(shirtV);

    const tieGeo = new THREE.BoxGeometry(0.06, 0.32, 0.02);
    const tie = new THREE.Mesh(tieGeo, tieMaterial);
    tie.position.set(0, 0.04, 0.2);
    torsoGroup.add(tie);

    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.18, 16);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.set(0, 0.34, 0);
    torsoGroup.add(neck);

    avatarRoot.add(torsoGroup);

    headGroup = new THREE.Group();
    headGroup.position.set(0, 0.15, 0);

    const headGeo = new THREE.SphereGeometry(0.3, 32, 32);
    headGeo.scale(1.0, 1.18, 1.05);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    headGroup.add(head);

    const hairGeo = new THREE.SphereGeometry(0.32, 32, 32);
    hairGeo.scale(1.04, 1.15, 1.08);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.set(0, 0.06, -0.02);
    headGroup.add(hair);

    // Procedural Eyes
    const eyeGeo = new THREE.SphereGeometry(0.042, 16, 16);
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshBasicMaterial({ color: presetConfig.iris });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.11, 0.04, 0.28);
    const leftEyeBall = new THREE.Mesh(eyeGeo, whiteMat);
    const leftIris = new THREE.Mesh(new THREE.CircleGeometry(0.02, 16), irisMat);
    leftIris.position.set(0, 0, 0.041);
    const leftPupil = new THREE.Mesh(new THREE.CircleGeometry(0.01, 16), pupilMat);
    leftPupil.position.set(0, 0, 0.042);
    leftEyeGroup.add(leftEyeBall, leftIris, leftPupil);

    const eyelidGeo = new THREE.SphereGeometry(0.046, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const leftEyelid = new THREE.Mesh(eyelidGeo, skinMaterial);
    leftEyelid.rotation.x = Math.PI;
    leftEyeGroup.add(leftEyelid);
    leftEyelidRef.current = leftEyelid;
    headGroup.add(leftEyeGroup);

    const rightEyeGroup = leftEyeGroup.clone();
    rightEyeGroup.position.set(0.11, 0.04, 0.28);
    const rightEyelid = rightEyeGroup.children[3] as THREE.Mesh;
    rightEyelidRef.current = rightEyelid;
    headGroup.add(rightEyeGroup);

    // --- ARTICULATED MOUTH & JAW GROUP (For Dynamic Lip Sync) ---
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.09, 0.30);

    const upperLipGeo = new THREE.BoxGeometry(0.12, 0.02, 0.04);
    const upperLip = new THREE.Mesh(upperLipGeo, lipMaterial);
    upperLip.position.set(0, 0.015, 0.02);
    jawGroup.add(upperLip);

    const lowerLipGeo = new THREE.BoxGeometry(0.11, 0.022, 0.05);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipMaterial);
    lowerLip.position.set(0, -0.015, 0.02);
    jawGroup.add(lowerLip);
    jawRef.current = lowerLip;

    const cavityGeo = new THREE.BoxGeometry(0.09, 0.03, 0.03);
    const cavityMat = new THREE.MeshBasicMaterial({ color: 0x1c0b05 });
    const cavityMesh = new THREE.Mesh(cavityGeo, cavityMat);
    cavityMesh.position.set(0, 0, 0.01);
    jawGroup.add(cavityMesh);

    headGroup.add(jawGroup);
    headGroupRef.current = headGroup;
    avatarRoot.add(headGroup);

    // --- GLB MODEL LOADER ---
    let isGLBLoaded = false;
    const loader = new GLTFLoader();
    loader.load(
      '/man_in_suit.glb',
      (gltf) => {
        const model = gltf.scene;
        const morphMeshes: Array<{ mesh: THREE.Mesh; targetIndices: number[] }> = [];

        model.traverse((child) => {
          if (child.name && child.name.toLowerCase().includes('floor')) {
            child.visible = false;
          }
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
              mat.side = THREE.DoubleSide;
              mat.roughness = 0.55;
              mat.metalness = 0.1;
              mat.needsUpdate = true;
            }

            // Find Morph Targets for facial animations
            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
              const targetIndices: number[] = [];
              Object.keys(mesh.morphTargetDictionary).forEach((targetName) => {
                const lower = targetName.toLowerCase();
                if (
                  lower.includes('mouth') ||
                  lower.includes('jaw') ||
                  lower.includes('viseme') ||
                  lower.includes('open') ||
                  lower.includes('smile') ||
                  lower.includes('talk')
                ) {
                  targetIndices.push(mesh.morphTargetDictionary![targetName]);
                }
              });
              if (targetIndices.length > 0) {
                morphMeshes.push({ mesh, targetIndices });
              }
            }
          }
        });

        morphMeshesRef.current = morphMeshes;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.8 / (maxDim || 1);
        model.scale.set(scale, scale, scale);

        const upperBodyOffsetY = (center.y + size.y * 0.08) * scale;
        model.position.x = -center.x * scale;
        model.position.y = -upperBodyOffsetY + 0.26;
        model.position.z = -center.z * scale;

        headGroupRef.current = model;
        avatarRoot.add(model);
        isGLBLoaded = true;

        // Hide ALL procedural body parts completely when 3D GLB model loads
        if (torsoGroup) torsoGroup.visible = false;
        if (headGroup) headGroup.visible = false;
      },
      undefined,
      (err) => {
        console.log('Using enhanced procedural 3D avatar.', err);
      }
    );

    // --- HOLOGRAPHIC AMBIENT HALO & PARTICLES ---
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

    // --- MOUSE TRACKING ---
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

    // --- ANIMATION & RENDER LOOP ---
    const clock = new THREE.Clock();
    let speechTimer = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const currentState = agentStateRef.current;

      // 1. Organic Breathing
      const breatheY = Math.sin(elapsedTime * 2.0) * 0.015;
      const breatheRot = Math.sin(elapsedTime * 1.2) * 0.01;
      avatarRoot.position.y = (presetId === 'custom' ? -0.05 : -0.4) + breatheY;

      // 2. Smooth Head Tracking
      const targetHeadX = mouseTargetRef.current.y * 0.18 + (currentState === 'listening' ? 0.05 : 0);
      const targetHeadY = mouseTargetRef.current.x * 0.28 + (currentState === 'listening' ? -0.08 : 0);

      currentHeadRotRef.current.x += (targetHeadX - currentHeadRotRef.current.x) * 0.08;
      currentHeadRotRef.current.y += (targetHeadY - currentHeadRotRef.current.y) * 0.08;

      if (headGroupRef.current) {
        if (isGLBLoaded) {
          const speechNod = (currentState === 'speaking') ? Math.sin(elapsedTime * 8) * 0.015 : 0;
          headGroupRef.current.rotation.x = speechNod;
          headGroupRef.current.rotation.y = currentHeadRotRef.current.y * 0.12;
          headGroupRef.current.rotation.z = (currentState === 'listening' ? 0.02 : 0);
        } else {
          headGroupRef.current.rotation.x = currentHeadRotRef.current.x + breatheRot;
          headGroupRef.current.rotation.y = currentHeadRotRef.current.y;
          headGroupRef.current.rotation.z = (currentState === 'listening' ? 0.04 : 0);
        }
      }

      // 3. REAL-TIME SYNCHRONIZED LIP-SYNC & MOUTH MOVEMENT
      const isSpeakingNow = currentState === 'speaking';

      if (isSpeakingNow) {
        speechTimer += delta * 14;
        // Phoneme waveform matching natural speech cadence
        const visemeOpen = Math.abs(Math.sin(speechTimer * 1.6) * 0.65 + Math.sin(speechTimer * 3.2) * 0.35);
        const visemeSpread = Math.cos(speechTimer * 2.2) * 0.15;

        // A. Morph Targets (if model supports them)
        if (morphMeshesRef.current.length > 0) {
          morphMeshesRef.current.forEach(({ mesh, targetIndices }) => {
            targetIndices.forEach((idx) => {
              mesh.morphTargetInfluences![idx] = visemeOpen;
            });
          });
        }

        // B. Articulated 3D Jaw / Lip movement
        if (jawRef.current) {
          jawRef.current.scale.y = 1.0 + visemeOpen * 1.8;
          jawRef.current.scale.x = 1.0 + visemeSpread;
          jawRef.current.position.y = -0.015 - Math.min(0.06, visemeOpen * 0.045);
        }
      } else {
        // Return smoothly to closed mouth
        if (morphMeshesRef.current.length > 0) {
          morphMeshesRef.current.forEach(({ mesh, targetIndices }) => {
            targetIndices.forEach((idx) => {
              mesh.morphTargetInfluences![idx] += (0 - mesh.morphTargetInfluences![idx]) * 0.3;
            });
          });
        }

        if (jawRef.current) {
          jawRef.current.scale.y += (1.0 - jawRef.current.scale.y) * 0.3;
          jawRef.current.scale.x += (1.0 - jawRef.current.scale.x) * 0.3;
          jawRef.current.position.y += (-0.015 - jawRef.current.position.y) * 0.3;
        }
      }

      // 4. Eye Blinking
      const now = Date.now();
      const blink = blinkStateRef.current;
      if (!blink.isBlinking && now > blink.nextBlinkTime) {
        blink.isBlinking = true;
        blink.blinkProgress = 0;
      }

      if (blink.isBlinking) {
        blink.blinkProgress += delta * 12;
        const blinkAmount = Math.sin(blink.blinkProgress * Math.PI);

        if (leftEyelidRef.current && rightEyelidRef.current) {
          const lidAngle = Math.PI - blinkAmount * (Math.PI * 0.85);
          leftEyelidRef.current.rotation.x = lidAngle;
          rightEyelidRef.current.rotation.x = lidAngle;
        }

        if (blink.blinkProgress >= 1) {
          blink.isBlinking = false;
          blink.nextBlinkTime = now + 2500 + Math.random() * 3500;
        }
      }

      // 5. Halo & Lighting Animation
      if (haloRingRef.current) {
        haloRingRef.current.rotation.z = elapsedTime * 0.3;
        const haloMat = haloRingRef.current.material as THREE.MeshBasicMaterial;

        if (currentState === 'speaking') {
          haloMat.color.setHex(0x38bdf8);
          haloMat.opacity = 0.65 + Math.sin(elapsedTime * 6) * 0.2;
        } else if (currentState === 'listening') {
          haloMat.color.setHex(0x34d399);
          haloMat.opacity = 0.5 + Math.sin(elapsedTime * 3) * 0.15;
        } else if (currentState === 'processing') {
          haloMat.color.setHex(0xa855f7);
          haloMat.opacity = 0.7;
          haloRingRef.current.rotation.z = elapsedTime * 1.5;
        } else {
          haloMat.color.setHex(0x818cf8);
          haloMat.opacity = 0.35;
        }
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.05;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [presetId]);

  return (
    <div className="relative w-full h-full min-h-[260px] sm:min-h-[280px] flex items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 select-none">
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
        <span className={`w-2 h-2 rounded-full ${agentState === 'speaking'
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

      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] text-slate-400 border border-slate-800">
        <Orbit className="w-2.5 h-2.5 text-cyan-400" />
        <span>3D Head Tracking</span>
      </div>

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

      {agentState === 'listening' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/85 px-4 py-1.5 rounded-full border border-emerald-400/50 backdrop-blur-md shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-extrabold text-emerald-300">Hearing your Voice...</span>
        </div>
      )}
    </div>
  );
};
