/**
 * Returns a multiplier in [0, 1] that applies a bell-curve (Gaussian) envelope
 * so bars near the center of the array get a higher max height than edge bars.
 *
 * @param barIndex - 0-based index of this bar
 * @param total    - total number of bars
 * @param strength - 0 = all bars equal (envelope flat), 1 = edge bars nearly zero
 */
export function centerPeakMultiplier(
  barIndex: number,
  total: number,
  strength: number,
): number {
  if (strength === 0) return 1;
  // Normalize position to [-1, 1] where 0 = center
  const center = (total - 1) / 2;
  const normalized = (barIndex - center) / center; // -1 to 1
  // Gaussian: e^(-k * x^2). k controls how sharp the peak is.
  const k = strength * 3; // tuned so strength=1 gives ~0 at edges
  return Math.exp(-k * normalized * normalized);
}

/**
 * Calculates the pixel width of each bar so all bars + gaps fit within totalWidth
 * with equal padding on each side.
 *
 * @param totalWidth - canvas width in pixels (e.g. 1920)
 * @param barCount   - number of bars
 * @param barGap     - gap between bars in pixels
 * @param padding    - horizontal padding on each side in pixels
 */
export function calculateBarWidth(
  totalWidth: number,
  barCount: number,
  barGap: number,
  padding: number,
): number {
  const available = totalWidth - padding * 2 - barCount * barGap;
  return available / barCount;
}
