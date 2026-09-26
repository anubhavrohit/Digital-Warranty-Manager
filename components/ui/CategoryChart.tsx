'use client';

import React from 'react';
import { WarrantyItem } from '@/types';
import { formatCurrency } from '@/lib/warranty-utils';

interface CategoryChartProps {
  warranties: WarrantyItem[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ warranties }) => {
  const categoryTotals: Record<string, { count: number; totalValue: number }> = {};

  let grandTotal = 0;
  warranties.forEach((item) => {
    const cat = item.category || 'Other';
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = { count: 0, totalValue: 0 };
    }
    categoryTotals[cat].count += 1;
    categoryTotals[cat].totalValue += item.purchasePrice || 0;
    grandTotal += item.purchasePrice || 0;
  });

  const categories = Object.keys(categoryTotals).sort(
    (a, b) => categoryTotals[b].totalValue - categoryTotals[a].totalValue
  );

  const colorPalette = [
    { bg: 'bg-forest dark:bg-emerald-500', text: 'text-forest dark:text-emerald-400' },
    { bg: 'bg-kiwi dark:bg-lime-400', text: 'text-kiwi-dark dark:text-lime-300' },
    { bg: 'bg-sunshine dark:bg-amber-400', text: 'text-forest dark:text-amber-300' },
    { bg: 'bg-carrot dark:bg-orange-500', text: 'text-carrot dark:text-orange-400' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cream-dark/60 dark:border-slate-800 p-5 sm:p-6 shadow-warm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-cream-dark/50 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-forest dark:text-slate-100">Category Expense Breakdown</h3>
          <p className="text-xs text-forest/60 dark:text-slate-400 mt-0.5">Distribution of total purchase value across categories</p>
        </div>
        <span className="text-sm font-extrabold text-forest dark:text-slate-100 bg-cream-light dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-cream-dark/50 dark:border-slate-700 self-start sm:self-auto shrink-0">
          {formatCurrency(grandTotal)}
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="py-8 text-center text-xs text-forest/60 dark:text-slate-400">No warranty data available.</div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const data = categoryTotals[cat];
            const percentage = grandTotal > 0 ? Math.round((data.totalValue / grandTotal) * 100) : 0;
            const color = colorPalette[idx % colorPalette.length];

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-forest dark:text-slate-200 flex items-center gap-2 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.bg}`} />
                    <span className="truncate">{cat}</span>
                    <span className="text-forest/60 dark:text-slate-400 font-normal shrink-0">({data.count} {data.count === 1 ? 'item' : 'items'})</span>
                  </span>
                  <span className="text-forest dark:text-slate-100 font-bold shrink-0 ml-2">
                    {formatCurrency(data.totalValue)}{' '}
                    <span className="text-forest/60 dark:text-slate-400 text-[10px] font-normal">({percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-cream-light dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-cream-dark/40 dark:border-slate-700/60">
                  <div
                    className={`h-full rounded-full ${color.bg} transition-all duration-500`}
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
