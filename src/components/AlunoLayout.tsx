'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlunoBottomNav } from './AlunoBottomNav';

interface AlunoLayoutProps {
  children: ReactNode;
}

export function AlunoLayout({ children }: AlunoLayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#E2E8E5] pb-24 dark:bg-gray-950">
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-md px-4 pb-6 pt-6 sm:px-5 sm:pt-7">
          {children}
        </div>
      </main>
      <AlunoBottomNav onLogout={logout} />
    </div>
  );
}
