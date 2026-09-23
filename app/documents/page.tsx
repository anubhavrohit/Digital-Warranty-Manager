'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/warranty-utils';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  UploadCloud,
  ExternalLink,
  Trash2,
  Search,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export default function DocumentsPage() {
  const { user, loading, documents, deleteDocument } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const filteredDocs = documents.filter(
    (d) =>
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.productName && d.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteConfirm = async () => {
    if (deleteDocId) {
      await deleteDocument(deleteDocId);
      setDeleteDocId(null);
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

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                Document Repository ({documents.length})
              </h1>
              <p className="text-xs sm:text-sm text-forest/70">
                All uploaded bills, receipts, invoices and warranty cards
              </p>
            </div>

            <Link href="/upload">
              <Button variant="primary" size="sm" icon={UploadCloud}>
                Upload New Document
              </Button>
            </Link>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-3xl border border-cream-dark shadow-warm">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search file name or product..."
                className="w-full pl-10 pr-4 py-2.5 bg-cream-light/60 border border-cream-dark/80 rounded-xl text-xs sm:text-sm text-forest placeholder-forest/40 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-dark p-12 text-center space-y-4">
              <FileText className="w-12 h-12 text-forest/40 mx-auto" />
              <h3 className="text-base font-bold text-forest">No Documents Found</h3>
              <p className="text-xs text-forest/70 max-w-sm mx-auto">
                Upload bills or warranty cards to view them stored in your repository.
              </p>
              <Link href="/upload">
                <Button variant="primary" size="sm" icon={UploadCloud}>
                  Upload First Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-cream-dark/60 p-5 shadow-warm hover:shadow-warm-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-forest text-sunshine flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-forest truncate">{doc.fileName}</h4>
                        <p className="text-xs text-forest/60 truncate">
                          {doc.productName || 'General Document'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-cream-light/60 p-3 rounded-2xl border border-cream-dark/40 space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between text-forest">
                        <span className="text-forest/60">Uploaded:</span>
                        <span className="font-semibold">{formatDate(doc.uploadedAt)}</span>
                      </div>
                      <div className="flex justify-between text-forest">
                        <span className="text-forest/60">File Type:</span>
                        <span className="font-semibold">{doc.fileType}</span>
                      </div>
                      <div className="flex justify-between text-forest">
                        <span className="text-forest/60">Size:</span>
                        <span className="font-semibold">{doc.fileSize || '1 MB'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-cream-dark/50">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs" icon={ExternalLink}>
                        View Document
                      </Button>
                    </a>
                    <button
                      onClick={() => setDeleteDocId(doc.id)}
                      className="p-2 rounded-xl text-tomato hover:bg-tomato-light transition-colors border border-tomato/20"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteDocId)}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        message="Are you sure you want to remove this document from your repository?"
      />
    </div>
  );
}
