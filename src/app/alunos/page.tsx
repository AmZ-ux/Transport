'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { ProtectedRoute } from '@/components';
import { AdminAvatar, AdminBottomNav, AdminStatusPill } from '@/components/admin';
import { useAlunos } from '@/hooks/useAlunos';
import { getMensalidades } from '@/services/storage';
import { StatusMensalidade } from '@/types';
import { formatarTelefone, formatarValor } from '@/lib/utils';

const STATUS_CHIPS: Array<{ value: '' | StatusMensalidade; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'pago', label: 'Pagos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'atrasado', label: 'Atrasados' },
];

export default function AlunosPage() {
  const router = useRouter();
  const { alunos, carregando } = useAlunos();
  const [busca, setBusca] = useState('');
  const [instFiltro, setInstFiltro] = useState('Todas');
  const [statusFiltro, setStatusFiltro] = useState<'' | StatusMensalidade>('');

  const mensalidadesMes = useMemo(() => {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();
    return getMensalidades().filter((m) => m.mesReferencia === mes && m.anoReferencia === ano);
  }, [alunos.length]);

  const alunosComStatus = useMemo(() => {
    return alunos.map((aluno) => {
      const mensalidade = mensalidadesMes.find((m) => m.alunoId === aluno.id);
      return {
        ...aluno,
        status: mensalidade?.status ?? 'pendente',
      };
    });
  }, [alunos, mensalidadesMes]);

  const instituicoes = useMemo(() => {
    const set = new Set(alunosComStatus.map((a) => a.faculdade.toUpperCase()));
    return ['Todas', ...Array.from(set)];
  }, [alunosComStatus]);

  const lista = useMemo(() => {
    return alunosComStatus.filter((aluno) => {
      const matchBusca =
        !busca ||
        aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.telefone.includes(busca.replace(/\D/g, ''));

      const matchInst = instFiltro === 'Todas' || aluno.faculdade.toUpperCase() === instFiltro;
      const matchStatus = !statusFiltro || aluno.status === statusFiltro;

      return matchBusca && matchInst && matchStatus;
    });
  }, [alunosComStatus, busca, instFiltro, statusFiltro]);

  const countByStatus = useMemo(
    () => ({
      pago: alunosComStatus.filter((a) => a.status === 'pago').length,
      pendente: alunosComStatus.filter((a) => a.status === 'pendente').length,
      atrasado: alunosComStatus.filter((a) => a.status === 'atrasado').length,
    }),
    [alunosComStatus]
  );

  return (
    <ProtectedRoute tipoRequerido="admin">
      <main className="min-h-screen bg-[#E8EEEC] pb-24">
        <div className="mx-auto w-full max-w-md px-4 pb-4 pt-7">
          <header className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="pageTitle text-gray-900">Passageiros</h1>
              <p className="pageSubtitle mt-1">{alunosComStatus.length} cadastrados</p>
            </div>
            <button
              onClick={() => router.push('/alunos/novo')}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_20px_rgba(5,150,105,0.35)] transition duration-200 hover:scale-105"
            >
              <Plus className="h-6 w-6" />
            </button>
          </header>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar passageiro..."
              className="h-12 w-full rounded-2xl border border-transparent bg-[#F4F6F5] pl-12 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-emerald-300 focus:outline-none"
            />
          </div>

          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {instituicoes.map((inst) => {
              const active = inst === instFiltro;
              const count = inst === 'Todas' ? alunosComStatus.length : alunosComStatus.filter((a) => a.faculdade.toUpperCase() === inst).length;

              return (
                <button
                  key={inst}
                  onClick={() => setInstFiltro(inst)}
                  className={`chipLabel whitespace-nowrap rounded-full px-3 py-2 transition ${
                    active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600'
                  }`}
                >
                  {inst} <span className={`${active ? 'text-emerald-100' : 'text-gray-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {STATUS_CHIPS.map((chip) => {
              const active = chip.value === statusFiltro;
              const count = !chip.value ? alunosComStatus.length : countByStatus[chip.value];

              return (
                <button
                  key={chip.label}
                  onClick={() => setStatusFiltro(chip.value)}
                  className={`chipLabel whitespace-nowrap rounded-full px-3 py-2 transition ${
                    active ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  {chip.label} <span className={`${active ? 'text-gray-200' : 'text-gray-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <section className="space-y-3">
            {carregando && <p className="py-6 text-center text-sm font-semibold text-gray-500">Carregando passageiros...</p>}

            {!carregando &&
              lista.map((aluno) => (
                <article
                  key={aluno.id}
                  className="rounded-[22px] border border-gray-100 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.09)] transition duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={aluno.nome} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-extrabold text-gray-900">{aluno.nome}</p>
                      <p className="text-sm font-medium text-gray-500">{formatarTelefone(aluno.telefone)}</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">• {aluno.faculdade.toUpperCase()}</p>
                      <p className="valueSecondary text-emerald-700">{formatarValor(aluno.valorMensalidade)}/mes</p>
                    </div>

                    <div className="self-start pt-1">
                      <AdminStatusPill status={aluno.status} compact />
                    </div>
                  </div>
                </article>
              ))}

            {!carregando && !lista.length && (
              <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-gray-500">Nenhum passageiro encontrado.</div>
            )}
          </section>
        </div>

        <AdminBottomNav />
      </main>
    </ProtectedRoute>
  );
}
