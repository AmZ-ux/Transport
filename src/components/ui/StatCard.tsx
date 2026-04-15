'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`mt-2 text-sm ${trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

