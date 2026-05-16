import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { Achievement } from '@/types/models';

const RARITY_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  gradient: string;
}> = {
  legendary: {
    label: 'Legendary',
    color: '#F59E0B',
    bg: '#FEF3C7',
    gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
  },
  epic: {
    label: 'Epic',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  },
  rare: {
    label: 'Rare',
    color: '#3B82F6',
    bg: '#DBEAFE',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  },
  common: {
    label: 'Common',
    color: '#6B7280',
    bg: '#F3F4F6',
    gradient: 'linear-gradient(135deg, #9CA3AF, #D1D5DB)',
  },
};

const CATEGORY_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  academic: 'primary',
  improvement: 'info',
  attendance: 'success',
  milestone: 'warning',
  participation: 'secondary',
};

type FilterType = 'all' | 'earned' | 'locked';

export default function AchievementsPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => (await api.get('/student/achievements')).data.data,
  });

  const earned = achievements?.filter(a => a.earned) || [];
  const locked = achievements?.filter(a => !a.earned) || [];
  const displayed = filter === 'all' ? achievements : filter === 'earned' ? earned : locked;

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'earned', label: 'Earned' },
    { value: 'locked', label: 'In Progress' },
  ];

  return (
    <Box sx={{ maxWidth: 960 }}>
      <PageHeader
        title="Achievements"
        subtitle={`${earned.length} earned · ${locked.length} in progress`}
      />

      {/* Rarity breakdown */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => {
          const cfg = RARITY_CONFIG[rarity];
          const count = earned.filter(a => a.rarity === rarity).length;
          const total = (achievements || []).filter(a => a.rarity === rarity).length;
          return (
            <Grid size={{ xs: 6, md: 3 }} key={rarity}>
              <Card elevation={2} sx={{ borderRadius: '16px', background: cfg.bg, border: `1px solid ${cfg.color}40` }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '6px', background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EmojiEventsIcon sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: 'capitalize' }}>
                      {cfg.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{count}</Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>of {total} unlocked</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filter chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
        {filters.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            onClick={() => setFilter(value)}
            color={filter === value ? 'primary' : 'default'}
            variant={filter === value ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600 }}
          />
        ))}
        <Typography sx={{ ml: 'auto', fontSize: 12, color: 'text.disabled' }}>
          {displayed?.length || 0} achievements
        </Typography>
      </Box>

      {/* Achievements grid */}
      <Grid container spacing={2}>
        {isLoading
          ? [1, 2, 3, 4, 5, 6].map(i => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '16px' }} />
              </Grid>
            ))
          : displayed?.map(ach => {
              const rarity = RARITY_CONFIG[ach.rarity] || RARITY_CONFIG.common;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ach.id}>
                  <Card
                    elevation={ach.earned ? 2 : 1}
                    sx={{
                      borderRadius: '16px',
                      opacity: ach.earned ? 1 : 0.72,
                      border: `1px solid ${ach.earned ? rarity.color + '40' : 'divider'}`,
                      transition: 'transform 0.2s',
                      '&:hover': ach.earned ? { transform: 'translateY(-4px)' } : {},
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top rarity stripe */}
                    <Box sx={{ height: 6, background: ach.earned ? rarity.gradient : 'divider' }} />

                    <CardContent sx={{ p: 2.5 }}>
                      {/* Lock icon for locked */}
                      {!ach.earned && (
                        <Box sx={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider' }}>
                          <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        </Box>
                      )}

                      {/* Icon + rarity */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28,
                            flexShrink: 0,
                            bgcolor: ach.earned ? `${ach.color}20` : 'action.hover',
                            filter: ach.earned ? 'none' : 'grayscale(1) opacity(0.5)',
                          }}
                        >
                          {ach.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
                            {ach.name}
                          </Typography>
                          <Chip
                            label={rarity.label}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 700,
                              height: 20,
                              bgcolor: ach.earned ? rarity.bg : 'action.hover',
                              color: ach.earned ? rarity.color : 'text.disabled',
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12, mb: 1.5, lineHeight: 1.6 }}>
                        {ach.description}
                      </Typography>

                      {/* Category chip */}
                      <Chip
                        label={ach.category}
                        size="small"
                        color={CATEGORY_COLOR[ach.category] || 'default'}
                        sx={{ fontSize: 10, height: 20, textTransform: 'capitalize', mb: 1 }}
                      />

                      {ach.earned && ach.earnedAt && (
                        <Typography sx={{ fontSize: 11, color: 'success.main', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          ✓ Earned {formatDate(ach.earnedAt)}
                        </Typography>
                      )}

                      {!ach.earned && ach.progress !== undefined && ach.progressMax !== undefined && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{ach.progressLabel}</Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
                              {ach.progress}/{ach.progressMax}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((ach.progress / ach.progressMax) * 100, 100)}
                            sx={{ borderRadius: 4, height: 6 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
      </Grid>

      {!isLoading && displayed?.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
          <Typography sx={{ fontSize: 56, mb: 2 }}>🏆</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>No achievements here</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {filter === 'earned' ? 'Start studying to earn your first badge!' : 'All badges are earned — amazing!'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
