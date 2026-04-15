'use client';

import { useMemo, useState } from 'react';
import { Check, CheckCircle2, Download, TrendingUp } from 'lucide-react';
import { ProtectedRoute } from '@/components';
import { AdminAvatar, AdminBottomNav, AdminStatusPill } from '@/components/admin';
import { useMensalidades } from '@/hooks/useMensalidades';
import { FiltrosMensalidade } from '@/types';
import { formatarData, formatarValor, nomeMes } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function gerarMesesBase() {
  const hoje = new Date();
  const resultado: Array<{ mes: number; ano: number; label: string }> = [];

  for (let i = -3; i <= 4; i += 1) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    resultado.push({ mes, ano, label: nomeMes(mes).slice(0, 3) });
  }

  return resultado;
}

export default function MensalidadesPage() {
  const meses = useMemo(() => gerarMesesBase(), []);
  const atual = useMemo(() => {
    const now = new Date();
    return { mes: now.getMonth() + 1, ano: now.getFullYear() };
  }, []);

  const [selecionado, setSelecionado] = useState(atual);
  const [feedback, setFeedback] = useState('');

  const filtros = useMemo<FiltrosMensalidade>(
    () => ({ mes: selecionado.mes, ano: selecionado.ano }),
    [selecionado]
  );

  const { mensalidades, carregando, registrarPagamento } = useMensalidades(filtros);

  const resumo = useMemo(() => {
    const totalPago = mensalidades.filter((m) => m.status === 'pago').reduce((acc, cur) => acc + cur.valor, 0);
    const pagos = mensalidades.filter((m) => m.status === 'pago').length;
    const pendentes = mensalidades.filter((m) => m.status === 'pendente').length;
    const atrasados = mensalidades.filter((m) => m.status === 'atrasado').length;
    return { totalPago, pagos, pendentes, atrasados, total: mensalidades.length };
  }, [mensalidades]);

  const nomeCabecalho = `${nomeMes(selecionado.mes)} ${selecionado.ano}`;

  const marcarPago = (id: string) => {
    registrarPagamento(id, 'pix');
    setFeedback('Pagamento marcado com sucesso.');
    window.setTimeout(() => setFeedback(''), 1800);
  };

  const exportarPdf = () => {
    const doc = new jsPDF();
    const tituloMes = `${nomeMes(selecionado.mes)} ${selecionado.ano}`;

    doc.setFontSize(16);
    doc.text('Relatorio Mensal de Pagamentos', 14, 16);
    doc.setFontSize(11);
    doc.text(`Mes/Ano: ${tituloMes}`, 14, 24);
    doc.text(`Valor recebido: ${formatarValor(resumo.totalPago)}`, 14, 30);
    doc.text(`Total de passageiros: ${resumo.total}`, 14, 36);
    doc.text(`Pagos: ${resumo.pagos} | Pendentes: ${resumo.pendentes} | Atrasados: ${resumo.atrasados}`, 14, 42);

    autoTable(doc, {
      startY: 48,
      head: [['Nome', 'Valor', 'Vencimento', 'Status', 'Data pagamento']],
      body: mensalidades.map((item) => [
        item.aluno?.nome || 'Aluno',
        formatarValor(item.valor),
        formatarData(item.dataVencimento),
        item.status,
        item.dataPagamento ? formatarData(item.dataPagamento) : '-',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [5, 150, 105] },
    });

    doc.save(`relatorio-${selecionado.ano}-${String(selecionado.mes).padStart(2, '0')}.pdf`);
  };

  return (
    <ProtectedRoute tipoRequerido="admin">
      <main className="min-h-screen bg-[#E8EEEC] pb-24">
        <div className="mx-auto w-full max-w-md px-4 pb-4 pt-7">
          <header className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="pageTitle text-gray-900">Pagamentos</h1>
              <p className="pageSubtitle mt-1">{nomeCabecalho}</p>
            </div>
            <button
              onClick={exportarPdf}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm transition duration-200 hover:scale-105 hover:bg-emerald-100"
              aria-label="Exportar PDF"
              title="Exportar PDF"
            >
              <Download className="h-4 w-4" />
            </button>
          </header>

          <div className="no-scrollbar mb-4 grid auto-cols-[74px] grid-flow-col gap-2 overflow-x-auto pb-1 pr-1">
            {meses.map((item) => {
              const active = item.mes === selecionado.mes && item.ano === selecionado.ano;

              return (
                <button
                  key={`${item.mes}-${item.ano}`}
                  onClick={() => setSelecionado({ mes: item.mes, ano: item.ano })}
                  className={`h-[58px] rounded-3xl px-2 text-center transition ${
                    active
                      ? 'bg-emerald-600 text-white shadow-[0_8px_16px_rgba(5,150,105,0.28)]'
                      : 'bg-white text-gray-600 shadow-sm'
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase leading-none ${active ? 'text-emerald-100' : 'text-gray-400'}`}>{item.ano}</p>
                  <p className="chipLabel mt-1 whitespace-nowrap text-base leading-none">{item.label}</p>
                </button>
              );
            })}
          </div>

          <article className="mb-4 rounded-[22px] border border-gray-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Recebido</p>
                  <p className="valuePrimary text-gray-900">{formatarValor(resumo.totalPago)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500">Pagos</p>
                <p className="text-4xl font-black text-emerald-700">
                  {resumo.pagos}
                  <span className="text-xl text-gray-400">/{resumo.total}</span>
                </p>
              </div>
            </div>
          </article>

          {feedback && <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{feedback}</p>}

          <section className="space-y-3">
            {carregando && <p className="py-6 text-center text-sm font-semibold text-gray-500">Carregando pagamentos...</p>}

            {!carregando &&
              mensalidades.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[22px] border border-gray-100 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.09)] transition duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={item.aluno?.nome || 'Aluno'} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-2xl font-extrabold text-gray-900">{item.aluno?.nome || 'Aluno'}</p>
                      <p className="text-sm font-semibold text-gray-500">
                        {formatarValor(item.valor)} <span className="mx-2 text-gray-300">•</span> Dia {new Date(item.dataVencimento).getDate()}
                      </p>
                      {item.status === 'pago' && item.dataPagamento && (
                        <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> {formatarData(item.dataPagamento)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <AdminStatusPill status={item.status} compact />
                      {item.status !== 'pago' && (
                        <button
                          onClick={() => marcarPago(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_16px_rgba(5,150,105,0.35)] transition duration-200 hover:scale-105"
                          aria-label="Marcar como pago"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}

            {!carregando && !mensalidades.length && (
              <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-gray-500">Nenhum pagamento para este mes.</div>
            )}
          </section>
        </div>

        <AdminBottomNav />
      </main>
    </ProtectedRoute>
  );
}
