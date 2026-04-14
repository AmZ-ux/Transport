'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notificacao } from '@/types';
import {
  getNotificacoes,
  getNotificacoesNaoLidas,
  marcarNotificacaoComoLida,
  criarNotificacao,
  gerarNotificacoesAutomaticas,
} from '@/services/storage';

export function useNotificacoes(usuarioId?: string) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    if (!usuarioId) {
      setNotificacoes([]);
      setNaoLidas(0);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      const dados = getNotificacoes(usuarioId);
      setNotificacoes(dados);
      setNaoLidas(getNotificacoesNaoLidas(usuarioId).length);
    } finally {
      setCarregando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    carregar();
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregar, 30000);
    return () => clearInterval(interval);
  }, [carregar]);

  const marcarComoLida = useCallback((notificacaoId: string) => {
    marcarNotificacaoComoLida(notificacaoId);
    carregar();
  }, [carregar]);

  const marcarTodasComoLidas = useCallback(() => {
    notificacoes.filter(n => !n.lida).forEach(n => {
      marcarNotificacaoComoLida(n.id);
    });
    carregar();
  }, [notificacoes, carregar]);

  const gerarLembretes = useCallback(() => {
    gerarNotificacoesAutomaticas();
    carregar();
  }, [carregar]);

  return {
    notificacoes,
    naoLidas,
    carregando,
    marcarComoLida,
    marcarTodasComoLidas,
    gerarLembretes,
    recarregar: carregar,
  };
}
