import React from 'react';
import {Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useAudioData} from '@remotion/media-utils';
import {WaveformVisualizer} from './WaveformVisualizer';
import {type WaveformProps} from './types';
import {sigmoid, interpole, getEnvBars, computeAudioStd} from './utils';

export const AudioWaveform: React.FC<WaveformProps> = (props) => {
  const {
    audioFile,
    barCount,
    barColor,
    barGap,
    barBorderRadius,
    centerPeakStrength,
    reflectionOpacity,
    backgroundColor,
    time,
    speed,
    oversample,
  } = props;

  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const audioSrc = audioFile.startsWith('http') ? audioFile : staticFile(audioFile);
  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    return <div style={{background: backgroundColor, width: '100%', height: '100%'}} />;
  }

  const {channelWaveforms, sampleRate} = audioData;

  const audioStd = computeAudioStd(channelWaveforms);

  // Each bar covers (time / barCount) seconds of audio
  const windowSize = Math.max(1, Math.floor(sampleRate * time / barCount));
  // Stride between envelope samples: windowSize / oversample
  const stride = Math.max(1, Math.floor(windowSize / oversample));

  // Current position in "page" units (each page = barCount * stride samples)
  const currentSample = (frame / fps) * sampleRate;
  const pos = currentSample / stride / barCount;
  const off = Math.floor(pos);
  const loc = pos - off; // fractional position within current page, 0→1

  // Compute two adjacent pages for cross-fade
  const env1 = getEnvBars(channelWaveforms, off, barCount, stride, windowSize, audioStd);
  const env2 = getEnvBars(channelWaveforms, off + 1, barCount, stride, windowSize, audioStd);

  // Volume-dependent speedup: loud upcoming audio transitions faster (seewav technique)
  const maxVol = Math.log10(1e-4 + Math.max(...env2)) * 10; // dB
  const speedup = Math.max(0.5, Math.min(2, interpole(-6, 0.5, 0, 2, maxVol)));

  // S-curve cross-fade: sigmoid gives smooth acceleration/deceleration
  const w = sigmoid(speed * speedup * (loc - 0.5));
  const amplitudes = env1.map((e1, i) => (1 - w) * e1 + w * env2[i]);

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
