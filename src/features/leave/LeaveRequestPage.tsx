import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Upload, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProgressBar } from '@/components/shared/ProgressBar';
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

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<LeaveRequestForm>({
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
    <div className="max-w-3xl">
      <PageHeader title="Leave Request" subtitle="Submit and manage leave applications" />

      {/* Leave Balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {balances?.map(b => (
          <Card key={b.type} padding="sm">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">{b.label}</p>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-[var(--color-text)]">{b.remaining} left</span>
              <span className="text-[var(--color-text-muted)]">/{b.allocated}</span>
            </div>
            <ProgressBar value={b.remaining} max={b.allocated} color="var(--color-primary)" height={4} />
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>New Leave Request</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">
                Leave Type <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value={LeaveType.MEDICAL}>Medical</option>
                <option value={LeaveType.PERSONAL}>Personal</option>
                <option value={LeaveType.FAMILY_EMERGENCY}>Family Emergency</option>
                <option value={LeaveType.EVENT_PARTICIPATION}>Event Participation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">
                  From Date <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  type="date"
                  {...register('fromDate')}
                  className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
                {errors.fromDate && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.fromDate.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">
                  To Date <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  type="date"
                  {...register('toDate')}
                  className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
                {errors.toDate && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.toDate.message}</p>}
              </div>
            </div>

            {duration > 0 && (
              <div className="flex items-center gap-2 p-2.5 bg-[var(--color-primary-light)] rounded-[var(--radius-md)]">
                <Info className="h-4 w-4 text-[var(--color-primary)]" />
                <p className="text-sm text-[var(--color-primary)]">Duration: <strong>{duration} day{duration > 1 ? 's' : ''}</strong></p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">
                Reason <span className="text-[var(--color-danger)]">*</span>
              </label>
              <textarea
                {...register('reason')}
                rows={3}
                placeholder="Provide a detailed reason for your leave..."
                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
              {errors.reason && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.reason.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="notify" {...register('notifyTeacher')} className="w-4 h-4 accent-[var(--color-primary)]" />
              <label htmlFor="notify" className="text-sm text-[var(--color-text-secondary)]">
                Notify class teachers
              </label>
            </div>

            <Button type="submit" loading={submitting} className="w-full">
              Submit Leave Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
