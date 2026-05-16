import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay,
} from 'date-fns';
import {
  Box, Card, CardContent, Typography, Grid, IconButton, Paper, Chip, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, Skeleton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { PageHeader } from '@/components/shared/PageHeader';
import api from '@/lib/api';
import { AttendanceDay, MonthlyAttendance } from '@/types/models';
import { AttendanceStatus } from '@/types/enums';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  [AttendanceStatus.PRESENT]: { label: 'Present', color: '#10B981', bg: '#D1FAF0' },
  [AttendanceStatus.ABSENT]: { label: 'Absent', color: '#EF4444', bg: '#FEE2E2' },
  [AttendanceStatus.LATE]: { label: 'Late', color: '#F59E0B', bg: '#FEF3C7' },
  [AttendanceStatus.HOLIDAY]: { label: 'Holiday', color: '#6B7280', bg: '#F3F4F6' },
  [AttendanceStatus.LEAVE]: { label: 'Leave', color: '#3B82F6', bg: '#DBEAFE' },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const STAT_CARDS = (overallPercent: number, totalPresent: number, totalAbsent: number, totalLeave: number) => [
  {
    icon: <CheckCircleOutlineIcon sx={{ color: '#fff', fontSize: 22 }} />,
    value: `${overallPercent}%`,
    label: 'Overall',
    gradient: overallPercent >= 75 ? 'linear-gradient(135deg,#10B981,#34D399)' : 'linear-gradient(135deg,#EF4444,#F87171)',
  },
  {
    icon: <CalendarMonthIcon sx={{ color: '#fff', fontSize: 22 }} />,
    value: totalPresent,
    label: 'Present Days',
    gradient: 'linear-gradient(135deg,#10B981,#34D399)',
  },
  {
    icon: <EventBusyIcon sx={{ color: '#fff', fontSize: 22 }} />,
    value: totalAbsent,
    label: 'Absent Days',
    gradient: 'linear-gradient(135deg,#EF4444,#F87171)',
  },
  {
    icon: <FlightLandIcon sx={{ color: '#fff', fontSize: 22 }} />,
    value: totalLeave,
    label: 'On Leave',
    gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)',
  },
];

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
  const totalLeave = monthly?.reduce((s, m) => s + m.leave, 0) || 0;
  const overallPercent = monthly?.length
    ? Math.round(monthly.reduce((sum, m) => sum + m.percentage, 0) / monthly.length)
    : 0;

  return (
    <Box sx={{ maxWidth: 900 }}>
      <PageHeader title="Attendance" subtitle="Monthly attendance records and subject-wise tracking" />

      {/* Warning alert */}
      {overallPercent > 0 && overallPercent < 75 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            severity="warning"
            icon={<WarningAmberIcon />}
            sx={{ mb: 3, borderRadius: '16px' }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Attendance Below Minimum Requirement
            </Typography>
            <Typography variant="caption">
              Your attendance is {overallPercent}%, below the required 75%. Please attend regularly to avoid academic consequences.
            </Typography>
          </Alert>
        </motion.div>
      )}

      {/* Stats row */}
      <motion.div variants={stagger} initial="hidden" animate="show">
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {STAT_CARDS(overallPercent, totalPresent, totalAbsent, totalLeave).map((stat) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <motion.div variants={fadeUp}>
                <Card elevation={2} sx={{ borderRadius: '18px' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box
                      sx={{
                        width: 44, height: 44, borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: stat.gradient, flexShrink: 0,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 ,  lineHeight: 1 }}>{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={2} sx={{ borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Month navigation */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
                    sx={{ borderRadius: '8px' }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: 'small' }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
                    sx={{ borderRadius: '8px' }}
                  >
                    <ChevronRightIcon sx={{ fontSize: 'small' }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Weekday headers */}
              <Grid container columns={7} sx={{ mb: 1 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <Grid size={1} key={d}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', textAlign: 'center', py: 0.5 }} color="text.secondary">
                      {d}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar grid */}
              <Grid container columns={7} spacing={0.5}>
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <Grid size={1} key={`e-${i}`} />
                ))}
                {allDays.map(day => {
                  const att = getAttendanceForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const config = att ? STATUS_CONFIG[att.status] : null;
                  return (
                    <Grid size={1} key={day.toISOString()}>
                      <Box
                        sx={{
                          aspectRatio: '1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%',
                          fontSize: 12, fontWeight: 600,
                          cursor: 'default',
                          bgcolor: config ? config.bg : 'transparent',
                          color: config ? config.color : 'text.secondary',
                          outline: isToday ? `2px solid ${config ? config.color : '#6366F1'}` : 'none',
                          outlineOffset: '2px',
                        }}
                        title={att ? STATUS_CONFIG[att.status].label : format(day, 'MMM d')}
                      >
                        {format(day, 'd')}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Legend */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <Chip
                    key={key}
                    label={cfg.label}
                    size="small"
                    sx={{
                      bgcolor: cfg.bg, color: cfg.color,
                      fontWeight: 600, fontSize: 11,
                      height: 24,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly trend */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={2} sx={{ borderRadius: '20px', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 ,  mb: 2.5 }}>Monthly Trend</Typography>

              {loadingMonthly ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: '10px' }} />)}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {monthly?.slice(0, 5).map(m => {
                    const isGood = m.percentage >= 75;
                    return (
                      <Box key={m.month}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography variant="caption" sx={{ fontWeight: 500 }} color="text.secondary">
                            {format(parseISO(`${m.month}-01`), 'MMM yyyy')}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 ,  color: isGood ? '#10B981' : '#EF4444' }}>
                            {m.percentage}%
                          </Typography>
                        </Box>
                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.percentage}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              height: '100%', borderRadius: 4,
                              background: isGood
                                ? 'linear-gradient(90deg,#10B981,#34D399)'
                                : 'linear-gradient(90deg,#EF4444,#F87171)',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          {[`P: ${m.present}`, `A: ${m.absent}`, `L: ${m.late}`, `LV: ${m.leave}`].map(t => (
                            <Typography key={t} variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{t}</Typography>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'action.hover' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B', flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">
                    Minimum required: <strong style={{ color: '#F59E0B' }}>75%</strong>
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly table */}
      {monthly && monthly.length > 0 && (
        <Card elevation={2} sx={{ borderRadius: '20px', mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 ,  mb: 2 }}>Monthly Summary</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Month', 'Present', 'Absent', 'Late', 'Leave', 'Percentage'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {monthly.map(m => {
                  const isGood = m.percentage >= 75;
                  return (
                    <TableRow key={m.month} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{format(parseISO(`${m.month}-01`), 'MMM yyyy')}</TableCell>
                      <TableCell sx={{ color: '#10B981', fontWeight: 600 }}>{m.present}</TableCell>
                      <TableCell sx={{ color: '#EF4444', fontWeight: 600 }}>{m.absent}</TableCell>
                      <TableCell sx={{ color: '#F59E0B', fontWeight: 600 }}>{m.late}</TableCell>
                      <TableCell sx={{ color: '#3B82F6', fontWeight: 600 }}>{m.leave}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${m.percentage}%`}
                          size="small"
                          sx={{
                            bgcolor: isGood ? '#D1FAF0' : '#FEE2E2',
                            color: isGood ? '#10B981' : '#EF4444',
                            fontWeight: 700, fontSize: 12,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
