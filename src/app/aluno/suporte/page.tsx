'use client';

import { MessageCircle, LifeBuoy } from 'lucide-react';
import { AlunoLayout, Button, Card, CardBody, ProtectedRoute } from '@/components';

export default function AlunoSuportePage() {
  const whatsappLink = (() => {
    const mensagem = encodeURIComponent('Ola! Sou aluno e preciso de ajuda com minhas mensalidades.');
    return `https://wa.me/5511999999999?text=${mensagem}`;
  })();

  return (
    <ProtectedRoute tipoRequerido="aluno">
      <AlunoLayout>
        <div className="space-y-5">
          <header>
            <h1 className="pageTitle text-gray-900 dark:text-white">Suporte</h1>
            <p className="pageSubtitle text-gray-600 dark:text-gray-400">Fale com a equipe para resolver duvidas de pagamento.</p>
          </header>

          <Card className="border-gray-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
            <CardBody className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="cardTitle text-gray-900">Atendimento via WhatsApp</h2>
                  <p className="valueSecondary mt-1 text-gray-600">Segunda a sexta, das 8h as 18h.</p>
                </div>
              </div>

              <Button className="w-full" onClick={() => window.open(whatsappLink, '_blank')}>
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </Button>
            </CardBody>
          </Card>
        </div>
      </AlunoLayout>
    </ProtectedRoute>
  );
}
