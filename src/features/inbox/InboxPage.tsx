import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, User, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { InboxThread, InboxMessage } from '@/types/models';

function MessageBubble({ message }: { message: InboxMessage }) {
  return (
    <div className={cn(
      'p-3 rounded-[var(--radius-lg)] text-sm max-w-[85%]',
      message.type === 'alert' ? 'bg-[var(--color-warning-light)] border border-[var(--color-warning)]/30 w-full max-w-full' : 'bg-[var(--color-surface-2)]'
    )}>
      <p className="text-[var(--color-text)] whitespace-pre-line">{message.content}</p>
      {message.actionLabel && message.actionUrl && (
        <a
          href={message.actionUrl}
          className="inline-block mt-2 text-xs text-[var(--color-primary)] font-medium hover:underline"
        >
          {message.actionLabel} →
        </a>
      )}
    </div>
  );
}

export default function InboxPage() {
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);

  const { data: threads, isLoading } = useQuery<InboxThread[]>({
    queryKey: ['inbox'],
    queryFn: async () => (await api.get('/student/inbox')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Inbox" />

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Thread List */}
        <div className={cn('w-full md:w-80 flex-shrink-0 space-y-2 overflow-y-auto', selectedThread && 'hidden md:block')}>
          {!threads?.length ? (
            <EmptyState emoji="📬" title="Inbox empty" />
          ) : (
            threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={cn(
                  'p-3 rounded-[var(--radius-lg)] border cursor-pointer transition-colors',
                  selectedThread?.id === thread.id
                    ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]/30'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-2)]'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white',
                    thread.senderRole === 'admin' ? 'bg-[var(--color-primary)]' :
                    thread.senderRole === 'teacher' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'
                  )}>
                    {thread.senderName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--color-text)] truncate">{thread.senderName}</p>
                      {thread.unreadCount > 0 && (
                        <span className="bg-[var(--color-primary)] text-white text-xs rounded-full px-1.5 min-w-[18px] text-center flex-shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[var(--color-text)] truncate">{thread.subject}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{thread.lastMessage}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatRelativeTime(thread.lastMessageAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message View */}
        <div className="flex-1 min-w-0">
          {selectedThread ? (
            <div className="h-full flex flex-col bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
                <button
                  className="md:hidden text-[var(--color-primary)] text-sm font-medium"
                  onClick={() => setSelectedThread(null)}
                >
                  ←
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {selectedThread.senderName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text)] truncate">{selectedThread.senderName}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{selectedThread.subject}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedThread.messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
                <p className="text-sm text-[var(--color-text-secondary)]">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
