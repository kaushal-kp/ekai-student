import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  color,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]',
        onClick && 'cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[var(--color-text-secondary)] font-medium">{title}</p>
        {icon && (
          <div
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color ? `${color}20` : 'var(--color-primary-light)' }}
          >
            <span style={{ color: color || 'var(--color-primary)' }}>{icon}</span>
          </div>
        )}
      </div>
      <p
        className="text-2xl font-bold text-[var(--color-text)]"
        style={{ color: color ? color : undefined }}
      >
        {value}
      </p>
      {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend > 0 ? (
            <TrendingUp className="h-3 w-3 text-[var(--color-success)]" />
          ) : trend < 0 ? (
            <TrendingDown className="h-3 w-3 text-[var(--color-danger)]" />
          ) : null}
          <span
            className={cn(
              'text-xs font-medium',
              trend > 0 ? 'text-[var(--color-success)]' : trend < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
            )}
          >
            {trend > 0 ? '+' : ''}{trend}% {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
