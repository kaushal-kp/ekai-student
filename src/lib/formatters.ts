import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, h:mm a');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd MMM');
  } catch {
    return dateStr;
  }
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatScore(obtained: number, max: number): string {
  return `${obtained}/${max}`;
}

export function formatLPA(amount: number): string {
  return `${amount} LPA`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export function getTimeGroup(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) return 'This Week';
    return 'Older';
  } catch {
    return 'Older';
  }
}
