'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  extractWarrantyDataFromImage,
  performGenericOCR,
  inferCategoryFromProduct,
} from '@/lib/ocr-service';
import { OCRResult, GenericOCRResult, ProductCategory } from '@/types';
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
  Search,
  Scan,
  Copy,
  Check,
  Layers,
  Phone,
  Hash,
  Building,
} from 'lucide-react';

export default function UploadBillPage() {
  const { user, loading, addWarranty, addDocument } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Workflow steps: 'upload' -> 'scanning' -> 'review'
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [ocrMode, setOcrMode] = useState<'warranty' | 'generic'>('warranty');

  // Warranty Mode State
  const [extractedData, setExtractedData] = useState<OCRResult | null>(null);

  // Generic OCR Mode State
  const [genericData, setGenericData] = useState<GenericOCRResult | null>(null);
  const [genericSearchQuery, setGenericSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('Initializing OCR...');
  const [showRawText, setShowRawText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Form Fields (Pre-populated by Warranty OCR)
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
      setImagePreviewUrl(null);
    }
  };

  // 1. Warranty OCR Mode Trigger
  const handleStartWarrantyOCR = async () => {
    if (!selectedFile) return;

    try {
      setOcrMode('warranty');
      setStep('scanning');
      setScanProgress(10);
      setScanStatusMessage('Loading Warranty OCR engine...');

      const result = await extractWarrantyDataFromImage(selectedFile, (msg, prog) => {
        setScanStatusMessage(msg);
        setScanProgress(Math.round(prog * 100));
      });

      setExtractedData(result);

      // Pre-fill editable form fields
      setProductName(result.productName);
      setBrand(result.brand);
      setCategory(inferCategoryFromProduct(result.productName, result.brand));
      setSerialNumber(result.serialNumber);
      setPurchaseDate(result.purchaseDate);
      setWarrantyStartDate(result.purchaseDate);

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

  // 2. Generic OCR Deep Scan Mode Trigger (Separate Button)
  const handleStartGenericOCR = async () => {
    if (!selectedFile) return;

    try {
      setOcrMode('generic');
      setStep('scanning');
      setScanProgress(10);
      setScanStatusMessage('Starting Generic OCR & Entity Classification...');

      const result = await performGenericOCR(selectedFile, (msg, prog) => {
        setScanStatusMessage(msg);
        setScanProgress(Math.round(prog * 100));
      });

      setGenericData(result);
      setStep('review');
    } catch (err) {
      console.error('Generic OCR Error:', err);
      setStep('upload');
      setErrors({ form: 'Generic OCR scan failed. Please try again with another file.' });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setExtractedData(null);
    setGenericData(null);
    setStep('upload');
    setScanProgress(0);
    setScanStatusMessage('');
    setErrors({});
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
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
              <span>Smart AI & Generic OCR Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              Upload Document & OCR Inspector
            </h1>
            <p className="text-xs sm:text-sm text-forest/70">
              Choose between <strong>Warranty Bill Extractor</strong> to auto-fill warranty forms or <strong>Generic OCR Deep Scan</strong> to inspect all entity types (prices, dates, IDs, contacts).
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
                1. Upload Document
              </div>
              <div
                className={`py-2 rounded-xl transition-colors ${
                  step === 'scanning'
                    ? 'bg-carrot text-white shadow-sm'
                    : 'bg-cream-light text-forest/70'
                }`}
              >
                2. Run OCR Mode
              </div>
              <div
                className={`py-2 rounded-xl transition-colors ${
                  step === 'review'
                    ? ocrMode === 'generic' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-kiwi text-white shadow-sm'
                    : 'bg-cream-light text-forest/70'
                }`}
              >
                3. {ocrMode === 'generic' ? 'Generic OCR Inspection' : 'Warranty Confirmation'}
              </div>
            </div>
          </div>

          {/* STEP 1: Upload Area + TWO SEPARATE BUTTONS */}
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
                <div className="bg-white p-6 rounded-3xl border border-cream-dark shadow-warm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest/80 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-carrot" />
                      Select Action Mode for &quot;{selectedFile.name}&quot;
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-xs font-bold text-forest/60 hover:text-tomato transition-colors"
                    >
                      Clear File
                    </button>
                  </div>

                  {/* TWO SEPARATE BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* BUTTON 1: Extract Warranty Data */}
                    <button
                      onClick={handleStartWarrantyOCR}
                      className="p-5 rounded-2xl bg-forest hover:bg-forest/90 text-white font-bold text-left shadow-md hover:shadow-lg transition-all group flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-2.5 rounded-xl bg-sunshine text-forest font-bold">
                          <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sunshine/20 text-sunshine border border-sunshine/40">
                          Warranty Form
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-sunshine group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                          Extract Warranty Data
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="text-xs text-white/80 font-normal mt-1">
                          Auto-extracts product name, serial number, prices, and warranty expiration dates into vault form.
                        </p>
                      </div>
                    </button>

                    {/* BUTTON 2: Generic OCR & Deep Scan */}
                    <button
                      onClick={handleStartGenericOCR}
                      className="p-5 rounded-2xl bg-gradient-to-br from-indigo-700 to-purple-800 hover:from-indigo-800 hover:to-purple-900 text-white font-bold text-left shadow-md hover:shadow-lg transition-all group flex flex-col justify-between space-y-3 border border-indigo-400/30"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-2.5 rounded-xl bg-white/20 text-white font-bold backdrop-blur-sm">
                          <Scan className="w-5 h-5 text-yellow-300" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-yellow-200 border border-white/30">
                          Generic OCR Mode
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-yellow-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                          Generic OCR & Deep Scan
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="text-xs text-white/80 font-normal mt-1">
                          Scans full raw optical text, classifies document type, and groups all prices, dates, IDs, and contacts.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Scanning Loading Animation */}
          {step === 'scanning' && (
            <div className="bg-white rounded-3xl border border-cream-dark p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-2xl mx-auto">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-4 border-cream-dark ${ocrMode === 'generic' ? 'border-t-indigo-600' : 'border-t-carrot'} animate-spin`} />
                {ocrMode === 'generic' ? (
                  <Scan className="w-10 h-10 text-indigo-600 animate-pulse" />
                ) : (
                  <Zap className="w-10 h-10 text-carrot animate-pulse" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-forest">
                  {ocrMode === 'generic' ? 'Running Generic OCR & Deep Scan...' : 'Scanning Bill Document...'}
                </h3>
                <p className="text-xs font-semibold text-forest/70 mt-1 max-w-sm mx-auto min-h-[20px]">
                  {scanStatusMessage}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-cream-dark/40 rounded-full h-3 overflow-hidden p-0.5 border border-cream-dark">
                  <div
                    className={`${ocrMode === 'generic' ? 'bg-indigo-600' : 'bg-carrot'} h-full rounded-full transition-all duration-300 ease-out`}
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

          {/* STEP 3 - MODE A: GENERIC OCR & DEEP SCAN INSPECTOR */}
          {step === 'review' && ocrMode === 'generic' && genericData && (
            <div className="space-y-6">
              {/* Top Document Classification Hero Info Box */}
              <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-forest text-white p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-yellow-300 shrink-0 border border-white/20">
                      <Scan className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-widest text-yellow-300">
                          Generic OCR Content Inspection
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-indigo-950 font-extrabold text-[11px] shadow-sm">
                          📑 Classified: {genericData.documentType}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1 truncate max-w-md sm:max-w-xl">
                        {selectedFile?.name || 'Scanned Document'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-white hover:bg-white/10">
                      Reset
                    </Button>
                    <button
                      onClick={handleStartWarrantyOCR}
                      className="px-4 py-2 rounded-xl bg-sunshine hover:bg-sunshine/90 text-forest font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 text-carrot" />
                      Convert to Warranty Record
                    </button>
                  </div>
                </div>

                {/* Document Metadata Summary Line */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-white/60 font-medium text-[10px] uppercase">Document Type</div>
                    <div className="font-extrabold text-yellow-300 mt-0.5">{genericData.documentType}</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-white/60 font-medium text-[10px] uppercase">Match Confidence</div>
                    <div className="font-extrabold text-kiwi mt-0.5">🎯 {genericData.classification.confidence}% Match</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-white/60 font-medium text-[10px] uppercase">Characters & Words</div>
                    <div className="font-bold text-white mt-0.5">{genericData.charCount.toLocaleString()} chars &bull; {genericData.wordCount} words</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-white/60 font-medium text-[10px] uppercase">Extraction Method</div>
                    <div className="font-semibold text-white/90 text-[11px] truncate mt-0.5">{genericData.extractionMethod}</div>
                  </div>
                </div>

                {/* Classification Analysis Reasons & Indicators */}
                {genericData.classification.indicators.length > 0 && (
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/15 space-y-2">
                    <div className="text-xs font-bold text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Classification Analysis: Why this was identified as {genericData.documentType}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {genericData.classification.indicators.map((ind, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-white/20 border border-white/30 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-yellow-300" />
                          <span>{ind}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CATEGORIZED ENTITY CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Prices & Financial Data */}
                <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-forest flex items-center gap-2">
                        <Tag className="w-4 h-4 text-carrot" />
                        Financial Amounts ({genericData.entities.prices.length})
                      </span>
                    </div>
                    {genericData.entities.prices.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {genericData.entities.prices.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => copyToClipboard(p, `price-${idx}`)}
                            className="px-3 py-1.5 rounded-xl bg-sunshine-light border border-sunshine text-forest font-bold text-xs hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{p}</span>
                            {copiedIndex === `price-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-kiwi" />
                            ) : (
                              <Copy className="w-3 h-3 text-forest/60" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-forest/60 italic">No price/currency formats detected.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-forest/50 border-t border-cream-dark/40 pt-2">Click any chip to copy value to clipboard.</p>
                </div>

                {/* 2. Dates Identified */}
                <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-forest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-kiwi" />
                        Extracted Dates ({genericData.entities.dates.length})
                      </span>
                    </div>
                    {genericData.entities.dates.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {genericData.entities.dates.map((d, idx) => (
                          <button
                            key={idx}
                            onClick={() => copyToClipboard(d, `date-${idx}`)}
                            className="px-3 py-1.5 rounded-xl bg-kiwi/10 border border-kiwi/30 text-kiwi font-bold text-xs hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{d}</span>
                            {copiedIndex === `date-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-kiwi" />
                            ) : (
                              <Copy className="w-3 h-3 text-kiwi/70" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-forest/60 italic">No date strings recognized.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-forest/50 border-t border-cream-dark/40 pt-2">Click to copy date string.</p>
                </div>

                {/* 3. Reference Identifiers (Invoice #, Serial #, GSTIN) */}
                <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-forest flex items-center gap-2">
                        <Hash className="w-4 h-4 text-indigo-600" />
                        Identifiers & Codes ({genericData.entities.identifiers.length})
                      </span>
                    </div>
                    {genericData.entities.identifiers.length > 0 ? (
                      <div className="space-y-1.5">
                        {genericData.entities.identifiers.map((idStr, idx) => (
                          <button
                            key={idx}
                            onClick={() => copyToClipboard(idStr, `id-${idx}`)}
                            className="w-full text-left px-3 py-1.5 rounded-xl bg-cream-light border border-cream-dark text-forest font-semibold text-xs hover:bg-cream-dark/40 transition-colors flex items-center justify-between"
                          >
                            <span className="truncate">{idStr}</span>
                            {copiedIndex === `id-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-kiwi shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-forest/60 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-forest/60 italic">No invoice or serial reference IDs detected.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-forest/50 border-t border-cream-dark/40 pt-2">Click identifier line to copy.</p>
                </div>

                {/* 4. Contact Information */}
                <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-forest flex items-center gap-2">
                        <Phone className="w-4 h-4 text-forest" />
                        Contacts & Web ({genericData.entities.contacts.length})
                      </span>
                    </div>
                    {genericData.entities.contacts.length > 0 ? (
                      <div className="space-y-1.5">
                        {genericData.entities.contacts.map((cStr, idx) => (
                          <button
                            key={idx}
                            onClick={() => copyToClipboard(cStr, `contact-${idx}`)}
                            className="w-full text-left px-3 py-1.5 rounded-xl bg-cream-light border border-cream-dark text-forest font-semibold text-xs hover:bg-cream-dark/40 transition-colors flex items-center justify-between"
                          >
                            <span className="truncate">{cStr}</span>
                            {copiedIndex === `contact-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-kiwi shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-forest/60 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-forest/60 italic">No email addresses or phone numbers found.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-forest/50 border-t border-cream-dark/40 pt-2">Click contact line to copy.</p>
                </div>

                {/* 5. Recognized Organizations */}
                <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-forest flex items-center gap-2">
                        <Building className="w-4 h-4 text-forest" />
                        Organizations & Vendors ({genericData.entities.organizations.length})
                      </span>
                    </div>
                    {genericData.entities.organizations.length > 0 ? (
                      <div className="space-y-1.5">
                        {genericData.entities.organizations.map((org, idx) => (
                          <div key={idx} className="px-3 py-2 rounded-xl bg-cream-light/80 border border-cream-dark text-forest font-bold text-xs truncate">
                            🏢 {org}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-forest/60 italic">No store or company names detected.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-forest/50 border-t border-cream-dark/40 pt-2">Identified vendor candidates.</p>
                </div>

                {/* 6. Product Line Items */}
                <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60 mb-3">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-forest flex items-center gap-2">
                        <Package className="w-4 h-4 text-forest" />
                        Line Items ({genericData.entities.products.length})
                      </span>
                    </div>
                    {genericData.entities.products.length > 0 ? (
                      <div className="space-y-1.5">
                        {genericData.entities.products.map((item, idx) => (
                          <div key={idx} className="px-3 py-1.5 rounded-xl bg-cream-light border border-cream-dark text-forest font-semibold text-xs truncate">
                            📦 {item}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-forest/60 italic">No line items recognized.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-forest/50 border-t border-cream-dark/40 pt-2">Recognized item descriptions.</p>
                </div>
              </div>

              {/* Full Raw Text Inspector with Search */}
              <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-dark/60 pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-carrot" />
                    <h3 className="text-base font-extrabold text-forest">Full Raw Text Inspector</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-forest/50 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search inside raw text..."
                        value={genericSearchQuery}
                        onChange={(e) => setGenericSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs bg-cream-light border border-cream-dark rounded-xl text-forest focus:outline-none focus:ring-2 focus:ring-forest w-56"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                      onClick={() => copyToClipboard(genericData.rawText, 'full-raw')}
                    >
                      {copiedIndex === 'full-raw' ? 'Copied!' : 'Copy Text'}
                    </Button>
                  </div>
                </div>

                <pre className="text-xs font-mono text-forest/90 bg-cream-light/60 p-4 rounded-2xl border border-cream-dark max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {genericSearchQuery
                    ? genericData.rawText
                        .split('\n')
                        .filter((line) => line.toLowerCase().includes(genericSearchQuery.toLowerCase()))
                        .join('\n') || 'No matching lines found.'
                    : genericData.rawText}
                </pre>
              </div>
            </div>
          )}

          {/* STEP 3 - MODE B: WARRANTY OCR REVIEW FORM */}
          {step === 'review' && ocrMode === 'warranty' && (
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

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset}>
                      Scan New
                    </Button>
                    <button
                      onClick={handleStartGenericOCR}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Scan className="w-3.5 h-3.5 text-indigo-700" />
                      Switch to Generic OCR
                    </button>
                  </div>
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
