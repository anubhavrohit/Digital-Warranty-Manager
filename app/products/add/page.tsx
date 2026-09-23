'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ProductCategory } from '@/types';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddWarrantyPage() {
  const { user, loading, addWarranty, addDocument } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyStartDate, setWarrantyStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default warranty end date set to 1 year from today
  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
  const [warrantyEndDate, setWarrantyEndDate] = useState(defaultExpiry.toISOString().split('T')[0]);

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
    }
  }, [user, loading, router]);

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

    if (new Date(warrantyEndDate).getTime() < new Date(warrantyStartDate).getTime()) {
      newErrors.warrantyEndDate = 'Warranty end date cannot be earlier than start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const created = await addWarranty({
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

      // If document URL present, record in documents repository as well
      if (imageUrl.trim()) {
        await addDocument({
          warrantyId: created.id,
          productName: created.productName,
          fileName: `${created.productName.replace(/\s+/g, '_')}_Bill.jpg`,
          fileUrl: imageUrl.trim(),
          fileType: 'Bill Invoice',
          fileSize: '1.5 MB',
        });
      }

      router.push(`/products/${created.id}`);
    } catch (err: any) {
      console.error('Error adding warranty:', err);
      setErrors({ form: err.message || 'Failed to save warranty details.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Link href="/products">
              <button className="p-2 rounded-xl bg-white border border-cream-dark text-forest hover:bg-cream-light">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                Add New Warranty Record
              </h1>
              <p className="text-xs sm:text-sm text-forest/70">
                Enter product details, serial numbers and warranty dates
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
              {/* Product Core Info */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                  1. Product Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    placeholder="e.g. ASUS TUF Gaming F15"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    error={errors.productName}
                    required
                  />

                  <Input
                    label="Brand / Manufacturer"
                    placeholder="e.g. ASUS, Samsung, Apple"
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
                    placeholder="e.g. 78990"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    error={errors.purchasePrice}
                    required
                  />
                </div>
              </div>

              {/* Warranty Timing & Dates */}
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

              {/* Vendor & Serial Numbers */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                  3. Identifiers & Vendor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Store / Vendor Name"
                    placeholder="e.g. Amazon, Reliance Digital"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                  />

                  <Input
                    label="Serial Number (S/N)"
                    placeholder="e.g. SN-ASUS-9938210"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />

                  <Input
                    label="Invoice / Bill Number"
                    placeholder="e.g. INV-2023-9948"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes & Image Attachment */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                  4. Additional Notes & Receipt URL
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Receipt Image URL (Optional)"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    helperText="Paste direct link or leave blank to attach later"
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/90 mb-1.5">
                      Warranty Notes / Terms
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Includes extended protection plan for keyboard and display screen..."
                      className="w-full px-3.5 py-2.5 bg-cream-light/60 border border-cream-dark/80 rounded-xl text-forest text-sm focus:outline-none focus:ring-2 focus:ring-forest hover:border-forest/40"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-dark/60">
                <Link href="/products">
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>
                  Save Warranty Record
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
