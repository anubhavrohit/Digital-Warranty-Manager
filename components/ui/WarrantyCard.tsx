import React from 'react';
import Link from 'next/link';
import { WarrantyItem } from '@/types';
import { getWarrantyStatus, getRemainingDays, formatCurrency, formatDate } from '@/lib/warranty-utils';
import { StatusBadge } from './Badge';
import { Calendar, Tag, Eye, Edit3, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface WarrantyCardProps {
  warranty: WarrantyItem;
  onDelete?: (id: string) => void;
}

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ warranty, onDelete }) => {
  const status = getWarrantyStatus(warranty.warrantyEndDate);
  const remainingText = getRemainingDays(warranty.warrantyEndDate);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cream-dark/60 dark:border-slate-800 p-5 shadow-warm hover:shadow-warm-hover transition-all duration-200 flex flex-col justify-between group h-full">
      <div>
        {/* Header with image & status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {warranty.productImageUrl ? (
              <img
                src={warranty.productImageUrl}
                alt={warranty.productName}
                className="w-12 h-12 rounded-xl object-cover border border-cream-dark/40 dark:border-slate-800 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-cream-light dark:bg-slate-800 border border-cream-dark/50 dark:border-slate-700 flex items-center justify-center text-forest dark:text-slate-300 font-bold shrink-0">
                <Tag className="w-6 h-6 text-forest/70 dark:text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-forest/60 dark:text-slate-400 uppercase tracking-wider block truncate">
                {warranty.brand}
              </span>
              <h4
                className="text-base font-bold text-forest dark:text-slate-100 truncate group-hover:text-carrot transition-colors"
                title={warranty.productName}
              >
                {warranty.productName}
              </h4>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-cream-light/40 dark:bg-slate-800/60 p-3 rounded-xl border border-cream-dark/40 dark:border-slate-800 mb-3">
          <div className="min-w-0">
            <span className="text-forest/60 dark:text-slate-400 block text-[11px]">Category</span>
            <span className="font-semibold text-forest dark:text-slate-200 truncate block">{warranty.category}</span>
          </div>
          <div className="min-w-0">
            <span className="text-forest/60 dark:text-slate-400 block text-[11px]">Price</span>
            <span className="font-bold text-forest dark:text-slate-100 truncate block">{formatCurrency(warranty.purchasePrice)}</span>
          </div>
          <div className="min-w-0">
            <span className="text-forest/60 dark:text-slate-400 block text-[11px]">Purchased</span>
            <span className="font-medium text-forest dark:text-slate-200 truncate block">{formatDate(warranty.purchaseDate)}</span>
          </div>
          <div className="min-w-0">
            <span className="text-forest/60 dark:text-slate-400 block text-[11px]">Expires</span>
            <span className="font-medium text-forest dark:text-slate-200 truncate block">{formatDate(warranty.warrantyEndDate)}</span>
          </div>
        </div>

        {/* Days remaining highlight banner */}
        <div
          className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-between mb-4 border ${
            status === 'ACTIVE'
              ? 'bg-kiwi-light text-kiwi-dark border-kiwi/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
              : status === 'EXPIRING_SOON'
              ? 'bg-sunshine-light text-forest border-sunshine/50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'
              : 'bg-tomato-light text-tomato border-tomato/30 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50'
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{remainingText}</span>
          </span>
          {warranty.serialNumber && (
            <span className="font-mono text-[10px] tracking-tight shrink-0 opacity-85 ml-2">S/N: {warranty.serialNumber}</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-cream-dark/50 dark:border-slate-800">
        <Link href={`/products/${warranty.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs h-9 flex items-center justify-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View Details
          </Button>
        </Link>
        <Link href={`/products/${warranty.id}/edit`}>
          <button
            title="Edit Warranty"
            className="w-9 h-9 rounded-xl text-forest/70 hover:text-forest hover:bg-cream-light dark:text-slate-300 dark:hover:bg-slate-800 flex items-center justify-center transition-colors border border-cream-dark/40 dark:border-slate-700 cursor-pointer shrink-0"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(warranty.id)}
            title="Delete Warranty"
            className="w-9 h-9 rounded-xl text-tomato hover:bg-tomato-light dark:hover:bg-rose-950/50 flex items-center justify-center transition-colors border border-tomato/20 dark:border-rose-800/50 cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
