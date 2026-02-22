import React from 'react';
import {Composition} from 'remotion';
import {AudioWaveform} from './AudioWaveform';
import {defaultWaveformProps} from './types';

// Duration: set a generous default; actual render should pass durationInFrames via CLI
const DEFAULT_FPS = 30;
const DEFAULT_DURATION_SECONDS = 60; // override with --props at render time

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AudioWaveform"
      component={AudioWaveform as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={DEFAULT_DURATION_SECONDS * DEFAULT_FPS}
      fps={DEFAULT_FPS}
      width={1920}
      height={1080}
      defaultProps={{
        audioFile: 'audio.mp3',
        ...defaultWaveformProps,
      }}
    />
  );
};
