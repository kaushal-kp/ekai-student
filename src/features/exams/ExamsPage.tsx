import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Bell, BellOff, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useUIStore } from '@/store/uiStore';
import { formatDate, formatPercent } from '@/lib/formatters';
import { daysUntil, getCountdownColor } from '@/lib/utils';
import api from '@/lib/api';
import { UpcomingExam } from '@/types/models';
import { ReadinessLevel } from '@/types/enums';

const tabs = ['upcoming', 'results'] as const;

export default function ExamsPage() {
  const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming');
  const { addToast } = useUIStore();
  const qc = useQueryClient();

  const { data: upcoming, isLoading: loadingUpcoming } = useQuery<UpcomingExam[]>({
    queryKey: ['upcoming-exams'],
    queryFn: async () => (await api.get('/student/exams/upcoming')).data.data,
  });

  const readinessInfo: Record<ReadinessLevel, { color: string; label: string; emoji: string }> = {
    [ReadinessLevel.READY]: { color: 'var(--color-success)', label: 'Ready', emoji: '✅' },
    [ReadinessLevel.NEEDS_PREP]: { color: 'var(--color-warning)', label: 'Needs Prep', emoji: '⚡' },
    [ReadinessLevel.AT_RISK]: { color: 'var(--color-danger)', label: 'At Risk', emoji: '⚠️' },
    [ReadinessLevel.NOT_STARTED]: { color: 'var(--color-text-muted)', label: 'Not Started', emoji: '📖' },
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Exams" subtitle="Track upcoming exams and view past results" />

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
          >
            {t === 'upcoming' ? 'Upcoming Exams' : 'Past Results'}
          </button>
        ))}
      </div>

      {tab === 'upcoming' && (
        <>
          {loadingUpcoming ? <LoadingSpinner /> : (
            <div className="space-y-4">
              {upcoming?.map(exam => {
                const days = daysUntil(exam.date);
                const info = readinessInfo[exam.readinessLevel];
                return (
                  <Card key={exam.id}>
                    <div className="flex items-start gap-4">
                      {/* Countdown */}
                      <div
                        className="w-16 h-16 rounded-[var(--radius-lg)] flex flex-col items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: getCountdownColor(days) }}
                      >
                        <p className="text-2xl font-bold leading-none">{days}</p>
                        <p className="text-xs mt-0.5">days</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="font-semibold text-[var(--color-text)]">{exam.subjectName}</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">{exam.examType.replace('_', ' ').toUpperCase()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiskBadge status={exam.readinessLevel} />
                            <span className="text-sm font-bold" style={{ color: info.color }}>{exam.readinessScore}%</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(exam.date)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{exam.venue}</span>
                        </div>

                        {exam.syllabusChapters.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Syllabus:</p>
                            <div className="flex flex-wrap gap-1">
                              {exam.syllabusChapters.map((ch, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] rounded-full">{ch}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {exam.readinessLevel === ReadinessLevel.AT_RISK && (
                      <div className="mt-3 p-2.5 bg-[var(--color-danger-light)] rounded-[var(--radius-md)] flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[var(--color-danger)] flex-shrink-0" />
                        <p className="text-xs text-[var(--color-danger)]">
                          Your readiness score is low. Increase study time immediately.
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'results' && (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>View detailed results in Performance tab</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.href = '/performance'}>
            Go to Performance
          </Button>
        </div>
      )}
    </div>
  );
}
