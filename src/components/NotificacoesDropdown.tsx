'use client';

import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { Notificacao } from '@/types';
import { formatDistanceToNow } from '@/lib/utils';

interface NotificacoesDropdownProps {
  usuarioId: string;
}

export function NotificacoesDropdown({ usuarioId }: NotificacoesDropdownProps) {
  const [aberto, setAberto] = useState(false);
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } = useNotificacoes(usuarioId);

  const getIconePorTipo = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'lembrete':
        return '🔔';
      case 'vencimento':
        return '⏰';
      case 'atraso':
        return '⚠️';
      case 'confirmacao':
        return '✅';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAberto(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notificacoes.map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                        !notificacao.lida ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        marcarComoLida(notificacao.id);
                        if (notificacao.link) {
                          window.location.href = notificacao.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getIconePorTipo(notificacao.tipo)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {notificacao.titulo}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {notificacao.mensagem}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(notificacao.dataEnvio)}
                          </p>
                        </div>
                        {!notificacao.lida && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
