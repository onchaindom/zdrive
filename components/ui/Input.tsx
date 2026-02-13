'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zd-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full bg-transparent border-0 border-b text-base py-1.5',
            'outline-none placeholder:text-zd-text-muted',
            'focus:border-zd-text transition-colors duration-150',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-b border-red-500'
              : 'border-zd-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {hint && !error && (
          <p className="text-sm text-zd-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
