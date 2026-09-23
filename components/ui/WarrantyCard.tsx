import React from 'react';
import Link from 'next/link';
import { WarrantyItem } from '@/types';
import { getWarrantyStatus, getRemainingDays, formatCurrency, formatDate } from '@/lib/warranty-utils';
import { StatusBadge } from './Badge';
import { Calendar, Tag, FileText, Eye, Edit3, Trash2, ArrowUpRight } from 'lucide-react';
import { Button } from './Button';

interface WarrantyCardProps {
  warranty: WarrantyItem;
  onDelete?: (id: string) => void;
}

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ warranty, onDelete }) => {
  const status = getWarrantyStatus(warranty.warrantyEndDate);
  const remainingText = getRemainingDays(warranty.warrantyEndDate);

  return (
    <div className="bg-white rounded-2xl border border-cream-dark/60 p-5 shadow-warm hover:shadow-warm-hover transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header with image & status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {warranty.productImageUrl ? (
              <img
                src={warranty.productImageUrl}
                alt={warranty.productName}
                className="w-12 h-12 rounded-xl object-cover border border-cream-dark/40 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-cream-light border border-cream-dark/50 flex items-center justify-center text-forest font-bold shrink-0">
                <Tag className="w-6 h-6 text-forest/70" />
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-forest/60 uppercase tracking-wider block">
                {warranty.brand}
              </span>
              <h4 className="text-base font-bold text-forest line-clamp-1 group-hover:text-carrot transition-colors">
                {warranty.productName}
              </h4>
            </div>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-cream-light/40 p-3 rounded-xl border border-cream-dark/40 mb-3">
          <div>
            <span className="text-forest/60 block">Category</span>
            <span className="font-semibold text-forest">{warranty.category}</span>
          </div>
          <div>
            <span className="text-forest/60 block">Price</span>
            <span className="font-bold text-forest">{formatCurrency(warranty.purchasePrice)}</span>
          </div>
          <div>
            <span className="text-forest/60 block">Purchased</span>
            <span className="font-medium text-forest">{formatDate(warranty.purchaseDate)}</span>
          </div>
          <div>
            <span className="text-forest/60 block">Expires</span>
            <span className="font-medium text-forest">{formatDate(warranty.warrantyEndDate)}</span>
          </div>
        </div>

        {/* Days remaining highlight banner */}
        <div
          className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-between mb-4 ${
            status === 'ACTIVE'
              ? 'bg-kiwi-light text-kiwi-dark'
              : status === 'EXPIRING_SOON'
              ? 'bg-sunshine-light text-forest border border-sunshine/40'
              : 'bg-tomato-light text-tomato'
          }`}
        >
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {remainingText}
          </span>
          {warranty.serialNumber && (
            <span className="font-mono text-[10px] opacity-75">S/N: {warranty.serialNumber}</span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-cream-dark/50 gap-2">
        <Link href={`/products/${warranty.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">
            <Eye className="w-3.5 h-3.5" /> View Details
          </Button>
        </Link>
        <Link href={`/products/${warranty.id}/edit`}>
          <button
            title="Edit Warranty"
            className="p-2 rounded-xl text-forest/70 hover:text-forest hover:bg-cream-light transition-colors border border-cream-dark/40"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(warranty.id)}
            title="Delete Warranty"
            className="p-2 rounded-xl text-tomato hover:bg-tomato-light transition-colors border border-tomato/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
