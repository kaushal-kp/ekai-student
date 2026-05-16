import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useUIStore } from '@/store/uiStore';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { LeaveRequest } from '@/types/models';
import { LeaveStatus, LeaveType } from '@/types/enums';

const statusConfig: Record<LeaveStatus, { icon: React.ReactNode; label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  [LeaveStatus.PENDING]: { icon: <AccessTimeIcon sx={{ fontSize: 14 }} />, label: 'Pending', color: 'warning' },
  [LeaveStatus.APPROVED]: { icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />, label: 'Approved', color: 'success' },
  [LeaveStatus.REJECTED]: { icon: <CancelIcon sx={{ fontSize: 14 }} />, label: 'Rejected', color: 'error' },
  [LeaveStatus.CANCELLED]: { icon: <ErrorOutlineIcon sx={{ fontSize: 14 }} />, label: 'Cancelled', color: 'default' },
};

const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.MEDICAL]: 'Medical',
  [LeaveType.PERSONAL]: 'Personal',
  [LeaveType.FAMILY_EMERGENCY]: 'Family Emergency',
  [LeaveType.EVENT_PARTICIPATION]: 'Event Participation',
};

export default function LeaveStatusPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const { data: requests, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['leave-requests'],
    queryFn: async () => (await api.get('/student/leave/requests')).data.data,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/student/leave/requests/${id}`),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Leave Cancelled', description: 'Your leave request has been cancelled.' });
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
    },
    onError: (err: any) => addToast({ type: 'error', title: 'Failed', description: err.message }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ maxWidth: 720 }}>
      <PageHeader title="Leave Status" subtitle="Track your leave request history" />

      {!requests?.length ? (
        <EmptyState
          emoji="📋"
          title="No leave requests"
          description="You haven't submitted any leave requests yet."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {requests.map(req => {
            const sc = statusConfig[req.status];
            return (
              <Card key={req.id} elevation={2} sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {leaveTypeLabels[req.type]}
                        </Typography>
                        <Chip
                          icon={sc.icon as React.ReactElement}
                          label={sc.label}
                          color={sc.color}
                          size="small"
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {formatDate(req.fromDate)}
                        {req.toDate !== req.fromDate && ` — ${formatDate(req.toDate)}`}
                        <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                          ({req.duration} day{req.duration > 1 ? 's' : ''})
                        </Typography>
                      </Typography>

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {req.reason}
                      </Typography>

                      {req.approvedBy && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                          ✅ Approved by {req.approvedBy}
                        </Typography>
                      )}
                      {req.rejectionReason && (
                        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
                          ❌ {req.rejectionReason}
                        </Typography>
                      )}
                    </Box>

                    {req.status === LeaveStatus.PENDING && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => cancelMutation.mutate(req.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
