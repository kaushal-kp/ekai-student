import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useStudentStore } from '@/store/studentStore';
import { ROUTES } from '@/lib/constants';
import {
  LayoutDashboard, BookOpen, TrendingUp, CalendarCheck, FileText, Target,
  ClipboardCheck, UserCheck, Share2, Award, Activity, Briefcase, Gift,
  MessageSquare, Bell, Settings, ChevronLeft, ChevronRight, LogOut, Star,
  Shield, UserCircle, Zap
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badgeKey?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Subjects', icon: BookOpen, path: ROUTES.ACADEMICS },
      { label: 'Performance', icon: TrendingUp, path: ROUTES.PERFORMANCE },
      { label: 'Exams', icon: CalendarCheck, path: ROUTES.EXAMS },
      { label: 'Report Card', icon: FileText, path: ROUTES.REPORT_CARD },
      { label: 'Readiness Score', icon: Target, path: ROUTES.READINESS_SCORE },
    ],
  },
  {
    label: 'Attendance',
    items: [
      { label: 'Attendance', icon: ClipboardCheck, path: ROUTES.ATTENDANCE },
      { label: 'Leave Request', icon: UserCheck, path: ROUTES.LEAVE_REQUEST },
      { label: 'Leave Status', icon: ClipboardCheck, path: ROUTES.LEAVE_STATUS },
    ],
  },
  {
    label: 'Profile & Records',
    items: [
      { label: 'My Profile', icon: UserCircle, path: ROUTES.PROFILE },
      { label: 'APAAR Record', icon: Shield, path: ROUTES.APAAR },
      { label: 'Share Profile', icon: Share2, path: ROUTES.SHARING },
      { label: 'Achievements', icon: Award, path: ROUTES.ACHIEVEMENTS },
      { label: 'Co-Curricular', icon: Activity, path: ROUTES.CO_CURRICULAR },
    ],
  },
  {
    label: 'Opportunities',
    items: [
      { label: 'Career', icon: Briefcase, path: ROUTES.CAREER },
      { label: 'Opportunities', icon: Gift, path: ROUTES.OPPORTUNITIES },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Inbox', icon: MessageSquare, path: ROUTES.INBOX, badgeKey: 'inbox' },
      { label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS, badgeKey: 'notif' },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  show: boolean;
}

function NavTooltip({ label, children, show }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  if (!show) return <>{children}</>;
  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
          >
            <div className="px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs font-medium whitespace-nowrap"
              style={{
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                boxShadow: 'var(--shadow-lg)'
              }}>
              {label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ onClose }: SidebarProps) {
  const { student, clearAuth } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { notificationCount, inboxUnreadCount } = useStudentStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  const getBadgeCount = (key?: string) => {
    if (key === 'inbox') return inboxUnreadCount;
    if (key === 'notif') return notificationCount;
    return 0;
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full overflow-hidden flex-shrink-0"
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-[60px] flex-shrink-0 px-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Gradient icon */}
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--gradient-hero)' }}>
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="whitespace-nowrap">
                  <p className="font-bold text-[13px] leading-tight" style={{ color: 'var(--color-text)' }}>EKAI</p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Student Hub</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle - desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-[6px] transition-colors flex-shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Main navigation"
        style={{ scrollbarWidth: 'none' }}>
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const badge = getBadgeCount(item.badgeKey);
              return (
                <NavTooltip key={item.path} label={item.label} show={sidebarCollapsed}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 mx-2 my-0.5 rounded-[8px] transition-all duration-150 relative',
                        sidebarCollapsed ? 'justify-center px-0 py-2.5 h-10' : 'px-3 py-2',
                        isActive
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                      )
                    }
                    style={({ isActive }) => isActive ? {
                      background: 'var(--color-primary-light)',
                      boxShadow: 'inset 3px 0 0 var(--color-primary)',
                    } : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn('flex-shrink-0 transition-transform', isActive ? 'h-4 w-4' : 'h-4 w-4')} />

                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.15 }}
                              className="text-[13px] font-medium truncate flex-1 overflow-hidden whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Badge - expanded */}
                        {!sidebarCollapsed && badge > 0 && (
                          <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center text-white flex-shrink-0"
                            style={{ background: 'var(--color-danger)' }}>
                            {badge}
                          </span>
                        )}

                        {/* Badge dot - collapsed */}
                        {sidebarCollapsed && badge > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                            style={{ background: 'var(--color-danger)' }} />
                        )}
                      </>
                    )}
                  </NavLink>
                </NavTooltip>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom divider */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} className="flex-shrink-0">
        {/* Settings link */}
        <NavTooltip label="Settings" show={sidebarCollapsed}>
          <NavLink
            to={ROUTES.SETTINGS}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 mx-2 mt-2 rounded-[8px] transition-all duration-150',
                sidebarCollapsed ? 'justify-center px-0 py-2.5 h-10' : 'px-3 py-2',
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              )
            }
            style={({ isActive }) => isActive ? { background: 'var(--color-primary-light)' } : undefined}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        </NavTooltip>

        {/* User card */}
        <div className={cn('p-2', sidebarCollapsed ? 'flex justify-center' : '')}>
          {!sidebarCollapsed && student ? (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-[10px] transition-colors"
              style={{ background: 'var(--color-surface-2)' }}>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                style={{ background: 'var(--gradient-primary)' }}>
                {student.avatarUrl
                  ? <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  : getInitials(student.name)
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--color-text)' }}>{student.name}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                  Class {student.class}-{student.section}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-1 rounded-[6px] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
                aria-label="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : sidebarCollapsed ? (
            <NavTooltip label="Logout" show>
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-[8px] transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </NavTooltip>
          ) : null}
        </div>
      </div>
    </motion.aside>
  );
}
