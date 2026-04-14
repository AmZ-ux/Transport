'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  GraduationCap,
  Edit,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import {
  Layout,
  ProtectedRoute,
  Card,
  CardHeader,
  CardBody,
  Button,
  SearchInput,
  EmptyState,
  ConfirmDialog,
} from '@/components';
import { useAlunos } from '@/hooks/useAlunos';
import { Aluno } from '@/types';
import { formatarValor, formatarTelefone } from '@/lib/utils';

export default function AlunosPage() {
  const router = useRouter();
  const { alunos, carregando, buscar, excluir } = useAlunos();
  const [busca, setBusca] = useState('');
  const [alunoExcluir, setAlunoExcluir] = useState<Aluno | null>(null);

  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusca(valor);
    buscar(valor);
  };

  const confirmarExclusao = async () => {
    if (alunoExcluir) {
      excluir(alunoExcluir.id);
      setAlunoExcluir(null);
    }
  };

  return (
    <ProtectedRoute tipoRequerido="admin">
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alunos</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {alunos.length} aluno{alunos.length > 1 ? 's' : ''} cadastrado{alunos.length > 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/alunos/novo')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <SearchInput
              placeholder="Buscar por nome, telefone, curso..."
              value={busca}
              onChange={handleBusca}
            />
          </div>

          {/* Grid de Alunos */}
          {alunos.length === 0 ? (
            <EmptyState
              title="Nenhum aluno encontrado"
              description="Comece cadastrando seu primeiro aluno para gerenciar as mensalidades."
              icon={<Users className="h-12 w-12 text-gray-400" />}
              action={{
                label: 'Cadastrar Aluno',
                onClick: () => router.push('/alunos/novo'),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alunos.map((aluno) => (
                <Card key={aluno.id} hover className="group">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {aluno.nome}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <GraduationCap className="h-4 w-4" />
                          {aluno.curso} - {aluno.faculdade}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/alunos/editar/${aluno.id}`)}
                          className="p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAlunoExcluir(aluno)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a
                          href={`https://wa.me/55${aluno.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {formatarTelefone(aluno.telefone)}
                        </a>
                      </div>

                      {aluno.endereco && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{aluno.endereco}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>Ponto: {aluno.pontoEmbarque}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Mensalidade</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatarValor(aluno.valorMensalidade)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Vencimento</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Dia {aluno.diaVencimento}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dialog de confirmacao */}
        <ConfirmDialog
          isOpen={!!alunoExcluir}
          onClose={() => setAlunoExcluir(null)}
          onConfirm={confirmarExclusao}
          title="Confirmar exclusao"
          message={`Deseja realmente excluir o aluno "${alunoExcluir?.nome}"? O aluno sera marcado como inativo.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
        />
      </Layout>
    </ProtectedRoute>
  );
}
