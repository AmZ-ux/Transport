'use client';

import { useState, useEffect, useCallback } from 'react';
import { Aluno } from '@/types';
import {
  getAlunos,
  getAlunosAtivos,
  salvarAluno,
  atualizarAluno,
  excluirAluno,
  buscarAlunos,
} from '@/services/storage';

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    setCarregando(true);
    const dados = getAlunosAtivos();
    setAlunos(dados);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(
    (aluno: Omit<Aluno, 'id' | 'dataCadastro'>) => {
      const novo = salvarAluno(aluno);
      carregar();
      return novo;
    },
    [carregar]
  );

  const atualizar = useCallback(
    (aluno: Aluno) => {
      const atualizado = atualizarAluno(aluno);
      carregar();
      return atualizado;
    },
    [carregar]
  );

  const excluir = useCallback(
    (id: string) => {
      excluirAluno(id);
      carregar();
    },
    [carregar]
  );

  const buscar = useCallback((termo: string) => {
    if (!termo.trim()) {
      carregar();
      return;
    }
    const resultados = buscarAlunos(termo);
    setAlunos(resultados);
  }, [carregar]);

  return {
    alunos,
    carregando,
    recarregar: carregar,
    criar,
    atualizar,
    excluir,
    buscar,
  };
}
