import React from 'react';
import { Chip } from '@mui/material';
import { ReadinessLevel, SubjectStatus } from '@/types/enums';

type Risk = 'low' | 'medium' | 'high';

const RISK_CONFIG: Record<Risk, { label: string; bgcolor: string; color: string }> = {
  low: { label: 'Low Risk', bgcolor: '#F0FDF4', color: '#16A34A' },
  medium: { label: 'Medium Risk', bgcolor: '#FFFBEB', color: '#D97706' },
  high: { label: 'High Risk', bgcolor: '#FEF2F2', color: '#DC2626' },
};

const STATUS_CONFIG: Record<string, { label: string; bgcolor: string; color: string }> = {
  [ReadinessLevel.READY]: { label: 'Ready', bgcolor: '#F0FDF4', color: '#16A34A' },
  [ReadinessLevel.NEEDS_PREP]: { label: 'Needs Prep', bgcolor: '#FFFBEB', color: '#D97706' },
  [ReadinessLevel.AT_RISK]: { label: 'At Risk', bgcolor: '#FEF2F2', color: '#DC2626' },
  [ReadinessLevel.NOT_STARTED]: { label: 'Not Started', bgcolor: '#F3F4F6', color: '#6B7280' },
  [SubjectStatus.ON_TRACK]: { label: 'On Track', bgcolor: '#F0FDF4', color: '#16A34A' },
  [SubjectStatus.NEEDS_ATTENTION]: { label: 'Needs Attention', bgcolor: '#FFFBEB', color: '#D97706' },
};

interface RiskBadgeProps {
  level?: Risk;
  status?: ReadinessLevel | SubjectStatus | string;
}

export function RiskBadge({ level, status }: RiskBadgeProps) {
  let cfg: { label: string; bgcolor: string; color: string };

  if (level) {
    cfg = RISK_CONFIG[level] || { label: level, bgcolor: '#F3F4F6', color: '#6B7280' };
  } else if (status) {
    cfg = STATUS_CONFIG[status] || { label: status, bgcolor: '#F3F4F6', color: '#6B7280' };
  } else {
    return null;
  }

  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 700, fontSize: '0.75rem' }}
    />
  );
}
