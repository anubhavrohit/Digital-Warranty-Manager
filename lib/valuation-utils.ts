import { ProductCategory, WarrantyItem } from '@/types';
import { getWarrantyStatus } from './warranty-utils';

export interface ResaleValuation {
  originalPrice: number;
  currentEstimatedValue: number;
  depreciationPercent: number;
  depreciationAmount: number;
  warrantyBonusAmount: number;
  ageInMonths: number;
  recommendation: string;
}

export interface CreditCardWarrantyInfo {
  eligible: boolean;
  bankName: string;
  originalEndDate: string;
  extendedEndDate: string;
  isWithinExtendedCoverage: boolean;
  extendedMonthsRemaining: number;
  claimAdvice: string;
}

// Annual depreciation percentage rates by product category
const CATEGORY_DEPRECIATION_RATES: Record<ProductCategory, { yr1: number; yr2: number; yr3: number; yr4Plus: number }> = {
  Mobile: { yr1: 0.35, yr2: 0.50, yr3: 0.65, yr4Plus: 0.78 },
  Laptop: { yr1: 0.28, yr2: 0.44, yr3: 0.58, yr4Plus: 0.72 },
  Electronics: { yr1: 0.30, yr2: 0.46, yr3: 0.60, yr4Plus: 0.74 },
  Appliances: { yr1: 0.18, yr2: 0.30, yr3: 0.42, yr4Plus: 0.56 },
  Gaming: { yr1: 0.22, yr2: 0.38, yr3: 0.52, yr4Plus: 0.65 },
  Vehicle: { yr1: 0.15, yr2: 0.26, yr3: 0.36, yr4Plus: 0.48 },
  Furniture: { yr1: 0.22, yr2: 0.36, yr3: 0.50, yr4Plus: 0.64 },
  Home: { yr1: 0.25, yr2: 0.38, yr3: 0.52, yr4Plus: 0.66 },
  Other: { yr1: 0.30, yr2: 0.45, yr3: 0.60, yr4Plus: 0.75 },
};

/**
 * Calculates real-time market resale value based on purchase price, age, category,
 * and whether the item is still covered by valid warranty.
 */
export function calculateResaleValuation(warranty: WarrantyItem): ResaleValuation {
  const originalPrice = warranty.purchasePrice || 0;
  if (originalPrice <= 0) {
    return {
      originalPrice: 0,
      currentEstimatedValue: 0,
      depreciationPercent: 0,
      depreciationAmount: 0,
      warrantyBonusAmount: 0,
      ageInMonths: 0,
      recommendation: 'Enter purchase price to view resale estimate.',
    };
  }

  // Calculate age in months
  const purchaseTime = new Date(warranty.purchaseDate || Date.now()).getTime();
  const now = Date.now();
  const ageInMonths = Math.max(Math.round((now - purchaseTime) / (1000 * 60 * 60 * 24 * 30.44)), 0);

  const rates = CATEGORY_DEPRECIATION_RATES[warranty.category] || CATEGORY_DEPRECIATION_RATES.Other;

  let baseDeprecPct = 0;
  if (ageInMonths <= 12) {
    // Linear scale inside year 1
    baseDeprecPct = (ageInMonths / 12) * rates.yr1;
  } else if (ageInMonths <= 24) {
    // Interpolate between year 1 and year 2
    const fraction = (ageInMonths - 12) / 12;
    baseDeprecPct = rates.yr1 + fraction * (rates.yr2 - rates.yr1);
  } else if (ageInMonths <= 36) {
    const fraction = (ageInMonths - 24) / 12;
    baseDeprecPct = rates.yr2 + fraction * (rates.yr3 - rates.yr2);
  } else {
    baseDeprecPct = Math.min(rates.yr4Plus + ((ageInMonths - 36) / 24) * 0.1, 0.88);
  }

  // Active warranty adds a 10-15% premium to second-hand buyer demand
  const status = getWarrantyStatus(warranty.warrantyEndDate);
  let warrantyMultiplier = 1.0;
  let bonusAmount = 0;

  if (status === 'ACTIVE') {
    warrantyMultiplier = 1.12; // +12% value boost
    bonusAmount = Math.round(originalPrice * (1 - baseDeprecPct) * 0.12);
  } else if (status === 'EXPIRING_SOON') {
    warrantyMultiplier = 1.05; // +5% value boost
    bonusAmount = Math.round(originalPrice * (1 - baseDeprecPct) * 0.05);
  }

  let finalResaleValue = Math.round(originalPrice * (1 - baseDeprecPct) * warrantyMultiplier);
  // Ensure value doesn't drop below 10% scrap floor or exceed original price
  finalResaleValue = Math.max(Math.min(finalResaleValue, originalPrice), Math.round(originalPrice * 0.1));

  const totalDeprecAmount = Math.max(originalPrice - finalResaleValue, 0);
  const totalDeprecPercent = Math.round((totalDeprecAmount / originalPrice) * 100);

  let recommendation = '';
  if (status === 'ACTIVE') {
    recommendation = `🔥 High Resale Demand: Active manufacturer warranty adds an estimated bonus to this device if sold today!`;
  } else if (status === 'EXPIRING_SOON') {
    recommendation = `⚡ Sweet Spot: Sell before warranty expires in the next few weeks to maximize secondary market return.`;
  } else {
    recommendation = `📦 Stable Residual Value: Value is now depreciating at a slower, mature rate.`;
  }

  return {
    originalPrice,
    currentEstimatedValue: finalResaleValue,
    depreciationPercent: totalDeprecPercent,
    depreciationAmount: totalDeprecAmount,
    warrantyBonusAmount: bonusAmount,
    ageInMonths,
    recommendation,
  };
}

/**
 * Calculates credit card extended warranty protection (+12 Months beyond manufacturer warranty)
 */
export function calculateCreditCardExtendedWarranty(
  warranty: WarrantyItem,
  bankName = 'Complimentary Credit Card Benefit'
): CreditCardWarrantyInfo {
  const originalEnd = new Date(warranty.warrantyEndDate);
  const extendedEnd = new Date(originalEnd);
  extendedEnd.setFullYear(extendedEnd.getFullYear() + 1);

  const extendedEndStr = extendedEnd.toISOString().split('T')[0];
  const now = Date.now();
  const isWithinExtendedCoverage = now > originalEnd.getTime() && now <= extendedEnd.getTime();
  const monthsRemaining = Math.max(
    Math.round((extendedEnd.getTime() - now) / (1000 * 60 * 60 * 24 * 30.44)),
    0
  );

  return {
    eligible: true,
    bankName: warranty.creditCardBank || bankName,
    originalEndDate: warranty.warrantyEndDate,
    extendedEndDate: extendedEndStr,
    isWithinExtendedCoverage,
    extendedMonthsRemaining: monthsRemaining,
    claimAdvice:
      'Most Visa Signature/Infinite, Mastercard World, Amex, and premium bank credit cards extend manufacturer warranty by +1 Year up to ₹1,00,000 / $1,000. Keep your original invoice and card monthly statement handy for filing.',
  };
}
