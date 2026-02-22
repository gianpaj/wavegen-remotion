export interface WaveformProps {
  /** Path or URL to the audio file (place in /public for staticFile() resolution) */
  audioFile: string;
  /** Number of bars to render. Must be a power of 2 (16, 32, 64, 128). Default: 64 */
  barCount?: number;
  /** CSS color string for bar fill. Default: '#22c55e' */
  barColor?: string;
  /** Gap between bars in pixels. Default: 4 */
  barGap?: number;
  /** Border radius of each bar in pixels. Default: 2 */
  barBorderRadius?: number;
  /** Bell-curve taper strength toward edges. 0 = all bars same height, 1 = edges are flat. Default: 0.7 */
  centerPeakStrength?: number;
  /** Frame-to-frame smoothing applied by visualizeAudio. Default: 0.6 */
  smoothing?: number;
  /** Opacity of the mirrored reflection below the baseline. Default: 0.3 */
  reflectionOpacity?: number;
  /** Background fill color. Default: '#000000' */
  backgroundColor?: string;
}

export const defaultWaveformProps: Required<Omit<WaveformProps, 'audioFile'>> = {
  barCount: 64,
  barColor: '#22c55e',
  barGap: 4,
  barBorderRadius: 2,
  centerPeakStrength: 0.7,
  smoothing: 0.6,
  reflectionOpacity: 0.3,
  backgroundColor: '#000000',
};
