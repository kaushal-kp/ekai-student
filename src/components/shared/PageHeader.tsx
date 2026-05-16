import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
      <Box>
        <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary' }}>{title}</Typography>
        {subtitle && <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {children && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{children}</Box>}
    </Box>
  );
}
