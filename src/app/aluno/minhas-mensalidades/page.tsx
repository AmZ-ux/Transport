'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Receipt, Upload } from 'lucide-react';
import {
  AlunoLayout,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  ListItem,
  Loading,
  ProtectedRoute,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { filtrarMensalidades, getAlunoPorUsuarioId } from '@/services/storage';
import { Mensalidade, StatusMensalidade } from '@/types';
import { formatarData, formatarValor, nomeMes } from '@/lib/utils';

const STATUS_OPTIONS: { value: StatusMensalidade | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pago', label: 'Pago' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'atrasado', label: 'Atrasado' },
];

export default function MinhasMensalidadesPage() {
  const router = useRouter();
  const { usuario } = useAuth();

  const [carregando, setCarregando] = useState(true);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<StatusMensalidade | ''>('');

  useEffect(() => {
    if (!usuario?.id) return;

    const aluno = getAlunoPorUsuarioId(usuario.id);
    if (!aluno) {
      setMensalidades([]);
      setCarregando(false);
      return;
    }

    let dados = filtrarMensalidades({ alunoId: aluno.id });
    if (filtroStatus) {
      dados = dados.filter((item) => item.status === filtroStatus);
    }

    dados.sort((a, b) => {
      if (b.anoReferencia !== a.anoReferencia) return b.anoReferencia - a.anoReferencia;
      return b.mesReferencia - a.mesReferencia;
    });

    setMensalidades(dados);
    setCarregando(false);
  }, [usuario?.id, filtroStatus]);

  const totalPendente = useMemo(
    () =>
      mensalidades
        .filter((item) => item.status === 'pendente' || item.status === 'atrasado')
        .reduce((acc, item) => acc + item.valor, 0),
    [mensalidades]
  );

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
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary-600" />
              <h1 className="pageTitle text-gray-900 dark:text-white">Minhas mensalidades</h1>
            </div>
            <p className="pageSubtitle text-gray-600 dark:text-gray-400">Acompanhe historico e status de pagamento.</p>
          </header>

          {totalPendente > 0 && (
            <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20">
              <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Total em aberto: {formatarValor(totalPendente)}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Regularize para manter o transporte sem bloqueios.</p>
                </div>
                <Button variant="outline" onClick={() => window.open(whatsappLink, '_blank')}>
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </Button>
              </CardBody>
            </Card>
          )}

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((opt) => {
              const ativo = (!filtroStatus && opt.value === '') || filtroStatus === opt.value;
              const qtd = opt.value ? mensalidades.filter((item) => item.status === opt.value).length : mensalidades.length;

              return (
                <button
                  key={opt.value}
                  onClick={() => setFiltroStatus(opt.value)}
                  className={`chipLabel min-h-[40px] whitespace-nowrap rounded-full px-3 transition ${
                    ativo
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {opt.label} ({qtd})
                </button>
              );
            })}
          </div>

          {!mensalidades.length ? (
            <EmptyState
              title="Nenhuma mensalidade encontrada"
              description="Aguarde a configuracao do administrador."
              icon={<Receipt className="h-12 w-12 text-gray-400" />}
            />
          ) : (
            <section className="space-y-3">
              {mensalidades.map((mensalidade) => (
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
                  meta={
                    mensalidade.dataPagamento
                      ? `Pago em ${formatarData(mensalidade.dataPagamento)}${
                          mensalidade.formaPagamento ? ` • ${mensalidade.formaPagamento.toUpperCase()}` : ''
                        }`
                      : 'Pagamento ainda nao registrado'
                  }
                  value={formatarValor(mensalidade.valor)}
                  actions={
                    mensalidade.status === 'pago' ? null : (
                      <Button size="sm" onClick={() => router.push(`/aluno/comprovante/${mensalidade.id}`)}>
                        <Upload className="h-4 w-4" /> Enviar comprovante
                      </Button>
                    )
                  }
                />
              ))}
            </section>
          )}
        </div>
      </AlunoLayout>
    </ProtectedRoute>
  );
}
