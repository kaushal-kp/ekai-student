import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle, Award, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { CoCurricularActivity } from '@/types/models';

export default function CoCurricularPage() {
  const { data: activities, isLoading } = useQuery<CoCurricularActivity[]>({
    queryKey: ['co-curricular'],
    queryFn: async () => (await api.get('/student/co-curricular')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  const levelColors: Record<string, string> = {
    school: 'var(--color-info)',
    district: 'var(--color-success)',
    state: 'var(--color-warning)',
    national: 'var(--color-danger)',
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Co-Curricular Activities" subtitle="Extra-curricular achievements and certificates" />

      <div className="space-y-4">
        {activities?.map(activity => (
          <Card key={activity.id}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">{activity.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="default">{activity.category}</Badge>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium text-white capitalize"
                        style={{ backgroundColor: levelColors[activity.level] || 'var(--color-primary)' }}
                      >
                        {activity.level} Level
                      </span>
                      {activity.isOngoing && <Badge variant="success">Ongoing</Badge>}
                      {activity.isVerified && (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] mt-2">{activity.description}</p>

                <div className="flex gap-4 mt-2 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(activity.startDate)}
                    {activity.endDate && ` — ${formatDate(activity.endDate)}`}
                  </span>
                  {activity.coach && <span>Coach: {activity.coach}</span>}
                </div>

                {activity.performanceNotes && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 italic">
                    📝 {activity.performanceNotes}
                  </p>
                )}

                {activity.certificates.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Certificates</p>
                    <div className="space-y-1.5">
                      {activity.certificates.map(cert => (
                        <div key={cert.id} className="flex items-center gap-2 text-xs">
                          <Award className="h-3.5 w-3.5 text-[var(--color-hub)] flex-shrink-0" />
                          <span className="text-[var(--color-text)]">{cert.name}</span>
                          <span className="text-[var(--color-text-muted)]">·</span>
                          <span className="text-[var(--color-text-muted)]">{cert.issuer}</span>
                          {cert.isVerified && (
                            <Badge variant="success" className="text-xs py-0">Verified</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
