import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, TrendingUp, ChevronRight, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ROUTES } from '@/lib/constants';
import { formatPercent } from '@/lib/formatters';
import api from '@/lib/api';
import { Subject } from '@/types/models';
import { SubjectStatus } from '@/types/enums';

const SUBJECT_COLORS: Record<string, { color: string; gradient: string }> = {
  Mathematics: { color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
  Science: { color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
  English: { color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
  Hindi: { color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)' },
  'Social Science': { color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
  'Computer Science': { color: '#6C63FF', gradient: 'linear-gradient(135deg, #6C63FF, #9C8FFF)' },
  'Physical Education': { color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #FB923C)' },
};

function getSubjectStyle(name: string) {
  for (const [key, val] of Object.entries(SUBJECT_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) return val;
  }
  return { color: '#6C63FF', gradient: 'linear-gradient(135deg, #6C63FF, #9C8FFF)' };
}

const STATUS_CONFIG: Record<SubjectStatus, { label: string; color: string; bg: string }> = {
  [SubjectStatus.ON_TRACK]: { label: 'On Track', color: '#10B981', bg: '#D1FAF0' },
  [SubjectStatus.NEEDS_ATTENTION]: { label: 'Needs Attention', color: '#F59E0B', bg: '#FEF3C7' },
  [SubjectStatus.AT_RISK]: { label: 'At Risk', color: '#EF4444', bg: '#FEE2E2' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

type FilterType = 'all' | SubjectStatus;

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton rounded-[20px] h-[200px]" />
      ))}
    </div>
  );
}

export default function AcademicsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/student/subjects')).data.data,
  });

  const onTrack = subjects?.filter(s => s.status === SubjectStatus.ON_TRACK) || [];
  const needsAttention = subjects?.filter(s => s.status === SubjectStatus.NEEDS_ATTENTION) || [];
  const atRisk = subjects?.filter(s => s.status === SubjectStatus.AT_RISK) || [];

  const filtered = (subjects || []).filter(s => {
    const matchFilter = filter === 'all' || s.status === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const avgScore = subjects?.length
    ? Math.round(subjects.reduce((sum, s) => sum + (s.averageScore || 0), 0) / subjects.length)
    : 0;

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title="Subjects" subtitle={`${subjects?.length || 0} subjects · Academic Year 2024–25`} />

      {/* Overview summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall Avg', value: `${avgScore}%`, gradient: 'var(--gradient-primary)', icon: '📊' },
            { label: 'On Track', value: onTrack.length, gradient: 'linear-gradient(135deg, #10B981, #34D399)', icon: '✅' },
            { label: 'Needs Attention', value: needsAttention.length, gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', icon: '⚡' },
            { label: 'At Risk', value: atRisk.length, gradient: 'linear-gradient(135deg, #EF4444, #F87171)', icon: '⚠️' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-[16px] p-4 flex items-center gap-3"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: s.gradient }}>
                <span className="text-[18px]">{s.icon}</span>
              </div>
              <div>
                <p className="text-[22px] font-bold text-[var(--color-text)] leading-tight">{s.value}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filter + Search bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 p-1 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          {([['all', 'All Subjects'], [SubjectStatus.ON_TRACK, 'On Track'], [SubjectStatus.NEEDS_ATTENTION, 'Needs Attention'], [SubjectStatus.AT_RISK, 'At Risk']] as [FilterType, string][]).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className="px-3 py-1.5 rounded-[9px] text-[12px] font-medium transition-all"
              style={filter === v ? {
                background: 'var(--color-surface)',
                color: 'var(--color-primary)',
                boxShadow: 'var(--shadow-sm)',
              } : {
                color: 'var(--color-text-secondary)',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="pl-8 pr-3 py-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] w-48"
          />
        </div>
      </div>

      {/* Subject grid */}
      {isLoading ? <SkeletonGrid /> : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(subject => {
              const style = getSubjectStyle(subject.name);
              const status = STATUS_CONFIG[subject.status];
              return (
                <motion.div
                  key={subject.id}
                  variants={fadeUp}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/academics/${subject.id}`)}
                  className="rounded-[20px] overflow-hidden cursor-pointer group shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  {/* Colored header band */}
                  <div className="h-2 w-full" style={{ background: style.gradient }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0"
                          style={{ background: style.gradient }}>
                          {subject.name[0]}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[var(--color-text)]">{subject.name}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">{subject.code}</p>
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Teacher */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: style.gradient }}>
                        {subject.teacherName[0]}
                      </div>
                      <span className="text-[12px] text-[var(--color-text-secondary)]">{subject.teacherName}</span>
                    </div>

                    {/* Syllabus progress */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                          <span className="text-[var(--color-text-secondary)]">Syllabus Progress</span>
                          <span className="font-semibold" style={{ color: style.color }}>{subject.syllabusProgress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subject.syllabusProgress}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ background: style.gradient }}
                          />
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {[
                          { label: 'Last Score', value: subject.lastScore !== undefined ? `${subject.lastScore}%` : '—' },
                          { label: 'Average', value: subject.averageScore !== undefined ? `${subject.averageScore}%` : '—' },
                          {
                            label: 'Attendance',
                            value: `${subject.attendancePercent}%`,
                            color: subject.attendancePercent >= 75 ? '#10B981' : '#EF4444',
                          },
                        ].map(stat => (
                          <div key={stat.label} className="text-center p-2 rounded-[8px]" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[13px] font-bold" style={{ color: stat.color || 'var(--color-text)' }}>{stat.value}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-3 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-text-muted)]">View details</span>
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-[56px] mb-4">📚</span>
          <p className="text-[16px] font-semibold text-[var(--color-text)]">No subjects found</p>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-1">Try adjusting your filter or search</p>
        </div>
      )}
    </div>
  );
}
