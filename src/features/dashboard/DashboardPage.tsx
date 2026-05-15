import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck, TrendingUp, Target, Clock,
  ArrowRight, Zap, CalendarDays,
  Flame, Trophy, MapPin
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';
import { formatDate, formatRelativeTime, formatPercent } from '@/lib/formatters';
import { getGreeting, getGradeColor, daysUntil, getCountdownColor } from '@/lib/utils';
import api from '@/lib/api';
import { DashboardData } from '@/types/api';

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
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) return color;
  }
  return '#6C63FF';
}

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

function DonutScore({ score }: { score: number }) {
  const data = [{ value: score }, { value: 100 - score }];
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative w-[110px] h-[110px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={50}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="rgba(255,255,255,0.15)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold text-white leading-none">{score}</span>
        <span className="text-white/70 text-[10px] font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="rounded-[24px] h-[200px] skeleton" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-[120px] rounded-[16px]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton h-[280px] rounded-[16px]" />
        <div className="skeleton h-[280px] rounded-[16px]" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { student } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/student/dashboard')).data.data,
  });

  if (isLoading) return <SkeletonDashboard />;

  const d = dashboard!;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const nowMins = today.getHours() * 60 + today.getMinutes();
  const getCurrentPeriod = () => {
    return d.todayTimetable.find(t => {
      if (!t.teacher) return false;
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = t.endTime.split(':').map(Number);
      return nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
    });
  };
  const currentPeriod = getCurrentPeriod();

  const nextExam = d.upcomingExams?.[0];
  const nextExamDays = nextExam ? daysUntil(nextExam.date) : null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-7xl">

      {/* HERO CARD */}
      <motion.div variants={fadeUp}>
        <div
          className="relative rounded-[24px] overflow-hidden p-7"
          style={{ background: 'var(--gradient-hero)' }}
        >
          {/* decorative blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
            <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-[13px] font-medium mb-1">{dateStr}</p>
              <h1 className="text-[26px] md:text-[30px] font-bold text-white leading-tight mb-1">
                {getGreeting()}, {student?.firstName}! 👋
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/80 text-[13px] font-medium">{student?.schoolName}</span>
                <span className="flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ VERIFIED
                </span>
              </div>

              {/* Mini stat chips */}
              <div className="flex flex-wrap gap-2.5 mt-5">
                {[
                  { icon: <CalendarCheck className="h-3.5 w-3.5" />, value: `${d.stats.attendancePercent}%`, label: 'Attendance' },
                  { icon: <Flame className="h-3.5 w-3.5" />, value: `${d.stats.studyStreak}d`, label: 'Streak 🔥' },
                  { icon: <Trophy className="h-3.5 w-3.5" />, value: `#${d.stats.classRank}`, label: 'Rank' },
                  ...(nextExamDays !== null ? [{ icon: <CalendarDays className="h-3.5 w-3.5" />, value: `${nextExamDays}d`, label: 'Next Exam' }] : []),
                ].map((chip, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px]"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                    <span className="text-white/80">{chip.icon}</span>
                    <span className="text-white font-bold text-[13px]">{chip.value}</span>
                    <span className="text-white/60 text-[11px]">{chip.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness donut */}
            <div className="flex flex-col items-center gap-2">
              <DonutScore score={d.readinessScore} />
              <p className="text-white/70 text-[11px] font-medium text-center">Exam Readiness</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STAT CARDS */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${d.stats.attendancePercent}%`}
          subtitle="This month"
          icon={<CalendarCheck />}
          trend={d.stats.attendanceTrend}
          trendLabel="vs last month"
          gradient={d.stats.attendancePercent >= 75
            ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)'}
          onClick={() => navigate(ROUTES.ATTENDANCE)}
        />
        <StatCard
          title="Readiness Score"
          value={`${d.readinessScore}`}
          subtitle="Out of 100"
          icon={<Target />}
          gradient={d.readinessScore >= 80
            ? 'linear-gradient(135deg, #10B981, #34D399)'
            : d.readinessScore >= 60
            ? 'linear-gradient(135deg, #F59E0B, #FCD34D)'
            : 'linear-gradient(135deg, #EF4444, #F87171)'}
          onClick={() => navigate(ROUTES.READINESS_SCORE)}
        />
        <StatCard
          title="Study Streak"
          value={`${d.stats.studyStreak}`}
          subtitle="days — keep it up!"
          icon={<Zap />}
          gradient="linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)"
          onClick={() => navigate(ROUTES.ACADEMICS)}
        />
        <StatCard
          title="Class Rank"
          value={`#${d.stats.classRank}`}
          subtitle={`Out of ${d.stats.totalStudents} students`}
          icon={<TrendingUp />}
          gradient="var(--gradient-primary)"
          onClick={() => navigate(ROUTES.PERFORMANCE)}
        />
      </motion.div>

      {/* SCHEDULE + ANNOUNCEMENTS */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-[var(--color-text)]">Today's Schedule</h2>
              {currentPeriod && (
                <p className="text-[12px] text-[var(--color-success)] font-medium mt-0.5 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Now: {currentPeriod.subject}
                </p>
              )}
            </div>
            <Clock className="h-5 w-5 text-[var(--color-text-muted)]" />
          </div>

          {/* Timeline layout */}
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[95px] top-0 bottom-0 w-[1px] bg-[var(--color-border)]" />
            <div className="space-y-1">
              {d.todayTimetable.filter(t => t.teacher).map((entry, idx) => {
                const [sh, sm] = entry.startTime.split(':').map(Number);
                const [eh, em] = entry.endTime.split(':').map(Number);
                const isNow = nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
                const isPast = nowMins >= eh * 60 + em;
                const subColor = getSubjectColor(entry.subject);

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-0"
                    style={{ opacity: isPast && !isNow ? 0.45 : 1 }}
                  >
                    {/* Time column */}
                    <div className="w-[96px] flex-shrink-0 text-right pr-4">
                      <span className="text-[11px] font-mono font-medium text-[var(--color-text-muted)]">
                        {entry.startTime}
                      </span>
                    </div>
                    {/* Dot on timeline */}
                    <div className="relative z-10 flex-shrink-0">
                      {isNow ? (
                        <div className="w-3 h-3 rounded-full border-2 border-[var(--color-success)] bg-[var(--color-success)] shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                          style={{ borderColor: subColor, background: isPast ? subColor : 'var(--color-surface)' }} />
                      )}
                    </div>
                    {/* Entry card */}
                    <div
                      className={`flex-1 ml-3 flex items-center gap-2.5 p-2.5 rounded-[10px] transition-all ${isNow ? 'border' : 'hover:bg-[var(--color-surface-2)]'}`}
                      style={isNow ? {
                        background: `${subColor}12`,
                        borderColor: `${subColor}35`,
                      } : {}}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ color: isNow ? subColor : 'var(--color-text)' }}>
                          {entry.subject}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] truncate">{entry.teacher} · {entry.room}</p>
                      </div>
                      {isNow && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                          style={{ background: subColor }}>NOW</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[var(--color-text)]">Announcements</h2>
            <button onClick={() => navigate(ROUTES.INBOX)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
              All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {d.announcements.slice(0, 4).map(ann => (
              <div
                key={ann.id}
                className="p-3 rounded-[12px] border cursor-pointer transition-all hover:shadow-[var(--shadow-sm)]"
                style={{
                  background: !ann.isRead ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                  borderColor: !ann.isRead ? 'var(--color-primary)' + '30' : 'var(--color-border)',
                }}
              >
                <div className="flex items-start gap-2">
                  {!ann.isRead && <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--color-primary)' }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[var(--color-text)] truncate">{ann.title}</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{ann.body}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">{formatRelativeTime(ann.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
            {d.announcements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-[32px] mb-2">📢</span>
                <p className="text-[13px] text-[var(--color-text-muted)]">No announcements</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* UPCOMING EXAMS */}
      <motion.div variants={fadeUp}>
        <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[var(--color-text)]">Upcoming Exams</h2>
            <button
              onClick={() => navigate(ROUTES.EXAMS)}
              className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {d.upcomingExams.slice(0, 3).map((exam, i) => {
              const days = daysUntil(exam.date);
              const subColor = getSubjectColor(exam.subjectName);
              const urgencyColor = getCountdownColor(days);
              return (
                <motion.div
                  key={exam.id}
                  whileHover={{ y: -3 }}
                  className="rounded-[16px] overflow-hidden border border-[var(--color-border)] cursor-pointer"
                  onClick={() => navigate(ROUTES.EXAMS)}
                >
                  {/* Colored header */}
                  <div className="px-4 py-3 relative" style={{ background: `${subColor}20`, borderBottom: `1px solid ${subColor}30` }}>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold" style={{ color: subColor }}>{exam.subjectName}</p>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: urgencyColor }}
                      >
                        {days}d
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {exam.examType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                  </div>
                  <div className="px-4 py-3" style={{ background: 'var(--color-surface)' }}>
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] gap-2">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(exam.date)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exam.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--color-surface-2)]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${exam.readinessScore}%`, background: urgencyColor }} />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: urgencyColor }}>{exam.readinessScore}%</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{exam.syllabusChapters.length} chapters</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* RESULTS + ACHIEVEMENTS */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[var(--color-text)]">Recent Results</h2>
            <button onClick={() => navigate(ROUTES.PERFORMANCE)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {d.recentMarks.slice(0, 4).map(result => {
              const subColor = getSubjectColor(result.subjectName);
              const gradeColor = getGradeColor(result.grade);
              return (
                <div key={result.id} className="flex items-center gap-3">
                  <div className="w-2 h-9 rounded-full flex-shrink-0" style={{ background: subColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-text)] truncate">{result.subjectName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${result.percentage}%`, background: subColor }} />
                      </div>
                      <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">{result.marksObtained}/{result.maxMarks}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[13px] font-bold px-2.5 py-0.5 rounded-[8px]"
                      style={{ color: gradeColor, background: `${gradeColor}18` }}>
                      {result.grade}
                    </span>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{formatPercent(result.percentage)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[var(--color-text)]">Achievements</h2>
            <button onClick={() => navigate(ROUTES.ACHIEVEMENTS)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {d.recentAchievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {d.recentAchievements.slice(0, 4).map(ach => (
                <motion.div
                  key={ach.id}
                  whileHover={{ scale: 1.04 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-[16px] text-center"
                  style={{
                    background: `${ach.color}15`,
                    border: `1px solid ${ach.color}30`,
                    boxShadow: `0 0 15px ${ach.color}20`,
                  }}
                >
                  <span className="text-[32px]">{ach.icon}</span>
                  <p className="text-[12px] font-bold text-[var(--color-text)] leading-tight">{ach.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">{ach.description}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-[48px] mb-3">🏆</span>
              <p className="text-[14px] font-semibold text-[var(--color-text)]">No achievements yet</p>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1">Keep studying to unlock badges!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ANNOUNCEMENTS */}
      {d.announcements.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[var(--color-text)]">Announcements</h2>
              <button onClick={() => navigate(ROUTES.INBOX)} className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {d.announcements.slice(0, 4).map(ann => (
                <div
                  key={ann.id}
                  className="p-4 rounded-[14px] border transition-all hover:shadow-[var(--shadow-sm)] cursor-pointer"
                  style={{
                    background: !ann.isRead ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                    borderColor: !ann.isRead ? 'var(--color-primary)' + '40' : 'var(--color-border)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!ann.isRead && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--color-primary)' }} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--color-text)] truncate">{ann.title}</p>
                      <p className="text-[12px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">{ann.body}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-2">{formatRelativeTime(ann.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
