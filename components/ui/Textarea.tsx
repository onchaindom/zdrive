'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zdrive-text"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full border bg-zdrive-surface px-3 py-2 text-sm',
            'placeholder:text-zdrive-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-zdrive-text focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[100px] resize-y',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zdrive-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {hint && !error && (
          <p className="text-sm text-zdrive-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
