import React from 'react';
import { cn } from '@/lib/utils';
import { ReadinessLevel, SubjectStatus } from '@/types/enums';

interface RiskBadgeProps {
  status: ReadinessLevel | SubjectStatus | string;
  className?: string;
}

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
  [ReadinessLevel.READY]: { label: 'Ready', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  [ReadinessLevel.NEEDS_PREP]: { label: 'Needs Prep', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  [ReadinessLevel.AT_RISK]: { label: 'At Risk', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
  [ReadinessLevel.NOT_STARTED]: { label: 'Not Started', color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' },
  [SubjectStatus.ON_TRACK]: { label: 'On Track', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  [SubjectStatus.NEEDS_ATTENTION]: { label: 'Needs Attention', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  [SubjectStatus.AT_RISK]: { label: 'At Risk', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
};

export function RiskBadge({ status, className }: RiskBadgeProps) {
  const config = levelConfig[status] || { label: status, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' };
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  );
}
