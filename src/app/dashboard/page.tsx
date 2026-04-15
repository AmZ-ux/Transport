'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Bell, Clock3, Settings } from 'lucide-react';
import { ProtectedRoute } from '@/components';
import { AdminBottomNav } from '@/components/admin';
import { getDashboardStats } from '@/services/storage';
import { formatarValor } from '@/lib/utils';

function ProgressCircle({ value, total }: { value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 84 84" className="h-20 w-20 -rotate-90">
        <circle cx="42" cy="42" r={radius} className="fill-none stroke-emerald-100" strokeWidth="8" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          className="fill-none stroke-emerald-500 transition-all duration-300"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
        <span className="text-2xl font-extrabold text-gray-900">{value}</span>
        <span className="text-[11px] font-semibold text-gray-500">de {total}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats] = useState(() => getDashboardStats());

  const nomeMes = useMemo(
    () => new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase(),
    []
  );

  const pagos = stats.totalPagos;
  const pendentes = stats.totalPendentes;
  const atrasados = stats.totalAtrasados;
  const total = pagos + pendentes + atrasados;

  const pagPercent = total ? (pagos / total) * 100 : 0;
  const penPercent = total ? (pendentes / total) * 100 : 0;
  const atrPercent = total ? (atrasados / total) * 100 : 0;

  return (
    <ProtectedRoute tipoRequerido="admin">
      <main className="min-h-screen bg-[#E2E8E5] pb-24">
        <section className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-b from-emerald-700 to-emerald-600 px-4 pb-10 pt-6 sm:px-5 sm:pt-7">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="pageTitle text-white">Painel Admin</h1>
              <button
                onClick={() => router.push('/configuracoes')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/80 text-white shadow-sm transition duration-200 hover:scale-105"
                aria-label="Abrir configuracoes"
                title="Configuracoes"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <article className="rounded-[24px] bg-white p-4 shadow-[0_14px_28px_rgba(16,24,40,0.12)] sm:p-5">
              <div className="mb-4 flex flex-col items-start gap-4 min-[360px]:flex-row min-[360px]:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-[0.22em] text-gray-500">{nomeMes}</p>
                  <p className="valuePrimary mt-1 text-gray-950">{formatarValor(stats.totalRecebido)}</p>
                  <p className="valueSecondary mt-2">de {formatarValor(stats.totalReceberMes)} esperado</p>
                </div>
                <div className="self-end text-center min-[360px]:self-auto">
                  <ProgressCircle value={pagos} total={total} />
                  <p className="mt-1 text-sm font-bold text-gray-700">Pagos</p>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="flex h-full">
                  <span style={{ width: `${pagPercent}%` }} className="h-full bg-emerald-500" />
                  <span style={{ width: `${penPercent}%` }} className="h-full bg-amber-400" />
                  <span style={{ width: `${atrPercent}%` }} className="h-full bg-rose-500" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold">
                <p className="text-emerald-700">● {pagos} Pagos</p>
                <p className="text-amber-700">● {pendentes} Pendentes</p>
                <p className="text-rose-700">● {atrasados} Atrasados</p>
              </div>
            </article>
          </div>
        </section>

        <div className="mx-auto mt-4 w-full max-w-md space-y-4 px-4 sm:space-y-5 sm:px-5">
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Acoes do administrador</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/mensalidades')}
                className="w-full rounded-3xl border border-rose-200 bg-rose-100 px-4 py-4 text-left shadow-[0_6px_14px_rgba(225,29,72,0.10)] transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-200 text-rose-700">
                    <Bell className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="cardTitle text-rose-800">Notificar atrasados</p>
                    <p className="valueSecondary text-rose-700">Enviar cobranca para {atrasados} passageiro(s)</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/mensalidades')}
                className="w-full rounded-3xl border border-amber-200 bg-amber-100 px-4 py-4 text-left shadow-[0_6px_14px_rgba(217,119,6,0.10)] transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-amber-800">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="cardTitle text-amber-800">Lembrar pendentes</p>
                    <p className="valueSecondary text-amber-700">Enviar lembrete para {pendentes} passageiro(s)</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/mensalidades')}
                className="w-full rounded-3xl border border-emerald-200 bg-emerald-100 px-4 py-4 text-left shadow-[0_6px_14px_rgba(5,150,105,0.12)] transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="cardTitle text-emerald-800">Gerar relatorio mensal</p>
                    <p className="valueSecondary text-emerald-700">Resumo de {nomeMes.split(' ')[0]} com todas as rotas</p>
                  </div>
                </div>
              </button>
            </div>
          </section>
        </div>

        <AdminBottomNav />
      </main>
    </ProtectedRoute>
  );
}
