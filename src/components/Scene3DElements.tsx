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

export const useHiccupImpulse = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return HICCUP_TIMESTAMPS.reduce((maxPulse, timeSec) => {
    const triggerFrame = Math.round(timeSec * fps);
    const elapsed = frame - triggerFrame;

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

export const GlowingParticles: React.FC<{ count?: number; speedMultiplier?: number }> = ({
  count = 110,
  speedMultiplier = 1,
}) => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse();

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

const AnatomicalLungsGLB: React.FC<{ breathScale: number; hiccupPulse: number }> = ({
  breathScale,
  hiccupPulse,
}) => {
  const [handle] = React.useState(() => delayRender('Loading lungs.glb 3D model'));
  const { scene } = useGLTF(staticFile('models/lungs.glb'));

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#0b3d2e'),
          emissive: new THREE.Color('#097969'),
          emissiveIntensity: 0.75 + hiccupPulse * 2.5,
          roughness: 0.25,
          metalness: 0.8,
          wireframe: false,
        });
      }
    });
    return clone;
  }, [scene, hiccupPulse]);

  useEffect(() => {
    continueRender(handle);
  }, [handle]);

  const finalScale = breathScale * (1 + hiccupPulse * 0.25);

  return (
    <group position={[0, 0.65, 0]} scale={[finalScale, finalScale * 1.05, finalScale]}>
      <primitive object={clonedScene} />
      <primitive object={clonedScene.clone()} scale={1.03} />
    </group>
  );
};

export const HiccupCoreScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse();

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

export const DiaphragmElevatorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse();

  const breathCycle = Math.sin((frame / 180) * Math.PI * 2);
  const diaphragmY = interpolate(breathCycle, [-1, 1], [-1.85, -0.55]);
  const lungScale = interpolate(breathCycle, [-1, 1], [1.32, 0.92]);

  return (
    <group position={[0, 0.2, 0]}>
      <Suspense fallback={null}>
        <AnatomicalLungsGLB breathScale={lungScale} hiccupPulse={hiccupPulse} />
      </Suspense>

      <Torus args={[2.1 * lungScale, 0.03, 16, 64]} position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" emissive="#097969" emissiveIntensity={1.5} transparent opacity={0.5} />
      </Torus>

      <group position={[0, diaphragmY, 0]}>
        <RoundedBox args={[4.8, 0.3, 2.8]} radius={0.12} smoothness={4}>
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

export const VocalChordSnapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse();

  const snapCycle = Math.sin(frame * 0.14);
  const isSnapped = snapCycle > 0.65 || hiccupPulse > 0.2;

  const valveGap = isSnapped ? 0.02 : interpolate(snapCycle, [-1, 0.65], [1.15, 0.4]);
  const spasmJerkY = isSnapped ? -2.2 : -1.1 + Math.sin(frame * 0.06) * 0.3;

  return (
    <group>
      <Suspense fallback={null}>
        <group position={[0, -0.3, -0.8]} scale={0.85}>
          <AnatomicalLungsGLB breathScale={isSnapped ? 1.38 : 1.0} hiccupPulse={hiccupPulse} />
        </group>
      </Suspense>

      <RoundedBox args={[1.65, 0.38, 1.2]} position={[-0.85 - valveGap * 0.5, 1.55, 0]} radius={0.1}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#097969"
          emissiveIntensity={isSnapped ? 4.2 : 0.8}
        />
      </RoundedBox>
      <RoundedBox args={[1.65, 0.38, 1.2]} position={[0.85 + valveGap * 0.5, 1.55, 0]} radius={0.1}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#097969"
          emissiveIntensity={isSnapped ? 4.2 : 0.8}
        />
      </RoundedBox>

      <mesh position={[0, spasmJerkY, 0]} rotation={[0, frame * 0.01, 0]}>
        <cylinderGeometry args={[2.3, 2.7, 0.35, 32]} />
        <meshStandardMaterial color="#097969" emissive="#097969" emissiveIntensity={1.6} wireframe />
      </mesh>
    </group>
  );
};

export const TriggersAndDrummerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse();

  const isGlitchBeat = frame % 140 > 115 || hiccupPulse > 0.1;
  const drumScale = isGlitchBeat ? 1.55 + hiccupPulse * 0.5 : 1 + Math.abs(Math.sin(frame * 0.1)) * 0.18;
  const tiltGlitch = isGlitchBeat ? Math.sin(frame * 0.8) * 0.4 : 0;

  return (
    <group rotation={[tiltGlitch, frame * 0.008, 0]}>
      <Torus args={[2.0, 0.12, 24, 64]} scale={drumScale}>
        <meshStandardMaterial
          color={isGlitchBeat ? '#ffffff' : '#097969'}
          emissive="#097969"
          emissiveIntensity={isGlitchBeat ? 4.5 : 1.0}
        />
      </Torus>
      <Torus args={[1.3, 0.06, 16, 48]} rotation={[Math.PI / 3, 0, 0]} scale={drumScale * 0.95}>
        <meshStandardMaterial color="#ffffff" emissive="#097969" emissiveIntensity={1.8} wireframe />
      </Torus>
    </group>
  );
};

export const HarmonyWaveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hiccupPulse = useHiccupImpulse();
  const points = useMemo(() => Array.from({ length: 28 }), []);

  return (
    <group>
      {points.map((_, i) => {
        const x = (i - 13.5) * 0.32;
        const y = Math.sin(frame * 0.04 + i * 0.35) * (1.1 + hiccupPulse * 1.2);
        const z = Math.cos(frame * 0.04 + i * 0.35) * 0.8;
        return (
          <Sphere key={i} args={[0.16, 16, 16]} position={[x, y, z]} scale={1 + hiccupPulse * 0.8}>
            <meshStandardMaterial
              color="#ffffff"
              emissive="#097969"
              emissiveIntensity={1.8 + hiccupPulse * 3}
              roughness={0.1}
            />
          </Sphere>
        );
      })}
    </group>
  );
};
