'use client';

import { ReactNode } from 'react';
import { AlunoSidebar } from './AlunoSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNotificacoes } from '@/hooks/useNotificacoes';

interface AlunoLayoutProps {
  children: ReactNode;
}

export function AlunoLayout({ children }: AlunoLayoutProps) {
  const { usuario, logout } = useAuth();
  const { naoLidas } = useNotificacoes(usuario?.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AlunoSidebar
        onLogout={logout}
        usuarioNome={usuario?.nome}
        usuarioId={usuario?.id}
        notificacoesNaoLidas={naoLidas}
      />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
