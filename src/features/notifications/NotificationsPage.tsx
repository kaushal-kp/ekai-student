import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useUIStore } from '@/store/uiStore';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Notification } from '@/types/models';

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

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread`}>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {!notifications?.length ? (
        <EmptyState emoji="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border transition-colors',
                !notif.isRead
                  ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]/20'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              )}
            >
              <div className="text-2xl flex-shrink-0">{notif.icon || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{notif.title}</p>
                  {!notif.isRead && <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{notif.description}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{formatRelativeTime(notif.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
