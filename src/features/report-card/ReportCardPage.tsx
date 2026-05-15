import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Printer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { getGradeColor, formatIndianCurrency } from '@/lib/utils';
import { formatPercent } from '@/lib/formatters';
import api from '@/lib/api';
import { ExamResult } from '@/types/models';
import { ExamType } from '@/types/enums';
import { GRADE_COLORS } from '@/lib/constants';

export default function ReportCardPage() {
  const { student } = useAuthStore();
  const [selectedExam, setSelectedExam] = useState<ExamType>(ExamType.UNIT_TEST);

  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ['exam-results'],
    queryFn: async () => (await api.get('/student/exams/results')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  const filtered = results?.filter(r => r.examType === selectedExam) || [];
  const totalMarks = filtered.reduce((sum, r) => sum + r.marksObtained, 0);
  const maxMarks = filtered.reduce((sum, r) => sum + r.maxMarks, 0);
  const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Report Card">
        <Button variant="outline" size="sm">
          <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
        </Button>
      </PageHeader>

      {/* Exam Type Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[ExamType.UNIT_TEST, ExamType.HALF_YEARLY, ExamType.PERIODIC].map(t => (
          <button
            key={t}
            onClick={() => setSelectedExam(t)}
            className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${selectedExam === t ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
          >
            {t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Report Card */}
      <Card>
        {/* Header */}
        <div className="text-center border-b border-[var(--color-border)] pb-4 mb-4">
          <p className="font-bold text-lg text-[var(--color-text)]">{student?.schoolName}</p>
          <p className="text-xs text-[var(--color-text-muted)]">UDISE: {student?.udiseCode} · Board: {student?.board}</p>
          <p className="text-sm font-semibold text-[var(--color-primary)] mt-1">
            {selectedExam.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Report Card
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">Academic Year: {student?.academicYear}</p>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div><span className="text-[var(--color-text-muted)]">Name: </span><strong>{student?.name}</strong></div>
          <div><span className="text-[var(--color-text-muted)]">Roll No: </span><strong>{student?.rollNumber}</strong></div>
          <div><span className="text-[var(--color-text-muted)]">Class: </span><strong>{student?.class}-{student?.section}</strong></div>
          <div><span className="text-[var(--color-text-muted)]">APAAR ID: </span><strong className="font-mono text-xs">{student?.apaarId}</strong></div>
        </div>

        {/* Marks Table */}
        {filtered.length > 0 ? (
          <>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  {['Subject', 'Max', 'Obtained', '%', 'Grade', 'Remarks'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[var(--color-text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-[var(--color-border)]">
                    <td className="py-2.5 px-3 font-medium">{r.subjectName}</td>
                    <td className="py-2.5 px-3 text-[var(--color-text-secondary)]">{r.maxMarks}</td>
                    <td className="py-2.5 px-3 font-semibold">{r.marksObtained}</td>
                    <td className="py-2.5 px-3">{formatPercent(r.percentage)}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold" style={{ color: getGradeColor(r.grade) }}>{r.grade}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-[var(--color-text-muted)]">{r.teacherRemarks?.slice(0, 30)}...</td>
                  </tr>
                ))}
                <tr className="bg-[var(--color-surface-2)] font-semibold">
                  <td className="py-2.5 px-3">Total</td>
                  <td className="py-2.5 px-3">{maxMarks}</td>
                  <td className="py-2.5 px-3">{totalMarks}</td>
                  <td className="py-2.5 px-3" style={{ color: percentage >= 75 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {formatPercent(percentage)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)]">
                Generated via EKAI Student Hub · {new Date().toLocaleDateString('en-IN')}
              </p>
              <Badge variant={percentage >= 75 ? 'success' : 'danger'}>
                {percentage >= 75 ? 'Pass' : 'Needs Improvement'}
              </Badge>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No results available for this exam type.</p>
        )}
      </Card>
    </div>
  );
}
