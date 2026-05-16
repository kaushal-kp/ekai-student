import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  showLabel?: boolean;
  height?: number;
}

export function ProgressBar({ value, max = 100, color = '#6366F1', label, showLabel = false, height = 8 }: ProgressBarProps) {
  const percent = max !== 100 ? Math.min((value / max) * 100, 100) : Math.min(value, 100);
  return (
    <Box>
      {(label || showLabel) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>}
          {showLabel && <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{Math.round(percent)}%</Typography>}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height,
          borderRadius: 99,
          bgcolor: 'rgba(0,0,0,0.06)',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
    </Box>
  );
}
