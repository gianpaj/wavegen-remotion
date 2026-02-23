# Audio Waveform Visualizer — Design Document

**Date:** 2026-02-22
**Status:** Approved

## Overview

A Remotion video template that takes an audio file of someone talking and renders an animated audio waveform visualizer. Bars animate in real time with the audio volume, with a symmetric center-peak layout and a vertical reflection. All visual parameters are configurable via Remotion `inputProps`.

## Requirements

- 1920×1080 landscape, standalone (black background, full-scene)
- Bars driven by real audio analysis via `@remotion/media-utils`
- Symmetric center-peak: tallest bars in the center, tapering toward edges
- Mirrored reflection below the baseline
- Configurable: colors, bar count, gap, smoothing, reflection opacity, border radius, center-peak strength

## Architecture

```
Root
└── AudioWaveform (composition)
    ├── <Audio src={audioFile} />
    └── <WaveformVisualizer {...props} />
        └── <svg>
            └── bars.map(bar => <BarPair />)  // bar + reflection
```

### Core rendering logic (per frame)

1. `useAudioData(audioFile)` loads the audio file
2. `visualizeAudio({ audioData, frame, fps, numberOfSamples: barCount })` returns amplitude array
3. Apply center-peak envelope: `amplitude[i] *= bellCurve(i, barCount, centerPeakStrength)`
4. Each `<BarPair>` renders one upward bar + one downward reflection

## Configurable Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `audioFile` | `string` | required | Path or URL to audio file |
| `barCount` | `number` | `40` | Number of bars |
| `barColor` | `string` | `"#22c55e"` | Bar fill color (any CSS color) |
| `barGap` | `number` | `4` | Gap between bars in px |
| `barBorderRadius` | `number` | `2` | Rounded corner radius |
| `centerPeakStrength` | `number` | `0.7` | Taper strength toward edges (0–1) |
| `smoothing` | `number` | `0.6` | Frame-to-frame smoothing (0 = instant, 1 = sluggish) |
| `reflectionOpacity` | `number` | `0.3` | Opacity of the mirrored reflection |
| `backgroundColor` | `string` | `"#000000"` | Background color |

## Visual Details

- **Bar width:** `(canvasWidth - sidePadding*2 - barCount * barGap) / barCount`
- **Max bar height:** ~45% of canvas height (450px of 1080px)
- **Baseline:** vertical center of canvas (540px)
- **Center-peak envelope:** bell-curve multiplier, parameterized by `centerPeakStrength`
- **Reflection:** same bar mirrored below baseline at `reflectionOpacity`
- **Side padding:** 80px each side
- **Color:** `barColor` as SVG fill; future extension point for `linearGradient`

## File Structure

```
remotion-audio-video-waveform/
├── src/
│   ├── Root.tsx                 # <Composition> registration
│   ├── AudioWaveform.tsx        # Top-level composition component
│   ├── WaveformVisualizer.tsx   # SVG rendering + amplitude logic
│   ├── BarPair.tsx              # Single bar + reflection SVG element
│   └── types.ts                 # Shared TypeScript prop types
├── public/
│   └── audio.mp3                # Sample audio for dev
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

## Dependencies

- `remotion` + `@remotion/cli`
- `@remotion/media-utils` — `useAudioData`, `visualizeAudio`
- TypeScript + React (bundled with Remotion)
- `bun` as package manager and runtime

## Dev & Render Commands

```bash
bun install
bun run remotion studio                          # preview
bun run remotion render AudioWaveform out/waveform.mp4 \
  --props='{"audioFile":"./public/audio.mp3","barCount":50,"barColor":"#22c55e"}'
```
