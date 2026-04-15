'use client';

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, helperText, children, className = '', ...props }, ref) => {
  const baseStyles =
    'block min-h-[44px] w-full rounded-xl border border-gray-300 bg-white px-3 text-base shadow-sm transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:bg-gray-900 dark:border-gray-700 dark:text-white';
  const errorStyles = error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : '';

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {props.required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select ref={ref} className={`${baseStyles} ${errorStyles} appearance-none ${className}`} {...props}>
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

