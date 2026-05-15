import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { formatPercent } from '@/lib/formatters';
import { getGradeColor } from '@/lib/utils';
import api from '@/lib/api';
import { ExamResult } from '@/types/models';
import { ExamType } from '@/types/enums';

export default function PerformancePage() {
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ['exam-results'],
    queryFn: async () => (await api.get('/student/exams/results')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  const examTypes = ['all', ExamType.UNIT_TEST, ExamType.HALF_YEARLY, ExamType.PERIODIC];
  const filtered = selectedExamType === 'all' ? results! : results!.filter(r => r.examType === selectedExamType);

  // Compute subject averages for bar chart
  const subjectMap: Record<string, { scores: number[]; name: string }> = {};
  filtered.forEach(r => {
    if (!subjectMap[r.subjectId]) subjectMap[r.subjectId] = { scores: [], name: r.subjectName };
    subjectMap[r.subjectId].scores.push(r.percentage);
  });
  const barData = Object.values(subjectMap).map(s => ({
    name: s.name.slice(0, 6),
    avg: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length),
    classAvg: 70,
  }));

  const overallAvg = filtered.length > 0
    ? Math.round(filtered.reduce((sum, r) => sum + r.percentage, 0) / filtered.length)
    : 0;

  return (
    <div className="max-w-6xl">
      <PageHeader title="Academic Performance" subtitle="Track your marks, grades, and class rankings" />

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {examTypes.map(t => (
          <button
            key={t}
            onClick={() => setSelectedExamType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedExamType === t ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}
          >
            {t === 'all' ? 'All Exams' : t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card padding="sm">
          <p className="text-xs text-[var(--color-text-muted)]">Overall Average</p>
          <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">{overallAvg}%</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-[var(--color-text-muted)]">Exams Taken</p>
          <p className="text-3xl font-bold text-[var(--color-text)] mt-1">{filtered.length}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-[var(--color-text-muted)]">Best Grade</p>
          <p className="text-3xl font-bold mt-1" style={{ color: getGradeColor('A1') }}>A1</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <Card>
          <CardHeader><CardTitle>Subject Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
                />
                <Legend />
                <Bar dataKey="avg" name="Your Score" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="classAvg" name="Class Average" fill="var(--color-border)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class rank comparison */}
        <Card>
          <CardHeader><CardTitle>Class Rankings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: getGradeColor(r.grade) }}>
                    #{r.classRank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{r.subjectName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{r.examName} · Class avg: {r.classAverage}%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: getGradeColor(r.grade) }}>{formatPercent(r.percentage)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{r.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader><CardTitle>All Results ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Subject', 'Exam', 'Marks', 'Percentage', 'Grade', 'Rank', 'Class Avg'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                    <td className="py-2.5 px-3 font-medium text-[var(--color-text)]">{r.subjectName}</td>
                    <td className="py-2.5 px-3 text-[var(--color-text-secondary)]">{r.examName}</td>
                    <td className="py-2.5 px-3">{r.marksObtained}/{r.maxMarks}</td>
                    <td className="py-2.5 px-3 font-medium">{formatPercent(r.percentage)}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-xs" style={{ color: getGradeColor(r.grade) }}>{r.grade}</span>
                    </td>
                    <td className="py-2.5 px-3">#{r.classRank}</td>
                    <td className="py-2.5 px-3 text-[var(--color-text-muted)]">{r.classAverage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
