import React from 'react';
import {Composition} from 'remotion';
import {AudioWaveform} from './AudioWaveform';
import {waveformPropsSchema, defaultWaveformProps} from './types';

const DEFAULT_FPS = 30;
const DEFAULT_DURATION_SECONDS = 60;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AudioWaveform"
      component={AudioWaveform}
      durationInFrames={DEFAULT_DURATION_SECONDS * DEFAULT_FPS}
      fps={DEFAULT_FPS}
      width={1920}
      height={1080}
      schema={waveformPropsSchema}
      defaultProps={defaultWaveformProps}
    />
  );
};
