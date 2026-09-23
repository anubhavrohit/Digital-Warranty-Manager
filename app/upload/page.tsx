'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { extractWarrantyDataFromImage } from '@/lib/ocr-service';
import { OCRResult, ProductCategory } from '@/types';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { FileUploader } from '@/components/ui/FileUploader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  UploadCloud,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function UploadBillPage() {
  const { user, loading, addWarranty, addDocument } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Workflow steps: 'upload' -> 'scanning' -> 'review'
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [extractedData, setExtractedData] = useState<OCRResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Form Fields (Pre-populated by OCR)
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyStartDate, setWarrantyStartDate] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [price, setPrice] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleStartOCR = async () => {
    if (!selectedFile) return;

    try {
      setStep('scanning');
      const result = await extractWarrantyDataFromImage(selectedFile);
      setExtractedData(result);

      // Pre-fill editable fields
      setProductName(result.productName);
      setBrand(result.brand);
      setSerialNumber(result.serialNumber);
      setPurchaseDate(result.purchaseDate);
      setWarrantyStartDate(result.purchaseDate);

      // Calculate expiry date based on warranty period text (e.g. "1 Year" or "2 Years")
      const pDate = new Date(result.purchaseDate || Date.now());
      const yearsToAdd = result.warrantyPeriod.includes('2') ? 2 : 1;
      pDate.setFullYear(pDate.getFullYear() + yearsToAdd);
      setWarrantyEndDate(pDate.toISOString().split('T')[0]);

      setPrice(String(result.price));
      setInvoiceNumber(result.invoiceNumber);
      setVendor(result.vendor);
      setNotes(`OCR Extracted Warranty Period: ${result.warrantyPeriod}`);

      setStep('review');
    } catch (err) {
      console.error('OCR Error:', err);
      setStep('upload');
      setErrors({ form: 'Failed to process image. Please try again or enter details manually.' });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setExtractedData(null);
    setStep('upload');
    setErrors({});
  };

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

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!productName.trim()) errs.productName = 'Product name is required';
    if (!brand.trim()) errs.brand = 'Brand is required';
    if (!purchaseDate) errs.purchaseDate = 'Purchase date is required';
    if (!warrantyEndDate) errs.warrantyEndDate = 'Expiry date is required';
    if (!price || isNaN(parseFloat(price))) errs.price = 'Valid numeric price required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const previewToUse =
        imagePreviewUrl ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80';

      const savedItem = await addWarranty({
        productName: productName.trim(),
        brand: brand.trim(),
        category,
        purchaseDate,
        warrantyStartDate: warrantyStartDate || purchaseDate,
        warrantyEndDate,
        purchasePrice: parseFloat(price),
        store: vendor.trim(),
        serialNumber: serialNumber.trim(),
        invoiceNumber: invoiceNumber.trim(),
        notes: notes.trim(),
        productImageUrl: previewToUse,
        invoiceImageUrl: previewToUse,
      });

      if (selectedFile) {
        await addDocument({
          warrantyId: savedItem.id,
          productName: savedItem.productName,
          fileName: selectedFile.name,
          fileUrl: previewToUse,
          fileType: selectedFile.type || 'Invoice Document',
          fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        });
      }

      router.push(`/products/${savedItem.id}`);
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err.message || 'Failed to save warranty record.' });
    } finally {
      setIsSaving(false);
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

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sunshine-light border border-sunshine/60 text-forest text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-carrot" />
              <span>Smart AI/OCR Data Extractor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              Upload Bill & Extract Warranty
            </h1>
            <p className="text-xs sm:text-sm text-forest/70">
              Upload your purchase invoice image to automatically detect product name, serial number and dates.
            </p>
          </div>

          {/* Workflow Stepper Progress */}
          <div className="bg-white p-4 rounded-2xl border border-cream-dark shadow-sm">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div
                className={`py-2 rounded-xl transition-colors ${
                  step === 'upload'
                    ? 'bg-forest text-sunshine shadow-sm'
                    : 'bg-cream-light text-forest/70'
                }`}
              >
                1. Upload Bill
              </div>
              <div
                className={`py-2 rounded-xl transition-colors ${
                  step === 'scanning'
                    ? 'bg-carrot text-white shadow-sm'
                    : 'bg-cream-light text-forest/70'
                }`}
              >
                2. Read Bill Details
              </div>
              <div
                className={`py-2 rounded-xl transition-colors ${
                  step === 'review'
                    ? 'bg-kiwi text-white shadow-sm'
                    : 'bg-cream-light text-forest/70'
                }`}
              >
                3. User Confirmation
              </div>
            </div>
          </div>

          {/* STEP 1: Upload Area */}
          {step === 'upload' && (
            <div className="space-y-6">
              <FileUploader onFileSelect={handleFileSelect} />

              {selectedFile && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={handleReset}>
                    Clear
                  </Button>
                  <Button variant="primary" size="lg" icon={Zap} onClick={handleStartOCR}>
                    Read Bill Details
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Scanning Loading Animation */}
          {step === 'scanning' && (
            <div className="bg-white rounded-3xl border border-cream-dark p-12 text-center space-y-6 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cream-dark border-t-carrot animate-spin" />
                <Zap className="w-8 h-8 text-carrot animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-forest">Scanning Bill Document...</h3>
                <p className="text-xs text-forest/70 mt-1 max-w-sm mx-auto">
                  Extracting product name, serial number, purchase price, vendor, and warranty dates...
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sunshine-light border border-sunshine/60 text-forest text-xs font-bold">
                <Sparkles className="w-4 h-4 text-carrot animate-bounce" />
                <span>Running `extractWarrantyDataFromImage()` Service</span>
              </div>
            </div>
          )}

          {/* STEP 3: Review Extracted Information & Confirmation */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Review Required Banner */}
              <div className="bg-sunshine-light border border-sunshine/80 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sunshine text-forest shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest">
                      Review Extracted Information Before Saving
                    </h4>
                    <p className="text-xs text-forest/80">
                      OCR has filled the form below. Please verify or edit any incorrect details before committing to your vault.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset}>
                  Try Again
                </Button>
              </div>

              {/* Form with pre-populated extracted fields */}
              <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
                {errors.form && (
                  <div className="p-3 rounded-xl bg-tomato-light border border-tomato/30 text-tomato text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <form onSubmit={handleSaveWarranty} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                      Product Details
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
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        error={errors.price}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 mb-4">
                      Extracted Dates & Identifiers
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
                        label="Serial Number (S/N)"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                      />

                      <Input
                        label="Warranty Expiry Date"
                        type="date"
                        value={warrantyEndDate}
                        onChange={(e) => setWarrantyEndDate(e.target.value)}
                        error={errors.warrantyEndDate}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Store / Vendor"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                      />

                      <Input
                        label="Invoice Number"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/90 mb-1.5">
                      Extracted Notes / Warranty Terms
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-cream-light/60 border border-cream-dark/80 rounded-xl text-forest text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-dark/60">
                    <Button variant="ghost" type="button" onClick={handleReset}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="lg" type="submit" isLoading={isSaving}>
                      Save Warranty
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
