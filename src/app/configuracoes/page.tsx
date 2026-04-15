'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, FileText, Lock, Palette, Shield, User } from 'lucide-react';
import { ProtectedRoute } from '@/components';

const itens = [
  {
    titulo: 'Relatorios',
    descricao: 'Personalizacao da exportacao PDF e estrutura do relatorio.',
    icone: FileText,
  },
  {
    titulo: 'Notificacoes',
    descricao: 'Automacao de alertas e ajustes de mensagens de cobranca.',
    icone: Bell,
  },
  {
    titulo: 'Perfil do admin',
    descricao: 'Dados da conta administrativa e preferencias de exibicao.',
    icone: User,
  },
  {
    titulo: 'Backup e restauracao',
    descricao: 'Salvamento, importacao e restauracao segura dos dados.',
    icone: Shield,
  },
  {
    titulo: 'Seguranca',
    descricao: 'Senha, PIN de acesso e opcoes de logout.',
    icone: Lock,
  },
  {
    titulo: 'Preferencias',
    descricao: 'Tema, formato de data e moeda.',
    icone: Palette,
  },
];

export default function ConfiguracoesPage() {
  const router = useRouter();

  return (
    <ProtectedRoute tipoRequerido="admin">
      <main className="min-h-screen bg-[#EEF2F1] px-4 pb-8 pt-7">
        <div className="mx-auto w-full max-w-md">
          <header className="mb-5 flex items-center justify-between">
            <h1 className="pageTitle text-gray-900">Configuracoes</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition duration-200 hover:scale-105"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </header>

          <section className="space-y-3">
            {itens.map((item) => {
              const Icone = item.icone;

              return (
                <article
                  key={item.titulo}
                  className="rounded-3xl border border-gray-100 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Icone className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="cardTitle text-gray-900">{item.titulo}</h2>
                      <p className="valueSecondary mt-1 text-gray-600">{item.descricao}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
