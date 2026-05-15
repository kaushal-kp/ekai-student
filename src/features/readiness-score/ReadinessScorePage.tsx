import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Target, Lightbulb, TrendingUp, BookOpen, CalendarCheck, Clock, FileText, BarChart2, Plus } from 'lucide-react';
import { getReadinessColor } from '@/lib/utils';
import api from '@/lib/api';
import { ReadinessScore } from '@/types/models';
import { ReadinessLevel } from '@/types/enums';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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

const READINESS_LEVEL_CONFIG: Record<ReadinessLevel, { label: string; color: string; bg: string }> = {
  [ReadinessLevel.READY]: { label: 'Exam Ready', color: '#10B981', bg: '#D1FAF0' },
  [ReadinessLevel.NEEDS_PREP]: { label: 'Needs Prep', color: '#F59E0B', bg: '#FEF3C7' },
  [ReadinessLevel.AT_RISK]: { label: 'At Risk', color: '#EF4444', bg: '#FEE2E2' },
  [ReadinessLevel.NOT_STARTED]: { label: 'Not Started', color: '#6B7280', bg: '#F3F4F6' },
};

function AnimatedDonut({ score, size = 180 }: { score: number; size?: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const gradeLabel = score >= 80 ? 'Exam Ready' : score >= 60 ? 'Moderate' : 'At Risk';

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (circleRef.current) {
            circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            circleRef.current.style.strokeDashoffset = String(offset);
          }
        }, 100);
      });
    }
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="var(--color-border)" strokeWidth="12" />
          <circle
            ref={circleRef}
            cx="80" cy="80" r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[48px] font-bold leading-none" style={{ color }}>{score}</span>
          <span className="text-[13px] text-[var(--color-text-muted)] font-medium mt-1">/ 100</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="px-3 py-1 rounded-full text-[12px] font-bold"
          style={{
            color: color,
            background: score >= 80 ? '#D1FAF0' : score >= 60 ? '#FEF3C7' : '#FEE2E2',
          }}
        >
          {gradeLabel}
        </span>
      </div>
    </div>
  );
}

function DimensionBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<any> }) {
  const color = value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2.5 w-[180px] flex-shrink-0">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <span className="text-[13px] font-medium text-[var(--color-text-secondary)] truncate">{label}</span>
      </div>
      <div className="flex-1 relative">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          />
        </div>
      </div>
      <span className="text-[13px] font-bold w-10 text-right flex-shrink-0" style={{ color }}>{value}%</span>
    </div>
  );
}

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] px-4 py-3 shadow-[var(--shadow-lg)] border border-[var(--color-border)]"
      style={{ background: 'var(--color-surface)', backdropFilter: 'blur(12px)' }}>
      <p className="text-[12px] font-semibold text-[var(--color-text)] mb-1">{label}</p>
      <div className="flex items-center gap-2 text-[11px]">
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
        <span className="text-[var(--color-text-secondary)]">Score:</span>
        <span className="font-bold text-[var(--color-text)]">{payload[0]?.value}</span>
      </div>
    </div>
  );
}

function SkeletonReadiness() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="skeleton h-[320px] rounded-[20px]" />
        <div className="lg:col-span-2 skeleton h-[320px] rounded-[20px]" />
      </div>
      <div className="skeleton h-[200px] rounded-[20px]" />
      <div className="skeleton h-[280px] rounded-[20px]" />
    </div>
  );
}

export default function ReadinessScorePage() {
  const { data: readiness, isLoading } = useQuery<ReadinessScore>({
    queryKey: ['readiness-score'],
    queryFn: async () => (await api.get('/student/readiness-score')).data.data,
  });

  if (isLoading) return <SkeletonReadiness />;
  if (!readiness) return null;

  const score = readiness.overall;
  const color = getReadinessColor(score);

  const factors = [
    { label: 'Academic Performance', value: readiness.academicPerformance, icon: BarChart2 },
    { label: 'Attendance', value: readiness.attendance, icon: CalendarCheck },
    { label: 'Syllabus Coverage', value: readiness.syllabusConverage, icon: BookOpen },
    { label: 'Study Consistency', value: readiness.studyConsistency, icon: Clock },
    { label: 'Past Exam Performance', value: readiness.pastExamPerformance, icon: FileText },
  ];

  const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    high: { label: 'High Impact', color: '#EF4444', bg: '#FEE2E2' },
    medium: { label: 'Medium Impact', color: '#F59E0B', bg: '#FEF3C7' },
    low: { label: 'Low Impact', color: '#10B981', bg: '#D1FAF0' },
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-5xl">

      {/* Score + Dimensions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large score display */}
        <div className="rounded-[20px] p-8 flex flex-col items-center justify-center gap-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-[14px] font-semibold text-[var(--color-text-secondary)] tracking-wide">Overall Readiness</p>
          <AnimatedDonut score={score} size={180} />
          <p className="text-[13px] text-[var(--color-text-secondary)] text-center leading-relaxed max-w-[220px]">
            {readiness.aiExplanation.slice(0, 100)}...
          </p>
        </div>

        {/* Dimension bars */}
        <div className="lg:col-span-2 rounded-[20px] p-6"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-[16px] font-bold text-[var(--color-text)] mb-6">Readiness Dimensions</h3>
          <div className="space-y-5">
            {factors.map(f => (
              <DimensionBar key={f.label} label={f.label} value={f.value} icon={f.icon} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Subject grid */}
      <motion.div variants={fadeUp}>
        <div className="rounded-[20px] p-6"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-[16px] font-bold text-[var(--color-text)] mb-5">Subject-wise Readiness</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {readiness.subjectWise.map(s => {
              const subColor = getSubjectColor(s.subjectName);
              const levelCfg = READINESS_LEVEL_CONFIG[s.level];
              return (
                <div key={s.subjectId}
                  className="rounded-[16px] p-4 flex flex-col items-center gap-3"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  {/* Small ring chart */}
                  <div className="relative" style={{ width: 64, height: 64 }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-border)" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="26"
                        fill="none"
                        stroke={subColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={String(2 * Math.PI * 26)}
                        strokeDashoffset={String(2 * Math.PI * 26 * (1 - s.score / 100))}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[14px] font-bold" style={{ color: subColor }}>{s.score}</span>
                    </div>
                  </div>
                  <p className="text-[12px] font-semibold text-[var(--color-text)] text-center leading-tight truncate w-full text-center">
                    {s.subjectName.split(' ')[0]}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: levelCfg.color, background: levelCfg.bg }}>
                    {levelCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* AI Insights + Suggestions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Explanation */}
        <div className="rounded-[20px] p-6"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid var(--color-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}>
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-[15px] font-bold text-[var(--color-text)]">AI Insights</h3>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            {readiness.aiExplanation}
          </p>
        </div>

        {/* Suggestions */}
        <div className="rounded-[20px] p-6"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: 'var(--gradient-success)' }}>
              <Target className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-[15px] font-bold text-[var(--color-text)]">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {readiness.suggestions.slice(0, 4).map(s => {
              const cfg = priorityConfig[s.priority];
              return (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-[12px]"
                  style={{ background: 'var(--color-surface-2)' }}>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                    style={{ color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--color-text)] leading-snug">{s.text}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Expected impact: <span className="font-bold" style={{ color: cfg.color }}>+{s.impact} pts</span>
                    </p>
                  </div>
                  <button className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)] hover:underline whitespace-nowrap">
                    <Plus className="h-3 w-3" /> Planner
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* History chart */}
      <motion.div variants={fadeUp}>
        <div className="rounded-[20px] p-6"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-[15px] font-bold text-[var(--color-text)]">Score History</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={readiness.history}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-primary)', r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }}
                activeDot={{ r: 6, fill: 'var(--color-primary)', strokeWidth: 2, stroke: 'var(--color-surface)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </motion.div>
  );
}
