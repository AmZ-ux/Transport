'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Receipt } from 'lucide-react';

const items = [
  { key: 'inicio', label: 'Inicio', href: '/dashboard', icon: Home },
  { key: 'passageiros', label: 'Passageiros', href: '/alunos', icon: Users },
  { key: 'pagamentos', label: 'Pagamentos', href: '/mensalidades', icon: Receipt },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-safe pt-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-3 gap-1">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs font-semibold transition duration-200 ${
                  active ? 'text-emerald-700' : 'text-gray-400'
                }`}
              >
                <Icon className={`mb-1 h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="tabLabel">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
