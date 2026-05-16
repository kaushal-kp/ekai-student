import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ROUTES } from '@/lib/constants';
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

const STATUS_CONFIG: Record<SubjectStatus, { label: string; color: string; bgcolor: string }> = {
  [SubjectStatus.ON_TRACK]: { label: 'On Track', color: '#16A34A', bgcolor: '#F0FDF4' },
  [SubjectStatus.NEEDS_ATTENTION]: { label: 'Needs Attention', color: '#D97706', bgcolor: '#FFFBEB' },
  [SubjectStatus.AT_RISK]: { label: 'At Risk', color: '#DC2626', bgcolor: '#FEF2F2' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

type FilterType = 'all' | SubjectStatus;

function SkeletonGrid() {
  return (
    <Grid container spacing={2.5}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Grid key={i} size={{ xs: 12, md: 6, xl: 4 }}>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: '20px' }} />
        </Grid>
      ))}
    </Grid>
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
    <Stack spacing={4} sx={{ maxWidth: '1200px' }}>
      <PageHeader title="Subjects" subtitle={`${subjects?.length || 0} subjects · Academic Year 2024–25`} />

      {/* Overview summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Grid container spacing={2.5}>
          {[
            { label: 'Overall Avg', value: `${avgScore}%`, gradient: 'linear-gradient(135deg, #6366F1, #818CF8)', icon: '📊' },
            { label: 'Total Subjects', value: subjects?.length || 0, gradient: 'linear-gradient(135deg, #6366F1, #818CF8)', icon: '📚' },
            { label: 'On Track', value: onTrack.length, gradient: 'linear-gradient(135deg, #10B981, #34D399)', icon: '✅' },
            { label: 'At Risk', value: atRisk.length, gradient: 'linear-gradient(135deg, #EF4444, #F87171)', icon: '⚠️' },
          ].map((s, i) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card elevation={2} sx={{ borderRadius: '16px' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: s.gradient,
                          flexShrink: 0,
                          fontSize: '18px',
                        }}
                      >
                        {s.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '22px', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                          {s.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Filter + Search bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val !== null && setFilter(val)}
          size="small"
          sx={{
            bgcolor: 'grey.100',
            borderRadius: '12px',
            p: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '9px !important',
              px: 2,
              py: 0.75,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'background.paper',
                color: 'primary.main',
                boxShadow: 1,
              },
            },
          }}
        >
          <ToggleButton value="all">All Subjects</ToggleButton>
          <ToggleButton value={SubjectStatus.ON_TRACK}>On Track</ToggleButton>
          <ToggleButton value={SubjectStatus.NEEDS_ATTENTION}>Needs Attention</ToggleButton>
          <ToggleButton value={SubjectStatus.AT_RISK}>At Risk</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder="Search subjects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 220 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={14} color="#9CA3AF" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Subject grid */}
      {isLoading ? <SkeletonGrid /> : (
        <motion.div variants={stagger} initial="hidden" animate="show">
          <Grid container spacing={2.5}>
            <AnimatePresence mode="popLayout">
              {filtered.map(subject => {
                const style = getSubjectStyle(subject.name);
                const status = STATUS_CONFIG[subject.status];
                return (
                  <Grid key={subject.id} size={{ xs: 12, md: 6, xl: 4 }}>
                    <motion.div
                      variants={fadeUp}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      style={{ height: '100%' }}
                    >
                      <Card
                        elevation={2}
                        onClick={() => navigate(`/academics/${subject.id}`)}
                        sx={{
                          borderRadius: '20px',
                          cursor: 'pointer',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          transition: 'box-shadow 0.2s',
                          '&:hover': { boxShadow: 4 },
                        }}
                      >
                        {/* Colored top strip */}
                        <Box sx={{ height: 4, background: style.gradient }} />

                        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: style.gradient,
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  flexShrink: 0,
                                }}
                              >
                                {subject.name[0]}
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'text.primary' }}>
                                  {subject.name}
                                </Typography>
                                <Chip
                                  label={subject.code}
                                  size="small"
                                  sx={{ height: 18, fontSize: '0.6875rem', bgcolor: 'grey.100', color: 'text.secondary' }}
                                />
                              </Box>
                            </Box>
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                bgcolor: status.bgcolor,
                                color: status.color,
                                fontWeight: 600,
                                fontSize: '0.6875rem',
                                flexShrink: 0,
                              }}
                            />
                          </Box>

                          {/* Teacher */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: style.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {subject.teacherName[0]}
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {subject.teacherName}
                            </Typography>
                          </Box>

                          {/* Progress */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Syllabus Progress</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: style.color }}>
                                {subject.syllabusProgress}%
                              </Typography>
                            </Box>
                            <ProgressBar value={subject.syllabusProgress} color={style.color} height={6} />
                          </Box>

                          {/* Stats row */}
                          <Grid container spacing={1} sx={{ mb: 1 }}>
                            {[
                              { label: 'Last Score', value: subject.lastScore !== undefined ? `${subject.lastScore}%` : '—', color: undefined },
                              { label: 'Average', value: subject.averageScore !== undefined ? `${subject.averageScore}%` : '—', color: undefined },
                              {
                                label: 'Attendance',
                                value: `${subject.attendancePercent}%`,
                                color: subject.attendancePercent >= 75 ? '#10B981' : '#EF4444',
                              },
                            ].map(stat => (
                              <Grid key={stat.label} size={{ xs: 4 }}>
                                <Box
                                  sx={{
                                    textAlign: 'center',
                                    p: 1,
                                    borderRadius: '8px',
                                    bgcolor: 'grey.50',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: '13px',
                                      fontWeight: 700,
                                      color: stat.color || 'text.primary',
                                    }}
                                  >
                                    {stat.value}
                                  </Typography>
                                  <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 0.25 }}>
                                    {stat.label}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>

                        {/* Footer */}
                        <Box
                          sx={{
                            px: 2.5,
                            pb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>View details</Typography>
                          <ChevronRight size={16} color="#9CA3AF" />
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </AnimatePresence>
          </Grid>
        </motion.div>
      )}

      {filtered.length === 0 && !isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
          <Typography sx={{ fontSize: '56px', mb: 2, lineHeight: 1 }}>📚</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>No subjects found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Try adjusting your filter or search
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
