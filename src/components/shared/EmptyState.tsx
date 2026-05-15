import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, emoji, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {emoji && <div className="text-5xl mb-4">{emoji}</div>}
      {icon && <div className="text-[var(--color-text-muted)] mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-4">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
