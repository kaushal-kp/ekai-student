import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, BookOpen, AlertTriangle, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useUIStore } from '@/store/uiStore';
import { formatDate, formatPercent } from '@/lib/formatters';
import { daysUntil, getCountdownColor } from '@/lib/utils';
import api from '@/lib/api';
import { UpcomingExam } from '@/types/models';
import { ReadinessLevel } from '@/types/enums';

type Tab = 'upcoming' | 'results' | 'preparation';

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

const READINESS_CONFIG: Record<ReadinessLevel, { color: string; bg: string; label: string; emoji: string }> = {
  [ReadinessLevel.READY]: { color: '#10B981', bg: '#D1FAF0', label: 'Ready', emoji: '✅' },
  [ReadinessLevel.NEEDS_PREP]: { color: '#F59E0B', bg: '#FEF3C7', label: 'Needs Prep', emoji: '⚡' },
  [ReadinessLevel.AT_RISK]: { color: '#EF4444', bg: '#FEE2E2', label: 'At Risk', emoji: '⚠️' },
  [ReadinessLevel.NOT_STARTED]: { color: '#6B7280', bg: '#F3F4F6', label: 'Not Started', emoji: '📖' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ExamsPage() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const { addToast } = useUIStore();

  const { data: upcoming, isLoading } = useQuery<UpcomingExam[]>({
    queryKey: ['upcoming-exams'],
    queryFn: async () => (await api.get('/student/exams/upcoming')).data.data,
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'results', label: 'Results' },
    { key: 'preparation', label: 'Preparation' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Exams" subtitle="Track upcoming exams, results, and preparation status" />

      {/* Pill tab switcher */}
      <div className="flex gap-1 p-1 rounded-[14px] bg-[var(--color-surface-2)] border border-[var(--color-border)] w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative px-5 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-200"
            style={tab === t.key ? { color: 'var(--color-primary)' } : { color: 'var(--color-text-secondary)' }}
          >
            {tab === t.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-[10px]"
                style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'upcoming' && (
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-[160px] rounded-[20px]" />)}
              </div>
            ) : upcoming?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="text-[56px] mb-4">🎉</span>
                <p className="text-[16px] font-semibold text-[var(--color-text)]">No upcoming exams</p>
                <p className="text-[13px] text-[var(--color-text-muted)] mt-1">Enjoy the break! New exams will appear here.</p>
              </div>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
                {upcoming?.map(exam => {
                  const days = daysUntil(exam.date);
                  const subStyle = getSubjectStyle(exam.subjectName);
                  const readiness = READINESS_CONFIG[exam.readinessLevel];
                  const urgencyColor = getCountdownColor(days);

                  return (
                    <motion.div
                      key={exam.id}
                      variants={fadeUp}
                      whileHover={{ y: -2 }}
                      className="rounded-[20px] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      {/* Gradient header */}
                      <div className="px-6 py-4 flex items-center justify-between" style={{ background: `${subStyle.color}18` }}>
                        <div>
                          <h3 className="text-[16px] font-bold" style={{ color: subStyle.color }}>{exam.subjectName}</h3>
                          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                            {exam.examType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[13px] font-bold px-3 py-1.5 rounded-full"
                            style={{ background: readiness.bg, color: readiness.color }}
                          >
                            {readiness.emoji} {readiness.label}
                          </span>
                          <div
                            className="w-[62px] h-[62px] rounded-[14px] flex flex-col items-center justify-center text-white flex-shrink-0"
                            style={{ background: urgencyColor }}
                          >
                            <span className="text-[22px] font-bold leading-none">{days}</span>
                            <span className="text-[10px] font-medium mt-0.5">days</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4">
                        <div className="flex flex-wrap gap-4 text-[12px] text-[var(--color-text-secondary)] mb-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" style={{ color: subStyle.color }} />
                            {formatDate(exam.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" style={{ color: subStyle.color }} />
                            {exam.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" style={{ color: subStyle.color }} />
                            {exam.venue}
                          </span>
                        </div>

                        {/* Readiness bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-[12px] mb-2">
                            <span className="font-medium text-[var(--color-text-secondary)]">Readiness Score</span>
                            <span className="font-bold" style={{ color: readiness.color }}>{exam.readinessScore}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden bg-[var(--color-surface-2)]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${exam.readinessScore}%` }}
                              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full"
                              style={{ background: readiness.color }}
                            />
                          </div>
                        </div>

                        {/* Syllabus chapters */}
                        {exam.syllabusChapters.length > 0 && (
                          <div>
                            <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5" /> Syllabus ({exam.syllabusChapters.length} chapters)
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {exam.syllabusChapters.slice(0, 5).map((ch, i) => (
                                <span key={i}
                                  className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                                  style={{ background: `${subStyle.color}15`, color: subStyle.color }}
                                >
                                  {ch}
                                </span>
                              ))}
                              {exam.syllabusChapters.length > 5 && (
                                <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                                  +{exam.syllabusChapters.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {exam.readinessLevel === ReadinessLevel.AT_RISK && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-3 rounded-[12px] flex items-center gap-2"
                            style={{ background: 'var(--color-danger-light)', border: '1px solid #FCA5A5' }}
                          >
                            <AlertTriangle className="h-4 w-4 text-[var(--color-danger)] flex-shrink-0" />
                            <p className="text-[12px] text-[var(--color-danger)]">
                              <strong>Action needed!</strong> Your readiness score is critically low. Start studying immediately.
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <span className="text-[56px] mb-4">📊</span>
            <p className="text-[16px] font-semibold text-[var(--color-text)]">Results are in Performance</p>
            <p className="text-[13px] text-[var(--color-text-muted)] mt-1 mb-4">Detailed results and analysis are in the Performance section</p>
            <a
              href="/performance"
              className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-white text-[13px] font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Go to Performance <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>
        )}

        {tab === 'preparation' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <span className="text-[56px] mb-4">🎯</span>
            <p className="text-[16px] font-semibold text-[var(--color-text)]">Study Planner coming soon</p>
            <p className="text-[13px] text-[var(--color-text-muted)] mt-1">Personalized study schedules based on your exam dates and readiness scores</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
