import {z} from 'zod';

export const waveformPropsSchema = z.object({
  /** Path or URL to the audio file (place in /public for staticFile() resolution) */
  audioFile: z.string().describe('Audio file path (in public/) or URL'),
  /** Number of bars. Must be a power of 2 (16, 32, 64, 128). Default: 64 */
  barCount: z.number().int().min(8).max(256).describe('Number of bars (power of 2: 16, 32, 64, 128)'),
  /** CSS color string for bar fill */
  barColor: z.string().describe('Bar color (CSS color: hex, rgb, hsl)'),
  /** Gap between bars in pixels */
  barGap: z.number().min(0).max(20).describe('Gap between bars in pixels'),
  /** Border radius of each bar in pixels */
  barBorderRadius: z.number().min(0).max(20).describe('Bar corner radius in pixels'),
  /** Bell-curve taper strength toward edges. 0 = flat, 1 = strong taper */
  centerPeakStrength: z.number().min(0).max(1).describe('Center peak taper strength (0 = flat, 1 = maximum taper)'),
  /** Opacity of the mirrored reflection below the baseline */
  reflectionOpacity: z.number().min(0).max(1).describe('Reflection opacity (0 = none, 1 = full)'),
  /** Background fill color */
  backgroundColor: z.string().describe('Background color (CSS color)'),
  /** Seconds of audio shown at once — lower = snappier (default: 0.4) */
  time: z.number().min(0.1).max(2.0).describe('Seconds of audio shown at once — lower = snappier (default: 0.4)'),
  /** Cross-fade speed — higher = more reactive (default: 4) */
  speed: z.number().min(0.5).max(10).describe('Cross-fade speed — higher = more reactive (default: 4)'),
  /** Envelope detail — lower = smoother (default: 4) */
  oversample: z.number().int().min(1).max(8).describe('Envelope detail — lower = smoother (default: 4)'),
});

export type WaveformProps = z.infer<typeof waveformPropsSchema>;

export const defaultWaveformProps: WaveformProps = {
  audioFile: 'audio.mp3',
  barCount: 64,
  barColor: '#22c55e',
  barGap: 4,
  barBorderRadius: 2,
  centerPeakStrength: 0.7,
  reflectionOpacity: 0.3,
  backgroundColor: '#000000',
  time: 0.4,
  speed: 4,
  oversample: 4,
};
