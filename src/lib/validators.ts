import { z } from 'zod';

export const mobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits');

export const loginSchema = z.object({
  mobile: mobileSchema,
});

export const otpVerifySchema = z.object({
  otp: otpSchema,
});

export const leaveRequestSchema = z.object({
  type: z.enum(['medical', 'personal', 'family_emergency', 'event_participation']),
  fromDate: z.string().min(1, 'Start date is required'),
  toDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please provide a reason (min 10 characters)').max(500, 'Reason too long'),
  notifyTeacher: z.boolean(),
}).refine(
  (data) => new Date(data.toDate) >= new Date(data.fromDate),
  { message: 'End date must be after start date', path: ['toDate'] }
);

export const profileUpdateSchema = z.object({
  interests: z.array(z.string()).optional(),
  careerGoal: z.string().optional(),
  dreamCollege: z.string().optional(),
  language: z.enum(['en', 'hi']).optional(),
});

export const shareLinkSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  purpose: z.string().min(1, 'Purpose is required').max(200, 'Purpose too long'),
  expiresIn: z.number().optional(),
  permissions: z.object({
    basicInfo: z.boolean(),
    attendanceSummary: z.boolean(),
    marksDetails: z.enum(['full', 'summary', 'hidden']),
    achievements: z.boolean(),
    coCurricular: z.boolean(),
    apaarId: z.boolean(),
    fullReportCards: z.boolean(),
  }),
});

export const dataCorrectionSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  currentValue: z.string().min(1, 'Current value is required'),
  correctValue: z.string().min(1, 'Correct value is required'),
  reason: z.string().min(10, 'Please provide a reason').max(500),
});
