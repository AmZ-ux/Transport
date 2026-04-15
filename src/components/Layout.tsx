'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#E2E8E5] dark:bg-gray-950">
      <Sidebar onLogout={logout} usuarioNome={usuario?.nome} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
