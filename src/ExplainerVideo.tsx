import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
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

// Konversi detik -> frame (komposisi berjalan di 60 fps)
const sec = (s: number) => Math.round(s * 60);

const TOTAL_FRAMES = 283 * 60;

// Kartu "ringkasan" yang bisa di-screenshot/disimpan penonton (muncul saat narasi menutup)
const RECAP_FROM = sec(229.33);
const RECAP_END = sec(257.59);
// Kartu ajakan komentar (sinkron dengan kalimat "Trik apa yang biasanya kamu pakai?")
const CTA_FROM = sec(257.59);

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

      {/* RETENSI 1: Hook besar di 3 detik pertama */}
      <Sequence from={0} durationInFrames={200}>
        <HookCard />
      </Sequence>

      {/* RETENSI 2: Janji di awal -> alasan untuk menonton sampai akhir */}
      <Sequence from={sec(8)} durationInFrames={sec(12)}>
        <TeaserChip text="TUNGGU DI AKHIR: 3 trik + kapan harus ke dokter" />
      </Sequence>

      {/* RETENSI 3: "Selanjutnya..." di 5 detik terakhir tiap bagian (open loop) */}
      {SCENE_OVERLAYS.slice(0, -1).map((scene, idx) => (
        <Sequence
          key={`next-${idx}`}
          from={scene.from + scene.duration - 300}
          durationInFrames={300}
        >
          <NextUpChip title={SCENE_OVERLAYS[idx + 1].title} />
        </Sequence>
      ))}

      {/* RETENSI 4: Ringkasan + ajakan komentar di bagian penutup */}
      <Sequence from={RECAP_FROM} durationInFrames={RECAP_END - RECAP_FROM}>
        <RecapCard />
      </Sequence>
      <Sequence from={CTA_FROM} durationInFrames={TOTAL_FRAMES - CTA_FROM}>
        <CommentCtaCard />
      </Sequence>

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

      <ProgressBar />
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

// ---------------------------------------------------------------------------
// KOMPONEN RETENSI
// ---------------------------------------------------------------------------

// Hook besar di awal: memancing rasa penasaran sebelum penjelasan dimulai
const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const exit = interpolate(frame, [150, 200], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="justify-center items-center pointer-events-none">
      <div
        style={{ opacity: exit, transform: `scale(${0.85 + enter * 0.15})` }}
        className="px-14 py-8 rounded-3xl bg-[#041611]/70 backdrop-blur-md border-2 border-[#097969] text-center max-w-4xl"
      >
        <h1
          style={{ fontFamily: poppinsFont }}
          className="text-white text-6xl font-bold tracking-tight leading-tight"
        >
          KENAPA TUBUHMU TIBA-TIBA BILANG <span className="text-[#2ee6c5]">"HIK!"</span>?
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// Chip kecil di kanan atas: janji isi video
const TeaserChip: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 20, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="justify-start items-end p-12 pointer-events-none">
      <div
        style={{ opacity, fontFamily: poppinsFont }}
        className="px-6 py-3 rounded-full bg-[#097969]/60 border border-white/70 text-white text-xl font-bold tracking-wide"
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Chip "Selanjutnya" di kanan bawah: open loop agar penonton tidak pergi di pergantian bagian
const NextUpChip: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 20, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const x = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill className="justify-end items-end pr-12 pb-28 pointer-events-none">
      <div
        style={{ opacity, transform: `translateX(${x}px)`, fontFamily: poppinsFont }}
        className="px-6 py-4 rounded-2xl bg-[#0b3d2e]/70 backdrop-blur-md border border-[#097969] max-w-md"
      >
        <div className="text-[#2ee6c5] text-sm font-bold tracking-widest">SELANJUTNYA</div>
        <div className="text-white text-2xl font-bold leading-snug">{title}</div>
      </div>
    </AbsoluteFill>
  );
};

// Ringkasan trik: layak di-screenshot, mendorong penonton menyimpan/membagikan
const RecapCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const items = [
    'Tahan napas sejenak',
    'Minum air perlahan',
    'Bernapas tenang & rileks',
    'Lebih dari 48 jam? Periksa ke dokter',
  ];

  return (
    <AbsoluteFill className="justify-center items-end pr-16 pointer-events-none">
      <div
        style={{ opacity: fade, fontFamily: poppinsFont }}
        className="px-8 py-6 rounded-2xl bg-[#0b3d2e]/70 backdrop-blur-md border border-[#097969] max-w-md"
      >
        <div className="text-[#2ee6c5] text-sm font-bold tracking-widest mb-3">RINGKASAN</div>
        {items.map((text, i) => {
          const p = spring({ frame: frame - 12 - i * 14, fps, config: { damping: 14 } });
          return (
            <div
              key={text}
              style={{ opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}
              className="text-white text-2xl font-bold leading-snug mb-2"
            >
              {i + 1}. {text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Ajakan komentar di akhir
const CommentCtaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill className="justify-center items-center pointer-events-none">
      <div
        style={{
          opacity: p,
          transform: `translateY(${(1 - p) * 40 - 120}px) scale(${0.9 + p * 0.1})`,
          fontFamily: poppinsFont,
        }}
        className="px-12 py-7 rounded-3xl bg-[#041611]/75 backdrop-blur-md border-2 border-[#2ee6c5] text-center"
      >
        <div className="text-white text-5xl font-bold">Trik cegukanmu apa?</div>
        <div className="text-[#2ee6c5] text-3xl font-bold mt-2">Tulis di kolom komentar</div>
      </div>
    </AbsoluteFill>
  );
};

// Progress bar di dasar layar dengan penanda tiap bagian
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill className="justify-end pointer-events-none">
      <div className="relative w-full h-2 bg-white/10">
        <div style={{ width: `${pct}%` }} className="h-full bg-[#2ee6c5]" />
        {SCENE_OVERLAYS.slice(1).map((scene, i) => (
          <div
            key={i}
            style={{ left: `${(scene.from / durationInFrames) * 100}%` }}
            className="absolute top-0 h-full w-[3px] bg-white/80"
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
