import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { CoCurricularActivity } from '@/types/models';

const LEVEL_COLORS: Record<string, string> = {
  school: '#3B82F6',
  district: '#22C55E',
  state: '#F59E0B',
  national: '#EF4444',
};

const LEVEL_STRIP: Record<string, string> = {
  school: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  district: 'linear-gradient(135deg, #22C55E, #4ADE80)',
  state: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
  national: 'linear-gradient(135deg, #EF4444, #F87171)',
};

const CATEGORIES = ['All', 'Sports', 'Cultural', 'Academic', 'Social'];

export default function CoCurricularPage() {
  const [tab, setTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const { data: activities, isLoading } = useQuery<CoCurricularActivity[]>({
    queryKey: ['co-curricular'],
    queryFn: async () => (await api.get('/student/co-curricular')).data.data,
  });

  const filtered = activities?.filter(a =>
    categoryFilter === 'All' ? true : a.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  const ongoing = filtered?.filter(a => a.isOngoing) || [];
  const completed = filtered?.filter(a => !a.isOngoing) || [];
  const tabData = tab === 0 ? filtered : tab === 1 ? ongoing : completed;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 768 }}>
      <PageHeader title="Co-Curricular Activities" subtitle="Extra-curricular achievements and certificates" />

      {/* Category filter chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {CATEGORIES.map(cat => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setCategoryFilter(cat)}
            color={categoryFilter === cat ? 'primary' : 'default'}
            variant={categoryFilter === cat ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>

      {/* Status tabs */}
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`All (${filtered?.length || 0})`} />
        <Tab label={`Ongoing (${ongoing.length})`} />
        <Tab label={`Completed (${completed.length})`} />
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tabData?.map(activity => (
          <Card key={activity.id} elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            {/* Colored strip based on level */}
            <Box sx={{ height: 5, background: LEVEL_STRIP[activity.level] || LEVEL_STRIP.school }} />
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: `${LEVEL_COLORS[activity.level] || '#6366F1'}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <WorkspacePremiumIcon sx={{ color: LEVEL_COLORS[activity.level] || '#6366F1', fontSize: 22 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Name + badges */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{activity.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      <Chip label={activity.category} size="small" color="primary" variant="outlined" sx={{ fontSize: 11 }} />
                      <Chip
                        label={`${activity.level} Level`}
                        size="small"
                        sx={{ fontSize: 11, bgcolor: LEVEL_COLORS[activity.level] || '#6366F1', color: '#fff' }}
                      />
                      {activity.isOngoing && <Chip label="Ongoing" size="small" color="success" sx={{ fontSize: 11 }} />}
                      {activity.isVerified && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                          label="Verified"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontSize: 11 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12, mb: 1 }}>
                    {activity.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 12, color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonthIcon sx={{ fontSize: 14 }} />
                      {formatDate(activity.startDate)}
                      {activity.endDate && ` — ${formatDate(activity.endDate)}`}
                    </Typography>
                    {activity.coach && (
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                        Coach: {activity.coach}
                      </Typography>
                    )}
                  </Box>

                  {activity.performanceNotes && (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1, fontStyle: 'italic' }}>
                      📝 {activity.performanceNotes}
                    </Typography>
                  )}

                  {activity.certificates.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.disabled', mb: 1 }}>
                        Certificates
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {activity.certificates.map(cert => (
                          <Box key={cert.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkspacePremiumIcon sx={{ fontSize: 14, color: '#6366F1', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 12, color: 'text.primary' }}>{cert.name}</Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>·</Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{cert.issuer}</Typography>
                            {cert.isVerified && (
                              <Chip label="Verified" size="small" color="success" sx={{ fontSize: 10, height: 18 }} />
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {tabData?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: 48, mb: 2 }}>🎯</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>No activities found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Try a different filter or category
          </Typography>
        </Box>
      )}
    </Box>
  );
}
