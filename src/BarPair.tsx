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
