import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InboxIcon from '@mui/icons-material/Inbox';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatRelativeTime } from '@/lib/formatters';
import api from '@/lib/api';
import { InboxThread, InboxMessage } from '@/types/models';

const SENDER_COLORS: Record<string, string> = {
  admin: '#6366F1',
  teacher: '#10B981',
  system: '#9CA3AF',
};

function MessageBubble({ message }: { message: InboxMessage }) {
  const isAlert = message.type === 'alert';
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        maxWidth: isAlert ? '100%' : '85%',
        bgcolor: isAlert ? '#FEF3C7' : '#F1F5F9',
        border: isAlert ? '1px solid rgba(245,158,11,0.3)' : 'none',
      }}
    >
      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
        {message.content}
      </Typography>
      {message.actionLabel && message.actionUrl && (
        <Typography
          component="a"
          href={message.actionUrl}
          variant="caption"
          sx={{ display: 'inline-block', mt: 1, color: '#6366F1', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
        >
          {message.actionLabel} →
        </Typography>
      )}
    </Box>
  );
}

export default function InboxPage() {
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const isMobile = useMediaQuery('(max-width:768px)');

  const { data: threads, isLoading } = useQuery<InboxThread[]>({
    queryKey: ['inbox'],
    queryFn: async () => (await api.get('/student/inbox')).data.data,
  });

  if (isLoading) return <LoadingSpinner />;

  const showList = !isMobile || !selectedThread;
  const showMessage = !isMobile || !!selectedThread;

  return (
    <Box sx={{ maxWidth: 960 }}>
      <PageHeader title="Inbox" />

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
        {/* Thread list */}
        {showList && (
          <Box sx={{ width: isMobile ? '100%' : 320, flexShrink: 0, overflowY: 'auto' }}>
            {!threads?.length ? (
              <EmptyState emoji="📬" title="Inbox empty" />
            ) : (
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {threads.map(thread => (
                  <ListItemButton
                    key={thread.id}
                    selected={selectedThread?.id === thread.id}
                    onClick={() => setSelectedThread(thread)}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: selectedThread?.id === thread.id ? 'rgba(99,102,241,0.3)' : 'divider',
                      bgcolor: thread.unreadCount > 0 ? '#FFFFFF' : '#F8FAFC',
                      '&.Mui-selected': { bgcolor: 'rgba(99,102,241,0.08)' },
                      '&:hover': { bgcolor: 'action.hover' },
                      alignItems: 'flex-start',
                      gap: 1.5,
                      py: 1.5,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor: SENDER_COLORS[thread.senderRole] || '#9CA3AF',
                        flexShrink: 0,
                      }}
                    >
                      {thread.senderName[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: thread.unreadCount > 0 ? 700 : 500 }}
                          noWrap
                        >
                          {thread.senderName}
                        </Typography>
                        {thread.unreadCount > 0 && (
                          <Box
                            sx={{
                              bgcolor: '#6366F1',
                              color: 'white',
                              borderRadius: '9999px',
                              px: 0.75,
                              minWidth: 18,
                              textAlign: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {thread.unreadCount}
                          </Box>
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: thread.unreadCount > 0 ? 600 : 400, display: "block" }} noWrap>
                        {thread.subject}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                        {thread.lastMessage}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
                        {formatRelativeTime(thread.lastMessageAt)}
                      </Typography>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Message view */}
        {showMessage && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {selectedThread ? (
              <Paper
                elevation={2}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {isMobile && (
                    <IconButton size="small" onClick={() => setSelectedThread(null)}>
                      <ArrowBackIcon sx={{ fontSize: 'small' }} />
                    </IconButton>
                  )}
                  <Avatar
                    sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#6366F1', flexShrink: 0 }}
                  >
                    {selectedThread.senderName[0]}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {selectedThread.senderName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                      {selectedThread.subject}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {selectedThread.messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <InboxIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Select a message to read
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
