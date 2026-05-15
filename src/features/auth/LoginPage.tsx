import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Button, Typography, CircularProgress,
  Alert, Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForward, Shield, ChevronLeft, Bolt,
  People, School, Star
} from '@mui/icons-material';
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
    <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="22" cy="22" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={radius}
        fill="none"
        stroke="#6366F1"
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
        fill="#0F172A"
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
  const [errorMsg, setErrorMsg] = useState('');
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
      setErrorMsg('');
      const res = await api.post('/auth/login', { mobile: data.mobile });
      setMobile(data.mobile);
      setSessionId(res.data.data.sessionId);
      setStep('otp');
      setResendTimer(OTP_RESEND_SECONDS);
      addToast({ type: 'success', title: 'OTP Sent', description: `OTP sent to +91 ${data.mobile}` });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
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
      setErrorMsg('');
      const res = await api.post('/auth/verify-otp', { mobile, otp, sessionId });
      const { accessToken, student, sessionId: sid } = res.data.data;
      setAuth(student, accessToken, sid);
      addToast({ type: 'success', title: 'Welcome back!', description: `Hello, ${student.firstName}!` });
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 600);
      setErrorMsg('The OTP entered is incorrect. Please try again.');
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
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Left Branding Panel */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          width: '45%',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 50%, #3B82F6 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', opacity: 0.2, background: 'radial-gradient(circle, white, transparent)' }} />
          <Box sx={{ position: 'absolute', bottom: 80, left: -80, width: 240, height: 240, borderRadius: '50%', opacity: 0.1, background: 'radial-gradient(circle, white, transparent)' }} />
        </Box>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              <Bolt sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1 }}>EKAI</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Student Hub</Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Main content */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '2.625rem', fontWeight: 700, color: 'white', lineHeight: 1.2, mb: 3 }}>
            Your Academic<br />Journey,<br />Simplified
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', lineHeight: 1.7, mb: 5 }}>
            Track attendance, ace exams, manage leave requests, and explore career opportunities — all in one powerful place.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {[
              { icon: <People sx={{ fontSize: 16 }} />, value: '10,000+', label: 'Students' },
              { icon: <School sx={{ fontSize: 16 }} />, value: '500+', label: 'Schools' },
              { icon: <Star sx={{ fontSize: 16 }} />, value: '98%', label: 'Satisfaction' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                  <Box sx={{ color: 'rgba(255,255,255,0.8)' }}>{stat.icon}</Box>
                  <Box>
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1 }}>{stat.value}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem' }}>{stat.label}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', position: 'relative', zIndex: 1 }}>
          © 2025 EKAI Education Technology · Your data is protected with enterprise security
        </Typography>
      </Box>

      {/* Right Form Panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 50%, #3B82F6 100%)' }}>
                <Bolt sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}>EKAI Student Hub</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>Your academic companion</Typography>
              </Box>
            </Box>
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
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 0.5 }}>Welcome back 👋</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                  Sign in with your registered mobile number
                </Typography>

                <Box component="form" onSubmit={mobileFormHook.handleSubmit(handleSendOTP)}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                        Mobile Number
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex', borderRadius: 2.5, overflow: 'hidden',
                          border: '1.5px solid', borderColor: 'divider',
                          bgcolor: 'background.paper',
                          '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' },
                          transition: 'all 0.15s',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, borderRight: '1.5px solid', borderColor: 'divider', bgcolor: 'grey.50', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '1.125rem' }}>🇮🇳</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>+91</Typography>
                        </Box>
                        <Box
                          component="input"
                          {...mobileFormHook.register('mobile')}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="9876543210"
                          sx={{
                            flex: 1, px: 2, py: 1.75, border: 'none', outline: 'none',
                            fontSize: '0.9375rem', color: 'text.primary', bgcolor: 'transparent',
                            fontFamily: 'inherit',
                            '&::placeholder': { color: 'text.disabled' },
                          }}
                        />
                      </Box>
                      {mobileFormHook.formState.errors.mobile && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          ⚠ {mobileFormHook.formState.errors.mobile.message}
                        </motion.p>
                      )}
                    </Box>

                    {errorMsg && (
                      <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMsg}</Alert>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
                      sx={{
                        py: 1.75, borderRadius: 2.5, fontSize: '0.9375rem',
                        background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 50%, #3B82F6 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #4338CA, #7C3AED)', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' },
                        transition: 'all 0.2s',
                      }}
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                  <Shield sx={{ fontSize: 14, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Secured with end-to-end encryption. OTP expires in 5 minutes.
                  </Typography>
                </Box>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Box
                    sx={{
                      mt: 3, p: 2, borderRadius: 2.5,
                      bgcolor: alpha('#6366F1', 0.08),
                      border: '1px solid', borderColor: alpha('#6366F1', 0.2),
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                      🎯 <strong>Demo Mode</strong> — Enter any 10-digit number. OTP: <strong>123456</strong>
                    </Typography>
                  </Box>
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
                <Button
                  startIcon={<ChevronLeft />}
                  onClick={() => { setStep('mobile'); setOtpDigits(['', '', '', '', '', '']); setErrorMsg(''); }}
                  sx={{ mb: 3, color: 'text.secondary', p: 0, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
                >
                  Change number
                </Button>

                <Typography variant="h2" sx={{ fontWeight: 800, mb: 0.5 }}>Enter OTP 🔐</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                  We sent a 6-digit code to{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>+91 {mobile}</Box>
                </Typography>

                {/* OTP boxes */}
                <motion.div
                  animate={otpShake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Box sx={{ display: 'flex', gap: 1.25, mb: 3 }}>
                    {otpDigits.map((digit, i) => (
                      <Box
                        key={i}
                        component="input"
                        ref={(el: HTMLInputElement | null) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOTPInput(i, e.target.value)}
                        onKeyDown={e => handleOTPKeyDown(i, e)}
                        aria-label={`OTP digit ${i + 1}`}
                        sx={{
                          flex: 1,
                          aspectRatio: '1',
                          maxWidth: 56,
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: digit ? 'primary.main' : otpShake ? 'error.main' : 'divider',
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          outline: 'none',
                          fontFamily: 'inherit',
                          cursor: 'text',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                          '&:focus': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </motion.div>

                {errorMsg && (
                  <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{errorMsg}</Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => handleVerifyOTP(otpDigits.join(''))}
                  disabled={loading || otpDigits.some(d => !d)}
                  endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
                  sx={{
                    py: 1.75, borderRadius: 2.5, fontSize: '0.9375rem',
                    background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 50%, #3B82F6 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #4338CA, #7C3AED)', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' },
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Didn't receive the code?</Typography>
                  <Box>
                    {resendTimer > 0 ? (
                      <CountdownRing seconds={resendTimer} total={OTP_RESEND_SECONDS} />
                    ) : (
                      <Button
                        onClick={handleResend}
                        sx={{ color: 'primary.main', fontWeight: 600, p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                      >
                        Resend OTP
                      </Button>
                    )}
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
