'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft } from 'lucide-react';
import {
  Layout,
  ProtectedRoute,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
} from '@/components';
import { useAlunos } from '@/hooks/useAlunos';
import { validarTelefone } from '@/lib/utils';

export default function NovoAlunoPage() {
  const router = useRouter();
  const { criar } = useAlunos();
  const [carregando, setCarregando] = useState(false);
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
  });

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

    if (!validar()) return;

    setCarregando(true);
    try {
      criar({
        nome: form.nome,
        telefone: form.telefone.replace(/\D/g, ''),
        endereco: form.endereco,
        curso: form.curso,
        faculdade: form.faculdade,
        pontoEmbarque: form.pontoEmbarque,
        valorMensalidade: Number(form.valorMensalidade),
        diaVencimento: Number(form.diaVencimento),
        ativo: true,
      });

      router.push('/alunos');
    } catch {
      setErros({ geral: 'Erro ao salvar aluno. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const formatarTelefone = (valor: string) => {
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
      [name]: name === 'telefone' ? formatarTelefone(value) : value,
    }));
    // Limpar erro quando o campo e alterado
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

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
                <UserPlus className="h-6 w-6 text-primary-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Novo Aluno
                  </h1>
                  <p className="text-sm text-gray-500">
                    Preencha os dados do aluno para cadastra-lo no sistema.
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
                      placeholder="Nome do aluno"
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
                      placeholder="(XX) XXXXX-XXXX"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Endereco (opcional)"
                      name="endereco"
                      value={form.endereco}
                      onChange={handleChange}
                      placeholder="Rua, numero, bairro"
                    />
                  </div>

                  <div>
                    <Input
                      label="Curso"
                      name="curso"
                      value={form.curso}
                      onChange={handleChange}
                      error={erros.curso}
                      placeholder="Ex: Medicina"
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
                      placeholder="Ex: UFBA"
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
                      placeholder="Ex: Ponto do Shopping"
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
                      placeholder="0,00"
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
                    loading={carregando}
                    className="flex-1"
                  >
                    Salvar Aluno
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
