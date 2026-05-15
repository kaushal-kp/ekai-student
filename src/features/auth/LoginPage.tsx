import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Shield, ChevronLeft, Zap, Users, School, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { ROUTES, OTP_RESEND_SECONDS } from '@/lib/constants';
import { mobileSchema } from '@/lib/validators';
import api from '@/lib/api';

const mobileForm = z.object({ mobile: mobileSchema });
type MobileForm = z.infer<typeof mobileForm>;

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const dashoffset = circumference * (1 - progress);

  return (
    <svg width="44" height="44" className="rotate-[-90deg]">
      <circle cx="22" cy="22" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <text
        x="22" y="22"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold"
        fill="var(--color-text)"
        style={{ transform: 'rotate(90deg)', transformOrigin: '22px 22px', fontSize: '10px', fontWeight: 700 }}
      >
        {seconds}
      </text>
    </svg>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpShake, setOtpShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const mobileFormHook = useForm<MobileForm>({ resolver: zodResolver(mobileForm) });

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
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
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
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 600);
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
      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          width: '45%',
          flexShrink: 0,
          background: 'var(--gradient-hero)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="absolute bottom-20 -left-20 w-60 h-60 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent)' }} />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-tight">EKAI</p>
            <p className="text-white/70 text-[11px] font-medium tracking-wide">STUDENT HUB</p>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className="text-[42px] font-bold text-white leading-tight mb-6">
            Your Academic<br />Journey,<br />Simplified
          </h1>
          <p className="text-white/80 text-[17px] leading-relaxed max-w-md mb-10">
            Track attendance, ace exams, manage leave requests, and explore career opportunities — all in one powerful place.
          </p>

          {/* Stats chips */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: <Users className="h-4 w-4" />, value: '10,000+', label: 'Students' },
              { icon: <School className="h-4 w-4" />, value: '500+', label: 'Schools' },
              { icon: <Star className="h-4 w-4" />, value: '98%', label: 'Satisfaction' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px]"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                <span className="text-white/80">{stat.icon}</span>
                <div>
                  <p className="text-white font-bold text-[15px] leading-tight">{stat.value}</p>
                  <p className="text-white/70 text-[11px]">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="text-white/40 text-xs relative z-10">
          © 2025 EKAI Education Technology · Your data is protected with enterprise security
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex items-center gap-2.5 mb-10"
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
              <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-[15px] text-[var(--color-text)]">EKAI Student Hub</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">Your academic companion</p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'mobile' ? (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-[28px] font-bold text-[var(--color-text)] mb-1">Welcome back 👋</h2>
                <p className="text-[var(--color-text-secondary)] text-[15px] mb-8">
                  Sign in with your registered mobile number
                </p>

                <form onSubmit={mobileFormHook.handleSubmit(handleSendOTP)} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-[var(--color-text-secondary)] mb-2">
                      Mobile Number
                    </label>
                    <div className="flex rounded-[12px] overflow-hidden border border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 transition-all"
                      style={{ background: 'var(--color-surface)' }}>
                      <div className="flex items-center gap-2 px-3 border-r border-[var(--color-border)] bg-[var(--color-surface-2)] flex-shrink-0">
                        <span className="text-[18px]">🇮🇳</span>
                        <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">+91</span>
                      </div>
                      <input
                        {...mobileFormHook.register('mobile')}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9876543210"
                        className="flex-1 px-4 py-3.5 bg-transparent text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                      />
                    </div>
                    {mobileFormHook.formState.errors.mobile && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[12px] text-[var(--color-danger)] mt-2 flex items-center gap-1"
                      >
                        ⚠ {mobileFormHook.formState.errors.mobile.message}
                      </motion.p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-white font-semibold text-[15px] transition-all disabled:opacity-60"
                    style={{ background: 'var(--gradient-hero)' }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                      />
                    ) : (
                      <>Send OTP <ArrowRight className="h-4 w-4" /></>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 flex items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
                  <Shield className="h-3.5 w-3.5 text-[var(--color-success)]" />
                  <span>Secured with end-to-end encryption. OTP expires in 5 minutes.</span>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-5 p-4 rounded-[12px] border"
                  style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}
                >
                  <p className="text-[12px] text-[var(--color-primary)] font-medium">
                    🎯 <strong>Demo Mode</strong> — Enter any 10-digit number. OTP: <strong>123456</strong>
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={() => { setStep('mobile'); setOtpDigits(['', '', '', '', '', '']); }}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-8 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Change number
                </button>

                <h2 className="text-[28px] font-bold text-[var(--color-text)] mb-1">Enter OTP 🔐</h2>
                <p className="text-[var(--color-text-secondary)] text-[15px] mb-8">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-[var(--color-text)]">+91 {mobile}</span>
                </p>

                {/* OTP boxes */}
                <motion.div
                  animate={otpShake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex gap-2.5 mb-8"
                >
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
                      className="flex-1 aspect-square max-w-[52px] text-center text-[20px] font-bold rounded-[12px] border-2 transition-all focus:outline-none"
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        borderColor: digit ? 'var(--color-primary)' : otpShake ? 'var(--color-danger)' : 'var(--color-border)',
                        boxShadow: digit ? '0 0 0 3px var(--color-primary)/20' : 'none',
                      }}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </motion.div>

                <motion.button
                  onClick={() => handleVerifyOTP(otpDigits.join(''))}
                  disabled={loading || otpDigits.some(d => !d)}
                  whileHover={{ scale: loading || otpDigits.some(d => !d) ? 1 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-white font-semibold text-[15px] transition-all disabled:opacity-50"
                  style={{ background: 'var(--gradient-hero)' }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                    />
                  ) : (
                    <>Verify & Sign In <ArrowRight className="h-4 w-4" /></>
                  )}
                </motion.button>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">Didn't receive the code?</span>
                  <div className="flex items-center gap-2">
                    {resendTimer > 0 ? (
                      <CountdownRing seconds={resendTimer} total={OTP_RESEND_SECONDS} />
                    ) : (
                      <button
                        onClick={handleResend}
                        className="text-[13px] font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
