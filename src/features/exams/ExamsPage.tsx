import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, BookOpen, AlertTriangle, ChevronRight } from 'lucide-react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  Button,
} from '@mui/material';
import { PageHeader } from '@/components/shared/PageHeader';
import { useUIStore } from '@/store/uiStore';
import { formatDate } from '@/lib/formatters';
import { daysUntil, getCountdownColor } from '@/lib/utils';
import api from '@/lib/api';
import { UpcomingExam } from '@/types/models';
import { ReadinessLevel } from '@/types/enums';

type Tab2 = 'upcoming' | 'results' | 'preparation';

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

const READINESS_CONFIG: Record<ReadinessLevel, { color: string; bgcolor: string; label: string; emoji: string }> = {
  [ReadinessLevel.READY]: { color: '#16A34A', bgcolor: '#F0FDF4', label: 'Ready', emoji: '✅' },
  [ReadinessLevel.NEEDS_PREP]: { color: '#D97706', bgcolor: '#FFFBEB', label: 'Needs Prep', emoji: '⚡' },
  [ReadinessLevel.AT_RISK]: { color: '#DC2626', bgcolor: '#FEF2F2', label: 'At Risk', emoji: '⚠️' },
  [ReadinessLevel.NOT_STARTED]: { color: '#6B7280', bgcolor: '#F3F4F6', label: 'Not Started', emoji: '📖' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ExamsPage() {
  const [tab, setTab] = useState<Tab2>('upcoming');
  const { addToast } = useUIStore();

  const { data: upcoming, isLoading } = useQuery<UpcomingExam[]>({
    queryKey: ['upcoming-exams'],
    queryFn: async () => (await api.get('/student/exams/upcoming')).data.data,
  });

  return (
    <Stack spacing={4} sx={{ maxWidth: '900px' }}>
      <PageHeader title="Exams" subtitle="Track upcoming exams, results, and preparation status" />

      {/* MUI Tabs */}
      <Paper elevation={0} sx={{ borderRadius: '14px', bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider', width: 'fit-content' }}>
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          sx={{
            minHeight: 0,
            px: 0.5,
            py: 0.5,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 36,
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'text.secondary',
              px: 2.5,
              py: 1,
              '&.Mui-selected': {
                bgcolor: 'background.paper',
                color: 'primary.main',
                boxShadow: 1,
              },
            },
          }}
        >
          <Tab label="Upcoming" value="upcoming" disableRipple />
          <Tab label="Results" value="results" disableRipple />
          <Tab label="Preparation" value="preparation" disableRipple />
        </Tabs>
      </Paper>

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
              <Stack spacing={2}>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: '20px' }} />
                ))}
              </Stack>
            ) : upcoming?.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
                <Typography sx={{ fontSize: '56px', mb: 2, lineHeight: 1 }}>🎉</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>No upcoming exams</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Enjoy the break! New exams will appear here.
                </Typography>
              </Box>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="show">
                <Stack spacing={2}>
                  {upcoming?.map(exam => {
                    const days = daysUntil(exam.date);
                    const subStyle = getSubjectStyle(exam.subjectName);
                    const readiness = READINESS_CONFIG[exam.readinessLevel];
                    const urgencyColor = getCountdownColor(days);

                    return (
                      <motion.div key={exam.id} variants={fadeUp} whileHover={{ y: -2 }}>
                        <Card
                          elevation={2}
                          sx={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: 4 },
                          }}
                        >
                          {/* Colored header band */}
                          <Box
                            sx={{
                              px: 3,
                              py: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              bgcolor: `${subStyle.color}18`,
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: subStyle.color }}>
                                {exam.subjectName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {exam.examType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Chip
                                label={`${readiness.emoji} ${readiness.label}`}
                                size="small"
                                sx={{
                                  bgcolor: readiness.bgcolor,
                                  color: readiness.color,
                                  fontWeight: 700,
                                  fontSize: '0.8125rem',
                                  height: 32,
                                }}
                              />
                              <Box
                                sx={{
                                  width: 62,
                                  height: 62,
                                  borderRadius: '14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: urgencyColor,
                                  color: 'white',
                                  flexShrink: 0,
                                }}
                              >
                                <Typography sx={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>{days}</Typography>
                                <Typography sx={{ fontSize: '10px', fontWeight: 500, mt: 0.25 }}>days</Typography>
                              </Box>
                            </Box>
                          </Box>

                          <CardContent sx={{ p: 3 }}>
                            {/* Info row */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                              {[
                                { icon: <Calendar size={14} color={subStyle.color} />, text: formatDate(exam.date) },
                                { icon: <Clock size={14} color={subStyle.color} />, text: exam.time },
                                { icon: <MapPin size={14} color={subStyle.color} />, text: exam.venue },
                              ].map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  {item.icon}
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.text}</Typography>
                                </Box>
                              ))}
                            </Box>

                            {/* Readiness bar */}
                            <Box sx={{ mb: 2.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                  Readiness Score
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: readiness.color }}>
                                  {exam.readinessScore}%
                                </Typography>
                              </Box>
                              <Box sx={{ height: 8, borderRadius: 99, bgcolor: 'grey.100', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${exam.readinessScore}%` }}
                                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ height: '100%', background: readiness.color, borderRadius: 99 }}
                                />
                              </Box>
                            </Box>

                            {/* Syllabus chapters */}
                            {exam.syllabusChapters.length > 0 && (
                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                  <BookOpen size={14} color="#6B7280" />
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    Syllabus ({exam.syllabusChapters.length} chapters)
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                  {exam.syllabusChapters.slice(0, 5).map((ch, i) => (
                                    <Chip
                                      key={i}
                                      label={ch}
                                      size="small"
                                      sx={{
                                        bgcolor: `${subStyle.color}15`,
                                        color: subStyle.color,
                                        fontWeight: 500,
                                        fontSize: '0.6875rem',
                                        height: 24,
                                      }}
                                    />
                                  ))}
                                  {exam.syllabusChapters.length > 5 && (
                                    <Chip
                                      label={`+${exam.syllabusChapters.length - 5} more`}
                                      size="small"
                                      sx={{ bgcolor: 'grey.100', color: 'text.secondary', fontSize: '0.6875rem', height: 24 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}

                            {exam.readinessLevel === ReadinessLevel.AT_RISK && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                              >
                                <Box
                                  sx={{
                                    mt: 2,
                                    p: 1.5,
                                    borderRadius: '12px',
                                    bgcolor: '#FEF2F2',
                                    border: '1px solid #FCA5A5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                                  <Typography variant="caption" sx={{ color: '#DC2626' }}>
                                    <strong>Action needed!</strong> Your readiness score is critically low. Start studying immediately.
                                  </Typography>
                                </Box>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </Stack>
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
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
              <Typography sx={{ fontSize: '56px', mb: 2, lineHeight: 1 }}>📊</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Results are in Performance</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
                Detailed results and analysis are in the Performance section
              </Typography>
              <Button
                component="a"
                href="/performance"
                variant="contained"
                endIcon={<ChevronRight size={16} />}
              >
                Go to Performance
              </Button>
            </Box>
          </motion.div>
        )}

        {tab === 'preparation' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
              <Typography sx={{ fontSize: '56px', mb: 2, lineHeight: 1 }}>🎯</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Study Planner coming soon</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Personalized study schedules based on your exam dates and readiness scores
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}
