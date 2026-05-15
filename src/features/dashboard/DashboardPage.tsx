import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, Grid, Typography, Stack, Chip,
  LinearProgress, ButtonBase,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonth, TrackChanges, LocalFireDepartment, EmojiEvents,
  ChevronRight, CalendarToday, LocationOn, Announcement,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import { getGreeting, getGradeColor, daysUntil } from '@/lib/utils';
import api from '@/lib/api';
import { DashboardData } from '@/types/api';

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#3B82F6', Science: '#10B981', English: '#8B5CF6',
  Hindi: '#F59E0B', 'Social Science': '#EF4444', 'Computer Science': '#6366F1',
  'Physical Education': '#F97316',
};

function subjectColor(name: string) {
  for (const [k, v] of Object.entries(SUBJECT_COLORS)) {
    if (name.toLowerCase().includes(k.toLowerCase().split(' ')[0])) return v;
  }
  return '#6366F1';
}

function urgencyChip(days: number) {
  if (days <= 3) return { bg: '#FEF2F2', color: '#DC2626' };
  if (days <= 7) return { bg: '#FFFBEB', color: '#D97706' };
  return { bg: '#F0FDF4', color: '#059669' };
}

function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1100, 1);
      const e = 1 - Math.pow(1 - p, 4);
      if (ref.current) ref.current.textContent = prefix + Math.round(e * to) + suffix;
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [to, prefix, suffix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

function ReadinessDonut({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <Box sx={{ position: 'relative', width: 128, height: 128, mx: 'auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={[{ value: score }, { value: 100 - score }]} cx="50%" cy="50%"
            innerRadius={44} outerRadius={58} startAngle={90} endAngle={-270}
            dataKey="value" strokeWidth={0}>
            <Cell fill={color} />
            <Cell fill="#F1F5F9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>{score}</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>/ 100</Typography>
      </Box>
    </Box>
  );
}

const sectionVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } } };

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h5">{title}</Typography>
      {action && (
        <ButtonBase onClick={onAction} sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: 'primary.main', borderRadius: 1, px: 0.5, py: 0.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>{action}</Typography>
          <ChevronRight sx={{ fontSize: 16 }} />
        </ButtonBase>
      )}
    </Box>
  );
}

const readinessSubjects = [
  { name: 'Mathematics', score: 68 }, { name: 'Science', score: 45 },
  { name: 'English', score: 85 }, { name: 'Hindi', score: 78 },
  { name: 'Social Science', score: 52 }, { name: 'Computer Science', score: 92 },
];

export default function DashboardPage() {
  const { student } = useAuthStore();
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/student/dashboard')).data.data,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[80, 140, 300, 300].map((h, i) => (
          <Box key={i} className="skeleton" sx={{ height: h, borderRadius: 3 }} />
        ))}
      </Box>
    );
  }

  const d = dashboard!;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const nowMins = today.getHours() * 60 + today.getMinutes();
  const currentPeriodIdx = d.todayTimetable.findIndex(t => {
    if (!t.teacher) return false;
    const [sh, sm] = t.startTime.split(':').map(Number);
    const [eh, em] = t.endTime.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
  });

  const statCards = [
    { label: 'Attendance', value: d.stats.attendancePercent, suffix: '%', sub: 'This month',
      trend: d.stats.attendanceTrend, icon: <CalendarMonth />, gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', path: ROUTES.ATTENDANCE },
    { label: 'Readiness Score', value: d.readinessScore, suffix: '', sub: 'Out of 100',
      icon: <TrackChanges />, gradient: d.readinessScore >= 80 ? 'linear-gradient(135deg, #10B981, #34D399)' : d.readinessScore >= 60 ? 'linear-gradient(135deg, #F59E0B, #FCD34D)' : 'linear-gradient(135deg, #EF4444, #F87171)', path: ROUTES.READINESS_SCORE },
    { label: 'Study Streak', value: d.stats.studyStreak, suffix: '', sub: 'days — keep it up! 🔥',
      icon: <LocalFireDepartment />, gradient: 'linear-gradient(135deg, #F97316, #FB923C)', path: ROUTES.PERFORMANCE },
    { label: 'Class Rank', value: d.stats.classRank, prefix: '#', suffix: '', sub: `of ${d.stats.totalStudents} students`,
      icon: <EmojiEvents />, gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', path: ROUTES.PERFORMANCE },
  ] as const;

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="show">
      <Stack spacing={4}>

        {/* ── HEADER ── */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {getGreeting()}, {student?.firstName}! 👋
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {dateStr} · {student?.schoolName} · Class {student?.class}-{student?.section}
              </Typography>
            </Box>
            <Chip
              label="APAAR Verified"
              size="small"
              sx={{ bgcolor: alpha('#6366F1', 0.10), color: 'primary.main', fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <motion.div variants={fadeUp}>
          <Grid container spacing={2.5}>
            {statCards.map((card, i) => (
              <Grid size={{ xs: 6, lg: 3 }} key={card.label}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.38 }}
                  whileHover={{ y: -4 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{ cursor: 'pointer', height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}
                    onClick={() => navigate(card.path)}
                  >
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.18)' }}>
                          <Box sx={{ color: 'white', '& svg': { fontSize: 22 } }}>{card.icon}</Box>
                        </Box>
                        {'trend' in card && card.trend !== undefined && (
                          <Chip
                            label={`${card.trend > 0 ? '+' : ''}${card.trend}%`}
                            size="small"
                            sx={{
                              bgcolor: card.trend > 0 ? '#F0FDF4' : '#FEF2F2',
                              color: card.trend > 0 ? '#16A34A' : '#DC2626',
                              fontWeight: 700, height: 22, fontSize: '0.6875rem',
                            }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>
                        <Counter to={card.value} prefix={'prefix' in card ? card.prefix : ''} suffix={card.suffix} />
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 1 }}>{card.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>{card.sub}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* ── SCHEDULE + READINESS ── */}
        <motion.div variants={fadeUp}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card sx={{ height: '100%' }}>
                <SectionHeader title="Today's Schedule" action="Full timetable" onAction={() => navigate(ROUTES.ACADEMICS)} />
                <Box>
                  {d.todayTimetable.map((period, idx) => {
                    const isBreak = !period.teacher;
                    const color = isBreak ? '#CBD5E1' : subjectColor(period.subject);
                    const isNow = idx === currentPeriodIdx;
                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 2.5,
                          px: 3, py: 2.25,
                          bgcolor: isNow ? alpha(color, 0.06) : 'transparent',
                          borderBottom: idx < d.todayTimetable.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          transition: 'background 0.2s',
                        }}
                      >
                        <Typography variant="caption" sx={{ width: 36, textAlign: 'right', color: 'text.disabled', fontWeight: 500, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                          {period.startTime}
                        </Typography>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, bgcolor: color, boxShadow: isNow ? `0 0 0 4px ${alpha(color, 0.25)}` : 'none' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: isBreak ? 'text.disabled' : 'text.primary' }}>
                              {period.subject}
                            </Typography>
                            {isNow && <Chip label="NOW" size="small" sx={{ bgcolor: color, color: 'white', height: 18, fontSize: '0.625rem', fontWeight: 800 }} />}
                          </Box>
                          {!isBreak && (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              {period.teacher} · {period.room}
                            </Typography>
                          )}
                        </Box>
                        {!isBreak && (
                          <Typography variant="caption" sx={{ bgcolor: 'grey.100', px: 1.25, py: 0.5, borderRadius: 1.5, color: 'text.disabled', fontWeight: 500, flexShrink: 0 }}>
                            – {period.endTime}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <SectionHeader title="Exam Readiness" action="Details" onAction={() => navigate(ROUTES.READINESS_SCORE)} />
                <CardContent sx={{ px: 3, pt: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <ReadinessDonut score={d.readinessScore} />
                  </Box>
                  <Stack spacing={2}>
                    {readinessSubjects.map(s => {
                      const color = subjectColor(s.name);
                      return (
                        <Box key={s.name}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{s.name}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{s.score}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={s.score}
                            sx={{ '& .MuiLinearProgress-bar': { bgcolor: color }, bgcolor: alpha(color, 0.12) }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* ── UPCOMING EXAMS ── */}
        <motion.div variants={fadeUp}>
          <Card>
            <SectionHeader title="Upcoming Exams" action="View all" onAction={() => navigate(ROUTES.EXAMS)} />
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                {d.upcomingExams.slice(0, 3).map(exam => {
                  const days = daysUntil(exam.date);
                  const color = subjectColor(exam.subjectName);
                  const { bg, color: textColor } = urgencyChip(days);
                  return (
                    <Grid size={{ xs: 12, md: 4 }} key={exam.id}>
                      <motion.div whileHover={{ y: -4 }} style={{ height: '100%' }}>
                        <Box
                          onClick={() => navigate(ROUTES.EXAMS)}
                          sx={{
                            border: '1.5px solid', borderColor: alpha(color, 0.3),
                            borderRadius: 3, overflow: 'hidden', cursor: 'pointer', height: '100%',
                            transition: 'box-shadow 0.2s, border-color 0.2s',
                            '&:hover': { boxShadow: 3, borderColor: alpha(color, 0.6) },
                          }}
                        >
                          <Box sx={{ height: 5, bgcolor: color }} />
                          <Box sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h5" sx={{ color: 'text.primary' }}>{exam.subjectName}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                  {exam.examType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </Typography>
                              </Box>
                              <Chip
                                label={days > 0 ? `${days}d left` : days === 0 ? 'Today' : `${Math.abs(days)}d ago`}
                                size="small"
                                sx={{ bgcolor: bg, color: textColor, fontWeight: 700, fontSize: '0.6875rem' }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 13, color: 'text.disabled' }} />
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{formatDate(exam.date)}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOn sx={{ fontSize: 13, color: 'text.disabled' }} />
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{exam.venue}</Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>Preparation</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color }}>{exam.readinessScore}%</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={exam.readinessScore}
                                sx={{ '& .MuiLinearProgress-bar': { bgcolor: color }, bgcolor: alpha(color, 0.12) }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Card>
        </motion.div>

        {/* ── RESULTS + ACHIEVEMENTS ── */}
        <motion.div variants={fadeUp}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <SectionHeader title="Recent Results" action="Performance" onAction={() => navigate(ROUTES.PERFORMANCE)} />
                <CardContent sx={{ px: 3, py: 2.5 }}>
                  <Stack spacing={2.5}>
                    {d.recentMarks.slice(0, 5).map(result => {
                      const color = subjectColor(result.subjectName);
                      const gradeColor = getGradeColor(result.grade);
                      return (
                        <Box key={result.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 4, height: 44, borderRadius: 99, bgcolor: color, flexShrink: 0 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{result.subjectName}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{result.marksObtained}/{result.maxMarks}</Typography>
                                <Chip label={result.grade} size="small" sx={{ bgcolor: alpha(gradeColor, 0.12), color: gradeColor, fontWeight: 700, height: 20, fontSize: '0.6875rem' }} />
                              </Box>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={result.percentage}
                              sx={{ '& .MuiLinearProgress-bar': { bgcolor: color }, bgcolor: alpha(color, 0.12) }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <SectionHeader title="Achievements" action="View all" onAction={() => navigate(ROUTES.ACHIEVEMENTS)} />
                <CardContent sx={{ px: 3, py: 2.5 }}>
                  {d.recentAchievements.length > 0 ? (
                    <Stack spacing={1.5}>
                      {d.recentAchievements.slice(0, 4).map(ach => (
                        <motion.div key={ach.id} whileHover={{ x: 4 }}>
                          <Box
                            onClick={() => navigate(ROUTES.ACHIEVEMENTS)}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 2,
                              p: 1.75, borderRadius: 2.5, cursor: 'pointer',
                              bgcolor: alpha(ach.color, 0.06),
                              border: '1px solid', borderColor: alpha(ach.color, 0.15),
                              transition: 'all 0.15s',
                              '&:hover': { bgcolor: alpha(ach.color, 0.10) },
                            }}
                          >
                            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: alpha(ach.color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                              {ach.icon}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{ach.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>{ach.description}</Typography>
                            </Box>
                            <ChevronRight sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
                          </Box>
                        </motion.div>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                      <Typography sx={{ fontSize: 48, mb: 1 }}>🏆</Typography>
                      <Typography variant="h6">No achievements yet</Typography>
                      <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>Keep studying to unlock badges!</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* ── ANNOUNCEMENTS ── */}
        {d.announcements.length > 0 && (
          <motion.div variants={fadeUp}>
            <Card>
              <SectionHeader title="Announcements" action="View inbox" onAction={() => navigate(ROUTES.INBOX)} />
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {d.announcements.slice(0, 3).map(ann => (
                    <Grid size={{ xs: 12, md: 4 }} key={ann.id}>
                      <Box
                        sx={{
                          p: 2.5, borderRadius: 2.5, cursor: 'pointer',
                          bgcolor: ann.isRead ? 'grey.50' : alpha('#6366F1', 0.06),
                          border: '1px solid', borderColor: ann.isRead ? 'divider' : alpha('#6366F1', 0.2),
                          transition: 'box-shadow 0.15s',
                          '&:hover': { boxShadow: 2 },
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: ann.isRead ? 'grey.100' : alpha('#6366F1', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                            <Announcement sx={{ fontSize: 16, color: ann.isRead ? 'text.disabled' : 'primary.main' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{ann.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.5 }}>
                              {ann.body}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Card>
          </motion.div>
        )}

      </Stack>
    </motion.div>
  );
}
