import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, Bell, Globe, Palette, ChevronRight, LogOut,
  Moon, Sun, Laptop, Check
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Theme, Language } from '@/types/enums';
import { ROUTES } from '@/lib/constants';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      style={{ background: checked ? 'var(--color-primary)' : 'var(--color-border)' }}
    >
      <motion.div
        animate={{ x: checked ? '100%' : '0%', translateX: checked ? '-2px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1">
      {label}
    </p>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function SettingsPage() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();

  // Notification preferences (local state, would normally be persisted)
  const [notifPrefs, setNotifPrefs] = useState({
    examReminders: true,
    attendanceAlerts: true,
    leaveUpdates: true,
    achievements: true,
    announcements: true,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [savedNotifPrefs] = useState({ ...notifPrefs });

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(notifPrefs) !== JSON.stringify(savedNotifPrefs);
    setHasChanges(changed);
  }, [notifPrefs]);

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  const themeOptions: { key: Theme; label: string; icon: React.ReactNode }[] = [
    { key: Theme.LIGHT, label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { key: Theme.DARK, label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { key: Theme.SYSTEM, label: 'System', icon: <Laptop className="h-4 w-4" /> },
  ];

  const accountLinks = [
    { label: 'Security', description: 'Password, 2FA, active sessions', icon: Shield, path: ROUTES.SETTINGS_SECURITY, color: '#6C63FF', bg: '#EEEDFF' },
    { label: 'Privacy & Data', description: 'Data rights, download your data', icon: Eye, path: ROUTES.SETTINGS_PRIVACY, color: '#10B981', bg: '#D1FAF0' },
    { label: 'Consent Manager', description: 'Manage data sharing consents', icon: Bell, path: ROUTES.CONSENT, color: '#F59E0B', bg: '#FEF3C7' },
  ];

  const notifOptions: { key: keyof typeof notifPrefs; label: string; desc: string }[] = [
    { key: 'examReminders', label: 'Exam Reminders', desc: 'Get notified before upcoming exams' },
    { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Warnings when attendance drops below 75%' },
    { key: 'leaveUpdates', label: 'Leave Updates', desc: 'Status updates on leave requests' },
    { key: 'achievements', label: 'Achievements', desc: 'When you unlock new badges' },
    { key: 'announcements', label: 'Announcements', desc: 'School circulars and notices' },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--color-text)]">Settings</h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">Manage your account, appearance, and notification preferences</p>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        {/* Appearance */}
        <motion.div variants={fadeUp}>
          <SectionHeader label="Appearance" />
          <div className="rounded-[20px] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] divide-y divide-[var(--color-border)]">
            {/* Theme */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #9C8FFF)' }}>
                  <Palette className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--color-text)]">Theme</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">Choose your display preference</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    className="flex flex-col items-center gap-2 p-4 rounded-[14px] border-2 transition-all"
                    style={theme === opt.key ? {
                      background: 'var(--color-primary-light)',
                      borderColor: 'var(--color-primary)',
                    } : {
                      background: 'var(--color-surface-2)',
                      borderColor: 'transparent',
                    }}
                  >
                    <div className="relative">
                      <span style={{ color: theme === opt.key ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                        {opt.icon}
                      </span>
                      {theme === opt.key && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--color-primary)' }}
                        >
                          <Check className="h-2 w-2 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <span className="text-[12px] font-semibold"
                      style={{ color: theme === opt.key ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)' }}>
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--color-text)]">Language</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">Display language for the app</p>
                </div>
              </div>
              <div className="flex gap-1.5 p-1 rounded-[10px] bg-[var(--color-surface-2)]">
                {([['en', 'English'], ['hi', 'हिंदी']] as [Language, string][]).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setLanguage(v)}
                    className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all"
                    style={language === v ? {
                      background: 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      boxShadow: 'var(--shadow-sm)',
                    } : {
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={fadeUp}>
          <SectionHeader label="Notifications" />
          <div className="rounded-[20px] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] divide-y divide-[var(--color-border)]">
            {notifOptions.map(opt => (
              <div key={opt.key} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-text)]">{opt.label}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{opt.desc}</p>
                </div>
                <ToggleSwitch
                  checked={notifPrefs[opt.key]}
                  onChange={v => setNotifPrefs(p => ({ ...p, [opt.key]: v }))}
                />
              </div>
            ))}
          </div>

          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3 flex items-center justify-between px-4 py-3 rounded-[12px] border"
                style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' + '40' }}
              >
                <p className="text-[12px] font-medium text-[var(--color-primary)]">You have unsaved changes</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNotifPrefs({ ...savedNotifPrefs })}
                    className="text-[12px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    className="text-[12px] font-bold text-[var(--color-primary)] hover:underline"
                    onClick={() => setHasChanges(false)}
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Account */}
        <motion.div variants={fadeUp}>
          <SectionHeader label="Account" />
          <div className="rounded-[20px] overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] divide-y divide-[var(--color-border)]">
            {accountLinks.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-4 hover:bg-[var(--color-surface-2)] transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}>
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-text)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div variants={fadeUp}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 rounded-[16px] transition-all group hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #EF4444, #F87171)' }}
          >
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-white/20">
              <LogOut className="h-4 w-4 text-white" />
            </div>
            <span className="text-[14px] font-semibold text-white">Sign Out</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
