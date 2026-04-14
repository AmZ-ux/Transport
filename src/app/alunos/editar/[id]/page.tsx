'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserCog, ArrowLeft } from 'lucide-react';
import {
  Layout,
  ProtectedRoute,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Loading,
} from '@/components';
import { getAlunoPorId } from '@/services/storage';
import { useAlunos } from '@/hooks/useAlunos';
import { Aluno } from '@/types';
import { validarTelefone, formatarTelefone } from '@/lib/utils';

export default function EditarAlunoPage() {
  const router = useRouter();
  const params = useParams();
  const alunoId = params.id as string;
  const { atualizar } = useAlunos();

  const [alunoOriginal, setAlunoOriginal] = useState<Aluno | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    curso: '',
    faculdade: '',
    pontoEmbarque: '',
    valorMensalidade: '',
    diaVencimento: '5',
    ativo: true,
  });

  useEffect(() => {
    const aluno = getAlunoPorId(alunoId);
    if (aluno) {
      setAlunoOriginal(aluno);
      setForm({
        nome: aluno.nome,
        telefone: formatarTelefone(aluno.telefone),
        endereco: aluno.endereco || '',
        curso: aluno.curso,
        faculdade: aluno.faculdade,
        pontoEmbarque: aluno.pontoEmbarque,
        valorMensalidade: String(aluno.valorMensalidade),
        diaVencimento: String(aluno.diaVencimento),
        ativo: aluno.ativo,
      });
    }
    setCarregando(false);
  }, [alunoId]);

  const validar = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!form.nome.trim()) {
      novosErros.nome = 'Nome e obrigatorio';
    }

    if (!form.telefone.trim()) {
      novosErros.telefone = 'Telefone e obrigatorio';
    } else if (!validarTelefone(form.telefone)) {
      novosErros.telefone = 'Telefone invalido';
    }

    if (!form.curso.trim()) {
      novosErros.curso = 'Curso e obrigatorio';
    }

    if (!form.faculdade.trim()) {
      novosErros.faculdade = 'Faculdade e obrigatoria';
    }

    if (!form.pontoEmbarque.trim()) {
      novosErros.pontoEmbarque = 'Ponto de embarque e obrigatorio';
    }

    if (!form.valorMensalidade || Number(form.valorMensalidade) <= 0) {
      novosErros.valorMensalidade = 'Valor invalido';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar() || !alunoOriginal) return;

    setSalvando(true);
    try {
      atualizar({
        ...alunoOriginal,
        nome: form.nome,
        telefone: form.telefone.replace(/\D/g, ''),
        endereco: form.endereco,
        curso: form.curso,
        faculdade: form.faculdade,
        pontoEmbarque: form.pontoEmbarque,
        valorMensalidade: Number(form.valorMensalidade),
        diaVencimento: Number(form.diaVencimento),
        ativo: form.ativo,
      });

      router.push('/alunos');
    } catch {
      setErros({ geral: 'Erro ao salvar aluno. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  };

  const formatarInputTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numeros.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'telefone' ? formatarInputTelefone(value) : value,
    }));
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
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

  if (!alunoOriginal) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center py-12">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aluno nao encontrado</h1>
            <p className="text-gray-500 mb-4">O aluno que voce esta tentando editar nao existe.</p>
            <Button onClick={() => router.push('/alunos')}>Voltar para Alunos</Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute tipoRequerido="admin">
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/alunos')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCog className="h-6 w-6 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Editar Aluno
                  </h1>
                  <p className="text-sm text-gray-500">
                    Atualize os dados do aluno {alunoOriginal.nome}.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {erros.geral && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {erros.geral}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome Completo"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      error={erros.nome}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Telefone (WhatsApp)"
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      error={erros.telefone}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Endereco (opcional)"
                      name="endereco"
                      value={form.endereco}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Input
                      label="Curso"
                      name="curso"
                      value={form.curso}
                      onChange={handleChange}
                      error={erros.curso}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Faculdade"
                      name="faculdade"
                      value={form.faculdade}
                      onChange={handleChange}
                      error={erros.faculdade}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Ponto de Embarque"
                      name="pontoEmbarque"
                      value={form.pontoEmbarque}
                      onChange={handleChange}
                      error={erros.pontoEmbarque}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Valor da Mensalidade"
                      name="valorMensalidade"
                      type="number"
                      value={form.valorMensalidade}
                      onChange={handleChange}
                      error={erros.valorMensalidade}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Select
                      label="Dia de Vencimento"
                      name="diaVencimento"
                      value={form.diaVencimento}
                      onChange={handleChange}
                      required
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(dia => (
                        <option key={dia} value={dia}>Dia {dia}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Select
                      label="Status"
                      name="ativo"
                      value={String(form.ativo)}
                      onChange={(e) => setForm(prev => ({ ...prev, ativo: e.target.value === 'true' }))}
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/alunos')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={salvando}
                    className="flex-1"
                  >
                    Salvar Alteracoes
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
