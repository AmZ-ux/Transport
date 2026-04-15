'use client';

import { ReactNode } from 'react';
import { StatusMensalidade } from '@/types';
import { coresStatus, labelsStatus } from '@/lib/utils';

interface BadgeProps {
  status: StatusMensalidade;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ status, children, size = 'md' }: BadgeProps) {
  const styles = coresStatus[status];
  const label = children || labelsStatus[status];

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${styles.bg} ${styles.text} ${styles.border} ${sizes[size]}`}>
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}

