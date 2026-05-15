import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Badge,
  Avatar, Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Menu as MenuIcon, Search, NotificationsNone, DarkMode, LightMode } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useStudentStore } from '@/store/studentStore';
import { Theme } from '@/types/enums';
import { ROUTES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard', '/academics': 'Subjects', '/performance': 'Performance',
  '/exams': 'Exams', '/report-card': 'Report Card', '/readiness-score': 'Readiness Score',
  '/attendance': 'Attendance', '/leave/request': 'Leave Request', '/leave/status': 'Leave Status',
  '/profile': 'My Profile', '/apaar': 'APAAR Record', '/sharing': 'Share Profile',
  '/achievements': 'Achievements', '/co-curricular': 'Co-Curricular', '/career': 'Career',
  '/opportunities': 'Opportunities', '/inbox': 'Inbox', '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export function TopBar({ onMenuClick, sidebarWidth }: { onMenuClick: () => void; sidebarWidth: number }) {
  const { student } = useAuthStore();
  const { theme: uiTheme, setTheme } = useUIStore();
  const { notificationCount } = useStudentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = ROUTE_LABELS[location.pathname] || 'EKAI Student Hub';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer - 1,
        width: { lg: `calc(100% - ${sidebarWidth}px)` },
        ml: { lg: `${sidebarWidth}px` },
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 56 } }}>
        <IconButton sx={{ display: { lg: 'none' } }} onClick={onMenuClick} edge="start">
          <MenuIcon />
        </IconButton>

        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', flexGrow: 0, mr: 2 }}>
          {pageTitle}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Search */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center', gap: 1,
            bgcolor: 'grey.100', borderRadius: 2.5, px: 1.5, py: 0.75,
            border: '1px solid', borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main' },
            cursor: 'pointer', minWidth: 180,
          }}
        >
          <Search sx={{ fontSize: 16, color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>Search... ⌘K</Typography>
        </Box>

        {/* Theme toggle */}
        <Tooltip title={uiTheme === Theme.DARK ? 'Light mode' : 'Dark mode'} arrow>
          <IconButton onClick={() => setTheme(uiTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK)} size="small">
            {uiTheme === Theme.DARK ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications" arrow>
          <IconButton onClick={() => navigate(ROUTES.NOTIFICATIONS)} size="small">
            <Badge badgeContent={notificationCount} color="error" max={9}>
              <NotificationsNone fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Avatar */}
        <Tooltip title={student?.name || 'Profile'} arrow>
          <Avatar
            src={student?.avatarUrl}
            onClick={() => navigate(ROUTES.PROFILE)}
            sx={{
              width: 32, height: 32, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              fontSize: '0.75rem', fontWeight: 700,
              '&:hover': { transform: 'scale(1.05)' },
              transition: 'transform 0.15s',
            }}
          >
            {student?.name ? getInitials(student.name) : 'AM'}
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
