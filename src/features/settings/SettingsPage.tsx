import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Bell, Globe, Palette, ChevronRight, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Theme } from '@/types/enums';
import { ROUTES } from '@/lib/constants';

const settingsGroups = [
  {
    label: 'Account',
    items: [
      { label: 'Security', description: 'Password, 2FA, active sessions', icon: Shield, path: ROUTES.SETTINGS_SECURITY },
      { label: 'Privacy & Data', description: 'Data rights, download your data', icon: Eye, path: ROUTES.SETTINGS_PRIVACY },
      { label: 'Consent Manager', description: 'Manage data sharing consents', icon: Bell, path: ROUTES.CONSENT },
    ],
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" />

      <div className="space-y-6">
        {/* Appearance */}
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Appearance</p>
          <Card padding="none">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">Theme</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Choose your display theme</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[Theme.LIGHT, Theme.DARK, Theme.SYSTEM].map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${theme === t ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">Language</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Display language</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[['en', 'English'], ['hi', 'हिंदी']].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setLanguage(v as any)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${language === v ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Account Settings */}
        {settingsGroups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">{group.label}</p>
            <Card padding="none">
              {group.items.map((item, i) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-[var(--color-surface-2)] transition-colors text-left ${i > 0 ? 'border-t border-[var(--color-border)]' : ''}`}
                >
                  <item.icon className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)]">{item.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                </button>
              ))}
            </Card>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 bg-[var(--color-danger-light)] rounded-[var(--radius-lg)] text-[var(--color-danger)] hover:opacity-90 transition-opacity"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
