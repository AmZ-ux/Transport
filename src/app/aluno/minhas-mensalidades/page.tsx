'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import {
  AlunoLayout,
  ProtectedRoute,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Loading,
  Select,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { getMensalidades, filtrarMensalidades } from '@/services/storage';
import { getAlunoPorUsuarioId } from '@/services/storage';
import { Mensalidade, StatusMensalidade } from '@/types';
import { formatarValor, formatarData, nomeMes } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pago', label: 'Pago' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'atrasado', label: 'Atrasado' },
];

export default function MinhasMensalidadesPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<StatusMensalidade | ''>('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (usuario?.id) {
      const aluno = getAlunoPorUsuarioId(usuario.id);
      if (aluno) {
        let dados = filtrarMensalidades({ alunoId: aluno.id });

        if (filtroStatus) {
          dados = dados.filter(m => m.status === filtroStatus);
        }

        // Ordenar do mais recente para o mais antigo
        dados.sort((a, b) => {
          if (b.anoReferencia !== a.anoReferencia) {
            return b.anoReferencia - a.anoReferencia;
          }
          return b.mesReferencia - a.mesReferencia;
        });

        setMensalidades(dados);
      }
      setCarregando(false);
    }
  }, [usuario?.id, filtroStatus]);

  const whatsappLink = () => {
    const mensagem = encodeURIComponent('Olá! Sou aluno e gostaria de tirar uma dúvida sobre minha mensalidade.');
    return `https://wa.me/5511999999999?text=${mensagem}`;
  };

  const totalPendente = mensalidades
    .filter(m => m.status === 'pendente' || m.status === 'atrasado')
    .reduce((acc, m) => acc + m.valor, 0);

  if (carregando) {
    return (
      <ProtectedRoute>
        <AlunoLayout>
          <Loading />
        </AlunoLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute tipoRequerido="aluno">
      <AlunoLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Mensalidades</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Histórico completo de suas mensalidades
              </p>
            </div>
          </div>

          {/* Resumo */}
          {totalPendente > 0 && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Você tem {formatarValor(totalPendente)} em mensalidades pendentes
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Regularize o quanto antes para evitar problemas no transporte
                      </p>
                    </div>
                  </div>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Falar no WhatsApp
                  </a>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Filtros */}
          <Card>
            <CardBody className="p-4">
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFiltroStatus(opt.value as StatusMensalidade | '')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filtroStatus === opt.value || (opt.value === '' && !filtroStatus)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Lista de Mensalidades */}
          {mensalidades.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma mensalidade encontrada</h2>
              <p className="text-gray-500">Aguarde o administrador configurar sua mensalidade.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mensalidades.map((mensalidade) => (
                <Card
                  key={mensalidade.id}
                  className={`border-l-4 ${
                    mensalidade.status === 'pago'
                      ? 'border-l-green-500'
                      : mensalidade.status === 'pendente'
                      ? 'border-l-yellow-500'
                      : 'border-l-red-500'
                  }`}
                >
                  <CardBody className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg text-gray-900 dark:text-white">
                            {nomeMes(mensalidade.mesReferencia)} {mensalidade.anoReferencia}
                          </span>
                          <Badge status={mensalidade.status} size="sm" />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Vencimento: {formatarData(mensalidade.dataVencimento)}</span>
                          {mensalidade.dataPagamento && (
                            <span>Pago em: {formatarData(mensalidade.dataPagamento)}</span>
                          )}
                        </div>

                        {mensalidade.formaPagamento && (
                          <p className="text-sm text-gray-500 mt-1">
                            Forma: {mensalidade.formaPagamento.toUpperCase()}
                          </p>
                        )}

                        {mensalidade.comprovante && (
                          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                            <CheckCircle className="h-4 w-4" />
                            Comprovante enviado em {formatarData(mensalidade.comprovante.dataEnvio)}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatarValor(mensalidade.valor)}
                        </p>

                        {mensalidade.status !== 'pago' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => router.push(`/aluno/comprovante/${mensalidade.id}`)}
                            className="mt-2"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar Comprovante
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AlunoLayout>
    </ProtectedRoute>
  );
}
