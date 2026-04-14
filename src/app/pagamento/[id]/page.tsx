'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  CreditCard,
} from 'lucide-react';
import {
  Layout,
  ProtectedRoute,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Badge,
  Loading,
} from '@/components';
import { getMensalidadePorId, registrarPagamento } from '@/services/storage';
import { Mensalidade } from '@/types';
import { formatarValor, formatarData, calcularStatus } from '@/lib/utils';

const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao', label: 'Cartao' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
];

export default function PagamentoPage() {
  const router = useRouter();
  const params = useParams();
  const mensalidadeId = params.id as string;

  const [mensalidade, setMensalidade] = useState<Mensalidade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    dataPagamento: new Date().toISOString().split('T')[0],
    formaPagamento: 'pix',
    observacoes: '',
  });

  useEffect(() => {
    const m = getMensalidadePorId(mensalidadeId);
    if (m) {
      // Recalcular status em tempo real
      const status = calcularStatus(m);
      setMensalidade({ ...m, status });
    }
    setCarregando(false);
  }, [mensalidadeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      const result = registrarPagamento(
        mensalidadeId,
        form.formaPagamento,
        form.dataPagamento,
        form.observacoes
      );

      if (result) {
        router.push('/mensalidades');
      } else {
        setErro('Erro ao registrar pagamento. Verifique se a mensalidade existe.');
      }
    } catch (err) {
      setErro('Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <ProtectedRoute>
        <Layout>
          <Loading />
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!mensalidade) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-lg mx-auto text-center py-12">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mensalidade nao encontrada</h1>
            <p className="text-gray-500 mb-4">A mensalidade que voce esta tentando pagar nao existe.</p>
            <Button onClick={() => router.push('/mensalidades')}>Voltar para Mensalidades</Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (mensalidade.status === 'pago') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pagamento ja registrado!</h1>
            <p className="text-gray-500 mb-2">Esta mensalidade ja foi paga.</p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pago em: <strong>{formatarData(mensalidade.dataPagamento || '')}</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Forma: <strong>{mensalidade.formaPagamento?.toUpperCase()}</strong>
              </p>
            </div>
            <Button onClick={() => router.push('/mensalidades')}>Voltar para Mensalidades</Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute tipoRequerido="admin">
      <Layout>
        <div className="max-w-xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/mensalidades')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Registrar Pagamento
                  </h1>
                  <p className="text-sm text-gray-500">
                    Preencha os dados do pagamento recebido.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {/* Resumo da Mensalidade */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Resumo</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {mensalidade.aluno?.nome}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Vencimento: {formatarData(mensalidade.dataVencimento)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatarValor(mensalidade.valor)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status atual:</span>
                    <Badge status={mensalidade.status} size="sm" />
                  </div>
                </div>
              </div>

              {erro && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {erro}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Data do Pagamento"
                      name="dataPagamento"
                      type="date"
                      value={form.dataPagamento}
                      onChange={(e) => setForm(prev => ({ ...prev, dataPagamento: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Select
                      label="Forma de Pagamento"
                      name="formaPagamento"
                      value={form.formaPagamento}
                      onChange={(e) => setForm(prev => ({ ...prev, formaPagamento: e.target.value }))}
                      required
                    >
                      {FORMAS_PAGAMENTO.map((fp) => (
                        <option key={fp.value} value={fp.value}>{fp.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <Input
                    label="Observacoes (opcional)"
                    name="observacoes"
                    value={form.observacoes}
                    onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Ex: Pagamento adiantado, desconto aplicado, etc."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/mensalidades')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="success"
                    loading={salvando}
                    className="flex-1"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Confirmar Pagamento
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
