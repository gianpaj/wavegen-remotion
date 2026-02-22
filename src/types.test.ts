import {test, expect} from 'bun:test';
import type {WaveformProps} from './types';

test('WaveformProps has required audioFile field', () => {
  const props: WaveformProps = {
    audioFile: 'public/audio.mp3',
  };
  expect(props.audioFile).toBe('public/audio.mp3');
});

test('WaveformProps optional fields have correct types', () => {
  const props: WaveformProps = {
    audioFile: 'audio.mp3',
    barCount: 40,
    barColor: '#22c55e',
    barGap: 4,
    barBorderRadius: 2,
    centerPeakStrength: 0.7,
    smoothing: 0.6,
    reflectionOpacity: 0.3,
    backgroundColor: '#000000',
  };
  expect(props.barCount).toBe(40);
  expect(props.barColor).toBe('#22c55e');
});
