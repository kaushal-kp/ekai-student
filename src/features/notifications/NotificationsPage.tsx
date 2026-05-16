import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useUIStore } from '@/store/uiStore';
import { formatRelativeTime } from '@/lib/formatters';
import api from '@/lib/api';
import { Notification } from '@/types/models';
import { NotificationType } from '@/types/enums';
import { isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  [NotificationType.ACHIEVEMENT]: { icon: <EmojiEventsIcon sx={{ fontSize: 16 }} />, color: '#F59E0B', bg: '#FEF3C7' },
  [NotificationType.ATTENDANCE_WARNING]: { icon: <WarningAmberIcon sx={{ fontSize: 16 }} />, color: '#EF4444', bg: '#FEE2E2' },
  [NotificationType.EXAM_RESULT]: { icon: <MenuBookIcon sx={{ fontSize: 16 }} />, color: '#6366F1', bg: '#EEF2FF' },
  [NotificationType.LEAVE_APPROVED]: { icon: <EventAvailableIcon sx={{ fontSize: 16 }} />, color: '#10B981', bg: '#D1FAE5' },
  [NotificationType.LEAVE_REJECTED]: { icon: <EventAvailableIcon sx={{ fontSize: 16 }} />, color: '#EF4444', bg: '#FEE2E2' },
  [NotificationType.CIRCULAR]: { icon: <NotificationsIcon sx={{ fontSize: 16 }} />, color: '#3B82F6', bg: '#DBEAFE' },
  [NotificationType.MESSAGE]: { icon: <ChatBubbleIcon sx={{ fontSize: 16 }} />, color: '#8B5CF6', bg: '#EDE9FE' },
  [NotificationType.PROFILE_VIEWED]: { icon: <NotificationsIcon sx={{ fontSize: 16 }} />, color: '#10B981', bg: '#D1FAE5' },
  [NotificationType.READINESS_UPDATE]: { icon: <MenuBookIcon sx={{ fontSize: 16 }} />, color: '#F97316', bg: '#FFF7ED' },
};

function groupNotifications(notifications: Notification[]) {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const thisWeek: Notification[] = [];
  const older: Notification[] = [];

  notifications.forEach(n => {
    const date = parseISO(n.createdAt);
    if (isToday(date)) today.push(n);
    else if (isYesterday(date)) yesterday.push(n);
    else if (isThisWeek(date)) thisWeek.push(n);
    else older.push(n);
  });

  return [
    { label: 'Today', items: today },
    { label: 'Yesterday', items: yesterday },
    { label: 'This Week', items: thisWeek },
    { label: 'Older', items: older },
  ].filter(g => g.items.length > 0);
}

export default function NotificationsPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/student/notifications')).data.data,
  });

  const markAllRead = useMutation({
    mutationFn: async () => await api.patch('/student/notifications/read-all'),
    onSuccess: () => {
      addToast({ type: 'success', title: 'All marked as read' });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const groups = notifications ? groupNotifications(notifications) : [];

  return (
    <Box sx={{ maxWidth: 672 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            sx={{ borderRadius: 2, flexShrink: 0 }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Box key={i} sx={{ height: 64, borderRadius: 2, bgcolor: 'action.hover', animation: 'pulse 1.5s infinite' }} />
          ))}
        </Box>
      ) : !notifications?.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
          <Typography sx={{ fontSize: 56, mb: 2 }}>🔔</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>No notifications yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            You're all caught up! We'll notify you of important updates.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {groups.map(group => (
            <Box key={group.label}>
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5, px: 0.5 }}
              >
                {group.label}
              </Typography>
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map(notif => {
                  const typeConfig = TYPE_CONFIG[notif.type] || {
                    icon: <NotificationsIcon sx={{ fontSize: 16 }} />,
                    color: '#6B7280',
                    bg: '#F3F4F6',
                  };
                  return (
                    <ListItemButton
                      key={notif.id}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: !notif.isRead ? 'rgba(99,102,241,0.3)' : 'divider',
                        bgcolor: !notif.isRead ? 'rgba(99,102,241,0.06)' : 'background.paper',
                        gap: 2,
                        alignItems: 'flex-start',
                        py: 1.5,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '12px',
                          bgcolor: typeConfig.bg,
                          color: typeConfig.color,
                          flexShrink: 0,
                        }}
                      >
                        {typeConfig.icon}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {notif.title}
                          </Typography>
                          {!notif.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#6366F1',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}>
                          {notif.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
                          {formatRelativeTime(notif.createdAt)}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
