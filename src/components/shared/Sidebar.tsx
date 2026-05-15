import React from 'react';
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
  Shield, UserCircle
} from 'lucide-react';

const navGroups = [
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

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-all duration-300 relative z-10',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-border)] flex-shrink-0">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--color-text)]">EKAI</p>
                <p className="text-xs text-[var(--color-text-muted)]">Student Hub</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary)] flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">E</span>
          </div>
        )}
        {/* Toggle button - hidden on mobile */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!sidebarCollapsed && (
              <p className="px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const badge = getBadgeCount(item.badgeKey);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-2 mx-2 rounded-[var(--radius-md)] transition-colors text-sm font-medium relative',
                      isActive
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
                      sidebarCollapsed && 'justify-center px-2'
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!sidebarCollapsed && badge > 0 && (
                    <span className="bg-[var(--color-danger)] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {badge}
                    </span>
                  )}
                  {sidebarCollapsed && badge > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-[var(--color-border)] p-3 flex-shrink-0">
        <NavLink
          to={ROUTES.SETTINGS}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 p-2 rounded-[var(--radius-md)] transition-colors mb-1',
              isActive ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]',
              sidebarCollapsed && 'justify-center'
            )
          }
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
        </NavLink>

        {!sidebarCollapsed && student && (
          <div className="flex items-center gap-2 p-2 rounded-[var(--radius-md)]">
            <img
              src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`}
              alt={student.name}
              className="w-8 h-8 rounded-full object-cover bg-[var(--color-surface-2)]"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-text)] truncate">{student.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">Class {student.class}-{student.section}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {sidebarCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface-2)] transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
