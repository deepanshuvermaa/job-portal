import React from 'react';
import { cn } from '../../utils/helpers';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  size = 'md',
}) => {
  const getColor = () => {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-300', stroke: '#22c55e' };
    if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-300', stroke: '#eab308' };
    if (score >= 40) return { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300', stroke: '#f97316' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-300', stroke: '#9ca3af' };
  };

  const color = getColor();

  const sizeConfig = {
    sm: { container: 'h-10 w-10', fontSize: 'text-[10px]', label: 'text-[8px]', svgSize: 40, r: 16, strokeWidth: 3 },
    md: { container: 'h-14 w-14', fontSize: 'text-xs', label: 'text-[9px]', svgSize: 56, r: 22, strokeWidth: 3.5 },
    lg: { container: 'h-20 w-20', fontSize: 'text-base', label: 'text-[10px]', svgSize: 80, r: 32, strokeWidth: 4 },
  };

  const cfg = sizeConfig[size];
  const circumference = 2 * Math.PI * cfg.r;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        cfg.container
      )}
    >
      <svg
        width={cfg.svgSize}
        height={cfg.svgSize}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={cfg.svgSize / 2}
          cy={cfg.svgSize / 2}
          r={cfg.r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={cfg.strokeWidth}
        />
        <circle
          cx={cfg.svgSize / 2}
          cy={cfg.svgSize / 2}
          r={cfg.r}
          fill="none"
          stroke={color.stroke}
          strokeWidth={cfg.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className={cn('font-bold leading-none', cfg.fontSize, color.text)}>
          {score}%
        </span>
        <span className={cn('leading-none mt-0.5', cfg.label, 'text-gray-500')}>
          Match
        </span>
      </div>
    </div>
  );
};

export default MatchScoreBadge;
