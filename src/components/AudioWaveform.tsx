import React, { useMemo } from 'react';

interface AudioWaveformProps {
  level: number; // 0 to 100
  isActive: boolean;
  barCount?: number;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  level,
  isActive,
  barCount = 36,
  className = '',
}) => {
  // Generate waveform heights centered around the middle
  const bars = useMemo(() => {
    const list: number[] = [];
    const mid = barCount / 2;

    for (let i = 0; i < barCount; i++) {
      const distFromMid = Math.abs(i - mid) / mid; // 0 at center, 1 at ends
      const bellCurve = Math.cos(distFromMid * (Math.PI / 2)); // 1 at center, 0 at ends

      if (!isActive) {
        // Idle ambient gentle shimmer
        const idleHeight = Math.max(4, Math.sin(i * 0.4 + Date.now() * 0.003) * 6 + 8);
        list.push(idleHeight);
      } else {
        // Audio reactive dynamic height
        const variance = Math.sin(i * 1.2 + (level / 10)) * 0.4 + 0.6;
        const reactiveHeight = Math.max(
          5,
          Math.min(48, (level * 0.45 * bellCurve * variance) + 6)
        );
        list.push(reactiveHeight);
      }
    }
    return list;
  }, [level, isActive, barCount]);

  return (
    <div className={`flex items-center justify-center gap-[2.5px] h-14 px-3 py-2 rounded-xl border border-cyan-950/60 bg-black/40 backdrop-blur-sm ${className}`}>
      {bars.map((height, idx) => {
        const isCenter = Math.abs(idx - barCount / 2) < barCount * 0.25;
        return (
          <div
            key={idx}
            className="w-[3px] rounded-full transition-all duration-75"
            style={{
              height: `${height}px`,
              backgroundColor: isActive
                ? isCenter
                  ? '#00f2fe'
                  : '#0284c7'
                : 'rgba(6, 182, 212, 0.25)',
              boxShadow: isActive && isCenter ? '0 0 8px #00f2fe' : 'none',
            }}
          />
        );
      })}
    </div>
  );
};
