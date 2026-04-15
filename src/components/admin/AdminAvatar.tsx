'use client';

interface AdminAvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

const palette = ['bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500', 'bg-fuchsia-500'];

function initials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '--';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AdminAvatar({ name, size = 'md' }: AdminAvatarProps) {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const bg = palette[hash % palette.length];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white font-bold ${bg} ${
        size === 'sm' ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-sm'
      }`}
    >
      {initials(name)}
    </span>
  );
}
