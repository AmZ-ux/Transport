'use client';

import { ReactNode } from 'react';

interface ListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  value?: ReactNode;
  actions?: ReactNode;
  statusColor?: 'pago' | 'pendente' | 'atrasado';
  onClick?: () => void;
}

const borderByStatus = {
  pago: 'border-l-emerald-500',
  pendente: 'border-l-amber-500',
  atrasado: 'border-l-rose-500',
};

export function ListItem({
  title,
  subtitle,
  meta,
  value,
  actions,
  statusColor,
  onClick,
}: ListItemProps) {
  return (
    <article
      onClick={onClick}
      className={[
        'rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-4',
        'transition duration-200 hover:shadow-md',
        onClick ? 'cursor-pointer' : '',
        statusColor ? `border-l-4 ${borderByStatus[statusColor]}` : '',
      ].join(' ')}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
          {subtitle && <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{subtitle}</div>}
          {meta && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{meta}</div>}
        </div>

        {(value || actions) && (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {value && <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
    </article>
  );
}

