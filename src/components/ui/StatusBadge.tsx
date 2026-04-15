'use client';

import { ReactNode } from 'react';
import { Badge } from './Badge';
import { StatusMensalidade } from '@/types';

interface StatusBadgeProps {
  status: StatusMensalidade;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export function StatusBadge({ status, size = 'md', children }: StatusBadgeProps) {
  return (
    <Badge status={status} size={size}>
      {children}
    </Badge>
  );
}

