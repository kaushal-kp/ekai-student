import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { ROUTES, OTP_RESEND_SECONDS } from '@/lib/constants';
import { mobileSchema } from '@/lib/validators';
import api from '@/lib/api';

const mobileForm = z.object({ mobile: mobileSchema });
const otpForm = z.object({ otp: z.string().length(6, 'Enter 6-digit OTP').regex(/^\d+$/, 'Digits only') });

type MobileForm = z.infer<typeof mobileForm>;
type OTPForm = z.infer<typeof otpForm>;

export default function LoginPage() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const mobileFormHook = useForm<MobileForm>({ resolver: zodResolver(mobileForm) });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async (data: MobileForm) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { mobile: data.mobile });
      setMobile(data.mobile);
      setSessionId(res.data.data.sessionId);
      setStep('otp');
      setResendTimer(OTP_RESEND_SECONDS);
      addToast({ type: 'success', title: 'OTP Sent', description: `OTP sent to +91 ${data.mobile}` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', description: err.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newDigits.every(d => d) && newDigits.join('').length === 6) {
      handleVerifyOTP(newDigits.join(''));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (otp.length !== 6) return;
    try {
      setLoading(true);
      const res = await api.post('/auth/verify-otp', { mobile, otp, sessionId });
      const { accessToken, student, sessionId: sid } = res.data.data;
      setAuth(student, accessToken, sid);
      addToast({ type: 'success', title: 'Welcome back!', description: `Hello, ${student.firstName}!` });
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Invalid OTP', description: 'The OTP entered is incorrect. Please try again.' });
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post('/auth/login', { mobile });
      setResendTimer(OTP_RESEND_SECONDS);
      setOtpDigits(['', '', '', '', '', '']);
      addToast({ type: 'info', title: 'OTP Resent', description: 'A new OTP has been sent.' });
    } catch {
      addToast({ type: 'error', title: 'Failed', description: 'Could not resend OTP.' });
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-[var(--color-primary)] flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-[var(--radius-md)] flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <p className="font-bold text-lg">EKAI</p>
            <p className="text-white/70 text-xs">Student Hub</p>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">Your Academic Journey, Simplified</h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Track attendance, view exam results, manage leave requests, and explore career opportunities — all in one place.
          </p>
          <div className="flex gap-6 mt-8">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Schools' },
              { value: '98%', label: 'Satisfaction' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-xs">© 2025 EKAI Education Technology. Your data is protected with enterprise security.</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-[var(--radius-md)] flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <p className="font-bold text-[var(--color-text)]">EKAI Student Hub</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'mobile' ? (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Sign in</h2>
                <p className="text-[var(--color-text-secondary)] mb-8">Enter your registered mobile number</p>

                <form onSubmit={mobileFormHook.handleSubmit(handleSendOTP)} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                      Mobile Number <span className="text-[var(--color-danger)]">*</span>
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-[var(--color-surface-2)] border border-r-0 border-[var(--color-border)] rounded-l-[var(--radius-md)] text-sm text-[var(--color-text-secondary)]">
                        +91
                      </div>
                      <input
                        {...mobileFormHook.register('mobile')}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9876543210"
                        className="flex-1 px-3 py-2.5 border border-[var(--color-border)] rounded-r-[var(--radius-md)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      />
                    </div>
                    {mobileFormHook.formState.errors.mobile && (
                      <p className="text-xs text-[var(--color-danger)] mt-1">
                        {mobileFormHook.formState.errors.mobile.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" loading={loading} className="w-full gap-2">
                    Send OTP <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secured with end-to-end encryption. OTP expires in 5 minutes.</span>
                </div>

                {/* Demo hint */}
                <div className="mt-6 p-3 rounded-[var(--radius-md)] bg-[var(--color-primary-light)] text-xs text-[var(--color-primary)]">
                  <strong>Demo Mode:</strong> Enter any 10-digit mobile number. Use OTP: <strong>123456</strong>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => { setStep('mobile'); setOtpDigits(['', '', '', '', '', '']); }}
                  className="text-sm text-[var(--color-primary)] mb-4 flex items-center gap-1 hover:underline"
                >
                  ← Change number
                </button>

                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Enter OTP</h2>
                <p className="text-[var(--color-text-secondary)] mb-8">
                  We sent a 6-digit OTP to <strong>+91 {mobile}</strong>
                </p>

                {/* OTP Input Boxes */}
                <div className="flex gap-3 mb-6">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOTPInput(i, e.target.value)}
                      onKeyDown={e => handleOTPKeyDown(i, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors"
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>

                <Button
                  className="w-full"
                  loading={loading}
                  onClick={() => handleVerifyOTP(otpDigits.join(''))}
                  disabled={otpDigits.some(d => !d)}
                >
                  Verify OTP
                </Button>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Didn't receive?</span>
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="flex items-center gap-1 text-[var(--color-primary)] disabled:text-[var(--color-text-muted)] hover:underline"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
