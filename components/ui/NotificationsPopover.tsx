'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getWarrantyStatus, getRemainingDays } from '@/lib/warranty-utils';
import { Bell, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import { Badge } from './Badge';

export const NotificationsPopover: React.FC = () => {
  const { warranties } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter urgent notification items
  const notifications = warranties
    .map((item) => {
      const status = getWarrantyStatus(item.warrantyEndDate);
      const remainingDaysText = getRemainingDays(item.warrantyEndDate);

      if (status === 'EXPIRING_SOON') {
        return {
          id: item.id,
          productName: item.productName,
          title: `Warranty Expiring Soon`,
          message: `Your ${item.brand} ${item.productName} warranty ${remainingDaysText.toLowerCase()}.`,
          status,
          date: item.warrantyEndDate,
        };
      } else if (status === 'EXPIRED') {
        return {
          id: item.id,
          productName: item.productName,
          title: `Warranty Expired`,
          message: `Warranty for your ${item.productName} has expired.`,
          status,
          date: item.warrantyEndDate,
        };
      }
      return null;
    })
    .filter(Boolean) as {
    id: string;
    productName: string;
    title: string;
    message: string;
    status: 'EXPIRING_SOON' | 'EXPIRED';
    date: string;
  }[];

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2.5 rounded-xl bg-white border border-cream-dark/60 text-forest hover:bg-cream-light transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest"
      >
        <Bell className="w-5 h-5 text-forest" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-carrot text-white text-[11px] font-extrabold flex items-center justify-center animate-bounce shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-cream-dark shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 bg-cream-light/80 border-b border-cream-dark/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-forest" />
              <h4 className="font-bold text-forest text-sm">Warranty Notifications</h4>
            </div>
            {unreadCount > 0 && (
              <Badge variant="carrot" size="sm">
                {unreadCount} Alert{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-cream-dark/40">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-forest/70">
                <CheckCircle2 className="w-8 h-8 text-kiwi mx-auto mb-2" />
                <p className="text-sm font-semibold text-forest">All clear!</p>
                <p className="text-xs text-forest/60">No warranties are expiring within the next 30 days.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/products/${n.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-3.5 hover:bg-cream-light/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        n.status === 'EXPIRING_SOON'
                          ? 'bg-sunshine-light text-forest'
                          : 'bg-tomato-light text-tomato'
                      }`}
                    >
                      {n.status === 'EXPIRING_SOON' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-forest">{n.title}</p>
                      <p className="text-xs text-forest/80 mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 bg-cream-light/50 border-t border-cream-dark/50 text-center">
            <Link
              href="/expiring"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-carrot hover:underline"
            >
              View Expiring Warranties Page &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
