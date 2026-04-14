'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Filter,
  Download,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  Layout,
  ProtectedRoute,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  SearchInput,
  EmptyState,
  Select,
} from '@/components';
import { useMensalidades } from '@/hooks/useMensalidades';
import { StatusMensalidade, FiltrosMensalidade } from '@/types';
import { formatarValor, formatarData, labelsStatus } from '@/lib/utils';

const MESES = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Marco' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'pago', label: 'Pago' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'atrasado', label: 'Atrasado' },
];

export default function MensalidadesPage() {
  const router = useRouter();
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  const [filtros, setFiltros] = useState<FiltrosMensalidade>({
    mes: mesAtual,
    ano: anoAtual,
  });
  const [busca, setBusca] = useState('');

  const { mensalidades, carregando, recarregar, registrarPagamento } = useMensalidades(filtros);

  const mensalidadesFiltradas = busca
    ? mensalidades.filter(m =>
        m.aluno?.nome.toLowerCase().includes(busca.toLowerCase())
      )
    : mensalidades;

  const totalReceber = mensalidadesFiltradas.reduce((acc, m) => acc + m.valor, 0);
  const totalRecebido = mensalidadesFiltradas
    .filter(m => m.status === 'pago')
    .reduce((acc, m) => acc + m.valor, 0);
  const totalPendente = mensalidadesFiltradas
    .filter(m => m.status === 'pendente')
    .reduce((acc, m) => acc + m.valor, 0);
  const totalAtrasado = mensalidadesFiltradas
    .filter(m => m.status === 'atrasado')
    .reduce((acc, m) => acc + m.valor, 0);

  const contagemPorStatus = {
    pago: mensalidadesFiltradas.filter(m => m.status === 'pago').length,
    pendente: mensalidadesFiltradas.filter(m => m.status === 'pendente').length,
    atrasado: mensalidadesFiltradas.filter(m => m.status === 'atrasado').length,
  };

  const handleStatusFilter = (status: string) => {
    if (status === '') {
      setFiltros(prev => ({ ...prev, status: undefined }));
    } else {
      setFiltros(prev => ({ ...prev, status: status as StatusMensalidade }));
    }
  };

  const exportarDados = () => {
    const dados = mensalidadesFiltradas.map(m => ({
      Aluno: m.aluno?.nome || '',
      Curso: m.aluno?.curso || '',
      'Mes Referencia': `${m.mesReferencia}/${m.anoReferencia}`,
      'Data Vencimento': formatarData(m.dataVencimento),
      Valor: m.valor,
      Status: labelsStatus[m.status],
      'Data Pagamento': m.dataPagamento ? formatarData(m.dataPagamento) : '',
      'Forma Pagamento': m.formaPagamento || '',
    }));

    const csv = [
      Object.keys(dados[0] || {}).join(';'),
      ...dados.map(row => Object.values(row).join(';')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mensalidades-${filtros.mes}-${filtros.ano}.csv`;
    link.click();
  };

  return (
    <ProtectedRoute tipoRequerido="admin">
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mensalidades</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {mensalidadesFiltradas.length} mensalidade{mensalidadesFiltradas.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportarDados}
                disabled={mensalidadesFiltradas.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="secondary" onClick={recarregar}>
                Atualizar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card>
            <CardBody className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <SearchInput
                    placeholder="Buscar por nome do aluno..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div>
                  <Select
                    label="Mes"
                    value={String(filtros.mes || mesAtual)}
                    onChange={(e) => setFiltros(prev => ({ ...prev, mes: Number(e.target.value) }))}
                  >
                    {MESES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Select
                    label="Ano"
                    value={String(filtros.ano || anoAtual)}
                    onChange={(e) => setFiltros(prev => ({ ...prev, ano: Number(e.target.value) }))}
                  >
                    {Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i).map(ano => (
                      <option key={ano} value={ano}>{ano}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      (filtros.status === opt.value) ||
                      (!filtros.status && opt.value === '')
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {opt.label}
                    {opt.value && contagemPorStatus[opt.value as keyof typeof contagemPorStatus] > 0 && (
                      <span className="ml-1">({contagemPorStatus[opt.value as keyof typeof contagemPorStatus]})</span>
                    )}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Total a Receber</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatarValor(totalReceber)}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300 uppercase">Recebido</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">{formatarValor(totalRecebido)}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 uppercase">Pendente</p>
              <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{formatarValor(totalPendente)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-300 uppercase">Atrasado</p>
              <p className="text-lg font-bold text-red-900 dark:text-red-100">{formatarValor(totalAtrasado)}</p>
            </div>
          </div>

          {/* Lista de Mensalidades */}
          {mensalidadesFiltradas.length === 0 ? (
            <EmptyState
              title="Nenhuma mensalidade encontrada"
              description="Nao ha mensalidades para os filtros selecionados."
              icon={<Receipt className="h-12 w-12 text-gray-400" />}
            />
          ) : (
            <div className="space-y-3">
              {mensalidadesFiltradas.map((mensalidade) => (
                <Card
                  key={mensalidade.id}
                  hover
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {mensalidade.aluno?.nome}
                          </h3>
                          <Badge status={mensalidade.status} size="sm" />
                        </div>
                        <div className="text-sm text-gray-500">
                          {mensalidade.aluno?.curso} - {mensalidade.aluno?.faculdade}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Vencimento</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatarData(mensalidade.dataVencimento)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">Valor</p>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            {formatarValor(mensalidade.valor)}
                          </p>
                        </div>

                        <div>
                          {mensalidade.status === 'pago' ? (
                            <div className="text-right">
                              <p className="text-xs text-green-600">Pago em</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {mensalidade.dataPagamento
                                  ? formatarData(mensalidade.dataPagamento)
                                  : '-'}
                              </p>
                              {mensalidade.formaPagamento && (
                                <p className="text-xs text-gray-500">
                                  {mensalidade.formaPagamento.toUpperCase()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => router.push(`/pagamento/${mensalidade.id}`)}
                            >
                              Receber
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
