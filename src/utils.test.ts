import {test, expect} from 'bun:test';
import {
  centerPeakMultiplier,
  calculateBarWidth,
  sigmoid,
  interpole,
  computeBarAmplitude,
  computeAudioStd,
} from './utils';

// centerPeakMultiplier (Hanning-based)
test('centerPeakMultiplier returns 1.0 for the center bar', () => {
  // barIndex=2, total=5 => center (index 2 of 0-4)
  const result = centerPeakMultiplier(2, 5, 1.0);
  expect(result).toBeCloseTo(1.0, 3);
});

test('centerPeakMultiplier returns 0 for edge bar at full strength', () => {
  expect(centerPeakMultiplier(0, 5, 1.0)).toBeCloseTo(0, 3);
  expect(centerPeakMultiplier(4, 5, 1.0)).toBeCloseTo(0, 3);
});

test('centerPeakMultiplier with strength=0 returns 1.0 for all bars', () => {
  expect(centerPeakMultiplier(0, 10, 0)).toBeCloseTo(1.0, 3);
  expect(centerPeakMultiplier(5, 10, 0)).toBeCloseTo(1.0, 3);
  expect(centerPeakMultiplier(9, 10, 0)).toBeCloseTo(1.0, 3);
});

test('centerPeakMultiplier partial strength gives value between 0 and 1 for edge', () => {
  const result = centerPeakMultiplier(0, 10, 0.7);
  expect(result).toBeGreaterThan(0);
  expect(result).toBeLessThan(1);
});

// calculateBarWidth
test('calculateBarWidth returns correct width', () => {
  const result = calculateBarWidth(1920, 10, 4, 80);
  expect(result).toBeCloseTo(172, 1);
});

test('calculateBarWidth handles zero gap', () => {
  const result = calculateBarWidth(1000, 10, 0, 0);
  expect(result).toBeCloseTo(100, 1);
});

// sigmoid
test('sigmoid(0) returns 0.5', () => {
  expect(sigmoid(0)).toBeCloseTo(0.5, 5);
});

test('sigmoid returns values in (0, 1)', () => {
  expect(sigmoid(100)).toBeCloseTo(1, 3);
  expect(sigmoid(-100)).toBeCloseTo(0, 3);
});

// interpole
test('interpole interpolates correctly at midpoint', () => {
  const result = interpole(0, 0, 10, 10, 5);
  expect(result).toBeCloseTo(5, 5);
});

test('interpole returns y1 at x1 and y2 at x2', () => {
  expect(interpole(-6, 0.5, 0, 2, -6)).toBeCloseTo(0.5, 5);
  expect(interpole(-6, 0.5, 0, 2, 0)).toBeCloseTo(2, 5);
});

// computeBarAmplitude
test('computeBarAmplitude returns 0 for silent audio', () => {
  const silence = new Float32Array(1000).fill(0);
  const result = computeBarAmplitude([silence], 500, 100, 1);
  expect(result).toBeCloseTo(0, 3);
});

test('computeBarAmplitude returns positive value for loud audio', () => {
  const loud = new Float32Array(1000).fill(1.0);
  const result = computeBarAmplitude([loud], 500, 100, 1);
  expect(result).toBeGreaterThan(0);
  expect(result).toBeLessThanOrEqual(1.0);
});

test('computeBarAmplitude handles out-of-bounds centerSample gracefully', () => {
  const samples = new Float32Array(100).fill(0.5);
  expect(() => computeBarAmplitude([samples], -50, 100, 1)).not.toThrow();
  expect(() => computeBarAmplitude([samples], 200, 100, 1)).not.toThrow();
});

// computeAudioStd
test('computeAudioStd returns ~1 for unit normal-ish signal', () => {
  // A sine wave with amplitude 1 has std ≈ 0.707
  const sine = new Float32Array(44100).map((_, i) => Math.sin(2 * Math.PI * 440 * i / 44100));
  const std = computeAudioStd([sine], 1);
  expect(std).toBeGreaterThan(0.5);
  expect(std).toBeLessThan(1.0);
});

test('computeAudioStd returns small value for near-silence', () => {
  const quiet = new Float32Array(1000).fill(0.001);
  const std = computeAudioStd([quiet], 1);
  expect(std).toBeLessThan(0.01);
});
