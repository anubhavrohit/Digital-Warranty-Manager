'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { WarrantyItem, ProductCategory, WarrantyStatus } from '@/types';
import { getWarrantyStatus, formatCurrency, formatDate } from '@/lib/warranty-utils';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { WarrantyCard } from '@/components/ui/WarrantyCard';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Package,
  Plus,
  UploadCloud,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';

function ProductsContent() {
  const { user, loading, warranties, deleteWarranty } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'expiry' | 'price' | 'date'>('expiry');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const filteredWarranties = useMemo(() => {
    return warranties
      .filter((item) => {
        if (search.trim()) {
          const query = search.toLowerCase().trim();
          const matchName = item.productName.toLowerCase().includes(query);
          const matchBrand = item.brand.toLowerCase().includes(query);
          const matchSerial = item.serialNumber.toLowerCase().includes(query);
          const matchInvoice = item.invoiceNumber.toLowerCase().includes(query);
          const matchStore = item.store.toLowerCase().includes(query);
          if (!matchName && !matchBrand && !matchSerial && !matchInvoice && !matchStore) {
            return false;
          }
        }

        if (category !== 'ALL' && item.category !== category) {
          return false;
        }

        if (status !== 'ALL') {
          const itemStatus = getWarrantyStatus(item.warrantyEndDate);
          if (itemStatus !== status) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry') {
          return new Date(a.warrantyEndDate).getTime() - new Date(b.warrantyEndDate).getTime();
        } else if (sortBy === 'price') {
          return (b.purchasePrice || 0) - (a.purchasePrice || 0);
        } else if (sortBy === 'date') {
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        }
        return 0;
      });
  }, [warranties, search, category, status, sortBy]);

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteWarranty(deleteId);
      setDeleteId(null);
    }
  };

  const categoryOptions = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Appliances', value: 'Appliances' },
    { label: 'Mobile', value: 'Mobile' },
    { label: 'Laptop', value: 'Laptop' },
    { label: 'Gaming', value: 'Gaming' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Vehicle', value: 'Vehicle' },
    { label: 'Home', value: 'Home' },
    { label: 'Other', value: 'Other' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'EXPIRING SOON', value: 'EXPIRING_SOON' },
    { label: 'EXPIRED', value: 'EXPIRED' },
  ];

  const sortOptions = [
    { label: 'Sort by Expiry Date (Soonest)', value: 'expiry' },
    { label: 'Sort by Price (Highest)', value: 'price' },
    { label: 'Sort by Purchase Date (Newest)', value: 'date' },
  ];

  return (
    <div className="min-h-screen bg-cream flex font-sans">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

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

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                My Warranties ({filteredWarranties.length})
              </h1>
              <p className="text-xs sm:text-sm text-forest/70">
                Search, filter and manage all stored digital product warranties
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/upload">
                <Button variant="primary" size="sm" icon={UploadCloud}>
                  Upload Bill
                </Button>
              </Link>
              <Link href="/products/add">
                <Button variant="secondary" size="sm" icon={Plus}>
                  Add Warranty
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-cream-dark shadow-warm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/50" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, brand, serial..."
                  className="w-full pl-10 pr-4 py-2.5 bg-cream-light/60 border border-cream-dark/80 rounded-xl text-xs sm:text-sm text-forest placeholder-forest/40 focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <Select
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <Select
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />

              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cream-dark/50 text-xs">
              <div className="text-forest/70">
                Showing <strong className="text-forest">{filteredWarranties.length}</strong> of{' '}
                <strong className="text-forest">{warranties.length}</strong> products
              </div>

              <div className="flex items-center gap-1 bg-cream-light p-1 rounded-xl border border-cream-dark/60">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-forest text-sunshine font-bold shadow-sm'
                      : 'text-forest/70 hover:bg-cream-dark/40'
                  }`}
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-forest text-sunshine font-bold shadow-sm'
                      : 'text-forest/70 hover:bg-cream-dark/40'
                  }`}
                  aria-label="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredWarranties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-dark p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-forest/40 mx-auto" />
              <h3 className="text-base font-bold text-forest">No Products Match Your Filter</h3>
              <p className="text-xs text-forest/70 max-w-sm mx-auto">
                Try adjusting your search query, category, or status filter.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategory('ALL');
                  setStatus('ALL');
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarranties.map((item) => (
                <WarrantyCard
                  key={item.id}
                  warranty={item}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-cream-dark shadow-warm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-light/80 border-b border-cream-dark/60 font-bold uppercase tracking-wider text-forest/80">
                    <tr>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Brand / Category</th>
                      <th className="p-4">Purchase Date</th>
                      <th className="p-4">Expiry Date</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark/40 font-medium">
                    {filteredWarranties.map((item) => {
                      const itemStatus = getWarrantyStatus(item.warrantyEndDate);
                      return (
                        <tr key={item.id} className="hover:bg-cream-light/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-forest text-sm">{item.productName}</div>
                            {item.serialNumber && (
                              <div className="font-mono text-[10px] text-forest/60">
                                S/N: {item.serialNumber}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-forest">{item.brand}</span>
                            <span className="block text-forest/60">{item.category}</span>
                          </td>
                          <td className="p-4 text-forest">{formatDate(item.purchaseDate)}</td>
                          <td className="p-4 text-forest">{formatDate(item.warrantyEndDate)}</td>
                          <td className="p-4 font-bold text-forest">
                            {formatCurrency(item.purchasePrice)}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={itemStatus} size="sm" />
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/products/${item.id}`}>
                                <button className="p-1.5 rounded-lg text-forest hover:bg-cream-light">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>
                              <Link href={`/products/${item.id}/edit`}>
                                <button className="p-1.5 rounded-lg text-forest hover:bg-cream-light">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="p-1.5 rounded-lg text-tomato hover:bg-tomato-light"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-forest border-t-carrot rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-forest">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
