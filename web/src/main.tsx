import React from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import { AudioWaveform } from '../../src/AudioWaveform';
import { defaultWaveformProps } from '../../src/types';

// Build a full URL so AudioWaveform's `audioFile.startsWith('http')` check
// routes it directly, bypassing staticFile() which doesn't know Vite's base path.
const audioFileUrl =
  window.location.origin + import.meta.env.BASE_URL + 'audio.mp3';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Player
      component={AudioWaveform}
      inputProps={{ ...defaultWaveformProps, audioFile: audioFileUrl }}
      durationInFrames={1800}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      style={{ width: '100%', maxWidth: 960 }}
      controls
    />
  </React.StrictMode>,
);
