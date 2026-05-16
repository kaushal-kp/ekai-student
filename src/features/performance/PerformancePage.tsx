import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
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
  'Computer Science': '#6366F1',
  'Physical Education': '#F97316',
};

function getSubjectColor(name: string) {
  for (const [k, v] of Object.entries(SUBJECT_COLORS)) {
    if (name.includes(k) || k.includes(name)) return v;
  }
  return '#6366F1';
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        px: 2,
        py: 1.5,
        boxShadow: 3,
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>{label}</Typography>
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{p.name}:</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{p.value}%</Typography>
        </Box>
      ))}
    </Box>
  );
}

type FilterType = 'all' | ExamType;

export default function PerformancePage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ['exam-results'],
    queryFn: async () => (await api.get('/student/exams/results')).data.data,
  });

  if (isLoading) return <LoadingSpinner />;

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
    avg: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length),
    classAvg: 70,
    color: s.color,
  }));

  const overallAvg = filtered.length
    ? Math.round(filtered.reduce((sum, r) => sum + r.percentage, 0) / filtered.length)
    : 0;

  const bestResult = filtered.reduce<ExamResult | null>(
    (best, r) => (!best || r.percentage > best.percentage) ? r : best,
    null
  );
  const bestSubject = bestResult?.subjectName || '—';

  const lowSubjects = Object.values(subjectMap).filter(s => {
    const avg = s.scores.reduce((a, b) => a + b, 0) / s.scores.length;
    return avg < 60;
  });

  const summaryStats = [
    { label: 'Overall Average', value: `${overallAvg}%`, icon: '📊', color: '#6366F1' },
    { label: 'Exams Taken', value: `${filtered.length}`, icon: '📝', color: '#10B981' },
    { label: 'Best Subject', value: bestSubject.split(' ')[0], icon: '⭐', color: '#F59E0B' },
  ];

  return (
    <Box>
      <PageHeader title="Academic Performance" subtitle="Marks, grades, and class rankings across all exams" />

      {/* Filter chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {examTypes.map(t => (
          <Chip
            key={t.key}
            label={t.label}
            onClick={() => setFilter(t.key)}
            color={filter === t.key ? 'primary' : 'default'}
            variant={filter === t.key ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, fontSize: 12 }}
          />
        ))}
      </Box>

      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryStats.map(s => (
          <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
            <Card elevation={2} sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: `${s.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 0.25 }}>{s.label}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Bar chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={2} sx={{ borderRadius: '16px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Subject Performance</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barGap={4} barCategoryGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="avg" name="Your Score" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="classAvg" name="Class Avg" fill="#E5E7EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Rankings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={2} sx={{ borderRadius: '16px', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Class Rankings</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {filtered.slice(0, 5).map(r => {
                  const gradeColor = getGradeColor(r.grade);
                  return (
                    <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: r.classRank <= 3 ? '#F59E0B' : r.classRank <= 10 ? '#6366F1' : 'action.hover',
                          color: r.classRank <= 10 ? '#fff' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        #{r.classRank}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{r.subjectName}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                          {r.examName} · Class avg: {r.classAverage}%
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.25,
                            borderRadius: '8px',
                            fontSize: 12,
                            fontWeight: 700,
                            color: gradeColor,
                            bgcolor: `${gradeColor}18`,
                          }}
                        >
                          {r.grade}
                        </Box>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>
                          {formatPercent(r.percentage)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights */}
      {lowSubjects.length > 0 && (
        <Card elevation={2} sx={{ borderRadius: '16px', mb: 3, borderLeft: '4px solid #6366F1' }}>
          <CardContent sx={{ p: 2.5, display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: '#6366F118',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LightbulbIcon sx={{ fontSize: 20, color: '#6366F1' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>AI-Powered Insights 🤖</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
                Based on your performance analysis, here are personalized recommendations:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {lowSubjects.map(s => (
                  <Box component="li" key={s.name} sx={{ display: 'flex', gap: 1, fontSize: 12, color: 'text.secondary' }}>
                    <span>⚡</span>
                    <span>
                      Your average in{' '}
                      <strong style={{ color: getSubjectColor(s.name) }}>{s.name}</strong>{' '}
                      is below 60%. Focus more study time on this subject.
                    </span>
                  </Box>
                ))}
                <Box component="li" sx={{ display: 'flex', gap: 1, fontSize: 12, color: 'text.secondary' }}>
                  <span>✅</span>
                  <span>
                    Overall average of {overallAvg}% is{' '}
                    {overallAvg >= 70 ? 'good' : 'needs improvement'}. Keep consistent with your study schedule.
                  </span>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Results table */}
      <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>All Results ({filtered.length})</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                {['Subject', 'Exam', 'Marks', 'Percentage', 'Grade', 'Rank', 'Class Avg'].map(h => (
                  <TableCell
                    key={h}
                    sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(r => {
                const gradeColor = getGradeColor(r.grade);
                const subColor = getSubjectColor(r.subjectName);
                return (
                  <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s' }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 3, height: 28, borderRadius: 1, bgcolor: subColor, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{r.subjectName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{r.examName}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>
                      {r.marksObtained}
                      <Typography component="span" sx={{ color: 'text.disabled', fontSize: 11 }}>/{r.maxMarks}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{formatPercent(r.percentage)}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.25,
                          borderRadius: '6px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: gradeColor,
                          bgcolor: `${gradeColor}18`,
                        }}
                      >
                        {r.grade}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>#{r.classRank}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.disabled' }}>{r.classAverage}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
