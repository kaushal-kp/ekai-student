import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/formatters';
import { formatIndianCurrency, daysUntil } from '@/lib/utils';
import api from '@/lib/api';
import { OpportunitiesResponse } from '@/types/api';

export default function OpportunitiesPage() {
  const [tab, setTab] = useState(0);

  const { data, isLoading } = useQuery<OpportunitiesResponse>({
    queryKey: ['opportunities'],
    queryFn: async () => (await api.get('/student/opportunities')).data.data,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ maxWidth: 768 }}>
      <PageHeader title="Opportunities" subtitle="Scholarships, internships, and campus events" />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab
          label={`Scholarships (${data?.scholarships.length ?? 0})`}
          sx={{ fontWeight: 600, textTransform: 'none', fontSize: 14 }}
        />
        <Tab
          label={`Internships (${data?.internships.length ?? 0})`}
          sx={{ fontWeight: 600, textTransform: 'none', fontSize: 14 }}
        />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data?.scholarships.map(sch => {
            const days = daysUntil(sch.deadline);
            return (
              <Card key={sch.id} elevation={2} sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{sch.name}</Typography>
                        {sch.eligibilityStatus === 'eligible' && (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                            label="Eligible"
                            size="small"
                            color="success"
                            sx={{ fontSize: 10, height: 22 }}
                          />
                        )}
                        {sch.eligibilityStatus === 'partial' && (
                          <Chip
                            icon={<ErrorOutlineIcon sx={{ fontSize: 12 }} />}
                            label="Partial"
                            size="small"
                            color="warning"
                            sx={{ fontSize: 10, height: 22 }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 1.5 }}>{sch.provider}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <CurrencyRupeeIcon sx={{ fontSize: 14 }} />
                          {formatIndianCurrency(sch.amount)}/year
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <CalendarTodayIcon sx={{ fontSize: 13 }} />
                          Deadline: {formatDate(sch.deadline)}
                          {days <= 30 && (
                            <Typography component="span" sx={{ color: 'error.main', fontSize: 12, ml: 0.5 }}>
                              ({days}d left)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 0.5 }}>Eligibility:</Typography>
                        {sch.eligibilityCriteria.slice(0, 2).map((c, i) => (
                          <Typography key={i} sx={{ fontSize: 12, color: 'text.secondary' }}>• {c}</Typography>
                        ))}
                      </Box>
                    </Box>
                    {sch.applicationUrl && (
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        href={sch.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        component="a"
                        sx={{ borderRadius: 2, flexShrink: 0, whiteSpace: 'nowrap' }}
                      >
                        Apply
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data?.internships.map(intern => (
            <Card key={intern.id} elevation={2} sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{intern.role}</Typography>
                      {intern.isVerifiedEmployer && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                          label="Verified"
                          size="small"
                          color="success"
                          sx={{ fontSize: 10, height: 22 }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1.5 }}>{intern.company}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: intern.stipend > 0 ? 'success.main' : 'text.disabled',
                        }}
                      >
                        {intern.stipend > 0 ? `₹${intern.stipend.toLocaleString('en-IN')}/month` : 'Unpaid'}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{intern.duration}</Typography>
                      <Chip
                        label={intern.mode}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10, height: 22, textTransform: 'capitalize' }}
                      />
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                        Deadline: {formatDate(intern.deadline)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {intern.skillsRequired.map(s => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: 10, height: 22 }} />
                      ))}
                    </Box>
                  </Box>
                  <Button variant="contained" size="small" sx={{ borderRadius: 2, flexShrink: 0 }}>
                    Apply
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
