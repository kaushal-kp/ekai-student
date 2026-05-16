import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
      <CircularProgress size={size} />
    </Box>
  );
}

export function PageLoader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <CircularProgress size={48} />
    </Box>
  );
}
