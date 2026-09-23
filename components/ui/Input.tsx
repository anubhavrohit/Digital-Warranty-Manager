import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-forest/90 mb-1.5"
          >
            {label}
            {props.required && <span className="text-tomato ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2.5 bg-cream-light/60 border rounded-xl text-forest placeholder-forest/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all duration-150 ${
            error
              ? 'border-tomato text-tomato focus:ring-tomato'
              : 'border-cream-dark/80 hover:border-forest/40'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs font-semibold text-tomato animate-fade-in">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-forest/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
