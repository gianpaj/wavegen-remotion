import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { AudioWaveform } from '../../src/AudioWaveform';
import { defaultWaveformProps } from '../../src/types';

// Must match the Composition registered in src/Root.tsx.
// Update these if you change the composition dimensions.
const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 1080;
const FPS = 30;

// Build a full URL so AudioWaveform's `audioFile.startsWith('http')` check
// routes it directly, bypassing staticFile() which doesn't know Vite's base path.
const audioFileUrl =
  window.location.origin + import.meta.env.BASE_URL + 'audio.mp3';

function App() {
  const [durationInFrames, setDurationInFrames] = useState<number | null>(null);

  useEffect(() => {
    getAudioDurationInSeconds(audioFileUrl).then((seconds) => {
      setDurationInFrames(Math.ceil(seconds * FPS));
    });
  }, []);

  if (durationInFrames === null) {
    return null;
  }

  return (
    <Player
      component={AudioWaveform}
      inputProps={{ ...defaultWaveformProps, audioFile: audioFileUrl }}
      durationInFrames={durationInFrames}
      compositionWidth={COMPOSITION_WIDTH}
      compositionHeight={COMPOSITION_HEIGHT}
      fps={FPS}
      style={{ width: '100%', maxWidth: 960 }}
      controls
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
