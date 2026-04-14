'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Upload,
  MessageCircle,
  TrendingUp,
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
  StatCard,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardAlunoStats, DashboardAlunoStats } from '@/services/storage';
import { formatarValor, formatarData } from '@/lib/utils';

export default function AlunoDashboardPage() {
  const router = useRouter();
  const { usuario, isAluno } = useAuth();
  const [stats, setStats] = useState<DashboardAlunoStats | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (usuario?.id) {
      const dados = getDashboardAlunoStats(usuario.id);
      setStats(dados);
      setCarregando(false);
    }
  }, [usuario?.id]);

  if (carregando) {
    return (
      <ProtectedRoute>
        <AlunoLayout>
          <Loading />
        </AlunoLayout>
      </ProtectedRoute>
    );
  }

  const whatsappLink = () => {
    const mensagem = encodeURIComponent('Olá! Sou aluno e gostaria de tirar uma dúvida.');
    return `https://wa.me/5511999999999?text=${mensagem}`;
  };

  return (
    <ProtectedRoute tipoRequerido="aluno">
      <AlunoLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Olá, {usuario?.nome?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe suas mensalidades e pagamentos
            </p>
          </div>

          {/* Mensalidade Atual */}
          {stats?.mensalidadeAtual && stats.mensalidadeAtual.status !== 'pago' ? (
            <Card className={`border-l-4 ${
              stats.mensalidadeAtual.status === 'atrasado'
                ? 'border-l-red-500'
                : 'border-l-yellow-500'
            }`}>
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Mensalidade Atual
                      </h2>
                      <Badge status={stats.mensalidadeAtual.status} />
                    </div>

                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatarValor(stats.mensalidadeAtual.valor)}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Vencimento: {formatarData(stats.mensalidadeAtual.dataVencimento)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/aluno/comprovante/${stats.mensalidadeAtual?.id}`)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Comprovante
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => window.open(whatsappLink(), '_blank')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : stats?.mensalidadeAtual?.status === 'pago' ? (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-green-900 dark:text-green-100">
                      Parabéns! Mensalidade em dia
                    </h2>
                    <p className="text-green-700 dark:text-green-300">
                      Sua mensalidade de {new Date().toLocaleDateString('pt-BR', { month: 'long' })} já está paga.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardBody className="p-6">
                <p className="text-blue-800 dark:text-blue-300">
                  Nenhuma mensalidade encontrada. Aguarde o administrador configurar sua mensalidade.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pago</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatarValor(stats?.totalPago || 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendente</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatarValor(stats?.totalPendente || 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Em Atraso</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatarValor(stats?.totalAtrasado || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico Rápido */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Últimas Mensalidades
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/aluno/minhas-mensalidades')}
                >
                  Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {stats?.historico.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma mensalidade encontrada.</p>
              ) : (
                <div className="space-y-2">
                  {stats?.historico.slice(0, 5).map((mensalidade) => (
                    <div
                      key={mensalidade.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          mensalidade.status === 'pago'
                            ? 'bg-green-100'
                            : mensalidade.status === 'pendente'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                        }`}>
                          {mensalidade.status === 'pago' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : mensalidade.status === 'pendente' ? (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {mensalidade.mesReferencia}/{mensalidade.anoReferencia}
                          </p>
                          <p className="text-xs text-gray-500">
                            Venc: {formatarData(mensalidade.dataVencimento)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatarValor(mensalidade.valor)}</p>
                        <Badge status={mensalidade.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </AlunoLayout>
    </ProtectedRoute>
  );
}
