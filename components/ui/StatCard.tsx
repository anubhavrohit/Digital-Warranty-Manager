import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'kiwi' | 'sunshine' | 'tomato' | 'forest' | 'carrot';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'forest',
  subtitle,
}) => {
  const variantStyles = {
    forest: {
      bg: 'bg-forest-light',
      iconBg: 'bg-forest text-white',
      border: 'border-forest/20',
      text: 'text-forest',
    },
    kiwi: {
      bg: 'bg-kiwi-light',
      iconBg: 'bg-kiwi text-white',
      border: 'border-kiwi/30',
      text: 'text-kiwi-dark',
    },
    sunshine: {
      bg: 'bg-sunshine-light',
      iconBg: 'bg-sunshine text-forest',
      border: 'border-sunshine/50',
      text: 'text-forest',
    },
    tomato: {
      bg: 'bg-tomato-light',
      iconBg: 'bg-tomato text-white',
      border: 'border-tomato/30',
      text: 'text-tomato',
    },
    carrot: {
      bg: 'bg-carrot-light',
      iconBg: 'bg-carrot text-white',
      border: 'border-carrot/30',
      text: 'text-carrot',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-warm transition-transform duration-200 hover:-translate-y-0.5 flex items-center justify-between ${style.border}`}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-forest/70">{title}</p>
        <h3 className={`text-2xl lg:text-3xl font-extrabold mt-1 tracking-tight ${style.text}`}>
          {value}
        </h3>
        {subtitle && <p className="text-xs text-forest/60 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
