import { WarrantyItem } from '@/types';

/**
 * Formats a YYYY-MM-DD date into YYYYMMDD for Google Calendar & iCal
 */
function toCalendarDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/[^0-9]/g, '').slice(0, 8);
}

/**
 * Returns next day in YYYYMMDD for all-day calendar events
 */
function getNextDay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0].replace(/[^0-9]/g, '');
}

/**
 * Generates a direct 1-click Google Calendar Event URL for warranty expiry
 */
export function generateGoogleCalendarUrl(warranty: WarrantyItem): string {
  const startDate = toCalendarDate(warranty.warrantyEndDate);
  const endDate = getNextDay(warranty.warrantyEndDate);

  const title = encodeURIComponent(`⚠️ Warranty Expiring: ${warranty.productName}`);
  const details = encodeURIComponent(
    `Product: ${warranty.productName}\n` +
      `Brand: ${warranty.brand}\n` +
      `Category: ${warranty.category}\n` +
      `Serial Number: ${warranty.serialNumber || 'N/A'}\n` +
      `Invoice Number: ${warranty.invoiceNumber || 'N/A'}\n` +
      `Purchased From: ${warranty.store || 'N/A'}\n` +
      `Purchase Date: ${warranty.purchaseDate}\n` +
      `Warranty Expiration Date: ${warranty.warrantyEndDate}\n\n` +
      `Managed via WarrantyVault Digital Warranty Manager.`
  );
  const location = encodeURIComponent(warranty.store || 'Online / Authorized Retailer');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
}

/**
 * Generates an RFC-5545 standard .ics file string with 30-day and 7-day alarms
 */
export function generateICalContent(warranty: WarrantyItem): string {
  const startDate = toCalendarDate(warranty.warrantyEndDate);
  const endDate = getNextDay(warranty.warrantyEndDate);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `warranty-${warranty.id}-${startDate}@warrantyvault.app`;

  const summary = `Warranty Expiring: ${warranty.productName}`;
  const description =
    `Product: ${warranty.productName}\\n` +
    `Brand: ${warranty.brand}\\n` +
    `Serial Number: ${warranty.serialNumber || 'N/A'}\\n` +
    `Invoice: ${warranty.invoiceNumber || 'N/A'}\\n` +
    `Vendor: ${warranty.store || 'N/A'}\\n` +
    `Purchase Date: ${warranty.purchaseDate}\\n` +
    `Warranty Expiry: ${warranty.warrantyEndDate}\\n\\n` +
    `Tracked via WarrantyVault`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WarrantyVault//Digital Warranty Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${warranty.store || 'Authorized Dealer'}`,
    'STATUS:CONFIRMED',
    // Alarm 1: 30 days before
    'BEGIN:VALARM',
    'TRIGGER:-P30D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Warranty for ${warranty.productName} expires in 30 days!`,
    'END:VALARM',
    // Alarm 2: 7 days before
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Warranty for ${warranty.productName} expires in 7 days!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers instant browser download of the .ics calendar file
 */
export function downloadICalFile(warranty: WarrantyItem): void {
  const icsContent = generateICalContent(warranty);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = warranty.productName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
  a.download = `${safeName}-warranty-expiry.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
