'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { extractWarrantyDataFromImage, inferCategoryFromProduct } from '@/lib/ocr-service';
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
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
  Calendar,
  Store,
  FileCheck,
  Eye,
  Info,
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
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('Initializing OCR...');
  const [showRawText, setShowRawText] = useState(false);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or non-image document
      setImagePreviewUrl(null);
    }
  };

  const handleStartOCR = async () => {
    if (!selectedFile) return;

    try {
      setStep('scanning');
      setScanProgress(10);
      setScanStatusMessage('Loading document engine...');

      const result = await extractWarrantyDataFromImage(selectedFile, (msg, prog) => {
        setScanStatusMessage(msg);
        setScanProgress(Math.round(prog * 100));
      });

      setExtractedData(result);

      // Pre-fill editable fields
      setProductName(result.productName);
      setBrand(result.brand);
      setCategory(inferCategoryFromProduct(result.productName, result.brand));
      setSerialNumber(result.serialNumber);
      setPurchaseDate(result.purchaseDate);
      setWarrantyStartDate(result.purchaseDate);

      // Calculate expiry date based on warranty period text (e.g. "1 Year" or "2 Years")
      const pDate = new Date(result.purchaseDate || Date.now());
      const yearsToAdd = result.warrantyPeriod.includes('2')
        ? 2
        : result.warrantyPeriod.includes('3')
        ? 3
        : 1;
      pDate.setFullYear(pDate.getFullYear() + yearsToAdd);
      setWarrantyEndDate(pDate.toISOString().split('T')[0]);

      setPrice(result.price > 0 ? String(result.price) : '');
      setInvoiceNumber(result.invoiceNumber);
      setVendor(result.vendor);
      setNotes(`OCR Extracted Warranty Period: ${result.warrantyPeriod}`);

      setStep('review');
    } catch (err) {
      console.error('OCR Error:', err);
      setStep('upload');
      setErrors({ form: 'Failed to process document. Please try again or enter details manually.' });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setExtractedData(null);
    setStep('upload');
    setScanProgress(0);
    setScanStatusMessage('');
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

  // Helper to count how many fields were detected
  const extractedCount = extractedData?.fieldsExtracted
    ? Object.values(extractedData.fieldsExtracted).filter(Boolean).length
    : 0;

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

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sunshine-light border border-sunshine/60 text-forest text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-carrot" />
              <span>Smart AI/OCR Data Extractor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              Upload Bill & Extract Warranty
            </h1>
            <p className="text-xs sm:text-sm text-forest/70">
              Upload your purchase invoice (JPG, PNG, WEBP or PDF) to automatically detect product details, serial numbers, prices, and dates.
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
            <div className="space-y-6 max-w-3xl mx-auto">
              {errors.form && (
                <div className="p-3 rounded-xl bg-tomato-light border border-tomato/30 text-tomato text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

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

          {/* STEP 2: Scanning Loading Animation with Real Progress Bar */}
          {step === 'scanning' && (
            <div className="bg-white rounded-3xl border border-cream-dark p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-2xl mx-auto">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cream-dark border-t-carrot animate-spin" />
                <Zap className="w-10 h-10 text-carrot animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-forest">Scanning Bill Document...</h3>
                <p className="text-xs font-semibold text-forest/70 mt-1 max-w-sm mx-auto min-h-[20px]">
                  {scanStatusMessage}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-cream-dark/40 rounded-full h-3 overflow-hidden p-0.5 border border-cream-dark">
                  <div
                    className="bg-carrot h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(5, scanProgress)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-forest/70 px-1">
                  <span>Progress</span>
                  <span>{scanProgress}%</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sunshine-light border border-sunshine/60 text-forest text-xs font-bold">
                <Sparkles className="w-4 h-4 text-carrot animate-bounce" />
                <span>Powered by Tesseract OCR & Multi-Format PDF Parser</span>
              </div>
            </div>
          )}

          {/* STEP 3: Dynamic Extracted Info Boxes & Form Confirmation */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Top Hero Document Scan Summary Info Box */}
              <div className="bg-white rounded-3xl border border-cream-dark p-5 sm:p-6 shadow-warm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-forest text-sunshine shrink-0 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-forest truncate max-w-xs sm:max-w-md">
                          {selectedFile?.name || 'Uploaded Document'}
                        </h3>
                        {extractedData?.extractionMethod === 'PDF Direct Text' ? (
                          <span className="px-2 py-0.5 rounded-full bg-kiwi/15 border border-kiwi/30 text-kiwi text-[10px] font-bold">
                            ✨ PDF Native Text
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-carrot/15 border border-carrot/30 text-carrot text-[10px] font-bold">
                            ⚡ Tesseract Neural OCR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-forest/60 mt-0.5">
                        {selectedFile?.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''} &bull;{' '}
                        {extractedCount > 0 ? `${extractedCount} of 7 key fields auto-extracted` : 'Standard defaults pre-filled'}
                      </p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset}>
                    Scan New Document
                  </Button>
                </div>

                {/* 4 DYNAMIC EXTRACTED INFO BOXES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  {/* Info Box 1: Product & Brand */}
                  <div className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/70 space-y-2 relative overflow-hidden group hover:border-forest/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-forest" />
                        Scanned Product
                      </span>
                      {extractedData?.fieldsExtracted?.productName ? (
                        <span className="px-2 py-0.5 rounded-full bg-kiwi/15 border border-kiwi/30 text-kiwi text-[9px] font-bold">
                          Auto-Detected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-cream-dark text-forest/70 text-[9px] font-bold">
                          Filename Derived
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-forest text-sm truncate">
                      {productName || 'Unknown Item'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-forest/70 truncate">
                      <span>Brand: {brand || 'Generic'}</span>
                      <span>&bull;</span>
                      <span className="text-carrot">{category}</span>
                    </div>
                  </div>

                  {/* Info Box 2: Price */}
                  <div className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/70 space-y-2 relative overflow-hidden group hover:border-forest/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-carrot" />
                        Invoice Total
                      </span>
                      {extractedData?.fieldsExtracted?.price ? (
                        <span className="px-2 py-0.5 rounded-full bg-kiwi/15 border border-kiwi/30 text-kiwi text-[9px] font-bold">
                          Extracted Price
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-sunshine/30 border border-sunshine text-forest text-[9px] font-bold">
                          Check Amount
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-forest text-base">
                      {price && parseFloat(price) > 0 ? `₹${parseFloat(price).toLocaleString('en-IN')}` : '₹0 (Enter Price)'}
                    </div>
                    <div className="text-[11px] font-semibold text-forest/60">
                      {price && parseFloat(price) > 0 ? 'Verified from receipt amount' : 'Please enter actual price'}
                    </div>
                  </div>

                  {/* Info Box 3: Dates */}
                  <div className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/70 space-y-2 relative overflow-hidden group hover:border-forest/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-kiwi" />
                        Dates & Expiry
                      </span>
                      {extractedData?.fieldsExtracted?.purchaseDate ? (
                        <span className="px-2 py-0.5 rounded-full bg-kiwi/15 border border-kiwi/30 text-kiwi text-[9px] font-bold">
                          Date Detected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-cream-dark text-forest/70 text-[9px] font-bold">
                          Today&apos;s Date
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-forest text-xs space-y-0.5">
                      <div>Purchased: <span className="text-forest/80 font-semibold">{purchaseDate || 'N/A'}</span></div>
                      <div>Expires: <span className="text-kiwi font-bold">{warrantyEndDate || 'N/A'}</span></div>
                    </div>
                    <div className="text-[11px] font-semibold text-forest/60 truncate">
                      {notes.replace('OCR Extracted ', '') || '1 Year Coverage'}
                    </div>
                  </div>

                  {/* Info Box 4: Vendor & Identifiers */}
                  <div className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/70 space-y-2 relative overflow-hidden group hover:border-forest/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-forest" />
                        Vendor & Ref
                      </span>
                      {extractedData?.fieldsExtracted?.vendor ? (
                        <span className="px-2 py-0.5 rounded-full bg-kiwi/15 border border-kiwi/30 text-kiwi text-[9px] font-bold">
                          Store Detected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-cream-dark text-forest/70 text-[9px] font-bold">
                          Store Review
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-forest text-xs truncate">
                      {vendor || 'Official Store'}
                    </div>
                    <div className="text-[11px] font-semibold text-forest/70 space-y-0.5 truncate">
                      <div>Inv #: {invoiceNumber || 'N/A'}</div>
                      <div>S/N: {serialNumber || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Layout: Left side Document Preview, Right side Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Document File Card & Raw Text */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-3xl border border-cream-dark p-5 shadow-warm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2 flex items-center justify-between">
                      <span>Scanned Document</span>
                      <Eye className="w-4 h-4 text-forest/60" />
                    </h3>

                    <div className="bg-cream-light/80 rounded-2xl border border-cream-dark/60 p-4 flex flex-col items-center text-center justify-center min-h-[180px]">
                      {imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="Receipt Document Preview"
                          className="max-h-56 rounded-xl object-contain shadow-sm border border-cream-dark"
                        />
                      ) : (
                        <div className="space-y-2 py-6">
                          <div className="w-16 h-16 rounded-2xl bg-forest text-sunshine mx-auto flex items-center justify-center shadow-sm">
                            <FileText className="w-8 h-8" />
                          </div>
                          <p className="text-xs font-bold text-forest">{selectedFile?.name}</p>
                          <p className="text-[11px] text-forest/60">PDF Invoice Document</p>
                        </div>
                      )}
                    </div>

                    {/* Scanned Raw Text Accordion */}
                    {extractedData?.rawText && (
                      <div className="bg-cream-light/60 rounded-2xl border border-cream-dark/60 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowRawText(!showRawText)}
                          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-forest hover:bg-cream-dark/30 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-carrot" />
                            Scanned Raw Text ({extractedData.rawText.length} chars)
                          </span>
                          {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showRawText && (
                          <div className="p-3 border-t border-cream-dark/60 bg-white">
                            <pre className="text-[11px] font-mono text-forest/80 bg-cream-light/40 p-3 rounded-xl border border-cream-dark/40 max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                              {extractedData.rawText}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Editable Form Pre-populated by OCR */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
                    {errors.form && (
                      <div className="p-3 rounded-xl bg-tomato-light border border-tomato/30 text-tomato text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errors.form}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveWarranty} className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between border-b border-cream-dark/60 pb-2 mb-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-forest">
                            Product Details
                          </h3>
                          <span className="text-[11px] font-bold text-forest/60">
                            Pre-filled from scanned document
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-forest/90">Product Name</span>
                              {extractedData?.fieldsExtracted?.productName ? (
                                <span className="text-[10px] font-bold text-kiwi flex items-center gap-1">✨ Auto-Extracted</span>
                              ) : (
                                <span className="text-[10px] font-semibold text-forest/60">Filename Derived</span>
                              )}
                            </div>
                            <Input
                              value={productName}
                              onChange={(e) => setProductName(e.target.value)}
                              error={errors.productName}
                              required
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-forest/90">Brand / Manufacturer</span>
                              {extractedData?.fieldsExtracted?.brand ? (
                                <span className="text-[10px] font-bold text-kiwi flex items-center gap-1">✨ Auto-Extracted</span>
                              ) : (
                                <span className="text-[10px] font-semibold text-forest/60">Default</span>
                              )}
                            </div>
                            <Input
                              value={brand}
                              onChange={(e) => setBrand(e.target.value)}
                              error={errors.brand}
                              required
                            />
                          </div>

                          <Select
                            label="Category"
                            options={categoryOptions}
                            value={category}
                            onChange={(e) => setCategory(e.target.value as ProductCategory)}
                            required
                          />

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-forest/90">Purchase Price (₹ INR)</span>
                              {extractedData?.fieldsExtracted?.price ? (
                                <span className="text-[10px] font-bold text-kiwi flex items-center gap-1">✨ Auto-Extracted</span>
                              ) : (
                                <span className="text-[10px] font-bold text-carrot flex items-center gap-1">✏️ Enter Amount</span>
                              )}
                            </div>
                            <Input
                              type="number"
                              placeholder="e.g. 14999"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              error={errors.price}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between border-b border-cream-dark/60 pb-2 mb-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-forest">
                            Extracted Dates & Identifiers
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-forest/90">Purchase Date</span>
                              {extractedData?.fieldsExtracted?.purchaseDate ? (
                                <span className="text-[10px] font-bold text-kiwi">✨ Auto-Extracted</span>
                              ) : null}
                            </div>
                            <Input
                              type="date"
                              value={purchaseDate}
                              onChange={(e) => setPurchaseDate(e.target.value)}
                              error={errors.purchaseDate}
                              required
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-forest/90">Serial Number</span>
                              {extractedData?.fieldsExtracted?.serialNumber ? (
                                <span className="text-[10px] font-bold text-kiwi">✨ Auto-Extracted</span>
                              ) : null}
                            </div>
                            <Input
                              placeholder="e.g. SN-8947201"
                              value={serialNumber}
                              onChange={(e) => setSerialNumber(e.target.value)}
                            />
                          </div>

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
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-forest/90">Store / Vendor</span>
                              {extractedData?.fieldsExtracted?.vendor ? (
                                <span className="text-[10px] font-bold text-kiwi">✨ Auto-Extracted</span>
                              ) : null}
                            </div>
                            <Input
                              placeholder="e.g. Amazon India, Croma"
                              value={vendor}
                              onChange={(e) => setVendor(e.target.value)}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-forest/90">Invoice Number</span>
                              {extractedData?.fieldsExtracted?.invoiceNumber ? (
                                <span className="text-[10px] font-bold text-kiwi">✨ Auto-Extracted</span>
                              ) : null}
                            </div>
                            <Input
                              placeholder="e.g. INV-2024-901"
                              value={invoiceNumber}
                              onChange={(e) => setInvoiceNumber(e.target.value)}
                            />
                          </div>
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
                          className="w-full px-3.5 py-2.5 bg-cream-light/60 border border-cream-dark/80 rounded-xl text-forest text-sm focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-dark/60">
                        <Button variant="ghost" type="button" onClick={handleReset}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="lg" type="submit" isLoading={isSaving}>
                          Confirm & Save Warranty
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
