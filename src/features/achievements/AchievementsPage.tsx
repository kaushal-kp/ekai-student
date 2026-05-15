import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Trophy, Star, Zap, Crown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatDate } from '@/lib/formatters';
import api from '@/lib/api';
import { Achievement } from '@/types/models';

const RARITY_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string;
  glow: string; icon: React.ReactNode; gradient: string;
}> = {
  legendary: {
    label: 'Legendary', color: '#F59E0B', bg: '#FEF3C7', border: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.4)', icon: <Crown className="h-3.5 w-3.5" />,
    gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
  },
  epic: {
    label: 'Epic', color: '#8B5CF6', bg: '#EDE9FE', border: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.3)', icon: <Star className="h-3.5 w-3.5" />,
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  },
  rare: {
    label: 'Rare', color: '#3B82F6', bg: '#DBEAFE', border: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.25)', icon: <Zap className="h-3.5 w-3.5" />,
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  },
  common: {
    label: 'Common', color: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB',
    glow: 'rgba(107, 114, 128, 0.15)', icon: <Trophy className="h-3.5 w-3.5" />,
    gradient: 'linear-gradient(135deg, #9CA3AF, #D1D5DB)',
  },
};

type FilterType = 'all' | 'earned' | 'locked';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } }
};

export default function AchievementsPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => (await api.get('/student/achievements')).data.data,
  });

  const earned = achievements?.filter(a => a.earned) || [];
  const locked = achievements?.filter(a => !a.earned) || [];
  const displayed = filter === 'all' ? achievements : filter === 'earned' ? earned : locked;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Achievements" subtitle={`${earned.length} earned · ${locked.length} in progress`} />

      {/* Rarity breakdown banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['legendary', 'epic', 'rare', 'common'] as const).map(rarity => {
            const cfg = RARITY_CONFIG[rarity];
            const count = earned.filter(a => a.rarity === rarity).length;
            const total = (achievements || []).filter(a => a.rarity === rarity).length;
            return (
              <div
                key={rarity}
                className="p-4 rounded-[16px] border"
                style={{ background: cfg.bg, borderColor: cfg.border + '60' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-white"
                    style={{ background: cfg.gradient }}>
                    {cfg.icon}
                  </div>
                  <span className="text-[12px] font-bold capitalize" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
                <p className="text-[22px] font-bold" style={{ color: cfg.color }}>{count}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">of {total} unlocked</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([['all', 'All'], ['earned', '✅ Earned'], ['locked', '🔒 In Progress']] as [FilterType, string][]).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className="px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all"
            style={filter === v ? {
              background: 'var(--gradient-primary)',
              color: 'white',
            } : {
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {l}
          </button>
        ))}
        <div className="ml-auto text-[12px] text-[var(--color-text-muted)] self-center">
          {displayed?.length || 0} achievements
        </div>
      </div>

      {/* Achievements grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-[180px] rounded-[20px]" />)}
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {displayed?.map(ach => {
              const rarity = RARITY_CONFIG[ach.rarity] || RARITY_CONFIG.common;
              const earnedColor = ach.earned ? ach.color : undefined;

              return (
                <motion.div
                  key={ach.id}
                  variants={fadeUp}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={ach.earned ? { y: -4 } : {}}
                  className="relative rounded-[20px] overflow-hidden border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: ach.earned ? `${rarity.border}60` : 'var(--color-border)',
                    boxShadow: ach.earned ? `0 4px 20px ${rarity.glow}` : 'var(--shadow-sm)',
                    opacity: ach.earned ? 1 : 0.7,
                  }}
                >
                  {/* Top rarity stripe */}
                  <div className="h-1.5 w-full" style={{ background: ach.earned ? rarity.gradient : 'var(--color-border)' }} />

                  <div className="p-5">
                    {/* Lock overlay */}
                    {!ach.earned && (
                      <div className="absolute top-4 right-4">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                          <Lock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                        </div>
                      </div>
                    )}

                    {/* Icon + rarity */}
                    <div className="flex items-start gap-3 mb-3">
                      <motion.div
                        animate={ach.earned ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[30px] flex-shrink-0"
                        style={{
                          background: ach.earned ? `${earnedColor}20` : 'var(--color-surface-2)',
                          boxShadow: ach.earned ? `0 0 12px ${rarity.glow}` : 'none',
                          filter: ach.earned ? 'none' : 'grayscale(1) opacity(0.5)',
                        }}
                      >
                        {ach.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[var(--color-text)] leading-tight">{ach.name}</p>
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 capitalize"
                          style={{
                            background: ach.earned ? rarity.bg : 'var(--color-surface-2)',
                            color: ach.earned ? rarity.color : 'var(--color-text-muted)',
                          }}
                        >
                          {rarity.icon} {rarity.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-3">{ach.description}</p>

                    {ach.earned && ach.earnedAt && (
                      <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                        ✓ Earned {formatDate(ach.earnedAt)}
                      </p>
                    )}

                    {!ach.earned && ach.progress !== undefined && ach.progressMax !== undefined && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-[var(--color-text-muted)]">{ach.progressLabel}</span>
                          <span className="font-semibold text-[var(--color-text)]">
                            {ach.progress}/{ach.progressMax}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((ach.progress / ach.progressMax) * 100, 100)}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ background: ach.color || 'var(--gradient-primary)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {!isLoading && displayed?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-[56px] mb-4">🏆</span>
          <p className="text-[16px] font-semibold text-[var(--color-text)]">No achievements here</p>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
            {filter === 'earned' ? 'Start studying to earn your first badge!' : 'All badges are earned — amazing!'}
          </p>
        </div>
      )}
    </div>
  );
}
