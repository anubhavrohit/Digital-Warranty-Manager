'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { WarrantyItem } from '@/types';
import { getWarrantyStatus, getRemainingDays, formatCurrency, formatDate } from '@/lib/warranty-utils';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  Calendar,
  Tag,
  Store,
  Hash,
  FileText,
  Clock,
  Edit3,
  Trash2,
  Upload,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { user, loading, warranties, deleteWarranty, addDocument, documents } = useAuth();
  const router = useRouter();
  const params = useParams();
  const warrantyId = params?.id as string;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // New Document modal state
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');

  const [item, setItem] = useState<WarrantyItem | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (warranties.length > 0 && warrantyId) {
      const found = warranties.find((w) => w.id === warrantyId);
      if (found) {
        setItem(found);
      }
    }
  }, [user, loading, warranties, warrantyId, router]);

  if (loading || (!item && warranties.length === 0)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-forest border-t-carrot rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-forest">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-cream-dark text-center space-y-4 max-w-md">
          <AlertTriangle className="w-12 h-12 text-tomato mx-auto" />
          <h3 className="text-lg font-bold text-forest">Warranty Not Found</h3>
          <p className="text-xs text-forest/70">
            The requested warranty record does not exist or has been deleted.
          </p>
          <Link href="/products">
            <Button variant="primary" size="sm">
              Return to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = getWarrantyStatus(item.warrantyEndDate);
  const remainingText = getRemainingDays(item.warrantyEndDate);

  // Attached files for this product
  const attachedDocs = documents.filter((d) => d.warrantyId === item.id);

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteWarranty(item.id);
      router.push('/products');
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docUrl.trim()) return;

    try {
      setIsUploading(true);
      await addDocument({
        warrantyId: item.id,
        productName: item.productName,
        fileName: docName.trim(),
        fileUrl: docUrl.trim(),
        fileType: 'Document Attachment',
        fileSize: '1.0 MB',
      });
      setUploadModalOpen(false);
      setDocName('');
      setDocUrl('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  // Timeline Progress Percentage Calculation
  const startTs = new Date(item.warrantyStartDate).getTime();
  const endTs = new Date(item.warrantyEndDate).getTime();
  const nowTs = Date.now();
  const totalDuration = endTs - startTs;
  const elapsed = nowTs - startTs;
  const progressPct = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);

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

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Top navigation breadcrumb */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/products">
                <button className="p-2 rounded-xl bg-white border border-cream-dark text-forest hover:bg-cream-light">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest/60">
                  {item.brand} &bull; {item.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                  {item.productName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/products/${item.id}/edit`}>
                <Button variant="outline" size="sm" icon={Edit3}>
                  Edit
                </Button>
              </Link>
              <Button
                variant="tomato"
                size="sm"
                icon={Trash2}
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Product Header Card */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-cream-dark/60">
              <div className="flex items-center gap-5">
                {item.productImageUrl ? (
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-24 h-24 rounded-2xl object-cover border border-cream-dark shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-cream-light border border-cream-dark/60 flex items-center justify-center text-forest font-bold shrink-0">
                    <Tag className="w-10 h-10 text-forest/70" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={status} size="md" />
                    <span className="text-xs font-bold text-forest/60">
                      ID: #{item.id.substring(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-forest">{item.productName}</h2>
                  <p className="text-xs text-forest/70 mt-1">
                    Vendor: <strong className="text-forest">{item.store || 'N/A'}</strong> &bull; Serial:{' '}
                    <strong className="text-forest font-mono">{item.serialNumber || 'N/A'}</strong>
                  </p>
                </div>
              </div>

              {/* Price & Days Remaining Badge */}
              <div className="md:text-right bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/60 shrink-0">
                <p className="text-xs font-bold uppercase tracking-wider text-forest/60">
                  Purchase Price
                </p>
                <h3 className="text-2xl font-extrabold text-forest mt-0.5">
                  {formatCurrency(item.purchasePrice)}
                </h3>
                <div className="mt-2 text-xs font-bold text-carrot flex items-center md:justify-end gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{remainingText}</span>
                </div>
              </div>
            </div>

            {/* Timeline Progress Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-forest">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-forest/70" />
                  Warranty Lifetime Progress
                </span>
                <span className="text-carrot font-extrabold">{progressPct}% Elapsed</span>
              </div>

              <div className="w-full bg-cream-light h-3.5 rounded-full overflow-hidden border border-cream-dark/60 relative">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    status === 'ACTIVE'
                      ? 'bg-kiwi'
                      : status === 'EXPIRING_SOON'
                      ? 'bg-sunshine'
                      : 'bg-tomato'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Timeline Milestones */}
              <div className="grid grid-cols-4 text-[11px] font-semibold text-forest/70 pt-1 text-center sm:text-left">
                <div>
                  <span className="block font-bold text-forest">Purchased</span>
                  <span>{formatDate(item.purchaseDate)}</span>
                </div>
                <div>
                  <span className="block font-bold text-forest">Started</span>
                  <span>{formatDate(item.warrantyStartDate)}</span>
                </div>
                <div>
                  <span className="block font-bold text-forest">Today</span>
                  <span>{formatDate(new Date().toISOString().split('T')[0])}</span>
                </div>
                <div className="sm:text-right">
                  <span className="block font-bold text-forest">Expires</span>
                  <span>{formatDate(item.warrantyEndDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2">
                Product Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-cream-dark/40">
                  <span className="text-forest/70">Brand</span>
                  <span className="font-bold text-forest">{item.brand}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cream-dark/40">
                  <span className="text-forest/70">Category</span>
                  <span className="font-bold text-forest">{item.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cream-dark/40">
                  <span className="text-forest/70">Serial Number</span>
                  <span className="font-bold font-mono text-forest">{item.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cream-dark/40">
                  <span className="text-forest/70">Invoice Number</span>
                  <span className="font-bold text-forest">{item.invoiceNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-forest/70">Store / Vendor</span>
                  <span className="font-bold text-forest">{item.store || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2">
                Warranty Notes & Coverage
              </h3>
              <p className="text-xs text-forest/80 leading-relaxed bg-cream-light/40 p-4 rounded-2xl border border-cream-dark/40 min-h-[120px]">
                {item.notes || 'No specific terms or extended protection notes recorded.'}
              </p>
            </div>
          </div>

          {/* Documents & Receipts Repository Section */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-cream-dark/60">
              <div>
                <h3 className="text-lg font-bold text-forest">Attached Documents & Receipts</h3>
                <p className="text-xs text-forest/60">Bills, invoices, and warranty cards</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Upload}
                onClick={() => setUploadModalOpen(true)}
              >
                Upload Document
              </Button>
            </div>

            {attachedDocs.length === 0 && !item.invoiceImageUrl ? (
              <div className="p-8 text-center bg-cream-light/40 rounded-2xl border border-cream-dark/50 text-xs text-forest/70 space-y-2">
                <FileText className="w-8 h-8 text-forest/40 mx-auto" />
                <p className="font-semibold text-forest">No bill image or document attached yet.</p>
                <p>Click &quot;Upload Document&quot; above to attach your receipt photo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Default invoice image if attached */}
                {item.invoiceImageUrl && (
                  <div className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.invoiceImageUrl}
                        alt="Bill Receipt"
                        className="w-12 h-12 rounded-xl object-cover border border-cream-dark"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-forest">Primary Purchase Bill</h4>
                        <p className="text-[11px] text-forest/60">Uploaded with warranty entry</p>
                      </div>
                    </div>
                    <a
                      href={item.invoiceImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-cream-dark text-forest hover:bg-cream-light"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {attachedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-forest text-sunshine flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate max-w-[160px]">
                        <h4 className="text-xs font-bold text-forest truncate">{doc.fileName}</h4>
                        <p className="text-[11px] text-forest/60">
                          {doc.fileType} &bull; {doc.fileSize || '1 MB'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-cream-dark text-forest hover:bg-cream-light"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Warranty Record"
        message={`Are you sure you want to delete ${item.productName}?`}
        isLoading={isDeleting}
      />

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Attach Document to Product"
      >
        <form onSubmit={handleAddDocument} className="space-y-4 py-2">
          <Input
            label="Document Name"
            placeholder="e.g. Extended_Warranty_Card.pdf"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            required
          />

          <Input
            label="Document File / Image URL"
            placeholder="https://..."
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUploading}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
