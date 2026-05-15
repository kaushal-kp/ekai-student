import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Target, Flame, Trophy, ChevronRight,
  CalendarDays, MapPin, Megaphone,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import { getGreeting, getGradeColor, daysUntil } from '@/lib/utils';
import api from '@/lib/api';
import { DashboardData } from '@/types/api';

/* ─── Subject colours ─────────────────────────────────────── */
const SUBJ: Record<string, string> = {
  Mathematics: '#3B82F6',
  Science: '#10B981',
  English: '#8B5CF6',
  Hindi: '#F59E0B',
  'Social Science': '#EF4444',
  'Computer Science': '#6366F1',
  'Physical Education': '#F97316',
};

function subjectColor(name: string): string {
  for (const [k, v] of Object.entries(SUBJ)) {
    if (name.toLowerCase().includes(k.toLowerCase().split(' ')[0])) return v;
  }
  return '#6366F1';
}

function urgencyColor(days: number) {
  if (days <= 3) return { bg: '#FEF2F2', text: '#DC2626' };
  if (days <= 7) return { bg: '#FFFBEB', text: '#D97706' };
  return { bg: '#F0FDF4', text: '#059669' };
}

/* ─── Animated counter ────────────────────────────────────── */
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const duration = 1100;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      if (ref.current) ref.current.textContent = prefix + Math.round(eased * to) + suffix;
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [to, prefix, suffix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ─── Readiness donut ─────────────────────────────────────── */
function ReadinessDonut({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative" style={{ width: 128, height: 128 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[{ value: score }, { value: 100 - score }]}
            cx="50%" cy="50%"
            innerRadius={44} outerRadius={58}
            startAngle={90} endAngle={-270}
            dataKey="value" strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#EEF0F8" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[30px] font-bold leading-none" style={{ color: '#0F172A' }}>{score}</span>
        <span className="text-[11px] font-medium mt-0.5" style={{ color: '#94A3B8' }}>/ 100</span>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonDash() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 rounded-2xl bg-slate-100 w-80" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-36 rounded-2xl bg-slate-100" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 h-80 rounded-2xl bg-slate-100" />
        <div className="h-80 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

/* ─── Animation presets ───────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ─── Card wrapper ────────────────────────────────────────── */
const CARD_SHADOW = '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)';
const CARD_SHADOW_HOVER = '0 8px 24px rgba(15,23,42,0.10)';

function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ boxShadow: CARD_SHADOW }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title, action, onAction,
}: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-6 pt-5 pb-4"
      style={{ borderBottom: '1px solid #F1F5F9' }}
    >
      <h2 className="text-[15px] font-semibold" style={{ color: '#0F172A' }}>{title}</h2>
      {action && onAction && (
        <button
          onClick={e => { e.stopPropagation(); onAction(); }}
          className="flex items-center gap-1 text-[13px] font-medium"
          style={{ color: '#6366F1' }}
        >
          {action} <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { student } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/student/dashboard')).data.data,
  });

  if (isLoading) return <SkeletonDash />;

  const d = dashboard!;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const nowMins = today.getHours() * 60 + today.getMinutes();

  const currentPeriodIdx = d.todayTimetable.findIndex(t => {
    if (!t.teacher) return false;
    const [sh, sm] = t.startTime.split(':').map(Number);
    const [eh, em] = t.endTime.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
  });

  const statCards = [
    {
      label: 'Attendance',
      value: d.stats.attendancePercent,
      suffix: '%',
      sub: 'This month',
      trend: d.stats.attendanceTrend,
      icon: <CalendarCheck className="h-5 w-5 text-white" />,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      path: ROUTES.ATTENDANCE,
    },
    {
      label: 'Readiness Score',
      value: d.readinessScore,
      suffix: '',
      sub: 'Out of 100',
      icon: <Target className="h-5 w-5 text-white" />,
      gradient:
        d.readinessScore >= 80
          ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
          : d.readinessScore >= 60
            ? 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      path: ROUTES.READINESS_SCORE,
    },
    {
      label: 'Study Streak',
      value: d.stats.studyStreak,
      suffix: '',
      sub: 'days — keep it up! 🔥',
      icon: <Flame className="h-5 w-5 text-white" />,
      gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      path: ROUTES.PERFORMANCE,
    },
    {
      label: 'Class Rank',
      value: d.stats.classRank,
      prefix: '#',
      suffix: '',
      sub: `of ${d.stats.totalStudents} students`,
      icon: <Trophy className="h-5 w-5 text-white" />,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      path: ROUTES.PERFORMANCE,
    },
  ] as const;

  const readinessSubjects = [
    { name: 'Mathematics', score: 68 },
    { name: 'Science', score: 45 },
    { name: 'English', score: 85 },
    { name: 'Hindi', score: 78 },
    { name: 'Social Science', score: 52 },
    { name: 'Computer Science', score: 92 },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {/* ── PAGE HEADER ────────────────────────────────────── */}
      <motion.div variants={fade} className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-[28px] font-bold tracking-tight leading-tight"
              style={{ color: '#0F172A' }}
            >
              {getGreeting()}, {student?.firstName}! 👋
            </h1>
            <p className="text-[14px] mt-1.5 font-medium" style={{ color: '#94A3B8' }}>
              {dateStr}&nbsp;·&nbsp;{student?.schoolName}&nbsp;·&nbsp;Class {student?.class}-{student?.section}
            </p>
          </div>
          <span
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold mt-1"
            style={{ background: '#EEF2FF', color: '#6366F1' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] inline-block" />
            APAAR Verified
          </span>
        </div>
      </motion.div>

      {/* ── STAT CARDS ─────────────────────────────────────── */}
      <motion.div variants={fade} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-2xl p-6 cursor-pointer border border-slate-100 transition-all duration-200"
            style={{ boxShadow: CARD_SHADOW }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = CARD_SHADOW)}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: card.gradient,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {card.icon}
              </div>
              {'trend' in card && card.trend !== undefined && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: card.trend > 0 ? '#F0FDF4' : '#FEF2F2',
                    color: card.trend > 0 ? '#16A34A' : '#DC2626',
                  }}
                >
                  {card.trend > 0 ? '+' : ''}{card.trend}%
                </span>
              )}
            </div>
            <div
              className="text-[34px] font-bold tracking-tight leading-none"
              style={{ color: '#0F172A' }}
            >
              <Counter to={card.value} prefix={'prefix' in card ? card.prefix : ''} suffix={card.suffix} />
            </div>
            <p className="text-[13px] font-semibold mt-2" style={{ color: '#334155' }}>{card.label}</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── SCHEDULE + READINESS ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Today's Schedule */}
        <motion.div variants={fade} className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Today's Schedule"
              action="Full timetable"
              onAction={() => navigate(ROUTES.ACADEMICS)}
            />
            <div>
              {d.todayTimetable.map((period, idx) => {
                const isBreak = !period.teacher;
                const color = isBreak ? '#CBD5E1' : subjectColor(period.subject);
                const isNow = idx === currentPeriodIdx;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-5 px-6 py-4 transition-colors"
                    style={{
                      background: isNow ? `${color}0C` : 'transparent',
                      borderBottom: idx < d.todayTimetable.length - 1 ? '1px solid #F8FAFC' : 'none',
                    }}
                  >
                    <div className="w-10 flex-shrink-0">
                      <span className="text-[12px] font-medium tabular-nums" style={{ color: '#94A3B8' }}>
                        {period.startTime}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: color,
                          boxShadow: isNow ? `0 0 0 4px ${color}30` : 'none',
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-[14px] font-semibold truncate"
                          style={{ color: isBreak ? '#94A3B8' : '#0F172A' }}
                        >
                          {period.subject}
                        </p>
                        {isNow && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: color }}
                          >
                            NOW
                          </span>
                        )}
                      </div>
                      {!isBreak && (
                        <p className="text-[12px] mt-0.5 truncate" style={{ color: '#94A3B8' }}>
                          {period.teacher}&nbsp;·&nbsp;{period.room}
                        </p>
                      )}
                    </div>
                    {!isBreak && (
                      <div
                        className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg font-medium"
                        style={{ background: '#F8FAFC', color: '#94A3B8' }}
                      >
                        – {period.endTime}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Exam Readiness */}
        <motion.div variants={fade}>
          <Card className="h-full">
            <CardHeader
              title="Exam Readiness"
              action="Details"
              onAction={() => navigate(ROUTES.READINESS_SCORE)}
            />
            <div className="px-6 py-5">
              <div className="flex justify-center mb-6">
                <ReadinessDonut score={d.readinessScore} />
              </div>
              <div className="space-y-3.5">
                {readinessSubjects.map(s => {
                  const color = subjectColor(s.name);
                  return (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-medium truncate pr-2" style={{ color: '#475569' }}>
                          {s.name}
                        </span>
                        <span className="text-[12px] font-bold flex-shrink-0" style={{ color: '#0F172A' }}>
                          {s.score}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${s.score}%` }}
                          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── UPCOMING EXAMS ─────────────────────────────────── */}
      <motion.div variants={fade} className="mb-5">
        <Card>
          <CardHeader title="Upcoming Exams" action="View all" onAction={() => navigate(ROUTES.EXAMS)} />
          <div className="px-6 pb-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {d.upcomingExams.slice(0, 3).map(exam => {
                const days = daysUntil(exam.date);
                const color = subjectColor(exam.subjectName);
                const { bg, text } = urgencyColor(days);
                return (
                  <motion.div
                    key={exam.id}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(ROUTES.EXAMS)}
                    className="rounded-xl border cursor-pointer overflow-hidden"
                    style={{
                      borderColor: `${color}30`,
                      boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(15,23,42,0.10)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.04)')}
                  >
                    <div className="h-1.5" style={{ background: color }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[15px] font-bold leading-tight" style={{ color: '#0F172A' }}>
                            {exam.subjectName}
                          </p>
                          <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
                            {exam.examType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </p>
                        </div>
                        <span
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ml-2"
                          style={{ background: bg, color: text }}
                        >
                          {days > 0 ? `${days}d left` : days === 0 ? 'Today' : `${Math.abs(days)}d ago`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-4" style={{ color: '#94A3B8' }}>
                        <span className="flex items-center gap-1 text-[12px]">
                          <CalendarDays className="h-3.5 w-3.5" />{formatDate(exam.date)}
                        </span>
                        <span className="flex items-center gap-1 text-[12px]">
                          <MapPin className="h-3.5 w-3.5" />{exam.venue}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-medium" style={{ color: '#94A3B8' }}>Preparation</span>
                          <span className="text-[11px] font-bold" style={{ color }}>{exam.readinessScore}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${exam.readinessScore}%`, background: color }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── RESULTS + ACHIEVEMENTS ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Recent Results */}
        <motion.div variants={fade}>
          <Card className="h-full">
            <CardHeader
              title="Recent Results"
              action="Performance"
              onAction={() => navigate(ROUTES.PERFORMANCE)}
            />
            <div className="px-6 py-5 space-y-5">
              {d.recentMarks.slice(0, 5).map(result => {
                const color = subjectColor(result.subjectName);
                const gradeColor = getGradeColor(result.grade);
                return (
                  <div key={result.id} className="flex items-center gap-4">
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-semibold" style={{ color: '#0F172A' }}>
                          {result.subjectName}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-[12px] font-medium" style={{ color: '#94A3B8' }}>
                            {result.marksObtained}/{result.maxMarks}
                          </span>
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                            style={{ background: `${gradeColor}18`, color: gradeColor }}
                          >
                            {result.grade}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.percentage}%` }}
                          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={fade}>
          <Card className="h-full">
            <CardHeader
              title="Achievements"
              action="View all"
              onAction={() => navigate(ROUTES.ACHIEVEMENTS)}
            />
            <div className="px-6 py-5 space-y-3">
              {d.recentAchievements.length > 0 ? (
                d.recentAchievements.slice(0, 4).map(ach => (
                  <motion.div
                    key={ach.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-3.5 rounded-xl cursor-pointer"
                    style={{
                      background: `${ach.color}08`,
                      border: `1px solid ${ach.color}20`,
                    }}
                    onClick={() => navigate(ROUTES.ACHIEVEMENTS)}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-[24px]"
                      style={{ background: `${ach.color}18` }}
                    >
                      {ach.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: '#0F172A' }}>{ach.name}</p>
                      <p className="text-[12px] mt-0.5 truncate" style={{ color: '#94A3B8' }}>{ach.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#CBD5E1' }} />
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-5xl mb-3">🏆</span>
                  <p className="text-[14px] font-semibold" style={{ color: '#0F172A' }}>No achievements yet</p>
                  <p className="text-[13px] mt-1" style={{ color: '#94A3B8' }}>Keep studying to unlock badges!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── ANNOUNCEMENTS ──────────────────────────────────── */}
      {d.announcements.length > 0 && (
        <motion.div variants={fade}>
          <Card>
            <CardHeader
              title="Announcements"
              action="View inbox"
              onAction={() => navigate(ROUTES.INBOX)}
            />
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {d.announcements.slice(0, 3).map(ann => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl border cursor-pointer"
                  style={{
                    background: ann.isRead ? '#FAFBFD' : '#EEF2FF',
                    borderColor: ann.isRead ? '#E2E8F0' : '#C7D2FE',
                    transition: 'box-shadow 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(15,23,42,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: ann.isRead ? '#F1F5F9' : '#E0E7FF' }}
                    >
                      <Megaphone className="h-4 w-4" style={{ color: ann.isRead ? '#94A3B8' : '#6366F1' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold leading-tight" style={{ color: '#0F172A' }}>
                        {ann.title}
                      </p>
                      <p className="text-[12px] mt-1.5 line-clamp-2" style={{ color: '#64748B' }}>
                        {ann.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

    </motion.div>
  );
}
