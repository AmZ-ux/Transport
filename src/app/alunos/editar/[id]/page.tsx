'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserCog } from 'lucide-react';
import {
  AlunoFormSteps,
  Button,
  Card,
  CardBody,
  CardHeader,
  Layout,
  Loading,
  ProtectedRoute,
} from '@/components';
import { useAlunos } from '@/hooks/useAlunos';
import { getAlunoPorId } from '@/services/storage';
import { Aluno } from '@/types';
import { formatarTelefone } from '@/lib/utils';

export default function EditarAlunoPage() {
  const router = useRouter();
  const params = useParams();
  const alunoId = params.id as string;
  const { atualizar } = useAlunos();

  const [alunoOriginal, setAlunoOriginal] = useState<Aluno | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const aluno = getAlunoPorId(alunoId);
    setAlunoOriginal(aluno);
    setCarregando(false);
  }, [alunoId]);

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
    if (!alunoOriginal) return;

    setSalvando(true);
    setErro('');

    try {
      atualizar({
        ...alunoOriginal,
        nome: values.nome,
        telefone: values.telefone.replace(/\D/g, ''),
        endereco: values.endereco,
        curso: values.curso,
        faculdade: values.faculdade,
        pontoEmbarque: values.pontoEmbarque,
        valorMensalidade: Number(values.valorMensalidade),
        diaVencimento: Number(values.diaVencimento),
        ativo: values.ativo,
      });

      router.push('/alunos');
    } catch {
      setErro('Nao foi possivel atualizar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <ProtectedRoute tipoRequerido="admin">
        <Layout>
          <Loading />
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!alunoOriginal) {
    return (
      <ProtectedRoute tipoRequerido="admin">
        <Layout>
          <Card>
            <CardBody className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">Aluno nao encontrado</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Verifique se o cadastro ainda existe.</p>
              <div className="mt-4">
                <Button onClick={() => router.push('/alunos')}>Voltar</Button>
              </div>
            </CardBody>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

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
                <UserCog className="h-6 w-6 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar aluno</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Atualize o cadastro em 3 etapas.</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {erro && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{erro}</div>}

              <AlunoFormSteps
                showStatusField
                loading={salvando}
                submitLabel="Salvar alteracoes"
                initialValues={{
                  nome: alunoOriginal.nome,
                  telefone: formatarTelefone(alunoOriginal.telefone),
                  endereco: alunoOriginal.endereco || '',
                  curso: alunoOriginal.curso,
                  faculdade: alunoOriginal.faculdade,
                  pontoEmbarque: alunoOriginal.pontoEmbarque,
                  valorMensalidade: String(alunoOriginal.valorMensalidade),
                  diaVencimento: String(alunoOriginal.diaVencimento),
                  ativo: alunoOriginal.ativo,
                }}
                onSubmit={handleSubmit}
              />
            </CardBody>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

