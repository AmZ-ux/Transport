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
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${styles.bg} ${styles.text} ${sizes[size]} ${styles.border} border`}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
