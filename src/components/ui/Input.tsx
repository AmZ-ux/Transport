'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, className = '', ...props }, ref) => {
  const baseStyles =
    'block min-h-[44px] w-full rounded-xl border border-gray-300 px-3 text-base shadow-sm transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:bg-gray-900 dark:border-gray-700 dark:text-white';
  const errorStyles = error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : '';

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {props.required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      <input ref={ref} className={`${baseStyles} ${errorStyles} ${className}`} {...props} />
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

