'use client';

import { useState, useEffect, useCallback } from 'react';
import { Usuario, TipoUsuario } from '@/types';
import {
  login as loginService,
  logout as logoutService,
  getUsuarioLogado,
  estaAutenticado,
  inicializarDados,
  isAdmin,
  isAluno,
  cadastrarAlunoPublico,
} from '@/services/storage';

interface LoginResult {
  sucesso: boolean;
  tipo?: TipoUsuario;
}

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    inicializarDados();
    const user = getUsuarioLogado();
    setUsuario(user);
    setCarregando(false);
  }, []);

  const login = useCallback((email: string, senha: string): LoginResult => {
    const resultado = loginService(email, senha);
    if (resultado.sucesso && resultado.usuario) {
      setUsuario(resultado.usuario);
      return {
        sucesso: true,
        tipo: resultado.usuario.tipo
      };
    }
    return { sucesso: false };
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUsuario(null);
  }, []);

  const autenticado = estaAutenticado();
  const usuarioIsAdmin = isAdmin();
  const usuarioIsAluno = isAluno();

  // Redirecionar com base no tipo
  const getRedirectPath = useCallback((): string => {
    if (usuarioIsAdmin) return '/dashboard';
    if (usuarioIsAluno) return '/aluno/dashboard';
    return '/login';
  }, [usuarioIsAdmin, usuarioIsAluno]);

  return {
    usuario,
    autenticado,
    carregando,
    isAdmin: usuarioIsAdmin,
    isAluno: usuarioIsAluno,
    tipo: usuario?.tipo,
    login,
    logout,
    getRedirectPath,
    cadastrar: cadastrarAlunoPublico,
  };
}
