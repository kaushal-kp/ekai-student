import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  gradient?: string;
  color?: string;
  className?: string;
  onClick?: () => void;
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v).toString();
      },
    });
    return controls.stop;
  }, [value]);

  return <span ref={ref}>0</span>;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  gradient,
  color,
  className,
  onClick,
}: StatCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue) && typeof numericValue === 'number';
  const suffix = typeof value === 'string' ? value.replace(/^[\d.]+/, '') : '';

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-[16px] p-5 cursor-pointer group',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'shadow-[var(--shadow-sm)] transition-all duration-300',
        className
      )}
      style={onClick ? { cursor: 'pointer' } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Gradient hover border */}
      <div
        className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: gradient || `linear-gradient(135deg, ${color || 'var(--color-primary)'} 0%, ${color || 'var(--color-primary)'}80 100%)`,
          padding: '1px',
          zIndex: 0,
        }}
      />
      <div className="absolute inset-[1px] rounded-[15px] bg-[var(--color-surface)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-[13px] font-medium text-[var(--color-text-secondary)] leading-tight">{title}</p>
          {icon && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: gradient || `linear-gradient(135deg, ${color || 'var(--color-primary)'} 0%, ${color || '#9C8FFF'} 100%)` }}
            >
              <span className="text-white [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-end gap-1 mb-1">
          <p className="text-[28px] font-bold leading-none tracking-tight text-[var(--color-text)]">
            {isNumeric ? (
              <>
                <AnimatedNumber value={numericValue} />
                {suffix}
              </>
            ) : value}
          </p>
        </div>

        {subtitle && (
          <p className="text-[12px] text-[var(--color-text-muted)] mt-1">{subtitle}</p>
        )}

        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-3">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                background: trend > 0 ? 'var(--color-success-light)' : trend < 0 ? 'var(--color-danger-light)' : 'var(--color-surface-2)',
                color: trend > 0 ? 'var(--color-success)' : trend < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)',
              }}
            >
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
              {trend > 0 ? '+' : ''}{trend}%
            </div>
            {trendLabel && <span className="text-[11px] text-[var(--color-text-muted)]">{trendLabel}</span>}
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[16px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: gradient || `linear-gradient(90deg, ${color || 'var(--color-primary)'}, transparent)` }}
      />
    </motion.div>
  );
}
