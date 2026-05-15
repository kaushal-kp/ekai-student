import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, TrendingUp, Target, Award, Clock, BookOpen, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';
import { formatDate, formatRelativeTime, formatPercent } from '@/lib/formatters';
import { getGreeting, getGradeColor, daysUntil, getCountdownColor } from '@/lib/utils';
import api from '@/lib/api';
import { DashboardData } from '@/types/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function DashboardPage() {
  const { student } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/student/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const d = dashboard!;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {getGreeting()}, {student?.firstName}! 👋
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${d.stats.attendancePercent}%`}
          subtitle="This month"
          icon={<CalendarCheck className="h-4 w-4" />}
          trend={d.stats.attendanceTrend}
          trendLabel="vs last month"
          color={d.stats.attendancePercent >= 75 ? 'var(--color-success)' : 'var(--color-danger)'}
          onClick={() => navigate(ROUTES.ATTENDANCE)}
        />
        <StatCard
          title="Readiness Score"
          value={`${d.readinessScore}/100`}
          subtitle="Exam preparation"
          icon={<Target className="h-4 w-4" />}
          color={d.readinessScore >= 80 ? 'var(--color-success)' : d.readinessScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'}
          onClick={() => navigate(ROUTES.READINESS_SCORE)}
        />
        <StatCard
          title="Study Streak"
          value={`${d.stats.studyStreak} days`}
          subtitle="Keep it up!"
          icon={<Zap className="h-4 w-4" />}
          color="var(--color-hub)"
          onClick={() => navigate(ROUTES.ACADEMICS)}
        />
        <StatCard
          title="Class Rank"
          value={`#${d.stats.classRank}`}
          subtitle={`Out of ${d.stats.totalStudents}`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="var(--color-primary)"
          onClick={() => navigate(ROUTES.PERFORMANCE)}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {d.todayTimetable.filter(t => t.teacher).map((entry) => {
                  const now = new Date();
                  const [sh, sm] = entry.startTime.split(':').map(Number);
                  const [eh, em] = entry.endTime.split(':').map(Number);
                  const isNow = now.getHours() * 60 + now.getMinutes() >= sh * 60 + sm &&
                    now.getHours() * 60 + now.getMinutes() < eh * 60 + em;
                  return (
                    <div
                      key={entry.period}
                      className={`flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] ${isNow ? 'bg-[var(--color-primary-light)] border border-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-2)]'}`}
                    >
                      <div className="text-xs text-[var(--color-text-muted)] w-20 flex-shrink-0">
                        {entry.startTime} - {entry.endTime}
                      </div>
                      <div className="w-1 h-6 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isNow ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                          {entry.subject}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{entry.teacher} · {entry.room}</p>
                      </div>
                      {isNow && <Badge variant="primary">Now</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <button onClick={() => navigate(ROUTES.INBOX)} className="text-xs text-[var(--color-primary)] hover:underline">
                View all
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {d.announcements.map((ann) => (
                  <div key={ann.id} className={`p-3 rounded-[var(--radius-md)] border ${!ann.isRead ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]/20' : 'bg-[var(--color-surface-2)] border-transparent'}`}>
                    {!ann.isRead && <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full mb-2" />}
                    <p className="text-sm font-medium text-[var(--color-text)]">{ann.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{ann.body}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{formatRelativeTime(ann.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.EXAMS)}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {d.upcomingExams.map((exam) => {
                  const days = daysUntil(exam.date);
                  return (
                    <div key={exam.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)]">
                      <div
                        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: getCountdownColor(days) }}
                      >
                        {days}d
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">{exam.subjectName}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{formatDate(exam.date)} · {exam.time}</p>
                      </div>
                      <RiskBadge status={exam.readinessLevel} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Marks */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PERFORMANCE)}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {d.recentMarks.slice(0, 4).map((result) => (
                  <div key={result.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: getGradeColor(result.grade) }}
                    >
                      {result.grade}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{result.subjectName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{result.examName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--color-text)]">{result.marksObtained}/{result.maxMarks}</p>
                      <p className="text-xs" style={{ color: getGradeColor(result.grade) }}>{formatPercent(result.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Achievements */}
      {d.recentAchievements.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.ACHIEVEMENTS)}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                {d.recentAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex-1 min-w-[200px]">
                    <div className="text-3xl">{ach.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{ach.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
