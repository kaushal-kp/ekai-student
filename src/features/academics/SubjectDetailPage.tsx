import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail } from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { Subject } from '@/types/models';

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const { data: subject, isLoading } = useQuery<Subject>({
    queryKey: ['subject', subjectId],
    queryFn: async () => (await api.get(`/student/subjects/${subjectId}`)).data.data,
  });

  if (isLoading) return <LoadingSpinner size={48} />;
  if (!subject) return null;

  const attendanceColor = subject.attendancePercent >= 75 ? '#16A34A' : '#DC2626';

  return (
    <Stack spacing={3} sx={{ maxWidth: '900px' }}>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        variant="text"
        sx={{ alignSelf: 'flex-start', color: 'text.secondary', fontWeight: 500 }}
      >
        Back to Subjects
      </Button>

      <PageHeader title={subject.name} subtitle={`${subject.code} • ${subject.teacherName}`}>
        <RiskBadge status={subject.status} />
      </PageHeader>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ borderRadius: '16px' }}>
            <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Performance</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {subject.lastScore ?? '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Last Score</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {subject.averageScore ?? '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Average</Typography>
                  </Box>
                </Grid>
              </Grid>
              <ProgressBar value={subject.syllabusProgress} height={8} showLabel label="Syllabus Progress" />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ borderRadius: '16px' }}>
            <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Attendance</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: attendanceColor }}>
                  {subject.attendancePercent}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Subject Attendance
                </Typography>
                {subject.attendancePercent < 75 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: '#FEF2F2',
                      borderRadius: '12px',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#DC2626' }}>
                      ⚠️ Below minimum 75% requirement
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card elevation={2} sx={{ borderRadius: '16px' }}>
            <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 700 }}>Teacher Contact</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {subject.teacherName[0]}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{subject.teacherName}</Typography>
                  {subject.teacherEmail && (
                    <Box
                      component="a"
                      href={`mailto:${subject.teacherEmail}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'primary.main',
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      <Mail size={12} />
                      {subject.teacherEmail}
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
