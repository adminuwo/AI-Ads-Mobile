import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface ZivaBrandIconProps {
  size?: number;
}

export const ZivaBrandIcon: React.FC<ZivaBrandIconProps> = ({ size = 24 }) => {
  // Proportions matching the reference image's stylized gradient "AVA / M" brand emblem
  const width = size * 1.35;
  const height = size;

  return (
    <Svg width={width} height={height} viewBox="0 0 34 24" fill="none">
      <Defs>
        {/* Left purple-indigo gradient */}
        <LinearGradient id="zivaPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4F46E5" />
          <Stop offset="50%" stopColor="#7C3AED" />
          <Stop offset="100%" stopColor="#9333EA" />
        </LinearGradient>

        {/* Right blue-cyan gradient */}
        <LinearGradient id="zivaBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" />
          <Stop offset="50%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#06B6D4" />
        </LinearGradient>

        {/* Center dot gradient */}
        <LinearGradient id="zivaCenterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#6D28D9" />
          <Stop offset="100%" stopColor="#7C3AED" />
        </LinearGradient>
      </Defs>

      {/* Left leg / arch */}
      <Path
        d="M3 20 L8.5 7 C9.5 4.5 12 4.5 13 7 L15.5 13"
        stroke="url(#zivaPurpleGrad)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center teardrop / capsule */}
      <Rect
        x="15.2"
        y="8.5"
        width="3.6"
        height="6.5"
        rx="1.8"
        fill="url(#zivaCenterGrad)"
      />

      {/* Right leg / arch */}
      <Path
        d="M18.5 13 L21 7 C22 4.5 24.5 4.5 25.5 7 L31 20"
        stroke="url(#zivaBlueGrad)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
