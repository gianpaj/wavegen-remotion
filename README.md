# Audio Waveform Visualizer

A Remotion video template that renders an animated audio waveform visualizer.

## Setup

1. Place your audio file in `public/audio.mp3`
2. Run `bun run studio` to preview in Remotion Studio

## Render

```bash
bunx remotionb render AudioWaveform out/waveform.mp4 \
  --props='{"audioFile":"audio.mp3","barCount":64,"barColor":"#22c55e"}'
```

## Props

| Prop | Default | Description |
|------|---------|-------------|
| audioFile | required | Path in public/ or URL |
| barCount | 64 | Number of bars (power of 2) |
| barColor | #22c55e | Bar fill color |
| barGap | 4 | Gap between bars (px) |
| barBorderRadius | 2 | Corner radius |
| centerPeakStrength | 0.7 | Bell curve taper (0–1) |
| smoothing | 0.6 | Smoothing on/off threshold |
| reflectionOpacity | 0.3 | Reflection opacity |
| backgroundColor | #000000 | Background color |
