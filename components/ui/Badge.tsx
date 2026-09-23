import React from 'react';
import { WarrantyStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'kiwi' | 'sunshine' | 'tomato' | 'forest' | 'carrot' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    kiwi: 'bg-kiwi-light text-kiwi-dark border-kiwi/30',
    sunshine: 'bg-sunshine-light text-forest font-bold border-sunshine/50',
    tomato: 'bg-tomato-light text-tomato border-tomato/30',
    forest: 'bg-forest-light text-forest border-forest/30',
    carrot: 'bg-carrot-light text-carrot border-carrot/30',
    neutral: 'bg-cream-light text-forest/80 border-cream-dark/60',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: WarrantyStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="kiwi" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-kiwi shrink-0 animate-pulse" />
          ACTIVE
        </Badge>
      );
    case 'EXPIRING_SOON':
      return (
        <Badge variant="sunshine" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-forest shrink-0" />
          EXPIRING SOON
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="tomato" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-tomato shrink-0" />
          EXPIRED
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};
