import React from 'react';
import { Composition } from 'remotion';
import { ExplainerVideo } from './ExplainerVideo';

export const RemotionRoot: React.FC = () => {
  const fps = 60;
  const durationInSeconds = 283; // 04:42.59 dibulatkan ke 283 detik

  return (
    <>
      <Composition
        id="Explainer3D"
        component={ExplainerVideo}
        durationInFrames={durationInSeconds * fps}
        fps={fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
