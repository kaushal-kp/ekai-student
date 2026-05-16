import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Box, Card, CardContent, Typography, Grid, LinearProgress, List, ListItem,
  ListItemText, Chip, Paper, Skeleton,
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TargetIcon from '@mui/icons-material/TrackChanges';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarCheckIcon from '@mui/icons-material/CalendarMonth';
import ClockIcon from '@mui/icons-material/Schedule';
import BookOpenIcon from '@mui/icons-material/MenuBook';
import FileTextIcon from '@mui/icons-material/Description';
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

function scoreColor(score: number) {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function AnimatedDonut({ score, size = 180 }: { score: number; size?: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);
  const gradeLabel = score >= 80 ? 'Exam Ready' : score >= 60 ? 'Moderate' : 'At Risk';
  const bgColor = score >= 80 ? '#D1FAF0' : score >= 60 ? '#FEF3C7' : '#FEE2E2';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
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
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: 48, fontWeight: 700, lineHeight: 1, color }}>{score}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>/ 100</Typography>
        </Box>
      </Box>
      <Chip
        label={gradeLabel}
        size="small"
        sx={{ bgcolor: bgColor, color, fontWeight: 700, fontSize: 12 }}
      />
    </Box>
  );
}

function DimensionBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<any> }) {
  const color = scoreColor(value);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 200, flexShrink: 0 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            bgcolor: `${color}18`,
          }}
        >
          <Icon sx={{ fontSize: 16, color }} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }} color="text.secondary" noWrap>
          {label}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 10, borderRadius: 5,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 },
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700 ,  width: 40, textAlign: 'right', color, flexShrink: 0, fontSize: 13 }}>
        {value}%
      </Typography>
    </Box>
  );
}

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={4} sx={{ px: 2, py: 1.5, borderRadius: '12px' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366F1' }} />
        <Typography variant="caption" color="text.secondary">Score:</Typography>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>{payload[0]?.value}</Typography>
      </Box>
    </Paper>
  );
}

function SkeletonReadiness() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '20px' }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '20px' }} />
        </Grid>
      </Grid>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '20px' }} />
      <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '20px' }} />
    </Box>
  );
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'High Impact', color: '#EF4444', bg: '#FEE2E2' },
  medium: { label: 'Medium Impact', color: '#F59E0B', bg: '#FEF3C7' },
  low: { label: 'Low Impact', color: '#10B981', bg: '#D1FAF0' },
};

export default function ReadinessScorePage() {
  const { data: readiness, isLoading } = useQuery<ReadinessScore>({
    queryKey: ['readiness-score'],
    queryFn: async () => (await api.get('/student/readiness-score')).data.data,
  });

  if (isLoading) return <SkeletonReadiness />;
  if (!readiness) return null;

  const score = readiness.overall;

  const factors = [
    { label: 'Academic Performance', value: readiness.academicPerformance, icon: BarChartIcon },
    { label: 'Attendance', value: readiness.attendance, icon: CalendarCheckIcon },
    { label: 'Syllabus Coverage', value: readiness.syllabusConverage, icon: BookOpenIcon },
    { label: 'Study Consistency', value: readiness.studyConsistency, icon: ClockIcon },
    { label: 'Past Exam Performance', value: readiness.pastExamPerformance, icon: FileTextIcon },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <Box sx={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Score + Dimensions */}
        <motion.div variants={fadeUp}>
          <Grid container spacing={3}>
            {/* Overall score donut */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card elevation={2} sx={{ borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.5 }} color="text.secondary">
                    Overall Readiness
                  </Typography>
                  <AnimatedDonut score={score} size={180} />
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6, maxWidth: 220 }}>
                    {readiness.aiExplanation.slice(0, 100)}...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Dimension bars */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card elevation={2} sx={{ borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 ,  mb: 3 }}>Readiness Dimensions</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {factors.map(f => (
                      <DimensionBar key={f.label} label={f.label} value={f.value} icon={f.icon} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Subject-wise cards */}
        <motion.div variants={fadeUp}>
          <Card elevation={2} sx={{ borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 ,  mb: 2.5 }}>Subject-wise Readiness</Typography>
              <Grid container spacing={2}>
                {readiness.subjectWise.map(s => {
                  const subColor = getSubjectColor(s.subjectName);
                  const levelCfg = READINESS_LEVEL_CONFIG[s.level];
                  return (
                    <Grid size={{ xs: 6, md: 4, lg: 3 }} key={s.subjectId}>
                      <Card variant="outlined" sx={{ borderRadius: '16px', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        {/* Small ring */}
                        <Box sx={{ position: 'relative', width: 64, height: 64 }}>
                          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" strokeWidth="6" />
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
                          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: subColor }}>{s.score}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 ,  textAlign: 'center', lineHeight: 1.3 }} noWrap>
                          {s.subjectName.split(' ')[0]}
                        </Typography>
                        <Chip
                          label={levelCfg.label}
                          size="small"
                          sx={{ bgcolor: levelCfg.bg, color: levelCfg.color, fontWeight: 700, fontSize: 10, height: 20 }}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={s.score}
                          sx={{
                            width: '100%', height: 4, borderRadius: 2,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { bgcolor: subColor, borderRadius: 2 },
                          }}
                        />
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights + Recommendations */}
        <motion.div variants={fadeUp}>
          <Grid container spacing={3}>
            {/* AI Explanation */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card elevation={2} sx={{ borderRadius: '20px', borderLeft: '3px solid #6366F1', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <LightbulbIcon sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Insights</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {readiness.aiExplanation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Recommendations */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card elevation={2} sx={{ borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'linear-gradient(135deg,#10B981,#34D399)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <TargetIcon sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Recommendations</Typography>
                  </Box>
                  <List dense disablePadding>
                    {readiness.suggestions.slice(0, 4).map(s => {
                      const cfg = priorityConfig[s.priority] || priorityConfig.low;
                      return (
                        <ListItem key={s.id} disableGutters sx={{ alignItems: 'flex-start', gap: 1.5, py: 1 }}>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 10, height: 20, mt: 0.25, flexShrink: 0 }}
                          />
                          <ListItemText
                            primary={s.text}
                            secondary={`Expected impact: +${s.impact} pts`}
                            slotProps={{
                              primary: { variant: 'body2', sx: { fontSize: 12, lineHeight: 1.4 } },
                              secondary: { variant: 'caption', sx: { color: cfg.color, fontWeight: 700 } },
                            }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Score history chart */}
        <motion.div variants={fadeUp}>
          <Card elevation={2} sx={{ borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'linear-gradient(135deg,#3B82F6,#60A5FA)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ color: '#fff', fontSize: 18 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Score History</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={readiness.history}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fill="url(#scoreGrad)"
                    dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

      </Box>
    </motion.div>
  );
}
