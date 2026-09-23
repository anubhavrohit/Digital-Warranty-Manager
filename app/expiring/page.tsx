'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getWarrantyStatus, getRemainingDays, formatDate, formatCurrency } from '@/lib/warranty-utils';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, Eye, Calendar, Tag } from 'lucide-react';

export default function ExpiringSoonPage() {
  const { user, loading, warranties } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const expiringList = warranties.filter((item) => {
    const status = getWarrantyStatus(item.warrantyEndDate);
    return status === 'EXPIRING_SOON';
  });

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
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              Warranties Expiring Soon
            </h1>
            <p className="text-xs sm:text-sm text-forest/70">
              Products with coverage ending in the next 30 days
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-sunshine-light border border-sunshine/80 p-5 rounded-3xl flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sunshine text-forest flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-forest">
                  {expiringList.length} {expiringList.length === 1 ? 'warranty needs' : 'warranties need'} your attention.
                </h3>
                <p className="text-xs text-forest/80">
                  Review warranty terms or contact store vendors for extension options before coverage expires.
                </p>
              </div>
            </div>
          </div>

          {expiringList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-dark p-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-kiwi mx-auto" />
              <h3 className="text-lg font-bold text-forest">No Warranties Expiring Soon</h3>
              <p className="text-xs text-forest/70 max-w-sm mx-auto">
                All your active product coverage is secure for at least another 30 days!
              </p>
              <Link href="/products">
                <Button variant="outline" size="sm">
                  View All Products &rarr;
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiringList.map((item) => {
                const remainingText = getRemainingDays(item.warrantyEndDate);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-sunshine/70 p-6 shadow-warm hover:shadow-warm-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-xs font-bold uppercase text-forest/60">
                          {item.brand} &bull; {item.category}
                        </span>
                        <StatusBadge status="EXPIRING_SOON" size="sm" />
                      </div>

                      <h3 className="text-base font-bold text-forest mb-2">{item.productName}</h3>

                      <div className="bg-sunshine-light p-3.5 rounded-2xl border border-sunshine/50 space-y-1 mb-4 text-xs">
                        <div className="flex justify-between text-forest">
                          <span>Expiry Date:</span>
                          <span className="font-bold">{formatDate(item.warrantyEndDate)}</span>
                        </div>
                        <div className="flex justify-between text-carrot font-bold">
                          <span>Countdown:</span>
                          <span>{remainingText}</span>
                        </div>
                        {item.serialNumber && (
                          <div className="flex justify-between text-forest/70 font-mono text-[11px] pt-1 border-t border-sunshine/40">
                            <span>S/N:</span>
                            <span>{item.serialNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/products/${item.id}`}>
                      <Button variant="sunshine" size="sm" className="w-full text-xs" icon={Eye}>
                        View Details & Claim Info
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
