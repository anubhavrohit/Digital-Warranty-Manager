'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '@/lib/theme-context';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export const ThemeToggle: React.FC<{ showLabel?: boolean; className?: string }> = ({
  showLabel = false,
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 rounded-xl text-forest hover:bg-cream-dark/50 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 border border-cream-dark/50 dark:border-slate-700/60"
        title={`Current Theme: ${theme.toUpperCase()} (${resolvedTheme} active)`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-sunshine" />
        ) : (
          <Sun className="w-4 h-4 text-carrot" />
        )}

        {showLabel && (
          <span className="text-xs font-bold text-forest dark:text-slate-200 capitalize">
            {theme}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-cream-dark/70 dark:border-slate-800 rounded-2xl shadow-warm dark:shadow-2xl z-50 py-1.5 animate-fade-in">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-forest/50 dark:text-slate-400 border-b border-cream-dark/40 dark:border-slate-800/80 mb-1">
            Choose Theme
          </div>

          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.mode;

            return (
              <button
                key={opt.mode}
                onClick={() => {
                  setTheme(opt.mode);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-forest/10 text-forest dark:bg-slate-800 dark:text-sunshine'
                    : 'text-forest/80 hover:bg-cream-light dark:text-slate-300 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-forest dark:text-sunshine" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
