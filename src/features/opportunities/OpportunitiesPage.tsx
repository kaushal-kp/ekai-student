import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, ExternalLink, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/formatters';
import { formatIndianCurrency, daysUntil } from '@/lib/utils';
import api from '@/lib/api';
import { OpportunitiesResponse } from '@/types/api';

const tabs = ['scholarships', 'internships'] as const;

export default function OpportunitiesPage() {
  const [tab, setTab] = useState<'scholarships' | 'internships'>('scholarships');

  const { data, isLoading } = useQuery<OpportunitiesResponse>({
    queryKey: ['opportunities'],
    queryFn: async () => (await api.get('/student/opportunities')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  return (
    <div className="max-w-4xl">
      <PageHeader title="Opportunities" subtitle="Scholarships, internships, and campus events" />

      <div className="flex border-b border-[var(--color-border)] mb-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-secondary)]'}`}
          >
            {t === 'scholarships' ? `Scholarships (${data?.scholarships.length})` : `Internships (${data?.internships.length})`}
          </button>
        ))}
      </div>

      {tab === 'scholarships' && (
        <div className="space-y-4">
          {data?.scholarships.map(sch => {
            const days = daysUntil(sch.deadline);
            return (
              <Card key={sch.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-text)]">{sch.name}</h3>
                      {sch.eligibilityStatus === 'eligible' && (
                        <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Eligible</Badge>
                      )}
                      {sch.eligibilityStatus === 'partial' && (
                        <Badge variant="warning"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{sch.provider}</p>

                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-[var(--color-success)] font-semibold">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatIndianCurrency(sch.amount)}/year
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                        <Calendar className="h-3.5 w-3.5" />
                        Deadline: {formatDate(sch.deadline)}
                        {days <= 30 && <span className="text-[var(--color-danger)]">({days}d left)</span>}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Eligibility:</p>
                      <ul className="space-y-0.5">
                        {sch.eligibilityCriteria.slice(0, 2).map((c, i) => (
                          <li key={i} className="text-xs text-[var(--color-text-secondary)]">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {sch.applicationUrl && (
                    <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                      <a href={sch.applicationUrl} target="_blank" rel="noopener noreferrer">
                        Apply <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'internships' && (
        <div className="space-y-4">
          {data?.internships.map(intern => {
            const days = daysUntil(intern.deadline);
            return (
              <Card key={intern.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-text)]">{intern.role}</h3>
                      {intern.isVerifiedEmployer && <Badge variant="success">✓ Verified</Badge>}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{intern.company}</p>

                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="text-sm font-semibold" style={{ color: intern.stipend > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {intern.stipend > 0 ? `₹${intern.stipend.toLocaleString('en-IN')}/month` : 'Unpaid'}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">{intern.duration}</span>
                      <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">{intern.mode}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">Deadline: {formatDate(intern.deadline)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {intern.skillsRequired.map(s => (
                        <Badge key={s} variant="default">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0">Apply</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
