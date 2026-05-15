import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, Stack
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon, Book, TrendingUp, CalendarMonth,
  Description, TrackChanges, CheckCircle, BeachAccess, Schedule,
  Person, Shield, Share, EmojiEvents, SportsBasketball,
  Work, CardGiftcard, Inbox, Notifications, Settings, LogoutRounded, Bolt
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useStudentStore } from '@/store/studentStore';
import { ROUTES } from '@/lib/constants';

interface NavItem {
  label: string;
  icon: React.ReactElement;
  path: string;
  badgeKey?: string;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD }],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Subjects', icon: <Book />, path: ROUTES.ACADEMICS },
      { label: 'Performance', icon: <TrendingUp />, path: ROUTES.PERFORMANCE },
      { label: 'Exams', icon: <CalendarMonth />, path: ROUTES.EXAMS },
      { label: 'Report Card', icon: <Description />, path: ROUTES.REPORT_CARD },
      { label: 'Readiness Score', icon: <TrackChanges />, path: ROUTES.READINESS_SCORE },
    ],
  },
  {
    label: 'Attendance',
    items: [
      { label: 'Attendance', icon: <CheckCircle />, path: ROUTES.ATTENDANCE },
      { label: 'Leave Request', icon: <BeachAccess />, path: ROUTES.LEAVE_REQUEST },
      { label: 'Leave Status', icon: <Schedule />, path: ROUTES.LEAVE_STATUS },
    ],
  },
  {
    label: 'Profile & Records',
    items: [
      { label: 'My Profile', icon: <Person />, path: ROUTES.PROFILE },
      { label: 'APAAR Record', icon: <Shield />, path: ROUTES.APAAR },
      { label: 'Share Profile', icon: <Share />, path: ROUTES.SHARING },
      { label: 'Achievements', icon: <EmojiEvents />, path: ROUTES.ACHIEVEMENTS },
      { label: 'Co-Curricular', icon: <SportsBasketball />, path: ROUTES.CO_CURRICULAR },
    ],
  },
  {
    label: 'Opportunities',
    items: [
      { label: 'Career', icon: <Work />, path: ROUTES.CAREER },
      { label: 'Opportunities', icon: <CardGiftcard />, path: ROUTES.OPPORTUNITIES },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Inbox', icon: <Inbox />, path: ROUTES.INBOX, badgeKey: 'inbox' },
      { label: 'Notifications', icon: <Notifications />, path: ROUTES.NOTIFICATIONS, badgeKey: 'notif' },
    ],
  },
];

interface SidebarProps {
  width: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent() {
  const { student, clearAuth } = useAuthStore();
  const { notificationCount, inboxUnreadCount } = useStudentStore();
  const navigate = useNavigate();
  const theme = useTheme();

  const getBadge = (key?: string) => {
    if (key === 'inbox') return inboxUnreadCount;
    if (key === 'notif') return notificationCount;
    return 0;
  };

  const initials = student?.name
    ? student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AM';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: 2,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
        >
          <Bolt sx={{ color: 'white', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1, color: 'text.primary', fontSize: '0.9375rem' }}>EKAI</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>Student Hub</Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 0.5 }}>
            <Typography
              variant="overline"
              sx={{ px: 2.5, py: 0.75, display: 'block', color: 'text.disabled', fontSize: '0.6875rem' }}
            >
              {group.label}
            </Typography>
            <List dense disablePadding>
              {group.items.map((item) => {
                const badge = getBadge(item.badgeKey);
                return (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to={item.path}
                      sx={{
                        mx: 1, mb: 0.25, borderRadius: 2, px: 1.5, py: 1,
                        '&.active': {
                          bgcolor: alpha(theme.palette.primary.main, 0.10),
                          color: 'primary.main',
                          '& .MuiListItemIcon-root': { color: 'primary.main' },
                        },
                        '& .MuiListItemIcon-root': { color: 'text.secondary', minWidth: 36 },
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          color: 'text.primary',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ '& svg': { fontSize: 18 } }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 500 } } }}
                      />
                      {badge > 0 && (
                        <Box
                          sx={{
                            bgcolor: 'error.main', color: 'white',
                            borderRadius: 99, px: 0.75, py: 0.1,
                            fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.6, minWidth: 18, textAlign: 'center',
                          }}
                        >
                          {badge}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Settings */}
      <List dense disablePadding sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to={ROUTES.SETTINGS}
            sx={{
              mx: 1, borderRadius: 2, px: 1.5, py: 1,
              '&.active': { bgcolor: alpha(theme.palette.primary.main, 0.10), color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
              '& .MuiListItemIcon-root': { color: 'text.secondary', minWidth: 36 },
              color: 'text.secondary',
            }}
          >
            <ListItemIcon sx={{ '& svg': { fontSize: 18 } }}><Settings /></ListItemIcon>
            <ListItemText primary="Settings" slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 500 } } }} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User */}
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 1.5, py: 1.25, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Avatar
            src={student?.avatarUrl}
            sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', fontSize: '0.75rem' }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
              {student?.name || 'Arjun Mehta'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
              Class {student?.class}-{student?.section}
            </Typography>
          </Box>
          <Tooltip title="Logout" arrow>
            <Box
              onClick={() => { clearAuth(); navigate(ROUTES.LOGIN); }}
              sx={{ cursor: 'pointer', color: 'text.disabled', display: 'flex', '&:hover': { color: 'error.main' }, transition: 'color 0.15s' }}
            >
              <LogoutRounded sx={{ fontSize: 16 }} />
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export function Sidebar({ width, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width, boxSizing: 'border-box' },
        }}
      >
        <SidebarContent />
      </Drawer>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width, boxSizing: 'border-box', position: 'fixed', height: '100vh' },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}
