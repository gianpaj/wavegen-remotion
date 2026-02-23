import React from 'react';
import {Composition, staticFile} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {AudioWaveform} from './AudioWaveform';
import {waveformPropsSchema, defaultWaveformProps, type WaveformProps} from './types';

const DEFAULT_FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AudioWaveform"
      component={AudioWaveform}
      durationInFrames={DEFAULT_FPS} // overridden by calculateMetadata
      fps={DEFAULT_FPS}
      width={1920}
      height={1080}
      schema={waveformPropsSchema}
      defaultProps={defaultWaveformProps}
      calculateMetadata={async ({props}: {props: WaveformProps}) => {
        const audioSrc = props.audioFile.startsWith('http')
          ? props.audioFile
          : staticFile(props.audioFile);
        const durationInSeconds = await getAudioDurationInSeconds(audioSrc);
        return {
          durationInFrames: Math.ceil(durationInSeconds * DEFAULT_FPS),
        };
      }}
    />
  );
};
