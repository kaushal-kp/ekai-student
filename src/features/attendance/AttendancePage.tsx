import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/formatters';
import api from '@/lib/api';
import { AttendanceDay, MonthlyAttendance } from '@/types/models';
import { AttendanceStatus } from '@/types/enums';

const statusColors: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'bg-[var(--color-success)] text-white',
  [AttendanceStatus.ABSENT]: 'bg-[var(--color-danger)] text-white',
  [AttendanceStatus.LATE]: 'bg-[var(--color-warning)] text-white',
  [AttendanceStatus.HOLIDAY]: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
  [AttendanceStatus.LEAVE]: 'bg-[var(--color-info)] text-white',
};

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4)); // May 2025

  const { data: monthly, isLoading: loadingMonthly } = useQuery<MonthlyAttendance[]>({
    queryKey: ['attendance-monthly'],
    queryFn: async () => (await api.get('/student/attendance/monthly')).data.data,
  });

  const { data: days } = useQuery<AttendanceDay[]>({
    queryKey: ['attendance-days'],
    queryFn: async () => (await api.get('/student/attendance/days')).data.data,
  });

  if (loadingMonthly) return <LoadingSpinner className="mt-16" />;

  const currentMonthKey = format(currentMonth, 'yyyy-MM');
  const monthData = monthly?.find(m => m.month === currentMonthKey);
  const overallPercent = monthly
    ? Math.round(monthly.reduce((sum, m) => sum + m.percentage, 0) / monthly.length)
    : 0;

  // Calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = getDay(monthStart);

  const getAttendanceForDay = (date: Date) => {
    return days?.find(d => isSameDay(parseISO(d.date), date));
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Attendance" subtitle="Track your attendance and leave records" />

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {monthly?.[0] && (
          <>
            <Card padding="sm" className="text-center">
              <p className="text-2xl font-bold text-[var(--color-success)]">{overallPercent}%</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Overall</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {monthly.reduce((s, m) => s + m.present, 0)}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Present</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-2xl font-bold text-[var(--color-danger)]">
                {monthly.reduce((s, m) => s + m.absent, 0)}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Absent</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-2xl font-bold text-[var(--color-info)]">
                {monthly.reduce((s, m) => s + m.leave, 0)}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">On Leave</p>
            </Card>
          </>
        )}
      </div>

      {overallPercent < 75 && (
        <div className="flex items-center gap-3 p-3 bg-[var(--color-danger-light)] rounded-[var(--radius-lg)] mb-6">
          <AlertTriangle className="h-5 w-5 text-[var(--color-danger)] flex-shrink-0" />
          <p className="text-sm text-[var(--color-danger)]">
            Your attendance is below the minimum 75% requirement. Please maintain regular attendance.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            {/* Month header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--color-text)]">{format(currentMonth, 'MMMM yyyy')}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
                  className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
                  className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-[var(--color-text-muted)] py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {allDays.map(day => {
                const att = getAttendanceForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'aspect-square flex items-center justify-center text-xs rounded-[var(--radius-sm)] font-medium',
                      att ? statusColors[att.status] : 'text-[var(--color-text-muted)]',
                      isToday && !att && 'border-2 border-[var(--color-primary)]'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
              {[
                { color: 'bg-[var(--color-success)]', label: 'Present' },
                { color: 'bg-[var(--color-danger)]', label: 'Absent' },
                { color: 'bg-[var(--color-warning)]', label: 'Late' },
                { color: 'bg-[var(--color-info)]', label: 'Leave' },
                { color: 'bg-[var(--color-surface-2)] border border-[var(--color-border)]', label: 'Holiday' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={cn('w-3 h-3 rounded-sm flex-shrink-0', l.color)} />
                  <span className="text-xs text-[var(--color-text-muted)]">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Monthly Summary */}
        <div>
          <Card>
            <CardHeader><CardTitle>Monthly Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthly?.slice(0, 4).map(m => (
                  <div key={m.month}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-secondary)]">{format(parseISO(`${m.month}-01`), 'MMM yyyy')}</span>
                      <span className="font-medium" style={{ color: m.percentage >= 75 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {m.percentage}%
                      </span>
                    </div>
                    <ProgressBar
                      value={m.percentage}
                      color={m.percentage >= 75 ? 'var(--color-success)' : 'var(--color-danger)'}
                      height={6}
                    />
                    <div className="flex justify-between text-xs mt-1 text-[var(--color-text-muted)]">
                      <span>P: {m.present}</span>
                      <span>A: {m.absent}</span>
                      <span>L: {m.late}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
