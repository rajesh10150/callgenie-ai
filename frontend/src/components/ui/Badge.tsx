'use client';

import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export default function Badge({ status, label, className }: BadgeProps) {
  return (
    <span className={cn(getStatusColor(status), className)}>
      {label || status.replace(/_/g, ' ')}
    </span>
  );
}
