'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Calendar, CheckCircle, MessageCircle, Upload } from 'lucide-react';
import {
  AlunoLayout,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ListItem,
  Loading,
  ProtectedRoute,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardAlunoStats } from '@/services/storage';
import type { DashboardAlunoStats } from '@/types';
import { formatarData, formatarValor, nomeMes } from '@/lib/utils';

export default function AlunoDashboardPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [stats, setStats] = useState<DashboardAlunoStats | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario?.id) return;

    const dados = getDashboardAlunoStats(usuario.id);
    setStats(dados);
    setCarregando(false);
  }, [usuario?.id]);

  const whatsappLink = useMemo(() => {
    const mensagem = encodeURIComponent('Ola! Sou aluno e preciso de ajuda com minhas mensalidades.');
    return `https://wa.me/5511999999999?text=${mensagem}`;
  }, []);

  if (carregando) {
    return (
      <ProtectedRoute tipoRequerido="aluno">
        <AlunoLayout>
          <Loading />
        </AlunoLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute tipoRequerido="aluno">
      <AlunoLayout>
        <div className="space-y-5">
          <header>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ola, {usuario?.nome?.split(' ')[0]}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Acompanhe pagamentos, pendencias e comprovantes.</p>
          </header>

          {stats?.mensalidadeAtual && stats.mensalidadeAtual.status !== 'pago' ? (
            <Card className={stats.mensalidadeAtual.status === 'atrasado' ? 'border-rose-300' : 'border-amber-300'}>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mensalidade atual</h2>
                  <Badge status={stats.mensalidadeAtual.status} size="sm" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatarValor(stats.mensalidadeAtual.valor)}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Vencimento: {formatarData(stats.mensalidadeAtual.dataVencimento)}</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => router.push(`/aluno/comprovante/${stats.mensalidadeAtual?.id}`)}>
                    <Upload className="h-4 w-4" /> Enviar comprovante
                  </Button>
                  <Button variant="outline" onClick={() => window.open(whatsappLink, '_blank')}>
                    <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : stats?.mensalidadeAtual?.status === 'pago' ? (
            <Card className="border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20">
              <CardBody className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">Mensalidade em dia</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Pagamento de {nomeMes(stats.mensalidadeAtual.mesReferencia)} confirmado.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <EmptyState
              title="Nenhuma mensalidade ativa"
              description="Aguarde o administrador configurar sua mensalidade."
              icon={<AlertTriangle className="h-10 w-10 text-gray-400" />}
            />
          )}

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500">Total pago</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatarValor(stats?.totalPago || 0)}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500">Pendente</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatarValor(stats?.totalPendente || 0)}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500">Atrasado</p>
                <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{formatarValor(stats?.totalAtrasado || 0)}</p>
              </CardBody>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ultimas mensalidades</h2>
                <Button variant="ghost" size="sm" onClick={() => router.push('/aluno/minhas-mensalidades')}>
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {stats?.historico.slice(0, 5).map((mensalidade) => (
                <ListItem
                  key={mensalidade.id}
                  statusColor={mensalidade.status}
                  title={
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{nomeMes(mensalidade.mesReferencia)} {mensalidade.anoReferencia}</span>
                      <Badge status={mensalidade.status} size="sm" />
                    </div>
                  }
                  subtitle={`Vencimento: ${formatarData(mensalidade.dataVencimento)}`}
                  value={formatarValor(mensalidade.valor)}
                />
              ))}

              {!stats?.historico.length && (
                <EmptyState
                  title="Sem historico"
                  description="Ainda nao existem mensalidades registradas para este aluno."
                />
              )}
            </CardBody>
          </Card>
        </div>
      </AlunoLayout>
    </ProtectedRoute>
  );
}
