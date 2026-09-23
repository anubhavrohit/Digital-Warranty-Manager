'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Search, Menu, User, Plus } from 'lucide-react';
import { NotificationsPopover } from './NotificationsPopover';
import { Button } from './Button';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-cream/80 backdrop-blur-md border-b border-cream-dark/60 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-forest hover:bg-cream-dark/50"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, serial numbers..."
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-cream-dark/70 rounded-xl text-xs sm:text-sm text-forest placeholder-forest/40 focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all shadow-sm"
          />
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <Link href="/products/add" className="hidden sm:block">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Warranty
          </Button>
        </Link>

        {/* Real-time Notifications Popover */}
        <NotificationsPopover />

        {/* User profile dropdown trigger */}
        <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-cream-dark/60">
          <div className="w-9 h-9 rounded-full bg-forest text-sunshine font-extrabold text-sm flex items-center justify-center shadow-sm border border-sunshine/30 hover:scale-105 transition-transform">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden md:inline-block text-xs font-bold text-forest truncate max-w-[120px]">
            {user?.name || 'Account'}
          </span>
        </Link>
      </div>
    </header>
  );
};
