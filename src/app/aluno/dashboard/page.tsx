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

  const situacaoAtual = useMemo(() => {
    if (!stats?.mensalidadeAtual) return '';

    const hoje = new Date();
    const vencimento = new Date(`${stats.mensalidadeAtual.dataVencimento}T00:00:00`);
    const diffMs = vencimento.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (stats.mensalidadeAtual.status === 'atrasado') {
      const diasAtraso = Math.max(1, Math.abs(diffDias));
      return `Pagamento em atraso ha ${diasAtraso} dia${diasAtraso > 1 ? 's' : ''}`;
    }

    if (diffDias === 0) return 'Vence hoje';
    if (diffDias > 0) return `Vence em ${diffDias} dia${diffDias > 1 ? 's' : ''}`;

    return '';
  }, [stats?.mensalidadeAtual]);

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
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Ola, {usuario?.nome?.split(' ')[0]}</h1>
            <p className="pageSubtitle text-gray-600 dark:text-gray-400">Acompanhe pagamentos, pendencias e comprovantes.</p>
          </header>

          {stats?.mensalidadeAtual && stats.mensalidadeAtual.status !== 'pago' ? (
            <Card
              className={`overflow-hidden rounded-3xl border bg-white shadow-md dark:bg-gray-900 ${
                stats.mensalidadeAtual.status === 'atrasado'
                  ? 'border-rose-300 shadow-rose-100/70 dark:shadow-rose-950/20'
                  : 'border-amber-300 shadow-amber-100/60 dark:shadow-amber-950/20'
              }`}
            >
              <CardBody className="space-y-5 p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Mensalidade atual</h2>
                  {stats.mensalidadeAtual.status === 'atrasado' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800 dark:border-rose-700 dark:bg-rose-950/70 dark:text-rose-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Atrasado
                    </span>
                  ) : (
                    <Badge status={stats.mensalidadeAtual.status} size="sm" />
                  )}
                </div>

                <p className="text-[2.8rem] font-black leading-none tracking-tight text-gray-950 dark:text-white sm:text-[3.2rem]">
                  {formatarValor(stats.mensalidadeAtual.valor)}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>Vencimento: {formatarData(stats.mensalidadeAtual.dataVencimento)}</span>
                  </div>
                  {situacaoAtual && (
                    <p
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        stats.mensalidadeAtual.status === 'atrasado'
                          ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                          : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                      }`}
                    >
                      Situacao atual: {situacaoAtual}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1 shadow-sm" onClick={() => router.push(`/aluno/comprovante/${stats.mensalidadeAtual?.id}`)}>
                    <Upload className="h-4 w-4" /> Enviar comprovante
                  </Button>
                  <Button className="flex-1 border-primary-500 text-primary-700" variant="outline" onClick={() => window.open(whatsappLink, '_blank')}>
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

          <section className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-3">
            <Card className="border-gray-200/90 bg-white shadow-sm">
              <CardBody>
                <p className="text-sm font-semibold text-gray-500">Total pago</p>
                <p className="text-2xl font-black leading-tight text-emerald-700 dark:text-emerald-300">{formatarValor(stats?.totalPago || 0)}</p>
              </CardBody>
            </Card>
            <Card className="border-gray-200/90 bg-white shadow-sm">
              <CardBody>
                <p className="text-sm font-semibold text-gray-500">Pendente</p>
                <p className="text-2xl font-black leading-tight text-amber-700 dark:text-amber-300">{formatarValor(stats?.totalPendente || 0)}</p>
              </CardBody>
            </Card>
            <Card className="border-gray-200/90 bg-white shadow-sm">
              <CardBody>
                <p className="text-sm font-semibold text-gray-500">Atrasado</p>
                <p className="text-2xl font-black leading-tight text-rose-700 dark:text-rose-300">{formatarValor(stats?.totalAtrasado || 0)}</p>
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
