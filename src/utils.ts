/**
 * Returns a multiplier using a Hanning window blended by `strength`.
 * strength=0: all bars equal height (flat)
 * strength=1: full Hanning window (center peaks, edges = 0)
 */
export function centerPeakMultiplier(
  barIndex: number,
  total: number,
  strength: number,
): number {
  const hanning = 0.5 * (1 - Math.cos((2 * Math.PI * barIndex) / (total - 1)));
  return 1 - strength + strength * hanning;
}

/**
 * Calculates the pixel width of each bar so all bars + gaps fit within totalWidth
 * with equal padding on each side.
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

/** Logistic sigmoid function */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Linear interpolation between two points */
export function interpole(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
): number {
  return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

/**
 * Estimate the standard deviation of the audio by sampling every `step` samples.
 * Equivalent to Python's wav.std() but fast for long files.
 */
export function computeAudioStd(
  channelWaveforms: Float32Array[],
  step = 50,
): number {
  const len = channelWaveforms[0].length;
  const numChannels = channelWaveforms.length;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let i = 0; i < len; i += step) {
    let mono = 0;
    for (let c = 0; c < numChannels; c++) mono += channelWaveforms[c][i];
    mono /= numChannels;
    sum += mono;
    sumSq += mono * mono;
    count++;
  }
  if (count === 0) return 1;
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.sqrt(Math.max(variance, 1e-10));
}

/**
 * Compute amplitude for a single bar by averaging positive samples
 * in a window centered on `centerSample`, then applying the seewav
 * sigmoid compressor: 1.9 * (sigmoid(2.5 * mean) - 0.5)
 */
export function computeBarAmplitude(
  channelWaveforms: Float32Array[],
  centerSample: number,
  windowSize: number,
  audioStd: number,
): number {
  const len = channelWaveforms[0].length;
  const start = Math.max(0, Math.floor(centerSample - windowSize / 2));
  const end = Math.min(len, Math.floor(centerSample + windowSize / 2));
  if (end <= start) return 0;

  const numChannels = channelWaveforms.length;
  let sum = 0;
  for (let i = start; i < end; i++) {
    let mono = 0;
    for (let c = 0; c < numChannels; c++) mono += channelWaveforms[c][i];
    mono /= numChannels;
    const normalized = mono / audioStd;
    if (normalized > 0) sum += normalized;
  }
  const mean = sum / (end - start);
  return Math.max(0, 1.9 * (sigmoid(2.5 * mean) - 0.5));
}

/**
 * Compute one "page" of barCount amplitude values starting at
 * sample position `offset * barCount * stride`.
 */
export function getEnvBars(
  channelWaveforms: Float32Array[],
  offset: number,
  barCount: number,
  stride: number,
  windowSize: number,
  audioStd: number,
): number[] {
  return Array.from({length: barCount}, (_, i) => {
    const centerSample = (offset * barCount + i) * stride;
    return computeBarAmplitude(channelWaveforms, centerSample, windowSize, audioStd);
  });
}
