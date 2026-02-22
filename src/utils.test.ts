import {test, expect} from 'bun:test';
import {centerPeakMultiplier, calculateBarWidth} from './utils';

// centerPeakMultiplier tests
test('centerPeakMultiplier returns 1.0 for the center bar (odd count)', () => {
  // barIndex=2, total=5 => center
  const result = centerPeakMultiplier(2, 5, 0.7);
  expect(result).toBeCloseTo(1.0, 3);
});

test('centerPeakMultiplier returns reduced value for edge bar', () => {
  // barIndex=0, total=5 => far from center
  const result = centerPeakMultiplier(0, 5, 0.7);
  expect(result).toBeLessThan(0.5);
  expect(result).toBeGreaterThan(0);
});

test('centerPeakMultiplier with strength=0 returns 1.0 for all bars', () => {
  expect(centerPeakMultiplier(0, 10, 0)).toBeCloseTo(1.0, 3);
  expect(centerPeakMultiplier(5, 10, 0)).toBeCloseTo(1.0, 3);
  expect(centerPeakMultiplier(9, 10, 0)).toBeCloseTo(1.0, 3);
});

test('centerPeakMultiplier with strength=1 returns ~0 for edge bars', () => {
  const result = centerPeakMultiplier(0, 100, 1.0);
  expect(result).toBeCloseTo(0, 1);
});

// calculateBarWidth tests
test('calculateBarWidth returns correct width', () => {
  // totalWidth=1920, padding=80 each side, barCount=10, gap=4
  // available = 1920 - 80*2 - 10*4 = 1920 - 160 - 40 = 1720
  // width = 1720 / 10 = 172
  const result = calculateBarWidth(1920, 10, 4, 80);
  expect(result).toBeCloseTo(172, 1);
});

test('calculateBarWidth handles zero gap', () => {
  const result = calculateBarWidth(1000, 10, 0, 0);
  expect(result).toBeCloseTo(100, 1);
});
