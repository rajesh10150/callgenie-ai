import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'badge-success',
    completed: 'badge-success',
    qualified: 'badge-success',
    converted: 'badge-success',
    positive: 'badge-success',
    draft: 'badge-neutral',
    new: 'badge-info',
    contacted: 'badge-info',
    in_progress: 'badge-info',
    ringing: 'badge-info',
    queued: 'badge-info',
    paused: 'badge-warning',
    neutral: 'badge-warning',
    callback: 'badge-warning',
    failed: 'badge-danger',
    lost: 'badge-danger',
    unqualified: 'badge-danger',
    negative: 'badge-danger',
    no_answer: 'badge-danger',
    archived: 'badge-neutral',
  };
  return colors[status] || 'badge-neutral';
}

export const LANGUAGES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil',
  te: 'Telugu',
};

export const AI_MODELS: Record<string, { label: string; description: string }> = {
  'gpt-4.1': { label: 'GPT-4.1', description: 'Best for complex reasoning & sales' },
  'claude': { label: 'Claude', description: 'Nuanced & safe responses' },
  'gemini': { label: 'Gemini', description: 'Fast & multilingual' },
  'deepseek': { label: 'DeepSeek', description: 'Cost-effective & fast' },
};
