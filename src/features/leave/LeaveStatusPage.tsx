import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useUIStore } from '@/store/uiStore';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { LeaveRequest } from '@/types/models';
import { LeaveStatus, LeaveType } from '@/types/enums';

const statusConfig: Record<LeaveStatus, { icon: React.ReactNode; label: string; variant: any }> = {
  [LeaveStatus.PENDING]: { icon: <Clock className="h-4 w-4" />, label: 'Pending', variant: 'warning' },
  [LeaveStatus.APPROVED]: { icon: <CheckCircle className="h-4 w-4" />, label: 'Approved', variant: 'success' },
  [LeaveStatus.REJECTED]: { icon: <XCircle className="h-4 w-4" />, label: 'Rejected', variant: 'danger' },
  [LeaveStatus.CANCELLED]: { icon: <AlertCircle className="h-4 w-4" />, label: 'Cancelled', variant: 'default' },
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

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Leave Status" subtitle="Track your leave request history" />

      {!requests?.length ? (
        <EmptyState
          emoji="📋"
          title="No leave requests"
          description="You haven't submitted any leave requests yet."
        />
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const sc = statusConfig[req.status];
            return (
              <Card key={req.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-[var(--color-text)] text-sm">{leaveTypeLabels[req.type]}</span>
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {formatDate(req.fromDate)} {req.toDate !== req.fromDate && `— ${formatDate(req.toDate)}`}
                      <span className="text-[var(--color-text-muted)] ml-2">({req.duration} day{req.duration > 1 ? 's' : ''})</span>
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{req.reason}</p>

                    {req.approvedBy && (
                      <p className="text-xs text-[var(--color-success)] mt-1.5">
                        ✅ Approved by {req.approvedBy}
                      </p>
                    )}
                    {req.rejectionReason && (
                      <p className="text-xs text-[var(--color-danger)] mt-1.5">
                        ❌ {req.rejectionReason}
                      </p>
                    )}
                  </div>

                  {req.status === LeaveStatus.PENDING && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => cancelMutation.mutate(req.id)}
                      loading={cancelMutation.isPending}
                      className="text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
