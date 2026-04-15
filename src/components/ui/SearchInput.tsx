'use client';

import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  placeholder?: string;
}

export function SearchInput({ placeholder = 'Buscar...', className = '', ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className={`block min-h-[44px] w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-base transition-colors duration-200 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:bg-gray-900 dark:border-gray-700 dark:text-white ${className}`}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

