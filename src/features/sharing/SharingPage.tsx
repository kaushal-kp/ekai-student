import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Eye, Trash2, Lock, Plus, Copy, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUIStore } from '@/store/uiStore';
import { formatDate, formatRelativeTime } from '@/lib/formatters';
import api from '@/lib/api';
import { ShareLink } from '@/types/models';

export default function SharingPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: links, isLoading } = useQuery<ShareLink[]>({
    queryKey: ['share-links'],
    queryFn: async () => (await api.get('/student/sharing/links')).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/student/sharing/links/${id}`),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Link Deleted' });
      qc.invalidateQueries({ queryKey: ['share-links'] });
      setDeleteId(null);
    },
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({ type: 'success', title: 'Link Copied', description: 'Share link copied to clipboard' });
  };

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Share Profile" subtitle="Control who can see your academic data">
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Link
        </Button>
      </PageHeader>

      {/* Privacy Note */}
      <div className="p-3 bg-[var(--color-primary-light)] rounded-[var(--radius-lg)] mb-6 flex items-start gap-3">
        <Lock className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-primary)]">
          You control who sees your data. Each link has custom permissions and can be revoked at any time.
          Links never share your APAAR ID unless explicitly enabled.
        </p>
      </div>

      {!links?.length ? (
        <EmptyState emoji="🔗" title="No share links yet" description="Create shareable links to share your profile with colleges or employers." />
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <Card key={link.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 ${link.isActive ? 'bg-[var(--color-primary-light)]' : 'bg-[var(--color-surface-2)]'}`}>
                    <Link2 className={`h-4 w-4 ${link.isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[var(--color-text)] text-sm">{link.name}</p>
                      {!link.isActive && <Badge>Inactive</Badge>}
                      {link.isPasswordProtected && <Badge variant="warning"><Lock className="h-2.5 w-2.5 mr-0.5" />Protected</Badge>}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{link.purpose}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                        <Eye className="h-3 w-3" />{link.views} views
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">Created {formatRelativeTime(link.createdAt)}</span>
                      {link.expiresAt && (
                        <span className="text-xs text-[var(--color-warning)]">Expires {formatDate(link.expiresAt)}</span>
                      )}
                    </div>
                    {/* Permissions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {link.permissions.basicInfo && <span className="text-xs bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">Basic Info</span>}
                      {link.permissions.attendanceSummary && <span className="text-xs bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">Attendance</span>}
                      {link.permissions.marksDetails !== 'hidden' && <span className="text-xs bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">Marks ({link.permissions.marksDetails})</span>}
                      {link.permissions.achievements && <span className="text-xs bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[var(--color-text-muted)]">Achievements</span>}
                      {link.permissions.apaarId && <span className="text-xs bg-[var(--color-warning-light)] px-1.5 py-0.5 rounded text-[var(--color-warning)]">APAAR ID</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(link.url)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(link.id)} className="text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Share Link"
        description="This will permanently delete the link. Anyone with this link won't be able to access your profile anymore."
        confirmLabel="Delete Link"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
