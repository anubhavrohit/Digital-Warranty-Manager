'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { calculateDashboardStats, getWarrantyStatus, formatCurrency } from '@/lib/warranty-utils';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { StatCard } from '@/components/ui/StatCard';
import { WarrantyCard } from '@/components/ui/WarrantyCard';
import { CategoryChart } from '@/components/ui/CategoryChart';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Plus,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, warranties, deleteWarranty } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cream dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-forest dark:border-sunshine border-t-carrot rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-forest dark:text-slate-200">Loading Warranty Vault...</p>
        </div>
      </div>
    );
  }

  const stats = calculateDashboardStats(warranties);
  const recentWarranties = [...warranties].slice(0, 6);
  const expiringWarranties = warranties.filter(
    (w) => getWarrantyStatus(w.warrantyEndDate) === 'EXPIRING_SOON'
  );

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteWarranty(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 flex font-sans">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-forest/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-full">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-cream-dark dark:border-slate-800 shadow-warm">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-slate-100 tracking-tight">
                  Welcome back, {user.name}!
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-kiwi animate-pulse shrink-0" />
              </div>
              <p className="text-xs sm:text-sm text-forest/70 dark:text-slate-400">
                You have <strong className="text-forest dark:text-slate-200">{stats.activeWarranties} active warranties</strong> currently protected in your digital vault.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/upload">
                <Button variant="primary" size="sm" icon={UploadCloud}>
                  Upload & Scan Bill
                </Button>
              </Link>
              <Link href="/products/add">
                <Button variant="secondary" size="sm" icon={Plus}>
                  Add Warranty
                </Button>
              </Link>
            </div>
          </div>

          {/* Expiring Alert Banner if any */}
          {expiringWarranties.length > 0 && (
            <div className="bg-sunshine-light dark:bg-amber-950/40 border border-sunshine/70 dark:border-amber-800/50 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sunshine text-forest shrink-0">
                  <Clock className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-forest dark:text-amber-200">
                    {expiringWarranties.length} Warranty{expiringWarranties.length > 1 ? 's' : ''} Expiring Soon!
                  </h4>
                  <p className="text-xs text-forest/80 dark:text-amber-300/80 mt-0.5">
                    Action required within the next 30 days to avoid expired coverage.
                  </p>
                </div>
              </div>
              <Link href="/expiring" className="shrink-0">
                <Button variant="sunshine" size="sm">
                  View Expiring Products &rarr;
                </Button>
              </Link>
            </div>
          )}

          {/* Stat Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
              variant="forest"
            />
            <StatCard
              title="Active Warranties"
              value={stats.activeWarranties}
              icon={CheckCircle2}
              variant="kiwi"
            />
            <StatCard
              title="Expiring Soon"
              value={stats.expiringSoon}
              icon={Clock}
              variant="sunshine"
            />
            <StatCard
              title="Expired"
              value={stats.expired}
              icon={AlertTriangle}
              variant="tomato"
            />
            <StatCard
              title="Purchase Value"
              value={formatCurrency(stats.totalPurchaseValue, user?.currency)}
              icon={IndianRupee}
              variant="carrot"
            />
          </div>

          {/* Analytics Chart & Quick Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <CategoryChart warranties={warranties} />
            </div>

            {/* Quick Actions Card */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-cream-dark/60 dark:border-slate-800 p-5 sm:p-6 shadow-warm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-carrot font-bold text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Smart Automation</span>
                </div>
                <h3 className="text-base font-bold text-forest dark:text-slate-100 mb-1">
                  Instant Bill Scanner
                </h3>
                <p className="text-xs text-forest/70 dark:text-slate-400 leading-relaxed">
                  Upload photos of purchase receipts or digital invoices to automatically extract product details, serial numbers, and warranty end dates.
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-cream-dark/50 dark:border-slate-800">
                <Link href="/upload" className="block">
                  <Button variant="primary" size="sm" className="w-full text-xs" icon={UploadCloud}>
                    Scan & Add Bill Document
                  </Button>
                </Link>
                <Link href="/products/add" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs" icon={Plus}>
                    Add Product Form
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Products Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-forest dark:text-slate-100">Recent Products</h2>
                <p className="text-xs text-forest/60 dark:text-slate-400">Your latest registered warranties and bills</p>
              </div>
              <Link href="/products" className="text-xs font-bold text-carrot hover:underline flex items-center gap-1">
                View All ({warranties.length}) &rarr;
              </Link>
            </div>

            {recentWarranties.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-cream-dark dark:border-slate-800 p-12 text-center space-y-4">
                <Package className="w-12 h-12 text-forest/40 dark:text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-forest dark:text-slate-200">No Products Added Yet</h3>
                <p className="text-xs text-forest/70 dark:text-slate-400 max-w-sm mx-auto">
                  Start by uploading a bill image or manually adding your first product warranty details.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link href="/upload">
                    <Button variant="primary" size="sm" icon={UploadCloud}>
                      Upload Bill
                    </Button>
                  </Link>
                  <Link href="/products/add">
                    <Button variant="outline" size="sm" icon={Plus}>
                      Add Form
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {recentWarranties.map((item) => (
                  <WarrantyCard
                    key={item.id}
                    warranty={item}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Warranty Record"
        message="Are you sure you want to delete this warranty record? This action cannot be undone."
        confirmText="Delete Warranty"
      />
    </div>
  );
}
