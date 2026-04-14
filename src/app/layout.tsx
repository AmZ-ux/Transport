import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Transporte Universitario - Gestao de Mensalidades',
  description: 'Sistema completo para gerenciamento de mensalidades de transporte universitario',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
