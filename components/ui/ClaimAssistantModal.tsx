'use client';

import React, { useState } from 'react';
import { WarrantyItem } from '@/types';
import { getBrandSupportInfo, generateClaimLetter, GeneratedClaimLetter } from '@/lib/brand-support';
import {
  ShieldAlert,
  Send,
  MessageSquare,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  Clock,
  Building,
} from 'lucide-react';
import { Button } from './Button';

interface ClaimAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranty: WarrantyItem;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const DEFECT_CATEGORIES = [
  'Hardware Malfunction / Component Failure',
  'Display / Screen / Pixel Defect',
  'Battery / Power Supply / Charging Issue',
  'Audio / Speaker / Microphone Defect',
  'Connectivity / Bluetooth / Wi-Fi Glitch',
  'Heating / Cooling Fan Noise',
  'Cosmetic / Assembly Defect upon Unboxing',
  'Other Operational Defect',
];

export const ClaimAssistantModal: React.FC<ClaimAssistantModalProps> = ({
  isOpen,
  onClose,
  warranty,
  customerName = 'Product Owner',
  customerEmail = '',
  customerPhone = '',
}) => {
  const [defectCategory, setDefectCategory] = useState(DEFECT_CATEGORIES[0]);
  const [defectDescription, setDefectDescription] = useState('');
  const [generated, setGenerated] = useState<GeneratedClaimLetter | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'result'>('form');

  if (!isOpen) return null;

  const brandInfo = getBrandSupportInfo(warranty.brand);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = generateClaimLetter({
      productName: warranty.productName,
      brand: warranty.brand,
      category: warranty.category,
      purchaseDate: warranty.purchaseDate,
      warrantyEndDate: warranty.warrantyEndDate,
      warrantyStatus: 'ACTIVE',
      serialNumber: warranty.serialNumber,
      invoiceNumber: warranty.invoiceNumber,
      store: warranty.store,
      customerName,
      customerEmail,
      customerPhone,
      defectCategory,
      defectDescription: defectDescription.trim() || 'Product is not functioning according to standard specifications.',
    });
    setGenerated(result);
    setActiveTab('result');
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(`${generated.subject}\n\n${generated.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#121417] rounded-3xl border border-cream-dark dark:border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cream-dark/60 dark:border-white/10 flex items-center justify-between bg-cream-light/40 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-carrot/15 dark:bg-carrot/20 text-carrot flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-forest dark:text-cream flex items-center gap-2">
                AI Warranty Claim Assistant
              </h2>
              <p className="text-xs text-forest/70 dark:text-cream/70">
                Official support channels & legal claim letter generator for <strong className="text-forest dark:text-white">{warranty.brand}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-forest/60 hover:text-forest hover:bg-cream-light dark:text-white/60 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Directory Quick Glance Banner */}
        <div className="bg-forest dark:bg-[#161a1e] text-cream p-4 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-forest-light/20">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-sunshine shrink-0" />
            <span>
              <strong>{brandInfo?.name || warranty.brand}</strong>
              {brandInfo?.hours && <span className="opacity-70 ml-2">({brandInfo.hours})</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {brandInfo?.phone && (
              <a
                href={`tel:${brandInfo.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-sunshine transition-colors"
              >
                <Phone className="w-3 h-3" />
                {brandInfo.phone}
              </a>
            )}
            {brandInfo?.portalUrl && (
              <a
                href={brandInfo.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-cream transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Support Portal
              </a>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'form' ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 dark:text-cream/70 mb-1.5">
                  1. Select Issue / Defect Category
                </label>
                <select
                  value={defectCategory}
                  onChange={(e) => setDefectCategory(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-cream-dark dark:border-white/20 bg-white dark:bg-[#1b1f24] text-forest dark:text-cream p-3 focus:outline-none focus:ring-2 focus:ring-carrot"
                >
                  {DEFECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 dark:text-cream/70 mb-1.5">
                  2. Describe the Problem in Your Words
                </label>
                <textarea
                  rows={4}
                  value={defectDescription}
                  onChange={(e) => setDefectDescription(e.target.value)}
                  placeholder="e.g. The device suddenly stopped powering on after 2 weeks of normal use. The charger indicator does not glow..."
                  className="w-full text-xs rounded-xl border border-cream-dark dark:border-white/20 bg-white dark:bg-[#1b1f24] text-forest dark:text-cream p-3 focus:outline-none focus:ring-2 focus:ring-carrot"
                />
              </div>

              {/* Product Reference snapshot */}
              <div className="bg-cream-light/50 dark:bg-white/5 rounded-2xl p-4 border border-cream-dark/60 dark:border-white/10 text-xs space-y-1.5">
                <span className="font-bold text-forest dark:text-cream block mb-1">
                  Claim Reference Data (Auto-injected into claim letter):
                </span>
                <div className="grid grid-cols-2 gap-2 text-forest/75 dark:text-cream/70">
                  <div>Product: <strong className="text-forest dark:text-white">{warranty.productName}</strong></div>
                  <div>Serial #: <strong className="text-forest dark:text-white font-mono">{warranty.serialNumber || 'N/A'}</strong></div>
                  <div>Invoice #: <strong className="text-forest dark:text-white">{warranty.invoiceNumber || 'N/A'}</strong></div>
                  <div>Purchase Date: <strong className="text-forest dark:text-white">{warranty.purchaseDate}</strong></div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button variant="outline" size="sm" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" icon={Sparkles}>
                  Generate Official Claim Letter
                </Button>
              </div>
            </form>
          ) : (
            generated && (
              <div className="space-y-4">
                {/* Action Button Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={generated.mailtoUrl}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-carrot hover:bg-carrot-dark text-white font-bold text-xs shadow-md transition-all text-center"
                  >
                    <Send className="w-4 h-4" />
                    Send via Email (Gmail / Mail)
                  </a>

                  {generated.whatsappUrl ? (
                    <a
                      href={generated.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-md transition-all text-center"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat on WhatsApp Support
                    </a>
                  ) : generated.supportPhone ? (
                    <a
                      href={`tel:${generated.supportPhone.replace(/\s+/g, '')}`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-sunshine font-bold text-xs shadow-md transition-all text-center"
                    >
                      <Phone className="w-4 h-4" />
                      Call Official Helpline
                    </a>
                  ) : null}
                </div>

                {/* Copy & Edit Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setActiveTab('form')}
                    className="text-xs font-bold text-forest/70 dark:text-cream/70 hover:text-carrot flex items-center gap-1"
                  >
                    &larr; Edit Details
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied to Clipboard!' : 'Copy Full Letter'}
                  </Button>
                </div>

                {/* Letter Content Preview */}
                <div className="border border-cream-dark dark:border-white/10 rounded-2xl p-4 bg-cream-light/30 dark:bg-white/5 space-y-3 font-mono text-[11px] leading-relaxed text-forest dark:text-cream">
                  <div className="font-bold text-xs border-b border-cream-dark/50 dark:border-white/10 pb-2 text-carrot">
                    Subject: {generated.subject}
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-forest/90 dark:text-cream/90 max-h-64 overflow-y-auto pr-2">
                    {generated.body}
                  </pre>
                </div>

                {brandInfo?.claimTurnaround && (
                  <div className="flex items-center gap-2 text-[11px] text-forest/60 dark:text-cream/60 bg-cream-light/60 dark:bg-white/5 p-3 rounded-xl">
                    <Clock className="w-4 h-4 text-carrot shrink-0" />
                    <span>
                      Estimated Brand Turnaround Time: <strong>{brandInfo.claimTurnaround}</strong>
                    </span>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
