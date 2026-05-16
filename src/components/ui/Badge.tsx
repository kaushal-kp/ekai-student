import React from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children?: React.ReactNode;
  className?: string;
}

const colorMap: Record<string, ChipProps['color']> = {
  default: 'default',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'error',
  info: 'info',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <Chip
      label={children}
      color={colorMap[variant] || 'default'}
      size="small"
      className={className}
      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
    />
  );
}
