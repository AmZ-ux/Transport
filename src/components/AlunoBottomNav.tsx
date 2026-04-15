'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogOut, MessageCircle, Receipt } from 'lucide-react';
import { useMemo } from 'react';

interface AlunoBottomNavProps {
  onLogout: () => void;
}

const items = [
  { key: 'inicio', label: 'Inicio', href: '/aluno/dashboard', icon: Home },
  { key: 'mensalidades', label: 'Mensalidades', href: '/aluno/minhas-mensalidades', icon: Receipt },
  { key: 'suporte', label: 'Suporte', href: '/aluno/suporte', icon: MessageCircle },
] as const;

export function AlunoBottomNav({ onLogout }: AlunoBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const whatsappLink = useMemo(() => {
    const mensagem = encodeURIComponent('Ola! Sou aluno e preciso de ajuda com minhas mensalidades.');
    return `https://wa.me/5511999999999?text=${mensagem}`;
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-2 pb-safe pt-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.key === 'suporte') {
            return (
              <li key={item.key}>
                <button
                  onClick={() => {
                    if (pathname !== item.href) {
                      router.push(item.href);
                    } else {
                      window.open(whatsappLink, '_blank');
                    }
                  }}
                  className={`touch-target flex w-full flex-col items-center justify-center rounded-xl px-1 py-2 transition duration-200 ${
                    active ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Icon className={`mb-1 h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="tabLabel">{item.label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`touch-target flex flex-col items-center justify-center rounded-xl px-1 py-2 transition duration-200 ${
                  active ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Icon className={`mb-1 h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="tabLabel">{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <button
            onClick={onLogout}
            className="touch-target flex w-full flex-col items-center justify-center rounded-xl px-1 py-2 text-gray-500 transition duration-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="mb-1 h-5 w-5 text-rose-500" />
            <span className="tabLabel">Sair</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
