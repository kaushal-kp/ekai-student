import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color,
  height = 8,
  showLabel = false,
  label,
  className,
  animated = false,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const getDefaultColor = () => {
    if (percent >= 75) return 'var(--color-success)';
    if (percent >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
          <span className="text-xs font-medium text-[var(--color-text)]">{Math.round(percent)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-[var(--color-surface-2)]"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', animated && 'animate-pulse')}
          style={{
            width: `${percent}%`,
            backgroundColor: color || getDefaultColor(),
          }}
        />
      </div>
    </div>
  );
}
