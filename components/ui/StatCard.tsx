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
      border: 'border-forest/20 dark:border-slate-800',
      text: 'text-forest dark:text-slate-100',
      iconBg: 'bg-forest text-white dark:bg-emerald-600',
    },
    kiwi: {
      border: 'border-kiwi/30 dark:border-emerald-800/40',
      text: 'text-kiwi-dark dark:text-emerald-400',
      iconBg: 'bg-kiwi text-white dark:bg-emerald-500',
    },
    sunshine: {
      border: 'border-sunshine/50 dark:border-amber-800/40',
      text: 'text-forest dark:text-amber-300',
      iconBg: 'bg-sunshine text-forest dark:bg-amber-400 dark:text-slate-950',
    },
    tomato: {
      border: 'border-tomato/30 dark:border-rose-800/40',
      text: 'text-tomato dark:text-rose-400',
      iconBg: 'bg-tomato text-white dark:bg-rose-500',
    },
    carrot: {
      border: 'border-carrot/30 dark:border-orange-800/40',
      text: 'text-carrot dark:text-orange-400',
      iconBg: 'bg-carrot text-white dark:bg-orange-500',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-warm transition-transform duration-200 hover:-translate-y-0.5 flex items-center justify-between ${style.border}`}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-forest/70 dark:text-slate-400 truncate">
          {title}
        </p>
        <h3 className={`text-xl lg:text-2xl font-extrabold mt-1 tracking-tight truncate ${style.text}`}>
          {value}
        </h3>
        {subtitle && <p className="text-xs text-forest/60 dark:text-slate-400 mt-1 truncate">{subtitle}</p>}
      </div>
      <div className={`w-11 h-11 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
