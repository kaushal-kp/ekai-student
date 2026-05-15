import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { Achievement } from '@/types/models';

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: '#F8F9FF', border: '#E5E7F0', text: '#6B7280' },
  rare: { bg: '#EEEDFF', border: '#6C63FF', text: '#6C63FF' },
  epic: { bg: '#FEF3C7', border: '#F59E0B', text: '#F59E0B' },
  legendary: { bg: '#FEE2E2', border: '#EF4444', text: '#EF4444' },
};

export default function AchievementsPage() {
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => (await api.get('/student/achievements')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  const earned = achievements?.filter(a => a.earned) || [];
  const locked = achievements?.filter(a => !a.earned) || [];

  const displayed = filter === 'all' ? achievements : filter === 'earned' ? earned : locked;

  return (
    <div className="max-w-4xl">
      <PageHeader title="Achievements" subtitle={`${earned.length} earned · ${locked.length} in progress`} />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {['legendary', 'epic', 'rare', 'common'].map(rarity => {
          const count = earned.filter(a => a.rarity === rarity).length;
          const color = rarityColors[rarity];
          return (
            <div key={rarity} className="text-center p-3 rounded-[var(--radius-lg)] border" style={{ backgroundColor: color.bg, borderColor: color.border }}>
              <p className="text-xl font-bold" style={{ color: color.text }}>{count}</p>
              <p className="text-xs font-medium mt-0.5 capitalize" style={{ color: color.text }}>{rarity}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[['all', 'All'], ['earned', 'Earned'], ['locked', 'In Progress']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === v ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {displayed?.map(ach => {
          const rarity = rarityColors[ach.rarity];
          return (
            <motion.div
              key={ach.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`relative ${!ach.earned ? 'opacity-70' : ''}`}
                style={{ borderColor: ach.earned ? rarity.border : 'var(--color-border)' }}
              >
                {!ach.earned && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="text-3xl w-12 h-12 flex items-center justify-center rounded-[var(--radius-md)] flex-shrink-0"
                    style={{ backgroundColor: ach.earned ? `${ach.color}20` : 'var(--color-surface-2)' }}
                  >
                    {ach.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)] text-sm">{ach.name}</p>
                    <span className="text-xs capitalize px-1.5 py-0.5 rounded font-medium" style={{ color: rarity.text, backgroundColor: rarity.bg }}>
                      {ach.rarity}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] mb-2">{ach.description}</p>

                {ach.earned && ach.earnedAt && (
                  <p className="text-xs text-[var(--color-success)]">✓ Earned {formatDate(ach.earnedAt)}</p>
                )}

                {!ach.earned && ach.progress !== undefined && ach.progressMax !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-muted)]">{ach.progressLabel}</span>
                      <span className="font-medium text-[var(--color-text)]">{Math.round((ach.progress / ach.progressMax) * 100)}%</span>
                    </div>
                    <ProgressBar value={ach.progress} max={ach.progressMax} color={ach.color} height={4} />
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
