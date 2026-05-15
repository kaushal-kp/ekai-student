import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Bell, Award, AlertTriangle, BookOpen, CalendarCheck, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useUIStore } from '@/store/uiStore';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Notification } from '@/types/models';
import { NotificationType } from '@/types/enums';
import { isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  [NotificationType.ACHIEVEMENT]: { icon: <Award className="h-4 w-4" />, color: '#F59E0B', bg: '#FEF3C7' },
  [NotificationType.ATTENDANCE_WARNING]: { icon: <AlertTriangle className="h-4 w-4" />, color: '#EF4444', bg: '#FEE2E2' },
  [NotificationType.EXAM_RESULT]: { icon: <BookOpen className="h-4 w-4" />, color: '#6C63FF', bg: '#EEEDFF' },
  [NotificationType.LEAVE_APPROVED]: { icon: <CalendarCheck className="h-4 w-4" />, color: '#10B981', bg: '#D1FAF0' },
  [NotificationType.LEAVE_REJECTED]: { icon: <CalendarCheck className="h-4 w-4" />, color: '#EF4444', bg: '#FEE2E2' },
  [NotificationType.CIRCULAR]: { icon: <Bell className="h-4 w-4" />, color: '#3B82F6', bg: '#DBEAFE' },
  [NotificationType.MESSAGE]: { icon: <MessageSquare className="h-4 w-4" />, color: '#8B5CF6', bg: '#EDE9FE' },
  [NotificationType.PROFILE_VIEWED]: { icon: <Bell className="h-4 w-4" />, color: '#10B981', bg: '#D1FAF0' },
  [NotificationType.READINESS_UPDATE]: { icon: <BookOpen className="h-4 w-4" />, color: '#F97316', bg: '#FFF7ED' },
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

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

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
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-text)]">Notifications</h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary-light)] transition-all disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-[16px]" />)}
        </div>
      ) : !notifications?.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-[56px] mb-4">🔔</span>
          <p className="text-[16px] font-semibold text-[var(--color-text)]">No notifications yet</p>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-1">You're all caught up! We'll notify you of important updates.</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {groups.map(group => (
            <div key={group.label}>
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map(notif => {
                  const typeConfig = TYPE_CONFIG[notif.type] || {
                    icon: <Bell className="h-4 w-4" />,
                    color: '#6B7280',
                    bg: '#F3F4F6',
                  };
                  return (
                    <motion.div
                      key={notif.id}
                      variants={fadeUp}
                      className="flex items-start gap-4 p-4 rounded-[16px] border transition-all cursor-pointer group"
                      style={{
                        background: !notif.isRead ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        borderColor: !notif.isRead ? 'var(--color-primary)' + '30' : 'var(--color-border)',
                      }}
                      whileHover={{ y: -1 }}
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{ background: typeConfig.bg, color: typeConfig.color }}
                      >
                        {typeConfig.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-[var(--color-text)]">{notif.title}</p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: 'var(--color-primary)' }} />
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                          {notif.description}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
