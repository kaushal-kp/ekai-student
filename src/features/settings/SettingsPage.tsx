import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ShieldIcon from '@mui/icons-material/Shield';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GlobeIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import CheckIcon from '@mui/icons-material/Check';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Theme, Language } from '@/types/enums';
import { ROUTES } from '@/lib/constants';

const themeOptions: { key: Theme; label: string; icon: React.ReactNode }[] = [
  { key: Theme.LIGHT, label: 'Light', icon: <LightModeIcon sx={{ fontSize: 18 }} /> },
  { key: Theme.DARK, label: 'Dark', icon: <DarkModeIcon sx={{ fontSize: 18 }} /> },
  { key: Theme.SYSTEM, label: 'System', icon: <DesktopWindowsIcon sx={{ fontSize: 18 }} /> },
];

const accountLinks = [
  { label: 'Security', description: 'Password, 2FA, active sessions', icon: ShieldIcon, path: ROUTES.SETTINGS_SECURITY, color: '#6366F1', bg: '#EEF2FF' },
  { label: 'Privacy & Data', description: 'Data rights, download your data', icon: VisibilityIcon, path: ROUTES.SETTINGS_PRIVACY, color: '#10B981', bg: '#D1FAE5' },
  { label: 'Consent Manager', description: 'Manage data sharing consents', icon: NotificationsIcon, path: ROUTES.CONSENT, color: '#F59E0B', bg: '#FEF3C7' },
];

const notifOptions: { key: string; label: string; desc: string }[] = [
  { key: 'examReminders', label: 'Exam Reminders', desc: 'Get notified before upcoming exams' },
  { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Warnings when attendance drops below 75%' },
  { key: 'leaveUpdates', label: 'Leave Updates', desc: 'Status updates on leave requests' },
  { key: 'achievements', label: 'Achievements', desc: 'When you unlock new badges' },
  { key: 'announcements', label: 'Announcements', desc: 'School circulars and notices' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();

  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    examReminders: true,
    attendanceAlerts: true,
    leaveUpdates: true,
    achievements: true,
    announcements: true,
  });
  const [savedNotifPrefs] = useState({ ...notifPrefs });
  const [hasChanges, setHasChanges] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    const changed = JSON.stringify(notifPrefs) !== JSON.stringify(savedNotifPrefs);
    setHasChanges(changed);
  }, [notifPrefs]);

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Settings</Typography>
        <Typography variant="caption" color="text.secondary">
          Manage your account, appearance, and notification preferences
        </Typography>
      </Box>

      {/* Appearance */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5, px: 0.5 }}>
          Appearance
        </Typography>
        <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          {/* Theme */}
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #9C8FFF)' }}>
                <PaletteIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Theme</Typography>
                <Typography variant="caption" color="text.secondary">Choose your display preference</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {themeOptions.map(opt => (
                <Box
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: theme === opt.key ? '#6366F1' : 'transparent',
                    bgcolor: theme === opt.key ? 'rgba(99,102,241,0.08)' : 'action.hover',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ color: theme === opt.key ? '#6366F1' : 'text.secondary' }}>{opt.icon}</Box>
                    {theme === opt.key && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: '#6366F1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 8, color: 'white' }} />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600 }} color={theme === opt.key ? 'primary' : 'text.secondary'}>
                    {opt.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Language */}
          <ListItem
            secondaryAction={
              <Select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                size="small"
                sx={{ minWidth: 120, borderRadius: 2 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">हिंदी</MenuItem>
              </Select>
            }
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 44 }}>
              <Avatar sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>
                <GlobeIcon sx={{ fontSize: 18 }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>Language</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">Display language for the app</Typography>}
            />
          </ListItem>
        </Card>
      </Box>

      {/* Notifications */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5, px: 0.5 }}>
          Notifications
        </Typography>
        <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <List disablePadding>
            {notifOptions.map((opt, i) => (
              <React.Fragment key={opt.key}>
                {i > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Switch
                      checked={!!notifPrefs[opt.key]}
                      onChange={e => setNotifPrefs(p => ({ ...p, [opt.key]: e.target.checked }))}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366F1' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6366F1' } }}
                    />
                  }
                  sx={{ py: 1.5 }}
                >
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{opt.desc}</Typography>}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Card>

        {hasChanges && (
          <Alert
            severity="info"
            sx={{ mt: 1.5, borderRadius: 2 }}
            action={
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button size="small" color="inherit" onClick={() => setNotifPrefs({ ...savedNotifPrefs })}>
                  Discard
                </Button>
                <Button size="small" color="primary" sx={{ fontWeight: 700 }} onClick={() => setSnackOpen(true)}>
                  Save
                </Button>
              </Box>
            }
          >
            You have unsaved changes
          </Alert>
        )}
      </Box>

      {/* Account */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1.5, px: 0.5 }}>
          Account
        </Typography>
        <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <List disablePadding>
            {accountLinks.map((item, i) => (
              <React.Fragment key={item.path}>
                {i > 0 && <Divider />}
                <ListItemButton onClick={() => navigate(item.path)} sx={{ py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Avatar sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: item.bg }}>
                      <item.icon sx={{ fontSize: 18, color: item.color }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{item.description}</Typography>}
                  />
                  <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Box>

      {/* Sign out */}
      <Button
        fullWidth
        variant="contained"
        color="error"
        size="large"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ borderRadius: 2, py: 1.5 }}
      >
        Sign Out
      </Button>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>Preferences saved</Alert>
      </Snackbar>
    </Box>
  );
}
