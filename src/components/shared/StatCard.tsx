import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, Chip, Box, Typography } from '@mui/material';

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
  color = '#6366F1',
  onClick,
}: StatCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue) && typeof numericValue === 'number';
  const suffix = typeof value === 'string' ? value.replace(/^[\d.]+/, '') : '';
  const bgGradient = gradient || `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card
        elevation={2}
        sx={{
          borderRadius: '16px',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem' }}>
              {title}
            </Typography>
            {icon && (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bgGradient,
                  flexShrink: 0,
                  '& svg': { color: 'white', width: 20, height: 20 },
                }}
              >
                {icon}
              </Box>
            )}
          </Box>

          <Typography sx={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: 'text.primary', mb: 0.5 }}>
            {isNumeric ? (
              <>
                <AnimatedNumber value={numericValue} />
                {suffix}
              </>
            ) : value}
          </Typography>

          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
          )}

          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <Chip
                size="small"
                icon={trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : undefined}
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  bgcolor: trend > 0 ? '#F0FDF4' : trend < 0 ? '#FEF2F2' : 'grey.100',
                  color: trend > 0 ? '#16A34A' : trend < 0 ? '#DC2626' : 'text.secondary',
                  '& .MuiChip-icon': { fontSize: 12 },
                }}
              />
              {trendLabel && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{trendLabel}</Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
