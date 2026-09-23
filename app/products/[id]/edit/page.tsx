'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProductCategory, WarrantyItem } from '@/types';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditWarrantyPage() {
  const { user, loading, warranties, updateWarranty } = useAuth();
  const router = useRouter();
  const params = useParams();
  const warrantyId = params?.id as string;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [item, setItem] = useState<WarrantyItem | null>(null);

  // Form State
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyStartDate, setWarrantyStartDate] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [store, setStore] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (warranties.length > 0 && warrantyId) {
      const found = warranties.find((w) => w.id === warrantyId);
      if (found) {
        setItem(found);
        setProductName(found.productName);
        setBrand(found.brand);
        setCategory(found.category);
        setPurchaseDate(found.purchaseDate);
        setWarrantyStartDate(found.warrantyStartDate);
        setWarrantyEndDate(found.warrantyEndDate);
        setPurchasePrice(String(found.purchasePrice));
        setStore(found.store || '');
        setSerialNumber(found.serialNumber || '');
        setInvoiceNumber(found.invoiceNumber || '');
        setNotes(found.notes || '');
        setImageUrl(found.productImageUrl || '');
      }
    }
  }, [user, loading, warranties, warrantyId, router]);

  const categoryOptions = [
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!productName.trim()) newErrors.productName = 'Product name is required';
    if (!brand.trim()) newErrors.brand = 'Brand is required';
    if (!purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!warrantyEndDate) newErrors.warrantyEndDate = 'Warranty end date is required';

    const priceNum = parseFloat(purchasePrice);
    if (!purchasePrice || isNaN(priceNum) || priceNum < 0) {
      newErrors.purchasePrice = 'Please enter a valid numeric purchase price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !warrantyId) return;

    try {
      setIsSubmitting(true);

      await updateWarranty(warrantyId, {
        productName: productName.trim(),
        brand: brand.trim(),
        category,
        purchaseDate,
        warrantyStartDate,
        warrantyEndDate,
        purchasePrice: parseFloat(purchasePrice),
        store: store.trim(),
        serialNumber: serialNumber.trim(),
        invoiceNumber: invoiceNumber.trim(),
        notes: notes.trim(),
        productImageUrl: imageUrl.trim() || undefined,
        invoiceImageUrl: imageUrl.trim() || undefined,
      });

      router.push(`/products/${warrantyId}`);
    } catch (err: any) {
      console.error('Error updating warranty:', err);
      setErrors({ form: err.message || 'Failed to update warranty details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item && !loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-cream-dark text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-tomato mx-auto" />
          <h3 className="text-base font-bold text-forest">Warranty Not Found</h3>
          <Link href="/products">
            <Button variant="secondary" size="sm">
              Back to Products Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link href={`/products/${warrantyId}`}>
              <button className="p-2 rounded-xl bg-white border border-cream-dark text-forest hover:bg-cream-light">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                Edit Warranty Details
              </h1>
              <p className="text-xs sm:text-sm text-forest/70">
                Update information for {productName || 'Product'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm">
            {errors.form && (
              <div className="mb-6 p-3 rounded-xl bg-tomato-light border border-tomato/30 text-tomato text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                  1. Product Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    error={errors.productName}
                    required
                  />

                  <Input
                    label="Brand / Manufacturer"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    error={errors.brand}
                    required
                  />

                  <Select
                    label="Category"
                    options={categoryOptions}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    required
                  />

                  <Input
                    label="Purchase Price (₹ INR)"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    error={errors.purchasePrice}
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                  2. Warranty & Expiry Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Purchase Date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    error={errors.purchaseDate}
                    required
                  />

                  <Input
                    label="Warranty Start Date"
                    type="date"
                    value={warrantyStartDate}
                    onChange={(e) => setWarrantyStartDate(e.target.value)}
                    required
                  />

                  <Input
                    label="Warranty End / Expiry Date"
                    type="date"
                    value={warrantyEndDate}
                    onChange={(e) => setWarrantyEndDate(e.target.value)}
                    error={errors.warrantyEndDate}
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                  3. Identifiers & Vendor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Store / Vendor Name"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                  />

                  <Input
                    label="Serial Number (S/N)"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />

                  <Input
                    label="Invoice / Bill Number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                  4. Additional Notes & Receipt URL
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Receipt Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/90 mb-1.5">
                      Warranty Notes / Terms
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-cream-light/60 border border-cream-dark/80 rounded-xl text-forest text-sm focus:outline-none focus:ring-2 focus:ring-forest hover:border-forest/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-dark/60">
                <Link href={`/products/${warrantyId}`}>
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
