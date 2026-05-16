import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ emoji, icon, title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 3, textAlign: 'center' }}>
      {emoji && <Typography sx={{ fontSize: 56, mb: 2, lineHeight: 1 }}>{emoji}</Typography>}
      {icon && <Box sx={{ color: 'text.disabled', mb: 2, '& svg': { fontSize: 48 } }}>{icon}</Box>}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
      {description && <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mb: 3 }}>{description}</Typography>}
      {action && <Button variant="outlined" onClick={action.onClick}>{action.label}</Button>}
    </Box>
  );
}
