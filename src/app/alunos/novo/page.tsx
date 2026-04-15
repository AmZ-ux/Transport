'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { AlunoFormSteps, Card, CardBody, CardHeader, ProtectedRoute } from '@/components';
import { useAlunos } from '@/hooks/useAlunos';

export default function NovoAlunoPage() {
  const router = useRouter();
  const { criar } = useAlunos();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (values: {
    nome: string;
    telefone: string;
    endereco: string;
    curso: string;
    faculdade: string;
    pontoEmbarque: string;
    valorMensalidade: string;
    diaVencimento: string;
    ativo: boolean;
  }) => {
    setSalvando(true);
    setErro('');

    try {
      criar({
        nome: values.nome,
        usuarioId: '',
        telefone: values.telefone.replace(/\D/g, ''),
        endereco: values.endereco,
        curso: values.curso,
        faculdade: values.faculdade,
        pontoEmbarque: values.pontoEmbarque,
        valorMensalidade: Number(values.valorMensalidade),
        diaVencimento: Number(values.diaVencimento),
        ativo: true,
      });

      router.push('/alunos');
    } catch {
      setErro('Nao foi possivel salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ProtectedRoute tipoRequerido="admin">
      <main className="min-h-screen bg-[#EEF2F1] px-4 pb-8 pt-6">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          <button
            onClick={() => router.push('/alunos')}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-semibold text-emerald-700 shadow-[0_6px_14px_rgba(15,23,42,0.10)] transition duration-200 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary-600" />
                <div>
                  <h1 className="cardTitle text-gray-900">Novo aluno</h1>
                  <p className="pageSubtitle mt-1">Cadastro rapido em 3 etapas.</p>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {erro && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{erro}</div>}

              <AlunoFormSteps onSubmit={handleSubmit} loading={salvando} submitLabel="Salvar aluno" />
            </CardBody>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}
