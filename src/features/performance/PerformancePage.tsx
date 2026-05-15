import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, Legend, AreaChart, Area,
  LineChart, Line
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { TrendingUp, Lightbulb, Medal } from 'lucide-react';
import { formatPercent } from '@/lib/formatters';
import { getGradeColor } from '@/lib/utils';
import api from '@/lib/api';
import { ExamResult } from '@/types/models';
import { ExamType } from '@/types/enums';

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#3B82F6',
  Science: '#10B981',
  English: '#8B5CF6',
  Hindi: '#F59E0B',
  'Social Science': '#EF4444',
  'Computer Science': '#6C63FF',
  'Physical Education': '#F97316',
};

function getSubjectColor(name: string) {
  for (const [k, v] of Object.entries(SUBJECT_COLORS)) {
    if (name.includes(k) || k.includes(name)) return v;
  }
  return '#6C63FF';
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] px-4 py-3 shadow-[var(--shadow-lg)] border border-[var(--color-border)]"
      style={{ background: 'var(--color-surface)', backdropFilter: 'blur(12px)' }}>
      <p className="text-[12px] font-semibold text-[var(--color-text)] mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--color-text-secondary)]">{p.name}:</span>
          <span className="font-bold text-[var(--color-text)]">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

type FilterType = 'all' | ExamType;

export default function PerformancePage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ['exam-results'],
    queryFn: async () => (await api.get('/student/exams/results')).data.data,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl space-y-6">
        <PageHeader title="Performance" subtitle="Your academic performance analysis" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-[16px]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-64 rounded-[20px]" />
          <div className="skeleton h-64 rounded-[20px]" />
        </div>
        <div className="skeleton h-80 rounded-[20px]" />
      </div>
    );
  }

  const examTypes: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Exams' },
    { key: ExamType.UNIT_TEST, label: 'Unit Test' },
    { key: ExamType.HALF_YEARLY, label: 'Half Yearly' },
    { key: ExamType.PERIODIC, label: 'Periodic' },
  ];

  const filtered = filter === 'all' ? (results || []) : (results || []).filter(r => r.examType === filter);

  const subjectMap: Record<string, { scores: number[]; name: string; color: string }> = {};
  filtered.forEach(r => {
    if (!subjectMap[r.subjectId]) {
      subjectMap[r.subjectId] = { scores: [], name: r.subjectName, color: getSubjectColor(r.subjectName) };
    }
    subjectMap[r.subjectId].scores.push(r.percentage);
  });

  const barData = Object.values(subjectMap).map(s => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    avg: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length),
    classAvg: 70,
    color: s.color,
  }));

  const overallAvg = filtered.length
    ? Math.round(filtered.reduce((sum, r) => sum + r.percentage, 0) / filtered.length)
    : 0;

  const bestResult = filtered.reduce<ExamResult | null>((best, r) => (!best || r.percentage > best.percentage) ? r : best, null);
  const bestSubject = bestResult?.subjectName || '—';

  // Trend data for area chart (grouped by subject with time)
  const trendBySubject: Record<string, { name: string; color: string; dataPoints: { exam: string; score: number }[] }> = {};
  filtered.forEach(r => {
    if (!trendBySubject[r.subjectId]) {
      trendBySubject[r.subjectId] = { name: r.subjectName, color: getSubjectColor(r.subjectName), dataPoints: [] };
    }
    trendBySubject[r.subjectId].dataPoints.push({ exam: r.examName.slice(0, 8), score: r.percentage });
  });

  // AI insights
  const lowSubjects = Object.values(subjectMap).filter(s => {
    const avg = s.scores.reduce((a, b) => a + b, 0) / s.scores.length;
    return avg < 60;
  });

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title="Academic Performance" subtitle="Marks, grades, and class rankings across all exams" />

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {examTypes.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className="px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all"
            style={filter === t.key ? {
              background: 'var(--gradient-primary)',
              color: 'white',
              boxShadow: 'var(--shadow-glow)',
            } : {
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-4">
        {[
          { label: 'Overall Average', value: `${overallAvg}%`, gradient: 'var(--gradient-primary)', icon: '📊' },
          { label: 'Exams Taken', value: filtered.length, gradient: 'linear-gradient(135deg, #10B981, #34D399)', icon: '📝' },
          { label: 'Best Subject', value: bestSubject.split(' ')[0], gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)', icon: '⭐' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="rounded-[18px] p-5 flex items-center gap-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] flex-shrink-0"
              style={{ background: s.gradient }}>
              {s.icon}
            </div>
            <div>
              <p className="text-[11px] text-[var(--color-text-muted)]">{s.label}</p>
              <p className="text-[24px] font-bold text-[var(--color-text)] leading-tight">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - subject comparison */}
        <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-5">Subject Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4} barCategoryGap={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{v}</span>}
              />
              <Bar dataKey="avg" name="Your Score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
              <Bar dataKey="classAvg" name="Class Avg" fill="var(--color-border)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rankings */}
        <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-5">Class Rankings</h3>
          <div className="space-y-3">
            {filtered.slice(0, 5).map(r => {
              const gradeColor = getGradeColor(r.grade);
              const subColor = getSubjectColor(r.subjectName);
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ background: r.classRank <= 3 ? '#F59E0B' : r.classRank <= 10 ? '#6C63FF' : '#9CA3AF' }}
                  >
                    #{r.classRank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-text)] truncate">{r.subjectName}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{r.examName} · Class avg: {r.classAverage}%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[13px] font-bold px-2.5 py-0.5 rounded-[8px]"
                      style={{ color: gradeColor, background: `${gradeColor}18` }}>
                      {r.grade}
                    </span>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{formatPercent(r.percentage)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insights panel */}
      {lowSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-6"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--gradient-primary)' }}>
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--color-text)] mb-2">AI-Powered Insights 🤖</p>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
                Based on your performance analysis, here are personalized recommendations:
              </p>
              <ul className="space-y-1.5">
                {lowSubjects.map(s => (
                  <li key={s.name} className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-warning)] mt-0.5">⚡</span>
                    <span>Your average in <strong style={{ color: getSubjectColor(s.name) }}>{s.name}</strong> is below 60%. Focus more study time on this subject.</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-[13px] text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-success)] mt-0.5">✅</span>
                  <span>Overall average of {overallAvg}% is {overallAvg >= 70 ? 'good' : 'needs improvement'}. Keep consistent with your study schedule.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results table */}
      <div className="rounded-[20px] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-[15px] font-bold text-[var(--color-text)]">All Results ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                {['Subject', 'Exam', 'Marks', 'Percentage', 'Grade', 'Rank', 'Class Avg'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const gradeColor = getGradeColor(r.grade);
                const subColor = getSubjectColor(r.subjectName);
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-7 rounded-full flex-shrink-0" style={{ background: subColor }} />
                        <span className="text-[13px] font-semibold text-[var(--color-text)]">{r.subjectName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[var(--color-text-secondary)]">{r.examName}</td>
                    <td className="py-3 px-4 text-[13px] font-medium text-[var(--color-text)]">
                      {r.marksObtained}<span className="text-[var(--color-text-muted)]">/{r.maxMarks}</span>
                    </td>
                    <td className="py-3 px-4 text-[13px] font-semibold text-[var(--color-text)]">{formatPercent(r.percentage)}</td>
                    <td className="py-3 px-4">
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-[6px]"
                        style={{ color: gradeColor, background: `${gradeColor}18` }}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-[var(--color-text-secondary)]">#{r.classRank}</td>
                    <td className="py-3 px-4 text-[12px] text-[var(--color-text-muted)]">{r.classAverage}%</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
