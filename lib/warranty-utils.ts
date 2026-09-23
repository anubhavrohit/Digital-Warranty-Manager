import { WarrantyItem, WarrantyStatus, DashboardStats } from '@/types';

/**
 * Calculates warranty status based on expiry date string (YYYY-MM-DD)
 */
export function getWarrantyStatus(expiryDateStr: string): WarrantyStatus {
  if (!expiryDateStr) return 'EXPIRED';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  if (isNaN(expiry.getTime())) return 'EXPIRED';

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  } else if (diffDays <= 30) {
    return 'EXPIRING_SOON';
  } else {
    return 'ACTIVE';
  }
}

/**
 * Returns human-readable remaining days string
 */
export function getRemainingDays(expiryDateStr: string): string {
  if (!expiryDateStr) return 'No expiry date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  if (isNaN(expiry.getTime())) return 'Invalid date';

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `Expired ${absDays} ${absDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays <= 30) {
    return `Expires in ${diffDays} days`;
  } else {
    return `${diffDays} days remaining`;
  }
}

/**
 * Formats a number as INR Currency (e.g. ₹1,24,500)
 */
export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats ISO / YYYY-MM-DD date into friendly readable date string (e.g., 15 Oct 2024)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Computes analytics stats for dashboard
 */
export function calculateDashboardStats(warranties: WarrantyItem[]): DashboardStats {
  let activeWarranties = 0;
  let expiringSoon = 0;
  let expired = 0;
  let totalPurchaseValue = 0;

  warranties.forEach((item) => {
    const status = getWarrantyStatus(item.warrantyEndDate);
    if (status === 'ACTIVE') activeWarranties++;
    else if (status === 'EXPIRING_SOON') expiringSoon++;
    else if (status === 'EXPIRED') expired++;

    totalPurchaseValue += item.purchasePrice || 0;
  });

  return {
    totalProducts: warranties.length,
    activeWarranties,
    expiringSoon,
    expired,
    totalPurchaseValue,
  };
}

/**
 * Default Seed Demo Data as required by project specification
 */
export function getInitialDemoWarranties(userId: string): WarrantyItem[] {
  const today = new Date();
  
  // Helpers to offset dates relative to today
  const addDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  };

  const subDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() - days);
    return res.toISOString().split('T')[0];
  };

  return [
    {
      id: 'demo-w-1',
      userId,
      productName: 'ASUS TUF Gaming F15',
      brand: 'ASUS',
      category: 'Laptop',
      purchaseDate: subDays(today, 300),
      warrantyStartDate: subDays(today, 300),
      warrantyEndDate: addDays(today, 15), // Expiring in 15 days
      purchasePrice: 78990,
      store: 'Amazon India',
      serialNumber: 'SN-ASUS-9938210',
      invoiceNumber: 'INV-2023-9948',
      notes: 'Includes extended protection plan for keyboard and screen.',
      productImageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80',
      invoiceImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      createdAt: subDays(today, 300),
      updatedAt: subDays(today, 300),
    },
    {
      id: 'demo-w-2',
      userId,
      productName: 'Samsung 345L Double Door Refrigerator',
      brand: 'Samsung',
      category: 'Appliances',
      purchaseDate: subDays(today, 600),
      warrantyStartDate: subDays(today, 600),
      warrantyEndDate: addDays(today, 120), // Active
      purchasePrice: 42500,
      store: 'Reliance Digital',
      serialNumber: 'SAMSUNG-REF-5592',
      invoiceNumber: 'RD-88392-B',
      notes: 'Compressor has 10 year manufacturer warranty.',
      productImageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop&q=80',
      invoiceImageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500&auto=format&fit=crop&q=80',
      createdAt: subDays(today, 600),
      updatedAt: subDays(today, 600),
    },
    {
      id: 'demo-w-3',
      userId,
      productName: 'Apple iPhone 15 Pro (256GB)',
      brand: 'Apple',
      category: 'Mobile',
      purchaseDate: subDays(today, 100),
      warrantyStartDate: subDays(today, 100),
      warrantyEndDate: addDays(today, 265), // Active
      purchasePrice: 134900,
      store: 'Apple Store BKC',
      serialNumber: 'F2LXW902M15P',
      invoiceNumber: 'AP-BKC-77402',
      notes: 'AppleCare+ registered under user Apple ID.',
      productImageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
      invoiceImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      createdAt: subDays(today, 100),
      updatedAt: subDays(today, 100),
    },
    {
      id: 'demo-w-4',
      userId,
      productName: 'Sony WH-1000XM5 Noise Canceling Headphones',
      brand: 'Sony',
      category: 'Electronics',
      purchaseDate: subDays(today, 400),
      warrantyStartDate: subDays(today, 400),
      warrantyEndDate: subDays(today, 35), // Expired 35 days ago
      purchasePrice: 29990,
      store: 'Croma Retail',
      serialNumber: 'SN-SONY-XM5-0921',
      invoiceNumber: 'CRM-2023-0912',
      notes: 'Purchased with standard 1-year Sony warranty.',
      productImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      invoiceImageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500&auto=format&fit=crop&q=80',
      createdAt: subDays(today, 400),
      updatedAt: subDays(today, 400),
    },
    {
      id: 'demo-w-5',
      userId,
      productName: 'LG 8kg Front Load Washing Machine',
      brand: 'LG',
      category: 'Appliances',
      purchaseDate: subDays(today, 350),
      warrantyStartDate: subDays(today, 350),
      warrantyEndDate: addDays(today, 15), // Expiring in 15 days
      purchasePrice: 36800,
      store: 'Vijay Sales',
      serialNumber: 'LG-WM-88301-IN',
      invoiceNumber: 'VS-99201',
      notes: 'Motor warranty valid for 10 years.',
      productImageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80',
      invoiceImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      createdAt: subDays(today, 350),
      updatedAt: subDays(today, 350),
    }
  ];
}
