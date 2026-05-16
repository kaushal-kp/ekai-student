import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import SendIcon from '@mui/icons-material/Send';
import { PageHeader } from '@/components/shared/PageHeader';
import { useUIStore } from '@/store/uiStore';
import api from '@/lib/api';
import { LeaveBalance } from '@/types/models';
import { LeaveType } from '@/types/enums';
import { leaveRequestSchema } from '@/lib/validators';

type LeaveRequestForm = z.infer<typeof leaveRequestSchema>;

export default function LeaveRequestPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: balances } = useQuery<LeaveBalance[]>({
    queryKey: ['leave-balances'],
    queryFn: async () => (await api.get('/student/leave/balances')).data.data,
  });

  const { register, handleSubmit, reset, control, formState: { errors }, watch } = useForm<LeaveRequestForm>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { type: LeaveType.MEDICAL, notifyTeacher: true },
  });

  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const duration = fromDate && toDate
    ? Math.max(1, Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  const onSubmit = async (data: LeaveRequestForm) => {
    try {
      setSubmitting(true);
      await api.post('/student/leave/requests', { ...data, duration });
      addToast({ type: 'success', title: 'Leave Requested', description: 'Your leave request has been submitted.' });
      reset();
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
      qc.invalidateQueries({ queryKey: ['leave-balances'] });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <PageHeader title="Leave Request" subtitle="Submit and manage leave applications" />

      {/* Leave Balances */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {balances?.map(b => (
          <Grid size={{ xs: 6, md: 3 }} key={b.type}>
            <Card elevation={2} sx={{ borderRadius: '16px', p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {b.label}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="body2">{b.remaining} left</Typography>
                <Typography variant="caption" color="text.secondary">/{b.allocated}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={b.allocated > 0 ? (b.remaining / b.allocated) * 100 : 0}
                sx={{ height: 4, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' } }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={2} sx={{ borderRadius: '16px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 ,  mb: 2.5 }}>New Leave Request</Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Leave Type *</InputLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Leave Type *">
                    <MenuItem value={LeaveType.MEDICAL}>Medical</MenuItem>
                    <MenuItem value={LeaveType.PERSONAL}>Personal</MenuItem>
                    <MenuItem value={LeaveType.FAMILY_EMERGENCY}>Family Emergency</MenuItem>
                    <MenuItem value={LeaveType.EVENT_PARTICIPATION}>Event Participation</MenuItem>
                  </Select>
                )}
              />
              {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
            </FormControl>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register('fromDate')}
                  label="From Date"
                  type="date"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.fromDate}
                  helperText={errors.fromDate?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register('toDate')}
                  label="To Date"
                  type="date"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.toDate}
                  helperText={errors.toDate?.message}
                />
              </Grid>
            </Grid>

            {duration > 0 && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Duration: <strong>{duration} day{duration > 1 ? 's' : ''}</strong>
              </Alert>
            )}

            <TextField
              {...register('reason')}
              label="Reason"
              multiline
              rows={3}
              fullWidth
              required
              placeholder="Provide a detailed reason for your leave..."
              error={!!errors.reason}
              helperText={errors.reason?.message}
            />

            <FormControlLabel
              control={<Checkbox {...register('notifyTeacher')} defaultChecked sx={{ color: '#6366F1' }} />}
              label={<Typography variant="body2" color="text.secondary">Notify class teachers</Typography>}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? undefined : <SendIcon />}
              sx={{
                bgcolor: '#6366F1',
                borderRadius: 2,
                '&:hover': { bgcolor: '#4F46E5' },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
