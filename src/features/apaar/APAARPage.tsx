import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, CheckCircle, Copy, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { APAARStatus } from '@/types/enums';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatters';

export default function APAARPage() {
  const { student } = useAuthStore();
  const { addToast } = useUIStore();
  const [showAPAAR, setShowAPAAR] = useState(false);

  const { data: apaarData, isLoading } = useQuery({
    queryKey: ['apaar'],
    queryFn: async () => (await api.get('/student/apaar')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  const handleCopy = () => {
    if (student?.apaarId) {
      navigator.clipboard.writeText(student.apaarId);
      addToast({ type: 'success', title: 'Copied', description: 'APAAR ID copied to clipboard' });
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="APAAR Record"
        subtitle="Academic Bank of Credits - Your Digital Academic Passport"
      />

      {/* Status Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${student?.apaarStatus === APAARStatus.VERIFIED ? 'bg-[var(--color-success-light)]' : 'bg-[var(--color-warning-light)]'}`}>
            <Shield className={`h-8 w-8 ${student?.apaarStatus === APAARStatus.VERIFIED ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-[var(--color-text)]">APAAR Account</h2>
              <Badge variant={student?.apaarStatus === APAARStatus.VERIFIED ? 'success' : 'warning'}>
                {student?.apaarStatus === APAARStatus.VERIFIED ? '✓ Verified' : 'Pending'}
              </Badge>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {student?.apaarStatus === APAARStatus.VERIFIED
                ? 'Your APAAR account is verified and linked to your academic records.'
                : 'Your APAAR verification is in progress.'}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] mb-2">APAAR ID</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm bg-[var(--color-surface-2)] px-3 py-2 rounded-[var(--radius-md)] text-[var(--color-text)]">
              {showAPAAR ? student?.apaarId : 'APAAR-DL-2025-XXXXXX'}
            </code>
            <Button variant="ghost" size="icon-sm" onClick={() => setShowAPAAR(s => !s)} aria-label="Toggle APAAR visibility">
              {showAPAAR ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy APAAR ID">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* What is APAAR */}
      <Card className="mb-6">
        <CardHeader><CardTitle>What is APAAR?</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            APAAR (Automated Permanent Academic Account Registry) is a unique ID issued by the Government of India under the National Education Policy 2020.
            It stores your complete academic journey digitally — from school to higher education — and is linked to your Aadhaar for verification.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { icon: '🎓', title: 'Lifelong ID', desc: 'Follows you throughout your education journey' },
              { icon: '🔒', title: 'Secure', desc: 'Linked to Aadhaar with consent-based access' },
              { icon: '📜', title: 'Digital Records', desc: 'All academic achievements stored digitally' },
              { icon: '🌐', title: 'Portable', desc: 'Recognized across all educational institutions' },
            ].map(item => (
              <div key={item.title} className="p-3 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]">
                <p className="text-lg mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-[var(--color-text)]">{item.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Records */}
      {apaarData?.records && (
        <Card>
          <CardHeader><CardTitle>Academic Records</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apaarData.records.map((record: any) => (
                <div key={record.year} className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]">
                  <CheckCircle className={`h-4 w-4 flex-shrink-0 ${record.verified ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">{record.school}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Class {record.class} · {record.year}</p>
                  </div>
                  <Badge variant={record.verified ? 'success' : 'default'}>
                    {record.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
