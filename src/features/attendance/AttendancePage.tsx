import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, CalendarCheck, CalendarX, Clock, PlaneLanding } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { AttendanceDay, MonthlyAttendance } from '@/types/models';
import { AttendanceStatus } from '@/types/enums';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; ring: string }> = {
  [AttendanceStatus.PRESENT]: { label: 'Present', color: '#10B981', bg: '#D1FAF0', ring: '#10B981' },
  [AttendanceStatus.ABSENT]: { label: 'Absent', color: '#EF4444', bg: '#FEE2E2', ring: '#EF4444' },
  [AttendanceStatus.LATE]: { label: 'Late', color: '#F59E0B', bg: '#FEF3C7', ring: '#F59E0B' },
  [AttendanceStatus.HOLIDAY]: { label: 'Holiday', color: '#6B7280', bg: '#F3F4F6', ring: '#D1D5DB' },
  [AttendanceStatus.LEAVE]: { label: 'Leave', color: '#3B82F6', bg: '#DBEAFE', ring: '#3B82F6' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4));

  const { data: monthly, isLoading: loadingMonthly } = useQuery<MonthlyAttendance[]>({
    queryKey: ['attendance-monthly'],
    queryFn: async () => (await api.get('/student/attendance/monthly')).data.data,
  });

  const { data: days } = useQuery<AttendanceDay[]>({
    queryKey: ['attendance-days'],
    queryFn: async () => (await api.get('/student/attendance/days')).data.data,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = getDay(monthStart);

  const getAttendanceForDay = (date: Date) =>
    days?.find(d => isSameDay(parseISO(d.date), date));

  const totalPresent = monthly?.reduce((s, m) => s + m.present, 0) || 0;
  const totalAbsent = monthly?.reduce((s, m) => s + m.absent, 0) || 0;
  const totalLate = monthly?.reduce((s, m) => s + m.late, 0) || 0;
  const totalLeave = monthly?.reduce((s, m) => s + m.leave, 0) || 0;
  const overallPercent = monthly?.length
    ? Math.round(monthly.reduce((sum, m) => sum + m.percentage, 0) / monthly.length)
    : 0;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Attendance" subtitle="Monthly attendance records and subject-wise tracking" />

      {/* Warning banner */}
      {overallPercent > 0 && overallPercent < 75 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-[16px]"
          style={{ background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)' }}
        >
          <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
          <div>
            <p className="text-[13px] font-bold text-white">Attendance Below Minimum Requirement</p>
            <p className="text-[12px] text-white/80 mt-0.5">
              Your attendance is {overallPercent}%, below the required 75%. Please attend regularly to avoid academic consequences.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <CalendarCheck className="h-5 w-5" />, value: `${overallPercent}%`, label: 'Overall', gradient: overallPercent >= 75 ? 'linear-gradient(135deg, #10B981, #34D399)' : 'linear-gradient(135deg, #EF4444, #F87171)' },
          { icon: <CalendarCheck className="h-5 w-5" />, value: totalPresent, label: 'Present Days', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
          { icon: <CalendarX className="h-5 w-5" />, value: totalAbsent, label: 'Absent Days', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
          { icon: <PlaneLanding className="h-5 w-5" />, value: totalLeave, label: 'On Leave', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="rounded-[18px] p-5 flex items-center gap-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="w-11 h-11 rounded-[12px] flex items-center justify-center text-white flex-shrink-0"
              style={{ background: stat.gradient }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[24px] font-bold text-[var(--color-text)] leading-tight">{stat.value}</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[17px] font-bold text-[var(--color-text)]">{format(currentMonth, 'MMMM yyyy')}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-3">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-[var(--color-text-muted)] py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {allDays.map(day => {
              const att = getAttendanceForDay(day);
              const isToday = isSameDay(day, new Date());
              const config = att ? STATUS_CONFIG[att.status] : null;

              return (
                <div
                  key={day.toISOString()}
                  className="aspect-square flex items-center justify-center rounded-full text-[12px] font-semibold transition-all cursor-default relative"
                  style={config ? {
                    background: config.bg,
                    color: config.color,
                    ...(isToday ? { outline: `2px solid ${config.ring}`, outlineOffset: '2px' } : {}),
                  } : {
                    color: 'var(--color-text-muted)',
                    ...(isToday ? { outline: '2px solid var(--color-primary)', outlineOffset: '2px' } : {}),
                  }}
                  title={att ? STATUS_CONFIG[att.status].label : format(day, 'MMM d')}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-[var(--color-border)]">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: cfg.color }} />
                <span className="text-[11px] text-[var(--color-text-muted)]">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly trend */}
        <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-5">Monthly Trend</h3>
          {loadingMonthly ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-14 rounded-[10px]" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {monthly?.slice(0, 5).map(m => {
                const isGood = m.percentage >= 75;
                return (
                  <div key={m.month}>
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="font-medium text-[var(--color-text-secondary)]">
                        {format(parseISO(`${m.month}-01`), 'MMM yyyy')}
                      </span>
                      <span className="font-bold" style={{ color: isGood ? '#10B981' : '#EF4444' }}>
                        {m.percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-[var(--color-surface-2)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.percentage}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: isGood ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #EF4444, #F87171)' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
                      <span>P: {m.present}</span>
                      <span>A: {m.absent}</span>
                      <span>L: {m.late}</span>
                      <span>LV: {m.leave}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 75% reference line note */}
          <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 p-3 rounded-[10px]" style={{ background: 'var(--color-surface-2)' }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: 'var(--color-warning)' }} />
              <p className="text-[11px] text-[var(--color-text-muted)]">Minimum required: <strong className="text-[var(--color-warning)]">75%</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
