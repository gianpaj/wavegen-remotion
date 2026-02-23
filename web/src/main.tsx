import React from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import { AudioWaveform } from '../../src/AudioWaveform';
import { defaultWaveformProps } from '../../src/types';

// Must match the Composition registered in src/Root.tsx.
// Update these if you change the composition dimensions or duration.
const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 1080;
const FPS = 30;
const DURATION_IN_FRAMES = 1800; // 60 s × 30 fps — set to match your audio length

// Build a full URL so AudioWaveform's `audioFile.startsWith('http')` check
// routes it directly, bypassing staticFile() which doesn't know Vite's base path.
const audioFileUrl =
  window.location.origin + import.meta.env.BASE_URL + 'audio.mp3';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Player
      component={AudioWaveform}
      inputProps={{ ...defaultWaveformProps, audioFile: audioFileUrl }}
      durationInFrames={DURATION_IN_FRAMES}
      compositionWidth={COMPOSITION_WIDTH}
      compositionHeight={COMPOSITION_HEIGHT}
      fps={FPS}
      style={{ width: '100%', maxWidth: 960 }}
      controls
    />
  </React.StrictMode>,
);
