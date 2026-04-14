'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import {
  Layout,
  ProtectedRoute,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Loading,
} from '@/components';
import { getDashboardStats, DashboardStats } from '@/services/storage';
import { formatarValor, formatarData } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const dados = getDashboardStats();
    setStats(dados);
    setCarregando(false);
  }, []);

  const hoje = new Date();
  const nomeMesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (carregando) {
    return (
      <ProtectedRoute>
        <Layout>
          <Loading />
        </Layout>
      </ProtectedRoute>
    );
  }

  const atrasados = stats?.mensalidadesMes.filter(m => m.status === 'atrasado') || [];
  const pendentes = stats?.mensalidadesMes.filter(m => m.status === 'pendente') || [];
  const pagos = stats?.mensalidadesMes.filter(m => m.status === 'pago') || [];

  return (
    <ProtectedRoute tipoRequerido="admin">
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Administrativo</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visão geral de {nomeMesAtual}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/alunos/novo')}
            >
              + Novo Aluno
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total a Receber"
              value={formatarValor(stats?.totalReceberMes || 0)}
              icon={<Receipt className="h-6 w-6" />}
              color="blue"
            />
            <StatCard
              title="Total Recebido"
              value={formatarValor(stats?.totalRecebido || 0)}
              icon={<CheckCircle className="h-6 w-6" />}
              color="green"
              trend={{
                value: stats?.totalReceberMes
                  ? Math.round((stats.totalRecebido / stats.totalReceberMes) * 100)
                  : 0,
                label: 'do total',
              }}
            />
            <StatCard
              title="Em Atraso"
              value={formatarValor(stats?.totalAtraso || 0)}
              icon={<AlertTriangle className="h-6 w-6" />}
              color="red"
            />
            <StatCard
              title="Alunos Ativos"
              value={stats?.quantidadeAlunosAtivos || 0}
              icon={<Users className="h-6 w-6" />}
              color="purple"
            />
          </div>

          {/* Taxa de Inadimplência */}
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Taxa de Inadimplência</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {stats?.taxaInadimplencia || 0}%
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-orange-700 dark:text-orange-300">
                  <p>{stats?.totalAtrasados || 0} alunos em atraso</p>
                  <p>{stats?.totalPendentes || 0} alunos pendentes</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Atrasados Alert */}
          {atrasados.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 dark:text-red-300">
                  Voce tem {atrasados.length} mensalidade{atrasados.length > 1 ? 's' : ''} em atraso
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Total: {formatarValor(atrasados.reduce((acc, m) => acc + m.valor, 0))}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/mensalidades')}
                className="text-red-600 hover:bg-red-100"
              >
                Ver tudo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Mensalidades do Mes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mensalidades do Mes
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/mensalidades')}
                >
                  Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {stats?.mensalidadesMes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma mensalidade para este mes.</p>
                  <p className="text-sm mt-1">Cadastre alunos para gerar mensalidades automaticamente.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats?.mensalidadesMes.slice(0, 10).map((mensalidade) => (
                        <tr key={mensalidade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {mensalidade.aluno?.nome || 'Aluno'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {mensalidade.aluno?.curso}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {formatarData(mensalidade.dataVencimento)}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {formatarValor(mensalidade.valor)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge status={mensalidade.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {mensalidade.status !== 'pago' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => router.push(`/pagamento/${mensalidade.id}`)}
                              >
                                Receber
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stats?.mensalidadesMes.length > 10 && (
                    <div className="text-center py-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/mensalidades')}
                      >
                        Ver {stats.mensalidadesMes.length - 10} mensalidades a mais
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Resumo por Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300">Pagos</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {pagos.length}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {formatarValor(pagos.reduce((acc, m) => acc + m.valor, 0))}
                    </p>
                  </div>
                  <div className="bg-green-200 dark:bg-green-800 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-300" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {pendentes.length}
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {formatarValor(pendentes.reduce((acc, m) => acc + m.valor, 0))}
                    </p>
                  </div>
                  <div className="bg-yellow-200 dark:bg-yellow-800 p-3 rounded-lg">
                    <Receipt className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">Atrasados</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {atrasados.length}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {formatarValor(atrasados.reduce((acc, m) => acc + m.valor, 0))}
                    </p>
                  </div>
                  <div className="bg-red-200 dark:bg-red-800 p-3 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-700 dark:text-red-300" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
}
