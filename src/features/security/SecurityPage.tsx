import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Monitor, LogOut, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUIStore } from '@/store/uiStore';
import { formatRelativeTime } from '@/lib/formatters';
import api from '@/lib/api';
import { Session } from '@/types/models';

export default function SecurityPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [terminateId, setTerminateId] = useState<string | null>(null);

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => (await api.get('/student/security/sessions')).data.data,
  });

  const terminateMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/student/security/sessions/${id}`),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Session terminated' });
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setTerminateId(null);
    },
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Security" subtitle="Manage sessions and security settings" />

      <div className="space-y-6">
        {/* Login History */}
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Active Sessions</p>
          <Card padding="none">
            {sessions?.map((session, i) => (
              <div
                key={session.id}
                className={`flex items-center gap-3 p-4 ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
              >
                <Monitor className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-text)]">{session.device}</p>
                    {session.isCurrent && <Badge variant="success">Current</Badge>}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {session.location} · {session.browser} · {formatRelativeTime(session.lastActive)}
                  </p>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setTerminateId(session.id)}
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Security Tips */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" />Security Tips</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                'Never share your OTP with anyone, including school staff.',
                'Log out from shared or public computers.',
                'Report suspicious activity immediately to school.',
                'Keep your registered mobile number updated.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-success)] mt-0.5">•</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!terminateId}
        onClose={() => setTerminateId(null)}
        onConfirm={() => terminateId && terminateMutation.mutate(terminateId)}
        title="Terminate Session"
        description="This will log out the device from your account."
        confirmLabel="Terminate"
        loading={terminateMutation.isPending}
      />
    </div>
  );
}
