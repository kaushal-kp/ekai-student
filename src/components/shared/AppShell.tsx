import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NotificationToast } from './NotificationToast';

const SIDEBAR_WIDTH = 248;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Sidebar
        width={SIDEBAR_WIDTH}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
          ml: { lg: `${SIDEBAR_WIDTH}px` },
        }}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} sidebarWidth={SIDEBAR_WIDTH} />
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4,
          }}
        >
          <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
      <NotificationToast />
    </Box>
  );
}
