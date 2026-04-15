'use client';

import { ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Clock3 } from 'lucide-react';
import { StatusMensalidade } from '@/types';

interface AdminStatusPillProps {
  status: StatusMensalidade;
  compact?: boolean;
}

const statusConfig: Record<
  StatusMensalidade,
  {
    label: string;
    className: string;
    icon: ReactNode;
  }
> = {
  pago: {
    label: 'Pago',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  atrasado: {
    label: 'Atrasado',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

export function AdminStatusPill({ status, compact = false }: AdminStatusPillProps) {
  const cfg = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${cfg.className} ${
        compact ? 'px-2 py-1 badgeText' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
