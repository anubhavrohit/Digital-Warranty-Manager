'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Zap,
  FileText,
  Clock,
  Search,
  PieChart,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Smartphone,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Sunshine decorative background shapes */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-sunshine/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-carrot/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sunshine-light border border-sunshine/60 text-forest text-xs font-bold">
                <Sparkles className="w-4 h-4 text-carrot" />
                <span>Smart Digital Warranty Vault</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest tracking-tight leading-tight">
                Never Lose Track of a <span className="text-carrot">Warranty</span> Again.
              </h1>

              <p className="text-lg sm:text-xl text-forest/80 max-w-2xl leading-relaxed font-medium">
                Keep your products, purchase details, bills and warranty dates organized in one simple, secure place with automated OCR extraction.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/register">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg">
                    Explore Features
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-cream-dark/60 flex items-center gap-6 text-xs font-semibold text-forest/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-kiwi" />
                  Instant OCR Bill Reading
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-kiwi" />
                  30-Day Expiry Alerts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-kiwi" />
                  100% Free SaaS
                </span>
              </div>
            </div>

            {/* Right Product Card Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative sunshine backdrop */}
                <div className="absolute -inset-2 bg-gradient-to-r from-sunshine via-carrot to-kiwi rounded-3xl opacity-30 blur-lg" />
                
                {/* Visual Mockup Card */}
                <div className="relative bg-white rounded-3xl border border-cream-dark p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-cream-dark/60">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-tomato" />
                      <div className="w-3 h-3 rounded-full bg-sunshine" />
                      <div className="w-3 h-3 rounded-full bg-kiwi" />
                    </div>
                    <span className="text-xs font-bold text-forest/60">WarrantyVault Dashboard</span>
                  </div>

                  {/* Sample Mockup Items */}
                  <div className="space-y-3">
                    <div className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest text-sunshine font-bold text-xs flex items-center justify-center">
                          ASUS
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-forest">ASUS TUF Gaming F15</h4>
                          <p className="text-xs text-forest/60">Purchased: Oct 2023 &bull; ₹78,990</p>
                        </div>
                      </div>
                      <Badge variant="sunshine" size="sm">
                        Expires in 15d
                      </Badge>
                    </div>

                    <div className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-kiwi text-white font-bold text-xs flex items-center justify-center">
                          APPL
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-forest">iPhone 15 Pro Max</h4>
                          <p className="text-xs text-forest/60">Purchased: Jan 2024 &bull; ₹1,34,900</p>
                        </div>
                      </div>
                      <Badge variant="kiwi" size="sm">
                        ACTIVE
                      </Badge>
                    </div>

                    <div className="bg-sunshine-light p-3.5 rounded-2xl border border-sunshine/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-forest" />
                        <span className="font-bold text-forest">Smart Expiry Engine</span>
                      </div>
                      <span className="font-extrabold text-carrot">Auto Notified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white border-y border-cream-dark/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-carrot">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest mt-2">
              Why Physical Receipts & Spreadsheets Fail You
            </h2>
            <p className="text-forest/70 mt-3 text-base">
              Managing warranties manually leads to lost money when products break after unmonitored expiration dates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-cream-light/50 p-6 rounded-2xl border border-cream-dark/60 text-left hover:border-forest/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-tomato-light text-tomato flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-forest mb-1">Lost Paper Bills</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Thermal receipts fade over time or vanish when you urgently need proof of purchase for repair.
              </p>
            </div>

            <div className="bg-cream-light/50 p-6 rounded-2xl border border-cream-dark/60 text-left hover:border-forest/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sunshine-light text-forest flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-forest mb-1">Forgotten Expiry Dates</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Missing warranty claims by just a few days forces out-of-pocket replacement costs.
              </p>
            </div>

            <div className="bg-cream-light/50 p-6 rounded-2xl border border-cream-dark/60 text-left hover:border-forest/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-carrot-light text-carrot flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-forest mb-1">Hidden Serial Numbers</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Scrambling to find serial numbers under mounted appliances or inside packaging during service calls.
              </p>
            </div>

            <div className="bg-cream-light/50 p-6 rounded-2xl border border-cream-dark/60 text-left hover:border-forest/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-forest-light text-forest flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-forest mb-1">Scattered Information</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Purchases split across emails, store accounts, physical folders, and mobile photo galleries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-carrot">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest mt-2">
              Everything You Need for Digital Peace of Mind
            </h2>
            <p className="text-forest/70 mt-3 text-base">
              A comprehensive toolkit designed specifically for personal and household warranty management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-cream-dark/70 shadow-warm hover:shadow-warm-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-forest text-sunshine flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-forest mb-2">Warranty Tracking</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Store product category, brand, purchase date, serial number, and store invoice in one structured dashboard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-dark/70 shadow-warm hover:shadow-warm-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-carrot text-white flex items-center justify-center mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-forest mb-2">Bill Image Upload</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Drag and drop physical bills, invoices, receipts, or PDF files. Documents are archived safely in cloud storage.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-dark/70 shadow-warm hover:shadow-warm-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sunshine text-forest flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-forest mb-2">Smart Data Extraction</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Automated OCR scans bill images to extract product name, price, date, serial number, and vendor instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-dark/70 shadow-warm hover:shadow-warm-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-kiwi text-white flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-forest mb-2">Expiry Monitoring</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Real-time status indicators (Active, Expiring Soon, Expired) with automated 30-day countdown alerts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-dark/70 shadow-warm hover:shadow-warm-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-forest-light text-forest flex items-center justify-center mb-5">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-forest mb-2">Instant Product Search</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Filter by category, active status, or sort by purchase date and price with real-time responsive search.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-dark/70 shadow-warm hover:shadow-warm-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sunshine-light text-forest flex items-center justify-center mb-5">
                <PieChart className="w-6 h-6 text-carrot" />
              </div>
              <h3 className="text-lg font-bold text-forest mb-2">Expense Overview</h3>
              <p className="text-xs text-forest/70 leading-relaxed">
                Visualize total purchase value across categories like Electronics, Appliances, Laptops, and Mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-cream-dark/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-carrot">
              Simple Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest mt-2">
              How WarrantyVault Works
            </h2>
            <p className="text-forest/70 mt-3 text-base">
              Organize your warranties in four quick steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-cream-light/60 p-6 rounded-3xl border border-cream-dark/60 relative text-left">
              <span className="w-10 h-10 rounded-xl bg-forest text-sunshine font-extrabold text-lg flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-base font-bold text-forest mb-1">Add Product</h3>
              <p className="text-xs text-forest/70">
                Enter your product name, category, brand, and purchase details into the system.
              </p>
            </div>

            <div className="bg-cream-light/60 p-6 rounded-3xl border border-cream-dark/60 relative text-left">
              <span className="w-10 h-10 rounded-xl bg-carrot text-white font-extrabold text-lg flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-base font-bold text-forest mb-1">Upload Bill</h3>
              <p className="text-xs text-forest/70">
                Snap or drag-and-drop a photo of your invoice or digital purchase receipt.
              </p>
            </div>

            <div className="bg-cream-light/60 p-6 rounded-3xl border border-cream-dark/60 relative text-left">
              <span className="w-10 h-10 rounded-xl bg-sunshine text-forest font-extrabold text-lg flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-base font-bold text-forest mb-1">Extract Information</h3>
              <p className="text-xs text-forest/70">
                AI/OCR reads the bill text and populates fields for your review before saving.
              </p>
            </div>

            <div className="bg-cream-light/60 p-6 rounded-3xl border border-cream-dark/60 relative text-left">
              <span className="w-10 h-10 rounded-xl bg-kiwi text-white font-extrabold text-lg flex items-center justify-center mb-4">
                4
              </span>
              <h3 className="text-base font-bold text-forest mb-1">Track Warranty</h3>
              <p className="text-xs text-forest/70">
                Monitor countdown timers and receive alerts before coverage expires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-forest-dark/40 border border-sunshine/20">
              <h3 className="text-4xl font-extrabold text-sunshine">100%</h3>
              <p className="text-sm font-semibold text-cream-light mt-1">Digital Records</p>
              <p className="text-xs text-cream-light/60 mt-1">Zero lost paper receipts</p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-dark/40 border border-sunshine/20">
              <h3 className="text-4xl font-extrabold text-sunshine">24/7</h3>
              <p className="text-sm font-semibold text-cream-light mt-1">Warranty Access</p>
              <p className="text-xs text-cream-light/60 mt-1">Instant serial number lookup anywhere</p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-dark/40 border border-sunshine/20">
              <h3 className="text-4xl font-extrabold text-sunshine">1</h3>
              <p className="text-sm font-semibold text-cream-light mt-1">Central Dashboard</p>
              <p className="text-xs text-cream-light/60 mt-1">All personal electronics & appliances</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cream relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-10 md:p-14 border border-cream-dark shadow-2xl space-y-6 relative">
            <div className="w-16 h-16 rounded-3xl bg-carrot text-white flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest">
              Start organizing your warranties today.
            </h2>

            <p className="text-base text-forest/70 max-w-xl mx-auto">
              Join thousands of users protecting their purchase investments with simple digital warranty tracking.
            </p>

            <div className="pt-2 flex justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="mt-auto bg-forest text-cream-light py-12 border-t border-forest-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-forest-muted">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sunshine text-forest flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Warranty<span className="text-sunshine">Vault</span>
              </span>
            </div>

            <p className="text-xs text-cream-light/70 text-center md:text-left">
              College Mini-Project SaaS &bull; Digital Product & Warranty Management System
            </p>

            <div className="flex items-center gap-6 text-xs text-cream-light/80">
              <Link href="/#home" className="hover:text-sunshine transition-colors">
                Home
              </Link>
              <Link href="/#features" className="hover:text-sunshine transition-colors">
                Features
              </Link>
              <Link href="/login" className="hover:text-sunshine transition-colors">
                Login
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-cream-light/60">
            <p>&copy; {new Date().getFullYear()} WarrantyVault. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Designed with Light Mode Warm Palette</span>
              <span className="w-2 h-2 rounded-full bg-sunshine inline-block" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
