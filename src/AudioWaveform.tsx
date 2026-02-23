import React from 'react';
import {Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {WaveformVisualizer} from './WaveformVisualizer';
import {type WaveformProps} from './types';

export const AudioWaveform: React.FC<WaveformProps> = (props) => {
  const {
    audioFile,
    barCount,
    barColor,
    barGap,
    barBorderRadius,
    centerPeakStrength,
    smoothing,
    reflectionOpacity,
    backgroundColor,
  } = props;

  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Resolve the audio file — if it starts with 'http' treat as URL, else use staticFile()
  const audioSrc = audioFile.startsWith('http') ? audioFile : staticFile(audioFile);

  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    // Render black frame while audio data loads
    return (
      <div style={{background: backgroundColor, width: '100%', height: '100%'}} />
    );
  }

  // visualizeAudio returns barCount amplitude values in range [0, 1]
  // numberOfSamples must be a power of 2; barCount prop should satisfy this
  // smoothing in @remotion/media-utils is a boolean; convert our numeric prop (> 0 means enable smoothing)
  const amplitudes = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: barCount,
    smoothing: smoothing > 0,
  });

  return (
    <>
      <Audio src={audioSrc} />
      <WaveformVisualizer
        amplitudes={amplitudes}
        barCount={barCount}
        barColor={barColor}
        barGap={barGap}
        barBorderRadius={barBorderRadius}
        centerPeakStrength={centerPeakStrength}
        reflectionOpacity={reflectionOpacity}
        backgroundColor={backgroundColor}
      />
    </>
  );
};
