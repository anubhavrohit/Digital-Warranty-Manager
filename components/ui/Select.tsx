import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-forest/90 mb-1.5"
          >
            {label}
            {props.required && <span className="text-tomato ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-3.5 py-2.5 bg-cream-light/60 border rounded-xl text-forest text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all duration-150 ${
            error
              ? 'border-tomato text-tomato focus:ring-tomato'
              : 'border-cream-dark/80 hover:border-forest/40'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs font-semibold text-tomato animate-fade-in">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
