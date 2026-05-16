import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip, Button,
  Table, TableHead, TableBody, TableRow, TableCell, LinearProgress,
  ToggleButton, ToggleButtonGroup, Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import SchoolIcon from '@mui/icons-material/School';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { getGradeColor } from '@/lib/utils';
import { formatPercent } from '@/lib/formatters';
import api from '@/lib/api';
import { ExamResult } from '@/types/models';
import { ExamType } from '@/types/enums';

function getGradeChipColor(grade: string): { bg: string; color: string } {
  if (grade.startsWith('A')) return { bg: '#D1FAF0', color: '#10B981' };
  if (grade.startsWith('B')) return { bg: '#DBEAFE', color: '#3B82F6' };
  if (grade.startsWith('C')) return { bg: '#FEF3C7', color: '#F59E0B' };
  if (grade === 'F') return { bg: '#FEE2E2', color: '#EF4444' };
  return { bg: '#F3F4F6', color: '#6B7280' };
}

export default function ReportCardPage() {
  const { student } = useAuthStore();
  const [selectedExam, setSelectedExam] = useState<ExamType>(ExamType.UNIT_TEST);

  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ['exam-results'],
    queryFn: async () => (await api.get('/student/exams/results')).data.data,
  });

  if (isLoading) return <LoadingSpinner />;

  const filtered = results?.filter(r => r.examType === selectedExam) || [];
  const totalMarks = filtered.reduce((sum, r) => sum + r.marksObtained, 0);
  const maxMarks = filtered.reduce((sum, r) => sum + r.maxMarks, 0);
  const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
  const isPassing = percentage >= 75;

  return (
    <Box sx={{ maxWidth: 760 }}>
      <PageHeader title="Report Card" />

      {/* Student Info Header Card */}
      <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2 }}>
            <Avatar
              sx={{
                width: 64, height: 64, fontSize: 24, fontWeight: 700,
                bgcolor: '#6366F1', color: '#fff',
              }}
              src={student?.avatarUrl}
            >
              {student?.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{student?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Class {student?.class}-{student?.section} &nbsp;·&nbsp; Roll No. {student?.rollNumber}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip label={student?.board} size="small" variant="outlined" />
                <Chip
                  label={`APAAR: ${student?.apaarId}`}
                  size="small"
                  sx={{ bgcolor: '#D1FAF0', color: '#10B981', fontWeight: 600, fontSize: 11 }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="contained" size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: '10px' }}>
                Download PDF
              </Button>
              <Button variant="outlined" size="small" startIcon={<ShareIcon />} sx={{ borderRadius: '10px' }}>
                Share
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">School</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{student?.schoolName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">UDISE Code</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{student?.udiseCode}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Academic Year</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{student?.academicYear}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Exam type selector */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={selectedExam}
          exclusive
          onChange={(_, v) => v && setSelectedExam(v)}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          {[ExamType.UNIT_TEST, ExamType.HALF_YEARLY, ExamType.PERIODIC].map(t => (
            <ToggleButton
              key={t}
              value={t}
              sx={{
                borderRadius: '10px !important',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
                px: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: '#6366F1', color: '#fff',
                  '&:hover': { bgcolor: '#4F46E5' },
                },
              }}
            >
              {t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Overall result card */}
      {filtered.length > 0 && (
        <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                  }}
                >
                  <SchoolIcon sx={{ color: '#fff' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Overall Performance</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalMarks} / {maxMarks}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 ,  color: isPassing ? '#10B981' : '#EF4444' }}>
                  {formatPercent(percentage)}
                </Typography>
                <Chip
                  label={isPassing ? 'Pass' : 'Needs Improvement'}
                  sx={{
                    bgcolor: isPassing ? '#D1FAF0' : '#FEE2E2',
                    color: isPassing ? '#10B981' : '#EF4444',
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Subjects table */}
      <Card elevation={2} sx={{ borderRadius: '16px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 ,  mb: 2 }}>
            {selectedExam.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} — Subject Results
          </Typography>

          {filtered.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  {['Subject', 'Max Marks', 'Obtained', 'Progress', 'Grade', 'Remarks'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(r => {
                  const gradeColor = getGradeChipColor(r.grade);
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{r.subjectName}</TableCell>
                      <TableCell>{r.maxMarks}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 ,  color: getGradeColor(r.grade) }}>
                          {r.marksObtained}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <LinearProgress
                          variant="determinate"
                          value={r.percentage}
                          sx={{
                            height: 6, borderRadius: 3,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { bgcolor: getGradeColor(r.grade), borderRadius: 3 },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">{formatPercent(r.percentage)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.grade}
                          size="small"
                          sx={{ bgcolor: gradeColor.bg, color: gradeColor.color, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {r.teacherRemarks?.slice(0, 30)}{(r.teacherRemarks?.length ?? 0) > 30 ? '...' : ''}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Totals row */}
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{maxMarks}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isPassing ? '#10B981' : '#EF4444' }}>{totalMarks}</TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': { bgcolor: isPassing ? '#10B981' : '#EF4444', borderRadius: 3 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: isPassing ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {formatPercent(percentage)}
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              No results available for this exam type.
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Generated via EKAI Student Hub · {new Date().toLocaleDateString('en-IN')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
