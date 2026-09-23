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
    { bg: 'bg-forest', text: 'text-forest', bar: '#18542A' },
    { bg: 'bg-kiwi', text: 'text-kiwi-dark', bar: '#9ABC05' },
    { bg: 'bg-sunshine', text: 'text-forest', bar: '#FFC926' },
    { bg: 'bg-carrot', text: 'text-carrot', bar: '#F96015' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-cream-dark/60 p-5 shadow-warm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-forest">Category Expense Breakdown</h3>
          <p className="text-xs text-forest/60">Distribution of total purchase value across categories</p>
        </div>
        <span className="text-sm font-extrabold text-forest bg-cream-light px-3 py-1 rounded-xl border border-cream-dark/50">
          {formatCurrency(grandTotal)}
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="py-8 text-center text-xs text-forest/60">No warranty data available.</div>
      ) : (
        <div className="space-y-3.5">
          {categories.map((cat, idx) => {
            const data = categoryTotals[cat];
            const percentage = grandTotal > 0 ? Math.round((data.totalValue / grandTotal) * 100) : 0;
            const color = colorPalette[idx % colorPalette.length];

            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-forest flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                    {cat} <span className="text-forest/60 font-normal">({data.count} items)</span>
                  </span>
                  <span className="text-forest font-bold">
                    {formatCurrency(data.totalValue)}{' '}
                    <span className="text-forest/60 text-[10px] font-normal">({percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-cream-light h-2.5 rounded-full overflow-hidden border border-cream-dark/40">
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
