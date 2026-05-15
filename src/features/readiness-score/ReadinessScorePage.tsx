import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Target, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { Badge } from '@/components/ui/Badge';
import { getReadinessColor } from '@/lib/utils';
import api from '@/lib/api';
import { ReadinessScore } from '@/types/models';

export default function ReadinessScorePage() {
  const { data: readiness, isLoading } = useQuery<ReadinessScore>({
    queryKey: ['readiness-score'],
    queryFn: async () => (await api.get('/student/readiness-score')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;
  if (!readiness) return null;

  const color = getReadinessColor(readiness.overall);

  const factors = [
    { label: 'Academic Performance', value: readiness.academicPerformance, icon: '📊' },
    { label: 'Attendance', value: readiness.attendance, icon: '✅' },
    { label: 'Syllabus Coverage', value: readiness.syllabusConverage, icon: '📚' },
    { label: 'Study Consistency', value: readiness.studyConsistency, icon: '⏰' },
    { label: 'Past Exam Performance', value: readiness.pastExamPerformance, icon: '📝' },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader title="Readiness Score" subtitle="Your overall exam preparation status" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Big Score */}
        <Card className="flex flex-col items-center justify-center py-6">
          <div className="relative w-32 h-32 mb-3">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={color}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - readiness.overall / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold" style={{ color }}>{readiness.overall}</p>
              <p className="text-xs text-[var(--color-text-muted)]">/ 100</p>
            </div>
          </div>
          <p className="font-semibold text-[var(--color-text)]">Overall Readiness</p>
          <Badge variant={readiness.overall >= 80 ? 'success' : readiness.overall >= 60 ? 'warning' : 'danger'} className="mt-2">
            {readiness.overall >= 80 ? 'Exam Ready' : readiness.overall >= 60 ? 'Needs Prep' : 'At Risk'}
          </Badge>
        </Card>

        {/* Factors */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Readiness Factors</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factors.map(f => (
                <div key={f.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[var(--color-text-secondary)]">{f.icon} {f.label}</span>
                    <span className="text-xs font-medium text-[var(--color-text)]">{f.value}%</span>
                  </div>
                  <ProgressBar value={f.value} color={getReadinessColor(f.value)} height={6} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Explanation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[var(--color-hub)]" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{readiness.aiExplanation}</p>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--color-primary)]" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {readiness.suggestions.map(s => (
              <div key={s.id} className={`flex items-start gap-3 p-3 rounded-[var(--radius-md)] ${
                s.priority === 'high' ? 'bg-[var(--color-danger-light)]' :
                s.priority === 'medium' ? 'bg-[var(--color-warning-light)]' : 'bg-[var(--color-surface-2)]'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                  s.priority === 'high' ? 'bg-[var(--color-danger)]' :
                  s.priority === 'medium' ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-text-muted)]'
                }`}>
                  {s.priority === 'high' ? '!' : s.priority === 'medium' ? '~' : '•'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-text)]">{s.text}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Estimated impact: +{s.impact} points
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Subject-wise Readiness</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {readiness.subjectWise.map(s => (
              <div key={s.subjectId} className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0">
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">{s.subjectName}</p>
                </div>
                <div className="flex-1">
                  <ProgressBar value={s.score} color={getReadinessColor(s.score)} height={6} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium text-[var(--color-text)] w-8 text-right">{s.score}%</span>
                  <RiskBadge status={s.level} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History Chart */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Score History</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={readiness.history}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
