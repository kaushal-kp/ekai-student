import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { ROUTES, CAREER_PATHS, INTERESTS } from '@/lib/constants';
import api from '@/lib/api';

const steps = ['Welcome', 'Career Goals', 'Interests'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [careerGoal, setCareerGoal] = useState('');
  const [dreamCollege, setDreamCollege] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { student, updateStudent } = useAuthStore();
  const navigate = useNavigate();

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleComplete = async () => {
    try {
      setSaving(true);
      await api.patch('/student/profile', { careerGoal, dreamCollege, interests });
      updateStudent({ careerGoal, dreamCollege, interests });
      navigate(ROUTES.DASHBOARD);
    } catch {
      navigate(ROUTES.DASHBOARD);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i <= step ? 'var(--color-primary)' : 'var(--color-border)' }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎓</div>
                <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                  Welcome, {student?.firstName}!
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                  Let's personalize your EKAI Student Hub experience. It'll take just 2 minutes.
                </p>
              </div>
              <div className="space-y-3 mb-8">
                {['📊 Track your academic performance', '🎯 Get exam readiness scores', '🏆 Earn achievement badges', '💼 Explore career opportunities'].map(f => (
                  <div key={f} className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
                    <span className="text-lg">{f[0]}</span>
                    <span className="text-sm text-[var(--color-text)]">{f.slice(2)}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setStep(1)}>Get Started →</Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="career" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Career Goals</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">Tell us about your career aspirations (optional)</p>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">Career Goal</label>
                  <select
                    value={careerGoal}
                    onChange={e => setCareerGoal(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select (optional)</option>
                    {CAREER_PATHS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-1">Dream College</label>
                  <input
                    value={dreamCollege}
                    onChange={e => setDreamCollege(e.target.value)}
                    placeholder="e.g. IIT Delhi, AIIMS"
                    className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Continue →</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="interests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Your Interests</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">Select areas you're interested in</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {INTERESTS.map(i => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${interests.includes(i) ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" loading={saving} onClick={handleComplete}>Complete Setup 🚀</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
