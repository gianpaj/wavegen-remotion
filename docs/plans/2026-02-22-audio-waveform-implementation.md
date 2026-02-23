# Audio Waveform Visualizer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Remotion video template that renders a symmetric, center-peak audio waveform visualizer driven by real audio amplitude data.

**Architecture:** Remotion composition using `@remotion/media-utils` (`useAudioData` + `visualizeAudio`) to get per-frame frequency amplitudes. A bell-curve envelope shapes bar heights so center bars are tallest, tapering toward edges. Bars are rendered as SVG `<rect>` elements with a mirrored reflection below the baseline. All visual parameters are driven by `inputProps`.

**Tech Stack:** Remotion, `@remotion/media-utils`, React, TypeScript, Bun

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `remotion.config.ts`

**Step 1: Initialize package.json**

```bash
cd /Users/gianpaj/tmp/remotion-audio-video-waveform
bun init -y
```

**Step 2: Install dependencies**

```bash
bun add remotion @remotion/cli @remotion/media-utils react react-dom
bun add -d @types/react @types/react-dom typescript
```

**Step 3: Replace tsconfig.json with Remotion-compatible config**

Replace contents of `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "lib": ["dom", "esnext"],
    "module": "commonjs",
    "target": "esnext",
    "jsx": "react",
    "strict": true,
    "outDir": "dist",
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": ["src"]
}
```

**Step 4: Create remotion.config.ts**

```typescript
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
```

**Step 5: Add scripts to package.json**

Edit `package.json` to add:

```json
{
  "scripts": {
    "studio": "bunx remotionb studio src/index.ts",
    "render": "bunx remotionb render AudioWaveform",
    "test": "bun test"
  }
}
```

**Step 6: Create src directory**

```bash
mkdir -p src public
```

**Step 7: Add a sample audio file**

Copy any `.mp3` file you have into `public/audio.mp3`. If you don't have one, download a short sample:

```bash
# Example: copy from your system or use any short MP3
cp /path/to/your/audio.mp3 public/audio.mp3
```

**Step 8: Verify setup compiles**

```bash
bunx tsc --noEmit
```
Expected: no errors (or only "cannot find module" errors for src files not yet created — those are fine)

**Step 9: Commit**

```bash
git init
git add package.json tsconfig.json remotion.config.ts
git commit -m "feat: scaffold Remotion project for audio waveform visualizer"
```

---

### Task 2: Types

**Files:**
- Create: `src/types.ts`
- Create: `src/types.test.ts`

**Step 1: Write the test first**

Create `src/types.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

```bash
bun test src/types.test.ts
```
Expected: FAIL with "Cannot find module './types'"

**Step 3: Create src/types.ts**

```typescript
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
```

**Step 4: Run test to verify it passes**

```bash
bun test src/types.test.ts
```
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add src/types.ts src/types.test.ts
git commit -m "feat: add WaveformProps types and defaults"
```

---

### Task 3: Pure utility functions (bell curve + bar geometry)

**Files:**
- Create: `src/utils.ts`
- Create: `src/utils.test.ts`

**Step 1: Write failing tests**

Create `src/utils.test.ts`:

```typescript
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
```

**Step 2: Run to confirm failures**

```bash
bun test src/utils.test.ts
```
Expected: FAIL with "Cannot find module './utils'"

**Step 3: Implement src/utils.ts**

```typescript
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
```

**Step 4: Run tests to verify they pass**

```bash
bun test src/utils.test.ts
```
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add src/utils.ts src/utils.test.ts
git commit -m "feat: add centerPeakMultiplier and calculateBarWidth utility functions"
```

---

### Task 4: BarPair component

**Files:**
- Create: `src/BarPair.tsx`

This component renders a single bar (upward) + its reflection (downward) as SVG `<rect>` elements.

**Step 1: Create src/BarPair.tsx**

```tsx
import React from 'react';

interface BarPairProps {
  x: number;          // left edge of the bar
  baseline: number;   // y coordinate of the baseline (center of canvas)
  width: number;      // bar width in px
  height: number;     // bar height in px (upward from baseline)
  color: string;      // fill color
  borderRadius: number;
  reflectionOpacity: number;
}

export const BarPair: React.FC<BarPairProps> = ({
  x,
  baseline,
  width,
  height,
  color,
  borderRadius,
  reflectionOpacity,
}) => {
  // Minimum bar height so bars are always visible even at silence
  const minHeight = 2;
  const h = Math.max(height, minHeight);

  return (
    <g>
      {/* Main bar: grows upward from baseline */}
      <rect
        x={x}
        y={baseline - h}
        width={width}
        height={h}
        fill={color}
        rx={borderRadius}
        ry={borderRadius}
      />
      {/* Reflection: grows downward from baseline */}
      <rect
        x={x}
        y={baseline}
        width={width}
        height={h}
        fill={color}
        opacity={reflectionOpacity}
        rx={borderRadius}
        ry={borderRadius}
        transform={`scale(1,-1) translate(0,${-2 * baseline})`}
      />
    </g>
  );
};
```

> Note: The reflection is achieved by flipping the rect with a `scale(1,-1)` transform centered on the baseline. The translate corrects for SVG's flipped coordinate origin.

**Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**

```bash
git add src/BarPair.tsx
git commit -m "feat: add BarPair SVG component with upward bar and reflection"
```

---

### Task 5: WaveformVisualizer component

**Files:**
- Create: `src/WaveformVisualizer.tsx`

This component takes the amplitude array (already computed per frame) and renders all bars.

**Step 1: Create src/WaveformVisualizer.tsx**

```tsx
import React from 'react';
import {useVideoConfig} from 'remotion';
import {BarPair} from './BarPair';
import {centerPeakMultiplier, calculateBarWidth} from './utils';
import {defaultWaveformProps, type WaveformProps} from './types';

interface WaveformVisualizerProps extends Required<Omit<WaveformProps, 'audioFile'>> {
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
```

**Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**

```bash
git add src/WaveformVisualizer.tsx
git commit -m "feat: add WaveformVisualizer SVG composition component"
```

---

### Task 6: AudioWaveform top-level composition

**Files:**
- Create: `src/AudioWaveform.tsx`

This is the main composition. It loads audio data and calls `visualizeAudio()` each frame.

**Step 1: Create src/AudioWaveform.tsx**

```tsx
import React from 'react';
import {Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {WaveformVisualizer} from './WaveformVisualizer';
import {defaultWaveformProps, type WaveformProps} from './types';

export const AudioWaveform: React.FC<WaveformProps> = (rawProps) => {
  const props = {...defaultWaveformProps, ...rawProps};
  const {
    audioFile,
    barCount,
    barColor,
    barGap,
    barBorderRadius,
    centerPeakStrength,
    smoothing,
    reflectionOpacity,
    backgroundColor,
  } = props;

  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Resolve the audio file — if it starts with 'http' treat as URL, else use staticFile()
  const audioSrc = audioFile.startsWith('http') ? audioFile : staticFile(audioFile);

  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    // Render black frame while audio data loads
    return (
      <div style={{background: backgroundColor, width: '100%', height: '100%'}} />
    );
  }

  // visualizeAudio returns barCount amplitude values in range [0, 1]
  // numberOfSamples must be a power of 2; barCount prop should satisfy this
  const amplitudes = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: barCount,
    smoothing,
  });

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
        smoothing={smoothing}
        reflectionOpacity={reflectionOpacity}
        backgroundColor={backgroundColor}
      />
    </>
  );
};
```

**Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**

```bash
git add src/AudioWaveform.tsx
git commit -m "feat: add AudioWaveform composition with useAudioData and visualizeAudio"
```

---

### Task 7: Root registration

**Files:**
- Create: `src/index.ts`
- Create: `src/Root.tsx`

**Step 1: Create src/Root.tsx**

```tsx
import React from 'react';
import {Composition} from 'remotion';
import {AudioWaveform} from './AudioWaveform';
import {defaultWaveformProps} from './types';

// Duration: set a generous default; actual render should pass durationInFrames via CLI
const DEFAULT_FPS = 30;
const DEFAULT_DURATION_SECONDS = 60; // override with --props at render time

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AudioWaveform"
      component={AudioWaveform}
      durationInFrames={DEFAULT_DURATION_SECONDS * DEFAULT_FPS}
      fps={DEFAULT_FPS}
      width={1920}
      height={1080}
      defaultProps={{
        audioFile: 'audio.mp3',
        ...defaultWaveformProps,
      }}
    />
  );
};
```

**Step 2: Create src/index.ts**

```typescript
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerRoot(RemotionRoot);
```

**Step 3: Verify TypeScript compiles**

```bash
bunx tsc --noEmit
```
Expected: no errors

**Step 4: Commit**

```bash
git add src/index.ts src/Root.tsx
git commit -m "feat: register AudioWaveform composition in Remotion root"
```

---

### Task 8: Verify in Remotion Studio

**Step 1: Open the studio**

```bash
bun run studio
```

Expected: Browser opens at `http://localhost:3000`. You should see the "AudioWaveform" composition in the left panel.

**Step 2: Select the AudioWaveform composition and press play**

The waveform should animate with green bars reacting to the audio, tallest in the center, tapering toward the edges, with a faint reflection below the baseline.

**Step 3: Experiment with props in the right panel**

In Remotion Studio, open the "Props" panel and try changing:
- `barCount`: try 32, 64, 128 (must be power of 2)
- `barColor`: try `"#3b82f6"` (blue) or `"#f43f5e"` (red)
- `centerPeakStrength`: try 0 (flat), 0.5, 1.0
- `reflectionOpacity`: try 0 (no reflection), 0.5 (stronger reflection)

**Step 4: Verify no console errors**

Open browser DevTools console — should be no errors.

---

### Task 9: Render to MP4

**Step 1: Render with default props**

```bash
bunx remotionb render AudioWaveform out/waveform.mp4
```

**Step 2: Render with custom props**

```bash
bunx remotionb render AudioWaveform out/waveform-blue.mp4 \
  --props='{"audioFile":"audio.mp3","barCount":64,"barColor":"#3b82f6","centerPeakStrength":0.8}'
```

Expected: `out/waveform.mp4` created successfully. Play it to verify audio plays and bars animate in sync.

**Step 3: Commit output directory to .gitignore**

```bash
echo "out/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore render output directory"
```

---

## Troubleshooting

**`numberOfSamples` warning:** `visualizeAudio` requires `numberOfSamples` to be a power of 2. If `barCount` is not a power of 2, the function clamps it. Use 16, 32, 64, 128, 256.

**Audio file not found:** Place audio in `public/` folder and reference it as just `"audio.mp3"` in props (not `"public/audio.mp3"`). Remotion's `staticFile()` resolves from the `public/` directory automatically.

**Black screen in Studio:** This is normal while `useAudioData()` loads. It resolves in 1–2 seconds.

**Bars too small/large:** Adjust `centerPeakStrength` (controls taper) and note that `visualizeAudio` output is already normalized 0–1. The `MAX_BAR_HEIGHT_RATIO` constant in `WaveformVisualizer.tsx` (currently 0.42) can be changed to make bars taller or shorter overall.
