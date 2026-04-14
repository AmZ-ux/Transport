'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from './ui';

interface ProtectedRouteProps {
  children: ReactNode;
  tipoRequerido?: 'admin' | 'aluno';
}

export function ProtectedRoute({ children, tipoRequerido }: ProtectedRouteProps) {
  const { autenticado, isAdmin, isAluno, carregando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (carregando) return;

    if (!autenticado) {
      router.push('/login');
      return;
    }

    // Verificar tipo de usuário
    if (tipoRequerido === 'admin' && !isAdmin) {
      // Aluno tentando acessar área de admin
      router.push('/aluno/dashboard');
      return;
    }

    if (tipoRequerido === 'aluno' && !isAluno) {
      // Admin tentando acessar área de aluno (opcional - pode permitir)
      // Por padrão vamos redirecionar para dashboard de admin
      if (pathname.startsWith('/aluno')) {
        router.push('/dashboard');
      }
      return;
    }
  }, [autenticado, carregando, isAdmin, isAluno, pathname, router, tipoRequerido]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!autenticado) {
    return null;
  }

  // Verificar permissão
  if (tipoRequerido === 'admin' && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
