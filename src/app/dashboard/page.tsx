'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Bus, BarChart3, Clock3, Settings } from 'lucide-react';
import { ProtectedRoute } from '@/components';
import { AdminBottomNav } from '@/components/admin';
import { getDashboardStats } from '@/services/storage';
import { formatarValor } from '@/lib/utils';

function saudacaoPorHora() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

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
      <main className="min-h-screen bg-[#EEF2F1] pb-24">
        <section className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-b from-emerald-700 to-emerald-600 px-4 pb-14 pt-7">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/70 text-white">
                  <Bus className="h-5 w-5" />
                </span>
                <div>
                  <p className="pageSubtitle text-emerald-100">{saudacaoPorHora()} 👋</p>
                  <h1 className="pageTitle text-white">Painel Admin</h1>
                </div>
              </div>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/70 text-white transition duration-200 hover:scale-105">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <article className="rounded-[24px] bg-white p-5 shadow-[0_14px_28px_rgba(16,24,40,0.12)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.22em] text-gray-500">{nomeMes}</p>
                  <p className="valuePrimary mt-1 text-gray-950">{formatarValor(stats.totalRecebido)}</p>
                  <p className="valueSecondary mt-2">de {formatarValor(stats.totalReceberMes)} esperado</p>
                </div>
                <div className="text-center">
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

        <div className="mx-auto -mt-9 w-full max-w-md space-y-5 px-4">
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Acoes do administrador</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/mensalidades')}
                className="w-full rounded-3xl bg-rose-50 px-4 py-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Bell className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-rose-700">Notificar atrasados</p>
                    <p className="text-sm font-medium text-rose-500">Enviar cobranca para {atrasados} passageiro(s)</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/mensalidades')}
                className="w-full rounded-3xl bg-amber-50 px-4 py-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-amber-700">Lembrar pendentes</p>
                    <p className="text-sm font-medium text-amber-500">Enviar lembrete para {pendentes} passageiro(s)</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/mensalidades')}
                className="w-full rounded-3xl bg-emerald-50 px-4 py-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-emerald-700">Gerar relatorio mensal</p>
                    <p className="text-sm font-medium text-emerald-500">Resumo de {nomeMes.split(' ')[0]} com todas as rotas</p>
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
