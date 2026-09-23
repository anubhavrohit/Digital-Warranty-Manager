'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '@/lib/auth-context';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-cream-dark/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-forest text-sunshine flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-forest tracking-tight block leading-none">
              Warranty<span className="text-carrot">Vault</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-forest/60 uppercase block">
              Digital Manager
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#home" className="text-sm font-semibold text-forest hover:text-carrot transition-colors">
            Home
          </Link>
          <Link href="/#features" className="text-sm font-semibold text-forest hover:text-carrot transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-semibold text-forest hover:text-carrot transition-colors">
            How It Works
          </Link>
          <Link href="/#about" className="text-sm font-semibold text-forest hover:text-carrot transition-colors">
            About
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="md">
                Go to Dashboard &rarr;
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="md">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="md">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-forest hover:bg-cream-dark/40"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream border-b border-cream-dark p-4 space-y-3 animate-fade-in">
          <Link
            href="/#home"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-forest hover:bg-cream-dark/50"
          >
            Home
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-forest hover:bg-cream-dark/50"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-forest hover:bg-cream-dark/50"
          >
            How It Works
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-forest hover:bg-cream-dark/50"
          >
            About
          </Link>

          <div className="pt-3 border-t border-cream-dark/60 flex flex-col gap-2">
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
