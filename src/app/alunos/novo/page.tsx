'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { AlunoFormSteps, Button, Card, CardBody, CardHeader, Layout, ProtectedRoute } from '@/components';
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
      <Layout>
        <div className="mx-auto max-w-2xl space-y-4">
          <Button variant="ghost" onClick={() => router.push('/alunos')}>
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Novo aluno</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cadastro rapido em 3 etapas.</p>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {erro && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{erro}</div>}

              <AlunoFormSteps onSubmit={handleSubmit} loading={salvando} submitLabel="Salvar aluno" />
            </CardBody>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

