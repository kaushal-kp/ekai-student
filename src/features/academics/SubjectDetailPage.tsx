import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { Subject } from '@/types/models';

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const { data: subject, isLoading } = useQuery<Subject>({
    queryKey: ['subject', subjectId],
    queryFn: async () => (await api.get(`/student/subjects/${subjectId}`)).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;
  if (!subject) return null;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Subjects
      </button>

      <PageHeader title={subject.name} subtitle={`${subject.code} • ${subject.teacherName}`}>
        <RiskBadge status={subject.status} />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]">
                  <p className="text-2xl font-bold text-[var(--color-text)]">{subject.lastScore ?? '—'}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Last Score</p>
                </div>
                <div className="text-center p-3 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]">
                  <p className="text-2xl font-bold text-[var(--color-text)]">{subject.averageScore ?? '—'}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Average</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-secondary)]">Syllabus Progress</span>
                  <span className="font-medium">{subject.syllabusProgress}%</span>
                </div>
                <ProgressBar value={subject.syllabusProgress} height={8} showLabel />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attendance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold" style={{ color: subject.attendancePercent >= 75 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {subject.attendancePercent}%
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">Subject Attendance</p>
              {subject.attendancePercent < 75 && (
                <div className="mt-3 p-2 bg-[var(--color-danger-light)] rounded-[var(--radius-md)]">
                  <p className="text-xs text-[var(--color-danger)]">⚠️ Below minimum 75% requirement</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Teacher Contact</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <span className="text-[var(--color-primary)] font-bold">{subject.teacherName[0]}</span>
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">{subject.teacherName}</p>
                {subject.teacherEmail && (
                  <a href={`mailto:${subject.teacherEmail}`} className="text-xs text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                    <Mail className="h-3 w-3" /> {subject.teacherEmail}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
