import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ROUTES } from '@/lib/constants';
import { formatPercent } from '@/lib/formatters';
import api from '@/lib/api';
import { Subject } from '@/types/models';
import { SubjectStatus } from '@/types/enums';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const statusColors: Record<SubjectStatus, string> = {
  [SubjectStatus.ON_TRACK]: 'var(--color-success)',
  [SubjectStatus.NEEDS_ATTENTION]: 'var(--color-warning)',
  [SubjectStatus.AT_RISK]: 'var(--color-danger)',
};

export default function AcademicsPage() {
  const navigate = useNavigate();
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/student/subjects')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  const atRisk = subjects?.filter(s => s.status === SubjectStatus.AT_RISK) || [];
  const needsAttention = subjects?.filter(s => s.status === SubjectStatus.NEEDS_ATTENTION) || [];
  const onTrack = subjects?.filter(s => s.status === SubjectStatus.ON_TRACK) || [];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Subjects"
        subtitle={`${subjects?.length || 0} subjects enrolled • Academic Year 2024-25`}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'On Track', count: onTrack.length, color: 'var(--color-success)', bg: 'var(--color-success-light)' },
          { label: 'Needs Attention', count: needsAttention.length, color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
          { label: 'At Risk', count: atRisk.length, color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
        ].map(s => (
          <div key={s.label} className="text-center p-3 rounded-[var(--radius-lg)]" style={{ backgroundColor: s.bg }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects?.map(subject => (
          <motion.div key={subject.id} variants={item}>
            <Card
              hover
              onClick={() => navigate(`/academics/${subject.id}`)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: statusColors[subject.status] }}
                  >
                    {subject.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">{subject.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{subject.code}</p>
                  </div>
                </div>
                <RiskBadge status={subject.status} />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">Syllabus Progress</span>
                  <span className="font-medium text-[var(--color-text)]">{subject.syllabusProgress}%</span>
                </div>
                <ProgressBar value={subject.syllabusProgress} color={statusColors[subject.status]} height={6} />

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="text-center">
                    <p className="text-sm font-bold text-[var(--color-text)]">{subject.lastScore ?? '—'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Last Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[var(--color-text)]">{subject.averageScore ?? '—'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Average</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: subject.attendancePercent >= 75 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {subject.attendancePercent}%
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">Attendance</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-1">
                  <Users className="h-3 w-3 text-[var(--color-text-muted)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">{subject.teacherName}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
