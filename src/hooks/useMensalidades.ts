'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mensalidade, FiltrosMensalidade } from '@/types';
import {
  getMensalidades,
  filtrarMensalidades as filtrar,
  registrarPagamento as pagar,
  getAlunos,
  gerarMensalidadesMes,
} from '@/services/storage';

export function useMensalidades(filtros?: FiltrosMensalidade) {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    setCarregando(true);
    const alunos = getAlunos();

    let dados;
    if (filtros) {
      dados = filtrar(filtros);
    } else {
      dados = getMensalidades();
    }

    // Vincular dados do aluno
    const dadosComAluno = dados.map(m => ({
      ...m,
      aluno: alunos.find(a => a.id === m.alunoId),
    }));

    setMensalidades(dadosComAluno);
    setCarregando(false);
  }, [filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const registrarPagamento = useCallback(
    (mensalidadeId: string, formaPagamento: string, dataPagamento?: string, observacoes?: string) => {
      const result = pagar(mensalidadeId, formaPagamento, dataPagamento, observacoes);
      if (result) {
        carregar();
      }
      return result;
    },
    [carregar]
  );

  const gerarMensalidades = useCallback(() => {
    gerarMensalidadesMes();
    carregar();
  }, [carregar]);

  return {
    mensalidades,
    carregando,
    recarregar: carregar,
    registrarPagamento,
    gerarMensalidades,
  };
}
