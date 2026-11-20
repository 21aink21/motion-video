import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import {
  DiaphragmElevatorScene,
  GlobalHiccupShockwave3D,
  GlowingParticles,
  HarmonyWaveScene,
  HiccupCoreScene,
  TriggersAndDrummerScene,
  useHiccupImpulse,
  VocalChordSnapScene,
} from './components/Scene3DElements';
import { SUBTITLES } from './subtitlesData';

const { fontFamily: poppinsFont } = loadPoppins('normal', { weights: ['700'] });
const { fontFamily: caveatFont } = loadCaveat('normal', { weights: ['700'] });

interface OverlayMeta {
  from: number;
  duration: number;
  badge: string;
  title: string;
  note: string;
}

const SCENE_OVERLAYS: OverlayMeta[] = [
  {
    from: 0,
    duration: 2307,
    badge: '01 / FENOMENA TUBUH',
    title: 'SIAPA PENEKAN TOMBOL "HIK!"?',
    note: 'Muncul mendadak di saat paling nggak tepat',
  },
  {
    from: 2307,
    duration: 3153,
    badge: '02 / ANATOMI 3D PARU-PARU',
    title: 'OTOT KUBAH DIAFRAGMA',
    note: 'Bekerja otomatis naik-turun seperti lantai lift',
  },
  {
    from: 5460,
    duration: 1500,
    badge: '03 / PROSES CEGUKAN',
    title: 'SPASME & PITA SUARA MENUTUP',
    note: 'Udara tersedot cepat lalu tertahan -> Bunyi Hik!',
  },
  {
    from: 6960,
    duration: 3784,
    badge: '04 / PEMICU & SARAF',
    title: 'DRUMMER YANG SALAH KETUK',
    note: 'Makan buru-buru, gas minuman soda, & rangsangan saraf',
  },
  {
    from: 10744,
    duration: 6236,
    badge: '05 / SOLUSI & MEDIS',
    title: 'RESET RITME & BATAS 48 JAM',
    note: 'Tahan nafas ubah kadar CO2 - Tulis trik andalanmu di komentar!',
  },
];

export const ExplainerVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const currentTimeSec = frame / fps;

  const hiccupPulse = useHiccupImpulse();

  const shakeX = Math.sin(frame * 1.7) * hiccupPulse * 0.35;
  const shakeY = Math.cos(frame * 2.1) * hiccupPulse * 0.35;
  const camZ =
    interpolate(Math.sin(frame * 0.005), [-1, 1], [6.8, 8.2]) - hiccupPulse * 1.1;

  const activeSubtitle = SUBTITLES.find(
    (s) => currentTimeSec >= s.start && currentTimeSec <= s.end
  );

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 45%, #097969 0%, #0b3d2e 55%, #041611 100%)',
      }}
    >
      <Audio src={staticFile('voiceover.mp3')} />

      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 45, position: [shakeX, shakeY, camZ] }}
      >
        <fog attach="fog" args={['#0b3d2e', 6, 22]} />
        <ambientLight intensity={0.7 + hiccupPulse * 0.8} />
        <directionalLight position={[6, 8, 5]} intensity={1.5 + hiccupPulse * 2} color="#ffffff" />
        <pointLight position={[-5, -4, 4]} intensity={2.2 + hiccupPulse * 4} color="#097969" />

        <GlowingParticles count={110} speedMultiplier={1.2} />
        <GlobalHiccupShockwave3D />

        <Sequence from={0} durationInFrames={2307} layout="none">
          <HiccupCoreScene />
        </Sequence>

        <Sequence from={2307} durationInFrames={3153} layout="none">
          <DiaphragmElevatorScene />
        </Sequence>

        <Sequence from={5460} durationInFrames={1500} layout="none">
          <VocalChordSnapScene />
        </Sequence>

        <Sequence from={6960} durationInFrames={3784} layout="none">
          <TriggersAndDrummerScene />
        </Sequence>

        <Sequence from={10744} durationInFrames={6236} layout="none">
          <HarmonyWaveScene />
        </Sequence>
      </ThreeCanvas>

      {hiccupPulse > 0.05 && (
        <AbsoluteFill className="justify-center items-center pointer-events-none">
          <div
            style={{
              width: `${300 + (1 - hiccupPulse) * 1400}px`,
              height: `${300 + (1 - hiccupPulse) * 1400}px`,
              opacity: hiccupPulse * 0.85,
              boxShadow: '0 0 90px 25px rgba(9, 121, 105, 0.75)',
            }}
            className="rounded-full border-4 border-white/90"
          />
          <div
            style={{
              transform: `scale(${0.8 + hiccupPulse * 0.7}) rotate(-6deg)`,
              opacity: hiccupPulse,
            }}
            className="absolute top-16 right-20 px-10 py-4 rounded-2xl bg-[#097969]/70 backdrop-blur-lg border-2 border-white shadow-[0_0_50px_rgba(255,255,255,0.6)]"
          >
            <span
              style={{ fontFamily: caveatFont }}
              className="text-white text-7xl font-bold tracking-wider"
            >
              HIK!
            </span>
          </div>
        </AbsoluteFill>
      )}

      {SCENE_OVERLAYS.map((scene, idx) => (
        <Sequence key={idx} from={scene.from} durationInFrames={scene.duration}>
          <SceneHeaderCard
            badge={scene.badge}
            title={scene.title}
            note={scene.note}
          />
        </Sequence>
      ))}

      {activeSubtitle && (
        <AbsoluteFill className="justify-end items-center pb-14 pointer-events-none">
          <div className="px-10 py-5 rounded-2xl bg-[#0b3d2e]/55 backdrop-blur-md border border-[#097969]/60 shadow-[0_8px_32px_rgba(9,121,105,0.3)] max-w-4xl text-center">
            <p
              style={{ fontFamily: poppinsFont }}
              className="text-white text-3xl font-bold tracking-wide leading-snug"
            >
              {activeSubtitle.text}
            </p>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const SceneHeaderCard: React.FC<{ badge: string; title: string; note: string }> = ({
  badge,
  title,
  note,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, 25], [-20, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill className="justify-start items-start p-12 pointer-events-none">
      <div
        style={{ opacity, transform: `translateY(${translateY}px)` }}
        className="px-8 py-6 rounded-2xl bg-[#0b3d2e]/40 backdrop-blur-md border border-[#097969]/50 shadow-[0_8px_32px_rgba(9,121,105,0.25)] max-w-xl"
      >
        <span
          style={{ fontFamily: poppinsFont }}
          className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#097969]/40 text-white border border-[#097969] mb-2"
        >
          {badge}
        </span>
        <h1
          style={{ fontFamily: poppinsFont }}
          className="text-white text-3xl font-bold tracking-tight"
        >
          {title}
        </h1>
        <p
          style={{ fontFamily: caveatFont }}
          className="text-[#ffffff]/90 text-3xl mt-1"
        >
          {note}
        </p>
      </div>
    </AbsoluteFill>
  );
};
