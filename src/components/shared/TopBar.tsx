import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, Sun, Moon, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useStudentStore } from '@/store/studentStore';
import { Theme } from '@/types/enums';
import { ROUTES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { student } = useAuthStore();
  const { theme, setTheme, notificationCount } = useStudentStore();
  const { theme: uiTheme, setTheme: setUiTheme } = useUIStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    setUiTheme(uiTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4 gap-3 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text)] p-1"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className={cn('flex-1 max-w-md', searchOpen ? 'flex' : 'hidden md:flex')}>
        {searchOpen ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <button onClick={() => setSearchOpen(false)} className="text-[var(--color-text-muted)]">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              placeholder="Search..."
              onClick={() => setSearchOpen(true)}
              readOnly
              className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm cursor-pointer text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text)] p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)]"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)]"
          aria-label="Toggle theme"
        >
          {uiTheme === Theme.DARK ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text)] p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
          )}
        </button>

        {/* Avatar */}
        {student && (
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className="flex items-center gap-2 ml-1"
            aria-label="Go to profile"
          >
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-8 h-8 rounded-full object-cover bg-[var(--color-surface-2)]"
                onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-white text-xs font-bold">{getInitials(student.name)}</span>
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
