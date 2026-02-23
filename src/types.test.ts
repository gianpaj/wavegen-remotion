import {test, expect} from 'bun:test';
import {waveformPropsSchema, defaultWaveformProps, type WaveformProps} from './types';

test('waveformPropsSchema validates a valid props object', () => {
  const result = waveformPropsSchema.safeParse(defaultWaveformProps);
  expect(result.success).toBe(true);
});

test('waveformPropsSchema rejects missing audioFile', () => {
  const result = waveformPropsSchema.safeParse({...defaultWaveformProps, audioFile: undefined});
  expect(result.success).toBe(false);
});

test('waveformPropsSchema rejects barCount out of range', () => {
  const result = waveformPropsSchema.safeParse({...defaultWaveformProps, barCount: 300});
  expect(result.success).toBe(false);
});

test('defaultWaveformProps has all required fields', () => {
  expect(defaultWaveformProps.audioFile).toBe('audio.mp3');
  expect(defaultWaveformProps.barCount).toBe(64);
  expect(defaultWaveformProps.barColor).toBe('#22c55e');
  expect(defaultWaveformProps.time).toBe(0.4);
  expect(defaultWaveformProps.speed).toBe(4);
  expect(defaultWaveformProps.oversample).toBe(4);
});

test('waveformPropsSchema rejects speed out of range', () => {
  const result = waveformPropsSchema.safeParse({...defaultWaveformProps, speed: 15});
  expect(result.success).toBe(false);
});
