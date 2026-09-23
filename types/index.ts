export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export type ProductCategory = 
  | 'Electronics'
  | 'Appliances'
  | 'Mobile'
  | 'Laptop'
  | 'Gaming'
  | 'Furniture'
  | 'Vehicle'
  | 'Home'
  | 'Other';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface WarrantyItem {
  id: string;
  userId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  purchaseDate: string; // YYYY-MM-DD
  warrantyStartDate: string; // YYYY-MM-DD
  warrantyEndDate: string; // YYYY-MM-DD
  purchasePrice: number;
  store: string;
  serialNumber: string;
  invoiceNumber: string;
  notes?: string;
  productImageUrl?: string;
  invoiceImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  warrantyId?: string;
  productName?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface OCRResult {
  productName: string;
  brand: string;
  serialNumber: string;
  purchaseDate: string;
  price: number;
  invoiceNumber: string;
  vendor: string;
  warrantyPeriod: string; // e.g. "12 Months" or "2 Years"
  rawText?: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeWarranties: number;
  expiringSoon: number;
  expired: number;
  totalPurchaseValue: number;
}
