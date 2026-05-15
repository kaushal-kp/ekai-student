import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Clock, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUIStore } from '@/store/uiStore';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { ConsentLog } from '@/types/models';
import { ConsentStatus } from '@/types/enums';

export default function ConsentPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data: consents, isLoading } = useQuery<ConsentLog[]>({
    queryKey: ['consents'],
    queryFn: async () => (await api.get('/student/consent')).data.data,
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/student/consent/${id}`),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Consent Revoked', description: 'Data sharing consent has been revoked.' });
      qc.invalidateQueries({ queryKey: ['consents'] });
      setRevokeId(null);
    },
    onError: (err: any) => addToast({ type: 'error', title: 'Failed', description: err.message }),
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  const active = consents?.filter(c => c.status === ConsentStatus.ACTIVE) || [];
  const expired = consents?.filter(c => c.status !== ConsentStatus.ACTIVE) || [];

  const statusConfig = {
    [ConsentStatus.ACTIVE]: { icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'success' as const, label: 'Active' },
    [ConsentStatus.EXPIRED]: { icon: <Clock className="h-3.5 w-3.5" />, variant: 'default' as const, label: 'Expired' },
    [ConsentStatus.REVOKED]: { icon: <AlertCircle className="h-3.5 w-3.5" />, variant: 'danger' as const, label: 'Revoked' },
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Consent Manager" subtitle="Manage who can access your academic data" />

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 bg-[var(--color-primary-light)] rounded-[var(--radius-lg)] mb-6">
        <Shield className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-primary)]">
          Under the Digital Personal Data Protection Act 2023, you have the right to revoke consent at any time.
          Revoking consent will stop new data from being shared but won't delete previously shared data.
        </p>
      </div>

      {!consents?.length ? (
        <EmptyState emoji="🔒" title="No active consents" description="No organizations currently have access to your data." />
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Active Consents ({active.length})</p>
              <div className="space-y-3">
                {active.map(consent => {
                  const sc = statusConfig[consent.status];
                  return (
                    <Card key={consent.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-[var(--color-text)] text-sm">{consent.organization}</p>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1">{consent.purpose}</p>
                          <div className="flex gap-4 mt-1.5 text-xs text-[var(--color-text-muted)]">
                            <span>Granted: {formatDate(consent.consentGivenAt)}</span>
                            {consent.expiresAt && <span>Expires: {formatDate(consent.expiresAt)}</span>}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <p className="text-xs text-[var(--color-text-muted)] mr-1">Data shared:</p>
                            {consent.dataFields.map(f => (
                              <span key={f} className="text-xs bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[var(--color-text-secondary)]">{f}</span>
                            ))}
                          </div>
                        </div>
                        {consent.canRevoke && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRevokeId(consent.id)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
                          </Button>
                        )}
                        {!consent.canRevoke && (
                          <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">Required</span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {expired.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Past Consents</p>
              <div className="space-y-2">
                {expired.map(consent => {
                  const sc = statusConfig[consent.status];
                  return (
                    <div key={consent.id} className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] rounded-[var(--radius-lg)] opacity-70">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[var(--color-text)]">{consent.organization}</p>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">{consent.purpose}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!revokeId}
        onClose={() => setRevokeId(null)}
        onConfirm={() => revokeId && revokeMutation.mutate(revokeId)}
        title="Revoke Consent"
        description="This will revoke data sharing consent. The organization will no longer receive updates to your data. Previously shared data may still be retained by the organization."
        confirmLabel="Revoke Consent"
        loading={revokeMutation.isPending}
      />
    </div>
  );
}
