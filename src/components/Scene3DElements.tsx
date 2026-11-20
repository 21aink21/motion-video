import React, { Suspense, useEffect, useMemo } from 'react';
import {
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { RoundedBox, Sphere, Torus, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { HICCUP_TIMESTAMPS } from '../subtitlesData';

// Helper: Hitung impuls "HIK!" menggunakan global frame (akurat di dalam <Sequence>)
export const useHiccupImpulse = (sequenceOffsetFrames = 0) => {
  const localFrame = useCurrentFrame();
  const globalFrame = localFrame + sequenceOffsetFrames;
  const { fps } = useVideoConfig();

  return HICCUP_TIMESTAMPS.reduce((maxPulse, timeSec) => {
    const triggerFrame = Math.round(timeSec * fps);
    const elapsed = globalFrame - triggerFrame;

    if (elapsed >= 0 && elapsed <= 55) {
      const p = spring({
        frame: elapsed,
        fps,
        config: { damping: 7, stiffness: 220, mass: 0.6 },
      });
      const decay = interpolate(elapsed, [0, 12, 55], [1, 1, 0], {
        extrapolateRight: 'clamp',
      });
      return Math.max(maxPulse, p * decay);
    }
    return maxPulse;
  }, 0);
};

// Fallback untuk <Suspense>: menahan render Remotion selama model .glb masih dimuat.
// delayRender dipanggil saat fallback tampil, continueRender saat fallback hilang (model siap).
// Ini menggantikan delayRender di dalam HologramGLB yang bocor ketika useGLTF "suspend".
const ModelLoader: React.FC = () => {
  useEffect(() => {
    const handle = delayRender('Loading 3D models');
    return () => continueRender(handle);
  }, []);
  return null;
};

// Preload semua model sekali di awal, supaya tidak "pop-in" saat scene berganti.
const MODEL_FILES = [
  'lungs.glb',
  'brain.glb',
  'larynx.glb',
  'stomach.glb',
  'soda-can.glb',
  'drum.glb',
  'water-glass.glb',
  'clock.glb',
];
MODEL_FILES.forEach((file) => useGLTF.preload(staticFile(`models/${file}`)));

// Komponen Reusable Loader Model .glb dengan Material Dark Emerald Hologram
interface HologramGLBProps {
  filename: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  emissiveIntensity?: number;
  wireframe?: boolean;
  accentColor?: string;
}

const HologramGLB: React.FC<HologramGLBProps> = ({
  filename,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  emissiveIntensity = 0.85,
  wireframe = false,
  accentColor = '#097969',
}) => {
  const { scene } = useGLTF(staticFile(`models/${filename}`));

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0b3d2e'),
        emissive: new THREE.Color(accentColor),
        emissiveIntensity,
        roughness: 0.25,
        metalness: 0.78,
        wireframe,
      }),
    [accentColor, wireframe]
  );

  // Update intensitas cahaya secara efisien tanpa re-clone mesh tiap frame
  material.emissiveIntensity = emissiveIntensity;

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material;
      }
    });
    return clone;
  }, [scene, material]);

  const scaleVec: [number, number, number] =
    typeof scale === 'number' ? [scale, scale, scale] : scale;

  return (
    <group position={position} rotation={rotation} scale={scaleVec}>
      <primitive object={clonedScene} />
    </group>
  );
};

// 1. MEGA SHOCKWAVE 3D (Aktif di seluruh video setiap kali terdengar "HIK!")
export const GlobalHiccupShockwave3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <group>
      {HICCUP_TIMESTAMPS.map((timeSec, idx) => {
        const triggerFrame = Math.round(timeSec * fps);
        const elapsed = frame - triggerFrame;

        if (elapsed < 0 || elapsed > 55) return null;

        const ring1Radius = interpolate(elapsed, [0, 50], [0.5, 11.5], {
          extrapolateRight: 'clamp',
        });
        const ring2Radius = interpolate(elapsed, [4, 52], [0.3, 8.5], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const ring3Radius = interpolate(elapsed, [8, 55], [0.2, 5.8], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const opacity = interpolate(elapsed, [0, 8, 55], [0, 1, 0], {
          extrapolateRight: 'clamp',
        });
        const sphereBurstScale = interpolate(elapsed, [0, 35], [0.4, 6.5], {
          extrapolateRight: 'clamp',
        });

        return (
          <group key={idx}>
            <Torus args={[ring1Radius, 0.14, 24, 96]} rotation={[Math.PI / 4, elapsed * 0.04, 0]}>
              <meshStandardMaterial
                color="#ffffff"
                emissive="#097969"
                emissiveIntensity={6 * opacity}
                transparent
                opacity={opacity}
              />
            </Torus>
            <Torus args={[ring2Radius, 0.09, 20, 80]} rotation={[-Math.PI / 3, elapsed * -0.05, 0]}>
              <meshStandardMaterial
                color="#097969"
                emissive="#ffffff"
                emissiveIntensity={4.5 * opacity}
                transparent
                opacity={opacity * 0.85}
              />
            </Torus>
            <Torus args={[ring3Radius, 0.06, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={5 * opacity}
                transparent
                opacity={opacity * 0.9}
              />
            </Torus>
            <Sphere args={[1, 24, 24]} scale={sphereBurstScale}>
              <meshStandardMaterial
                color="#097969"
                emissive="#ffffff"
                emissiveIntensity={3.5 * opacity}
                wireframe
                transparent
                opacity={opacity * 0.45}
              />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
};

// 2. Partikel Atmosferik Deterministik (Ikut terdorong saat Shockwave "HIK!")
export const GlowingParticles: React.FC<{ count?: number; speedMultiplier?: number }> = ({
  count = 110,
  speedMultiplier = 1,
}) => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse(0);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (random(`px-${i}`) - 0.5) * 22,
      y: (random(`py-${i}`) - 0.5) * 14,
      z: (random(`pz-${i}`) - 0.5) * 12 - 2,
      size: random(`ps-${i}`) * 0.08 + 0.03,
      speed: (random(`psp-${i}`) * 0.015 + 0.005) * speedMultiplier,
      phase: random(`pph-${i}`) * Math.PI * 2,
    }));
  }, [count, speedMultiplier]);

  return (
    <group>
      {particles.map((p, i) => {
        const yPos = ((p.y + frame * p.speed + 7) % 14) - 7;
        const xOffset = Math.sin(frame * 0.02 + p.phase) * 0.35;
        const radialPush = 1 + hiccupPulse * 0.65;

        return (
          <mesh
            key={i}
            position={[(p.x + xOffset) * radialPush, yPos * radialPush, p.z]}
            scale={1 + hiccupPulse * 1.8}
          >
            <sphereGeometry args={[p.size, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#097969"
              emissiveIntensity={2.4 + hiccupPulse * 4}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// 3. Scene 1 (Frame 0 - 2307): Inti Tombol "HIK!"
export const HiccupCoreScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse(0);

  const baseScale = 1 + Math.sin(frame * 0.05) * 0.06 + hiccupPulse * 0.85;
  const rotY = frame * 0.012 + hiccupPulse * 0.5;
  const rotX = Math.sin(frame * 0.008) * 0.3;

  return (
    <group rotation={[rotX, rotY, 0]}>
      <Sphere args={[1.6, 32, 32]} scale={baseScale}>
        <meshStandardMaterial
          color="#0b3d2e"
          emissive="#097969"
          emissiveIntensity={0.9 + hiccupPulse * 4.5}
          wireframe
        />
      </Sphere>
      <Sphere args={[1.1, 32, 32]} scale={baseScale * 0.9}>
        <meshStandardMaterial
          color="#097969"
          emissive="#ffffff"
          emissiveIntensity={0.3 + hiccupPulse * 3.0}
          roughness={0.15}
          metalness={0.85}
        />
      </Sphere>
    </group>
  );
};

// 4. Scene 2 (Frame 2307 - 5460): Paru-paru (.glb), Lift Diafragma & Otak (.glb)
export const DiaphragmElevatorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse(2307);

  // Siklus napas 3 detik (180 frame)
  const breathCycle = Math.sin((frame / 180) * Math.PI * 2);
  const diaphragmY = interpolate(breathCycle, [-1, 1], [-1.85, -0.55]);
  const lungScale = interpolate(breathCycle, [-1, 1], [1.28, 0.94]);

  // Otak (brain.glb) masuk pada 01:23 (local frame ~2640) saat membahas ritme otomatis otak & saraf
  const showBrain = frame >= 2600;
  const brainScale = interpolate(frame, [2600, 2670], [0.001, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <group position={[0, 0.15, 0]}>
      <Suspense fallback={<ModelLoader />}>
        {/* Model 3D Paru-paru */}
        <HologramGLB
          filename="lungs.glb"
          position={[0, 0.65, 0]}
          rotation={[0, Math.sin(frame * 0.01) * 0.25, 0]}
          scale={[lungScale, lungScale * 1.05, lungScale]}
          emissiveIntensity={0.8 + hiccupPulse * 2.5}
        />

        {/* Model 3D Otak (Muncul di kanan atas saat narasi otak & saraf) */}
        {showBrain && (
          <HologramGLB
            filename="brain.glb"
            position={[2.7, 1.55, 0.3]}
            rotation={[0, frame * 0.018, 0]}
            scale={brainScale}
            emissiveIntensity={1.2 + Math.sin(frame * 0.12) * 0.5}
          />
        )}
      </Suspense>

      {/* Cincin Indikator Tekanan Rongga Dada */}
      <Torus args={[2.1 * lungScale, 0.03, 16, 64]} position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" emissive="#097969" emissiveIntensity={1.5} transparent opacity={0.5} />
      </Torus>

      {/* Lantai Lift / Kubah Diafragma */}
      <group position={[0, diaphragmY, 0]}>
        <RoundedBox args={[4.8, 0.28, 2.6]} radius={0.12} smoothness={4}>
          <meshStandardMaterial
            color="#097969"
            emissive="#ffffff"
            emissiveIntensity={0.5 + hiccupPulse * 2}
            metalness={0.7}
            roughness={0.2}
          />
        </RoundedBox>
        <mesh position={[-2.6, 1.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 3.8, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
        <mesh position={[2.6, 1.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 3.8, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
};

// 5. Scene 3 (Frame 5460 - 6960): Spasme Paru-paru (.glb) & Laring/Pita Suara (.glb)
export const VocalChordSnapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse(5460);

  const snapCycle = Math.sin(frame * 0.14);
  const isSnapped = snapCycle > 0.65 || hiccupPulse > 0.15;

  const valveGap = isSnapped ? 0.02 : interpolate(snapCycle, [-1, 0.65], [1.1, 0.35]);
  const spasmJerkY = isSnapped ? -2.2 : -1.2 + Math.sin(frame * 0.06) * 0.25;

  return (
    <group>
      <Suspense fallback={<ModelLoader />}>
        {/* Model Laring (Pita Suara) di Bagian Atas */}
        <HologramGLB
          filename="larynx.glb"
          position={[0, 1.45, 0.2]}
          rotation={[0, frame * 0.015, 0]}
          scale={isSnapped ? [1.15, 0.92, 1.15] : 1.0}
          emissiveIntensity={isSnapped ? 3.2 : 0.9}
        />

        {/* Model Paru-paru di Bawahnya yang Ikut Menyentak */}
        <HologramGLB
          filename="lungs.glb"
          position={[0, -0.45, -0.7]}
          rotation={[0, Math.sin(frame * 0.01) * 0.2, 0]}
          scale={isSnapped ? 1.08 : 0.85}
          emissiveIntensity={0.75 + hiccupPulse * 2.5}
        />
      </Suspense>

      {/* Katup Pita Suara Kiri & Kanan (Indikator Penutupan) */}
      <RoundedBox args={[1.35, 0.26, 0.9]} position={[-0.7 - valveGap * 0.5, 1.5, 0.7]} radius={0.08}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#097969"
          emissiveIntensity={isSnapped ? 4.2 : 0.8}
        />
      </RoundedBox>
      <RoundedBox args={[1.35, 0.26, 0.9]} position={[0.7 + valveGap * 0.5, 1.5, 0.7]} radius={0.08}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#097969"
          emissiveIntensity={isSnapped ? 4.2 : 0.8}
        />
      </RoundedBox>

      {/* Kubah Diafragma Menyentak di Bawah */}
      <mesh position={[0, spasmJerkY, 0]} rotation={[0, frame * 0.01, 0]}>
        <cylinderGeometry args={[2.3, 2.7, 0.3, 32]} />
        <meshStandardMaterial color="#097969" emissive="#097969" emissiveIntensity={1.6} wireframe />
      </mesh>
    </group>
  );
};

// 6. Scene 4 (Frame 6960 - 10744): Lambung + Soda -> Drummer -> Otak & Saraf
export const TriggersAndDrummerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse(6960);

  // Fase 1 (0 - 1788): 01:56 - 02:25 -> Lambung mengembang & Kaleng Soda
  const isStomachPhase = frame < 1788;
  // Fase 2 (1788 - 2693): 02:25 - 02:40 -> Analogi Drummer
  const isDrummerPhase = frame >= 1788 && frame < 2693;
  // Fase 3 (2693+): 02:40 - 02:59 -> Sistem Saraf & Otak
  const isBrainPhase = frame >= 2693;

  const stomachBloat = 1.15 + Math.sin(frame * 0.04) * 0.18 + interpolate(frame, [0, 1500], [0, 0.25], { extrapolateRight: 'clamp' });
  const showSoda = frame >= 880 && isStomachPhase; // Muncul saat 02:11

  const isGlitchBeat = frame % 120 > 96 || hiccupPulse > 0.1;
  const drumScale = isGlitchBeat ? 1.48 + hiccupPulse * 0.4 : 1.2 + Math.abs(Math.sin(frame * 0.14)) * 0.15;
  const tiltGlitch = isGlitchBeat ? Math.sin(frame * 0.9) * 0.35 : 0;

  return (
    <Suspense fallback={<ModelLoader />}>
      {/* FASE 1: Lambung & Minuman Bersoda */}
      {isStomachPhase && (
        <group>
          <HologramGLB
            filename="stomach.glb"
            position={[showSoda ? -0.9 : 0, 0.1, 0]}
            rotation={[0, frame * 0.012, 0]}
            scale={stomachBloat}
            emissiveIntensity={0.95 + Math.sin(frame * 0.08) * 0.3}
          />
          {showSoda && (
            <HologramGLB
              filename="soda-can.glb"
              position={[2.0, Math.sin(frame * 0.06) * 0.35, 0.4]}
              rotation={[0.25, frame * 0.03, -0.2]}
              scale={1.05}
              emissiveIntensity={1.4}
            />
          )}
        </group>
      )}

      {/* FASE 2: Snare Drum (Analogi Drummer Salah Ketuk) */}
      {isDrummerPhase && (
        <group rotation={[0.3 + tiltGlitch, frame * 0.012, 0]}>
          <HologramGLB
            filename="drum.glb"
            position={[0, 0, 0]}
            scale={drumScale}
            emissiveIntensity={isGlitchBeat ? 3.5 : 1.0}
          />
          <Torus args={[2.3, 0.07, 20, 64]} rotation={[Math.PI / 2, 0, 0]} scale={drumScale * 0.9}>
            <meshStandardMaterial
              color={isGlitchBeat ? '#ffffff' : '#097969'}
              emissive="#097969"
              emissiveIntensity={isGlitchBeat ? 4.5 : 1.1}
            />
          </Torus>
        </group>
      )}

      {/* FASE 3: Otak & Sinyal Sistem Saraf */}
      {isBrainPhase && (
        <group>
          <HologramGLB
            filename="brain.glb"
            position={[0, 0.2, 0]}
            rotation={[0, frame * 0.016, 0]}
            scale={1.45 + Math.sin(frame * 0.08) * 0.08 + hiccupPulse * 0.3}
            emissiveIntensity={1.2 + Math.sin(frame * 0.15) * 0.6 + hiccupPulse * 3}
          />
          <Torus args={[2.2, 0.04, 16, 64]} rotation={[frame * 0.02, frame * 0.015, 0]}>
            <meshStandardMaterial color="#ffffff" emissive="#097969" emissiveIntensity={2.2} />
          </Torus>
        </group>
      )}
    </Suspense>
  );
};

// 7. Scene 5 (Frame 10744 - 16980): Gelas Air -> Jam 48 Jam -> Gelombang Harmoni Penutup
export const HarmonyWaveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse(10744);
  const points = useMemo(() => Array.from({ length: 28 }), []);

  // Fase 1 (local frame 0 - 3015): 02:59 - 03:49 -> Gelas Air & Gelombang CO2
  const showWaterGlass = frame >= 120 && frame < 2950;
  // Fase 2 (local frame 3015 - 4024): 03:49 - 04:06 -> Jam Peringatan 48 Jam
  const showClock = frame >= 2950 && frame < 4100;
  // Fase 3 (local frame 4100+): 04:06 - 04:43 -> Penutup (Paru-paru & Harmoni)
  const showOutroModel = frame >= 4100;

  return (
    <group>
      {/* Gelombang Harmoni Partikel CO2 di Latar Belakang */}
      <group position={[0, -0.9, -1.5]}>
        {points.map((_, i) => {
          const x = (i - 13.5) * 0.36;
          const y = Math.sin(frame * 0.04 + i * 0.35) * (0.9 + hiccupPulse * 1.1);
          const z = Math.cos(frame * 0.04 + i * 0.35) * 0.7;
          return (
            <Sphere key={i} args={[0.14, 16, 16]} position={[x, y, z]} scale={1 + hiccupPulse * 0.7}>
              <meshStandardMaterial
                color="#ffffff"
                emissive="#097969"
                emissiveIntensity={1.6 + hiccupPulse * 3}
                roughness={0.1}
              />
            </Sphere>
          );
        })}
      </group>

      <Suspense fallback={<ModelLoader />}>
        {/* Model Gelas Air */}
        {showWaterGlass && (
          <HologramGLB
            filename="water-glass.glb"
            position={[0, 0.35 + Math.sin(frame * 0.04) * 0.2, 0.4]}
            rotation={[0.15, frame * 0.015, Math.sin(frame * 0.03) * 0.12]}
            scale={1.35}
            emissiveIntensity={1.15}
          />
        )}

        {/* Model Jam Peringatan 48 Jam */}
        {showClock && (
          <HologramGLB
            filename="clock.glb"
            position={[0, 0.3, 0.5]}
            rotation={[0, Math.sin(frame * 0.025) * 0.35, Math.sin(frame * 0.35) * 0.06]}
            scale={1.45 + Math.sin(frame * 0.15) * 0.08}
            emissiveIntensity={1.8 + Math.abs(Math.sin(frame * 0.15)) * 1.4}
          />
        )}

        {/* Model Penutup (Paru-paru Harmonis) */}
        {showOutroModel && (
          <HologramGLB
            filename="lungs.glb"
            position={[0, 0.35, 0.3]}
            rotation={[0, frame * 0.012, 0]}
            scale={1.15 + Math.sin(frame * 0.04) * 0.08 + hiccupPulse * 0.25}
            emissiveIntensity={1.0 + hiccupPulse * 3.0}
          />
        )}
      </Suspense>
    </group>
  );
};
