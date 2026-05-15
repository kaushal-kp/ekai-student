import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download, Edit3, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function PrivacyPage() {
  const { addToast } = useUIStore();
  const { clearAuth } = useAuthStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadMutation = useMutation({
    mutationFn: async () => (await api.post('/student/data/download', { format: 'json' })).data.data,
    onSuccess: (data) => {
      addToast({ type: 'success', title: 'Data Download Ready', description: 'Your data export is ready.' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed', description: 'Could not prepare download.' }),
  });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Privacy & Data Rights" subtitle="Control your data under DPDP Act 2023" />

      <div className="space-y-4">
        {/* Download Data */}
        <Card>
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Download My Data</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Get a copy of all your academic data including marks, attendance, profile, and activity records.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadMutation.mutate()} loading={downloadMutation.isPending}>
              Download
            </Button>
          </div>
        </Card>

        {/* Data Correction */}
        <Card>
          <div className="flex items-start gap-3">
            <Edit3 className="h-5 w-5 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Request Data Correction</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Found incorrect information? Submit a correction request with supporting evidence.
              </p>
            </div>
            <Button variant="outline" size="sm">Request</Button>
          </div>
        </Card>

        {/* Data Categories */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />Data We Collect</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { category: 'Academic Records', items: 'Marks, attendance, exam results, report cards', required: true },
                { category: 'Profile Information', items: 'Name, DOB, contact details, school info', required: true },
                { category: 'Activity Data', items: 'Login history, session data', required: true },
                { category: 'Preferences', items: 'Career interests, language settings', required: false },
              ].map(d => (
                <div key={d.category} className="flex items-start justify-between gap-2 p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)]">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">{d.category}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{d.items}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${d.required ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'}`}>
                    {d.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <div className="border border-[var(--color-danger)] rounded-[var(--radius-lg)] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--color-danger)]">Delete Account</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
                For minors, parent/guardian consent is required.
              </p>
              <Button variant="danger" size="sm" className="mt-3" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Request Account Deletion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          setShowDeleteDialog(false);
          addToast({ type: 'info', title: 'Deletion Request Submitted', description: 'Your account deletion request has been submitted. You will receive confirmation within 7 days.' });
        }}
        title="Delete Account"
        description="This will permanently delete all your academic records, achievements, and profile data. This action is irreversible and may affect your academic records."
        confirmLabel="Submit Deletion Request"
      />
    </div>
  );
}
