import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Menu, Sun, Moon, X, Settings, LogOut, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useStudentStore } from '@/store/studentStore';
import { Theme } from '@/types/enums';
import { ROUTES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuClick: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/academics': 'Subjects',
  '/performance': 'Performance',
  '/exams': 'Exams',
  '/report-card': 'Report Card',
  '/readiness-score': 'Readiness Score',
  '/attendance': 'Attendance',
  '/leave/request': 'Leave Request',
  '/leave/status': 'Leave Status',
  '/profile': 'My Profile',
  '/apaar': 'APAAR Record',
  '/sharing': 'Share Profile',
  '/achievements': 'Achievements',
  '/co-curricular': 'Co-Curricular',
  '/career': 'Career',
  '/opportunities': 'Opportunities',
  '/inbox': 'Inbox',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { student, clearAuth } = useAuthStore();
  const { theme: uiTheme, setTheme: setUiTheme } = useUIStore();
  const { notificationCount } = useStudentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const pageTitle = ROUTE_LABELS[location.pathname] || 'EKAI Student Hub';

  const toggleTheme = () => {
    setUiTheme(uiTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Ctrl+K search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      className="h-[60px] flex items-center px-4 gap-3 flex-shrink-0 sticky top-0 z-30"
      style={{
        background: 'rgba(var(--topbar-bg, 255 255 255) / 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title or breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 min-w-0 flex-shrink-0">
        <span className="text-[15px] font-semibold text-[var(--color-text)] truncate">{pageTitle}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-[var(--color-text-muted)] pointer-events-none" />
              <input
                ref={searchRef}
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-9 pr-8 py-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => { setSearchOpen(true); }}
            className="hidden md:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50 transition-all group"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-[12px]">Search...</span>
            <span className="ml-2 px-1.5 py-0.5 rounded-[5px] text-[10px] font-medium border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
              ⌘K
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-all"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 400 }}
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {uiTheme === Theme.DARK ? (
              <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun className="h-[18px] w-[18px]" />
              </motion.span>
            ) : (
              <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon className="h-[18px] w-[18px]" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); setAvatarOpen(false); }}
            className="relative flex items-center justify-center w-9 h-9 rounded-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--color-danger)' }}
              />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-[16px] shadow-[var(--shadow-lg)] z-50 overflow-hidden"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[var(--color-text)]">Notifications</p>
                  {notificationCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--color-danger)' }}>
                      {notificationCount}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  {[
                    { icon: '📊', title: 'Results published', desc: 'Unit Test results are out', time: '2m ago', unread: true },
                    { icon: '🏆', title: 'Achievement unlocked', desc: 'Attendance Champion badge earned', time: '1h ago', unread: true },
                    { icon: '📅', title: 'Exam reminder', desc: 'Math exam in 3 days', time: '2h ago', unread: false },
                  ].map((n, i) => (
                    <div key={i} className={cn('flex items-start gap-3 p-2.5 rounded-[10px] cursor-pointer transition-colors hover:bg-[var(--color-surface-2)]', n.unread && 'bg-[var(--color-primary-light)]')}>
                      <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12px] font-semibold text-[var(--color-text)] truncate">{n.title}</p>
                          {n.unread && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--color-primary)' }} />}
                        </div>
                        <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{n.desc}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setNotifOpen(false); navigate(ROUTES.NOTIFICATIONS); }}
                  className="w-full p-3 text-[12px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors border-t border-[var(--color-border)]"
                >
                  View all notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        {student && (
          <div className="relative ml-1" ref={avatarRef}>
            <button
              onClick={() => { setAvatarOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1 rounded-[10px] hover:bg-[var(--color-surface-2)] transition-all"
              aria-label="Profile menu"
            >
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--color-border)]" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-[var(--color-border)]"
                  style={{ background: 'var(--gradient-primary)' }}>
                  <span className="text-white text-[11px] font-bold">{getInitials(student.name)}</span>
                </div>
              )}
            </button>

            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-[16px] shadow-[var(--shadow-lg)] z-50 overflow-hidden"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  {/* User info */}
                  <div className="p-4 border-b border-[var(--color-border)]">
                    <p className="text-[13px] font-semibold text-[var(--color-text)]">{student.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Class {student.class}-{student.section}</p>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {[
                      { icon: User, label: 'My Profile', path: ROUTES.PROFILE },
                      { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => { setAvatarOpen(false); navigate(item.path); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 border-t border-[var(--color-border)]" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
