# WarrantyVault — Digital Product & Warranty Management Platform

A modern full-stack web application for storing product purchase details, scanning receipts using Tesseract.js OCR, monitoring 30-day warranty expiration alerts, and managing digital invoices with Firebase integration.

## Key Features
- **OCR Bill & Receipt Scanner**: Automatic Optical Character Recognition (OCR) powered by WebAssembly Tesseract.js to scan invoice images and pre-fill product details, price, serial numbers, and purchase dates.
- **Expiry Monitoring Engine**: Real-time status indicators (Active, Expiring Soon, Expired) with automated 30-day countdown tracking and real-time popover notifications.
- **Firebase & Local Sync**: Full integration with Firebase Auth, Cloud Firestore Database, and Firebase Storage with local fallback persistence.
- **Document Repository**: Upload and attach digital invoices, bills, and warranty cards directly to product records.
- **Category Analytics**: Visual breakdown of purchase expenses across categories (Electronics, Mobile, Laptop, Appliances, Furniture, etc.).
- **Global Search & Filtering**: Fast search by product name, brand, serial number, invoice number, or vendor with custom sort orders.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS / Tailwind CSS (Warm Aesthetic Palette)
- **Backend / DB**: Firebase Auth, Cloud Firestore, Firebase Storage
- **OCR Engine**: Tesseract.js WebAssembly
- **Icons**: Lucide React

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
