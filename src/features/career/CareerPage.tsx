import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import { PageHeader } from '@/components/shared/PageHeader';
import api from '@/lib/api';
import { CareerRecommendation } from '@/types/models';

export default function CareerPage() {
  const { data: careers, isLoading } = useQuery<CareerRecommendation[]>({
    queryKey: ['career-recommendations'],
    queryFn: async () => (await api.get('/student/career/recommendations')).data.data,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960 }}>
      <PageHeader
        title="Career Guidance"
        subtitle="AI-powered career recommendations based on your profile"
      />

      {/* Aptitude summary */}
      <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Aptitude Overview</Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Analytical', score: 82 },
              { label: 'Creative', score: 74 },
              { label: 'Technical', score: 68 },
              { label: 'Communication', score: 78 },
            ].map(apt => (
              <Grid size={{ xs: 12, sm: 6 }} key={apt.label}>
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{apt.label}</Typography>
                    <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 700 }}>{apt.score}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={apt.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#6366F118',
                      '& .MuiLinearProgress-bar': { bgcolor: '#6366F1', borderRadius: 4 },
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Career recommendation cards */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Career Recommendations</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {careers?.map(career => (
          <Card key={career.id} elevation={2} sx={{ borderRadius: '16px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: '#6366F118',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <WorkIcon sx={{ color: '#6366F1', fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{career.title}</Typography>
                      <Chip label={career.field} size="small" color="info" sx={{ mt: 0.5, fontSize: 11 }} />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#6366F1', lineHeight: 1 }}>
                        {career.matchPercent}%
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>match</Typography>
                    </Box>
                  </Box>

                  {/* Match progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={career.matchPercent}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      mb: 2,
                      bgcolor: '#6366F118',
                      '& .MuiLinearProgress-bar': { bgcolor: '#6366F1', borderRadius: 3 },
                    }}
                  />

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: 13 }}>
                    {career.description}
                  </Typography>

                  {/* Stats row */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Salary Range</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {career.salaryRangeMin}–{career.salaryRangeMax} LPA
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <SchoolIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Entrance Exams</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {career.entranceExams.slice(0, 2).map(e => (
                          <Chip key={e} label={e} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                        ))}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Top Colleges</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {career.topColleges.slice(0, 2).join(', ')}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Skills chips */}
                  <Box>
                    <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 0.75 }}>Key Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {career.keySkills.slice(0, 5).map(skill => (
                        <Chip key={skill} label={skill} size="small" color="primary" variant="outlined" sx={{ fontSize: 11 }} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {careers?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: 48, mb: 2 }}>🚀</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>No recommendations yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Complete your profile to get personalized career suggestions.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
