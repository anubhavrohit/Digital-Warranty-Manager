'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  UploadCloud,
  Clock,
  FileText,
  User,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from './Badge';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, warranties, isDemoMode } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const expiringCount = warranties.filter(
    (w) => new Date(w.warrantyEndDate).getTime() - Date.now() <= 30 * 86400000 &&
           new Date(w.warrantyEndDate).getTime() - Date.now() >= 0
  ).length;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Products', href: '/products', icon: Package, badge: warranties.length },
    { label: 'Add Warranty', href: '/products/add', icon: PlusCircle },
    { label: 'Upload Bill', href: '/upload', icon: UploadCloud, highlight: true },
    { label: 'Expiring Soon', href: '/expiring', icon: Clock, badge: expiringCount > 0 ? expiringCount : undefined, badgeVariant: 'sunshine' as const },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-cream/95 backdrop-blur-md border-r border-cream-dark/70 flex flex-col justify-between h-screen sticky top-0 z-30 p-4 shrink-0">
      <div>
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-forest text-sunshine flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-forest tracking-tight block leading-none">
              Warranty<span className="text-carrot">Vault</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-forest/60 uppercase block">
              Digital Manager
            </span>
          </div>
        </Link>

        {isDemoMode && (
          <div className="mx-2 mb-4 px-3 py-2 rounded-xl bg-sunshine-light border border-sunshine/50 flex items-center gap-2 text-xs font-bold text-forest">
            <Sparkles className="w-4 h-4 text-carrot shrink-0 animate-pulse" />
            <span>Demo Mode Active</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-forest text-white shadow-warm'
                    : item.highlight
                    ? 'bg-carrot/10 text-carrot hover:bg-carrot/20'
                    : 'text-forest/80 hover:text-forest hover:bg-cream-dark/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sunshine' : item.highlight ? 'text-carrot' : 'text-forest/70'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <Badge variant={item.badgeVariant || (isActive ? 'sunshine' : 'neutral')} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User info & Logout */}
      <div className="pt-4 border-t border-cream-dark/60">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/60 border border-cream-dark/50">
          <div className="w-8 h-8 rounded-full bg-forest text-sunshine font-bold text-xs flex items-center justify-center shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-forest truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-forest/60 truncate">{user?.email || ''}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-tomato hover:bg-tomato-light transition-colors border border-tomato/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
