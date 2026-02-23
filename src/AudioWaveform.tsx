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
    gain,
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

  // Get half the samples, then mirror — ensures all bars have data and pattern is symmetric
  const halfCount = Math.max(16, Math.floor(barCount / 2));
  // Clamp to valid power-of-2 values that visualizeAudio accepts
  const validSamples = ([16, 32, 64, 128] as const).reduce((prev, curr) =>
    Math.abs(curr - halfCount) < Math.abs(prev - halfCount) ? curr : prev
  );

  const rawAmplitudes = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: validSamples,
    smoothing: smoothing > 0,
  });
  // Mirror: [sN-1...s0, s0...sN-1] puts lowest freq (most speech energy) in center
  const amplitudes = [...rawAmplitudes.slice().reverse(), ...rawAmplitudes];

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
        gain={gain}
      />
    </>
  );
};
