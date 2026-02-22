import React from 'react';
import {useVideoConfig} from 'remotion';
import {BarPair} from './BarPair';
import {centerPeakMultiplier, calculateBarWidth} from './utils';
import {type WaveformProps} from './types';

interface WaveformVisualizerProps extends Required<Omit<WaveformProps, 'audioFile' | 'smoothing'>> {
  /** Amplitude values from visualizeAudio(), one per bar, range [0, 1] */
  amplitudes: number[];
}

const SIDE_PADDING = 80;
const MAX_BAR_HEIGHT_RATIO = 0.42; // bars reach up to 42% of canvas height

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  amplitudes,
  barCount,
  barColor,
  barGap,
  barBorderRadius,
  centerPeakStrength,
  reflectionOpacity,
  backgroundColor,
}) => {
  const {width, height} = useVideoConfig();
  const baseline = height / 2;
  const maxBarHeight = height * MAX_BAR_HEIGHT_RATIO;
  const barWidth = calculateBarWidth(width, barCount, barGap, SIDE_PADDING);

  return (
    <svg
      width={width}
      height={height}
      style={{position: 'absolute', top: 0, left: 0}}
    >
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} fill={backgroundColor} />

      {amplitudes.map((amplitude, i) => {
        const envelope = centerPeakMultiplier(i, barCount, centerPeakStrength);
        const barHeight = amplitude * maxBarHeight * envelope;
        const x = SIDE_PADDING + i * (barWidth + barGap);

        return (
          <BarPair
            key={i}
            x={x}
            baseline={baseline}
            width={barWidth}
            height={barHeight}
            color={barColor}
            borderRadius={barBorderRadius}
            reflectionOpacity={reflectionOpacity}
          />
        );
      })}
    </svg>
  );
};
