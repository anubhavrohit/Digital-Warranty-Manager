import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'kiwi' | 'tomato' | 'sunshine' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]';

  const variantStyles = {
    // Primary CTA -> Crisp Carrot (#F96015)
    primary:
      'bg-carrot text-white hover:bg-carrot-hover focus:ring-carrot shadow-carrot/20',
    // Secondary -> Forest Green (#18542A)
    secondary:
      'bg-forest text-white hover:bg-forest-hover focus:ring-forest shadow-forest/20',
    // Active/Success -> Kiwi (#9ABC05)
    kiwi:
      'bg-kiwi text-white hover:bg-kiwi-hover focus:ring-kiwi shadow-kiwi/20',
    // Destructive -> Tomato Burst (#D52518)
    tomato:
      'bg-tomato text-white hover:bg-tomato-hover focus:ring-tomato shadow-tomato/20',
    // Highlight -> Sunshine (#FFC926)
    sunshine:
      'bg-sunshine text-forest hover:bg-sunshine-hover focus:ring-sunshine font-bold shadow-sunshine/20',
    // Outline
    outline:
      'border-2 border-forest text-forest bg-transparent hover:bg-forest/5 focus:ring-forest',
    // Ghost
    ghost:
      'text-forest bg-transparent hover:bg-cream-dark/40 focus:ring-forest shadow-none',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
