import { recognize } from 'tesseract.js';
import { OCRResult, GenericOCRResult, ProductCategory } from '@/types';

/**
 * Advanced Browser-Side OCR and Multi-Format Invoice Parsing Engine.
 * Handles JPG, PNG, WEBP images and native/scanned PDF files.
 * Uses image preprocessing (contrast enhancement + grayscale) and pdfjs-dist.
 */
export async function extractWarrantyDataFromImage(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<OCRResult> {
  let rawText = '';
  const fileType = file.type || '';
  const isPdf = fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (onProgress) onProgress('Preparing document...', 0.1);

  let extractionMethod: 'PDF Direct Text' | 'Tesseract.js Engine' = 'Tesseract.js Engine';

  try {
    if (isPdf) {
      if (onProgress) onProgress('Parsing PDF text content...', 0.2);
      // Attempt 1: Extract embedded text directly from PDF
      rawText = await extractTextFromPdfFile(file);

      if (rawText && rawText.trim().length >= 20) {
        extractionMethod = 'PDF Direct Text';
      } else {
        // Attempt 2: If PDF has no embedded text (scanned PDF), render page 1 to canvas and OCR it
        if (onProgress) onProgress('Rendering scanned PDF page to high-res image...', 0.4);
        const canvas = await renderPdfPageToCanvas(file);
        if (canvas) {
          if (onProgress) onProgress('Applying OCR text recognition on scanned PDF...', 0.6);
          rawText = await runTesseractOCR(canvas, onProgress);
        }
      }
    } else {
      // Standard Image file (JPG, PNG, WEBP)
      if (onProgress) onProgress('Enhancing image contrast for OCR...', 0.3);
      const processedImage = await preprocessImageForOCR(file);

      if (onProgress) onProgress('Running neural OCR text extraction...', 0.5);
      rawText = await runTesseractOCR(processedImage, onProgress);
    }
  } catch (err) {
    console.warn('OCR / Document extraction error, proceeding to heuristic fallback:', err);
  }

  if (onProgress) onProgress('Extracting structured warranty fields...', 0.9);

  // Parse extracted raw text using intelligent regular expressions & pattern matching
  const parsed = parseTextToWarrantyResult(rawText, file.name);
  parsed.rawText = rawText.trim();
  parsed.extractionMethod = extractionMethod;

  if (onProgress) onProgress('Complete', 1.0);

  return parsed;
}

/**
 * Extracts text directly from digital PDF files using pdfjs-dist.
 */
async function extractTextFromPdfFile(file: File): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    let fullText = '';
    const maxPages = Math.min(pdfDoc.numPages, 3);

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (err) {
    console.warn('PDF text extraction error:', err);
    return '';
  }
}

/**
 * Renders page 1 of a PDF file to an HTML Canvas element for OCR processing.
 */
async function renderPdfPageToCanvas(file: File): Promise<HTMLCanvasElement | null> {
  if (typeof window === 'undefined') return null;

  try {
    const pdfjs = await import('pdfjs-dist');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);

    // High scale (2.5x) for sharp text rendering
    const viewport = page.getViewport({ scale: 2.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    return canvas;
  } catch (err) {
    console.warn('PDF canvas rendering failed:', err);
    return null;
  }
}

/**
 * Preprocesses an image or canvas (resizing small images, grayscale, contrast boost)
 * to significantly improve Tesseract.js OCR accuracy.
 */
async function preprocessImageForOCR(fileOrCanvas: File | HTMLCanvasElement): Promise<HTMLCanvasElement | File> {
  if (typeof window === 'undefined') return fileOrCanvas;

  try {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    if (fileOrCanvas instanceof HTMLCanvasElement) {
      canvas = fileOrCanvas;
      ctx = canvas.getContext('2d');
    } else {
      const img = new Image();
      const url = URL.createObjectURL(fileOrCanvas);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      URL.revokeObjectURL(url);

      canvas = document.createElement('canvas');
      // Scale up small images for better OCR resolution
      let scale = 1;
      if (img.width < 1200) {
        scale = 1800 / img.width;
      } else if (img.width > 3200) {
        scale = 2400 / img.width;
      }

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      ctx = canvas.getContext('2d');
      if (!ctx) return fileOrCanvas;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    if (!ctx) return fileOrCanvas;

    // Apply Grayscale + Contrast boost
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const contrast = 1.25; // Boost contrast
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

    for (let i = 0; i < data.length; i += 4) {
      // Grayscale luminance formula
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));

      data[i] = newGray;
      data[i + 1] = newGray;
      data[i + 2] = newGray;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  } catch (err) {
    console.warn('Preprocessing skipped:', err);
    return fileOrCanvas;
  }
}

/**
 * Runs Tesseract.js OCR on an image/canvas with progress logger support.
 */
async function runTesseractOCR(
  imageSource: File | HTMLCanvasElement,
  onProgress?: (status: string, progress: number) => void
): Promise<string> {
  const result = await recognize(imageSource, 'eng', {
    logger: (m) => {
      if (onProgress && m.status) {
        const pct = Math.round((m.progress || 0) * 100);
        let msg = m.status;
        if (m.status === 'recognizing text') msg = `Recognizing text (${pct}%)`;
        else if (m.status === 'loading tesseract core') msg = 'Loading OCR Core...';
        else if (m.status === 'initializing api') msg = 'Initializing OCR Engine...';
        onProgress(msg, 0.5 + (m.progress || 0) * 0.4);
      }
    },
  });

  return result.data.text || '';
}

/**
 * Parses raw text extracted by OCR into structured warranty fields.
 */
function parseTextToWarrantyResult(text: string, fileName: string): OCRResult {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const fullText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  // 1. BRAND DETECTION (Using Word Boundaries to avoid partial word matching like "shipping" matching "hp")
  const brandList = [
    'Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer',
    'Bose', 'JBL', 'Canon', 'Nikon', 'Realme', 'OnePlus', 'Xiaomi', 'Redmi',
    'Boat', 'Noise', 'Whirlpool', 'Bosch', 'Panasonic', 'Godrej', 'Voltas',
    'Haier', 'IKEA', 'Royal Enfield', 'Hero', 'TVS', 'Honda', 'Maruti',
    'Hyundai', 'Dyson', 'Philips', 'Logitech', 'Motorola', 'Fire-Boltt',
    'Boult', 'Zebronics', 'Portronics', 'Infinix', 'Vivo', 'Oppo', 'Sennheiser'
  ];

  let detectedBrand = '';

  // Check labeled brand field first (e.g. Brand: Apple or Make: Dell)
  const brandLabelMatch = text.match(/(?:brand|make|manufacturer)\s*[:\s]+([a-zA-Z0-9\s-]+)/i);
  if (brandLabelMatch && brandLabelMatch[1]) {
    const candidate = brandLabelMatch[1].trim().split(/\s+/)[0];
    if (candidate.length > 1) {
      detectedBrand = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  if (!detectedBrand) {
    for (const b of brandList) {
      const regex = new RegExp(`\\b${b.replace('-', '\\-')}\\b`, 'i');
      if (regex.test(text) || regex.test(fileName)) {
        detectedBrand = b;
        break;
      }
    }
  }

  // 2. VENDOR / STORE DETECTION
  const vendorList: Record<string, string> = {
    amazon: 'Amazon India',
    flipkart: 'Flipkart',
    'reliance digital': 'Reliance Digital',
    croma: 'Croma Electronics',
    'vijay sales': 'Vijay Sales',
    'apple store': 'Apple Store',
    tatacliq: 'Tata CLIQ',
    'tata cliq': 'Tata CLIQ',
    myntra: 'Myntra',
    ikea: 'IKEA India',
    decathlon: 'Decathlon',
    zepto: 'Zepto',
    blinkit: 'Blinkit',
    swiggy: 'Swiggy Instamart',
  };

  let detectedVendor = '';

  // Check labeled vendor / sold by pattern
  const vendorLabelMatch = text.match(/(?:sold by|seller|vendor|merchant|store)\s*[:\s]+([^\n,]{3,35})/i);
  if (vendorLabelMatch && vendorLabelMatch[1]) {
    const cleaned = vendorLabelMatch[1].replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (cleaned.length > 2 && !cleaned.toLowerCase().includes('tax invoice')) {
      detectedVendor = cleaned;
    }
  }

  if (!detectedVendor) {
    for (const [key, val] of Object.entries(vendorList)) {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(text) || regex.test(fileName)) {
        detectedVendor = val;
        break;
      }
    }
  }

  if (!detectedVendor && lines.length > 0) {
    // Check top 3 lines for company name
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const lower = line.toLowerCase();
      if (
        line.length > 3 &&
        line.length < 35 &&
        !lower.includes('tax invoice') &&
        !lower.includes('invoice') &&
        !lower.includes('receipt') &&
        !lower.includes('original') &&
        !lower.includes('bill of supply')
      ) {
        detectedVendor = line;
        break;
      }
    }
  }

  // 3. INVOICE NUMBER EXTRACTION
  let invoiceNumber = '';
  const invMatch = text.match(
    /(?:invoice|inv|bill|receipt|tax invoice|order)\s*(?:no|num|number|#)?[:\s]*([a-zA-Z0-9\/-]{4,30})/i
  ) || text.match(/#\s*([a-zA-Z0-9-]{5,25})/);

  if (invMatch && invMatch[1]) {
    const candidate = invMatch[1].trim();
    // Exclude false matches like "Date", "Details", "Address"
    if (!/^(date|details|copy|original|tax|amount)$/i.test(candidate)) {
      invoiceNumber = candidate;
    }
  }

  // 4. SERIAL NUMBER EXTRACTION
  let serialNumber = '';
  const serialMatch = text.match(
    /(?:serial|s\/n|sn|imei|mac address)\s*(?:no|num|number|#)?[:\s]*([a-zA-Z0-9-]{5,30})/i
  );
  if (serialMatch && serialMatch[1]) {
    const candidate = serialMatch[1].trim();
    if (!/^(number|no|details|code)$/i.test(candidate)) {
      serialNumber = candidate;
    }
  }

  // 5. PRICE EXTRACTION
  let price = 0;

  // Search for explicit labeled price lines (e.g. Grand Total: ₹ 24,999.00 or Total Amount: Rs 15000/-)
  const priceMatches = Array.from(
    text.matchAll(
      /(?:grand total|total amount|net amount|amount paid|invoice total|paid amount|total cost|total|price|mrp|rs\.?|inr|₹)\s*[:\s]*[₹\$€]?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|\b[0-9]{3,7}\b(?:\/-)?)/gi
    )
  );

  for (let i = priceMatches.length - 1; i >= 0; i--) {
    const rawVal = priceMatches[i][1].replace(/,/g, '').replace(/\/-/, '').trim();
    const parsedVal = parseFloat(rawVal);
    // Ignore PIN codes (e.g. 560037), HSN codes, and years
    if (!isNaN(parsedVal) && parsedVal > 10 && parsedVal < 5000000 && parsedVal !== 2024 && parsedVal !== 2025 && parsedVal !== 2026) {
      price = parsedVal;
      break;
    }
  }

  if (price === 0) {
    // Search for standalone currency values with ₹ or Rs.
    const standaloneMatches = Array.from(text.matchAll(/(?:₹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|\b[0-9]{3,6}\b)/gi));
    for (const m of standaloneMatches) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(val) && val > price && val < 1000000) {
        price = val;
      }
    }
  }

  // 6. PURCHASE DATE EXTRACTION
  let purchaseDate = '';

  // Priority 1: Explicit Labeled Date (e.g., Invoice Date: 15/01/2024 or Date: 12-Oct-2023)
  const labeledDateMatch = text.match(/(?:invoice|order|purchase|bill|transaction)?\s*date[:\s]*([a-zA-Z0-9\/\.\-]+)/i);
  if (labeledDateMatch && labeledDateMatch[1]) {
    const parsedDate = parseFlexibleDate(labeledDateMatch[1]);
    if (parsedDate) purchaseDate = parsedDate;
  }

  // Priority 2: Standard Date formats across document
  if (!purchaseDate) {
    const rawDates = Array.from(
      text.matchAll(/\b(\d{1,2})[\/\.\-](\d{1,2}|[a-zA-Z]{3,9})[\/\.\-](\d{2,4})\b/g)
    );

    for (const m of rawDates) {
      const parsedDate = parseFlexibleDate(m[0]);
      if (parsedDate) {
        purchaseDate = parsedDate;
        break;
      }
    }
  }

  if (!purchaseDate) {
    purchaseDate = new Date().toISOString().split('T')[0];
  }

  // 7. WARRANTY PERIOD EXTRACTION
  let warrantyPeriod = '1 Year';
  const wMatch = text.match(/(\d+)\s*(year|yr|month|mth|m)s?\s*(?:warranty|guarantee)/i) ||
                 text.match(/warranty\s*(?:period)?[:\s]*(\d+)\s*(year|yr|month|mth)s?/i);
  if (wMatch) {
    const num = wMatch[1];
    const unit = wMatch[2].toLowerCase().startsWith('m') ? 'Month' : 'Year';
    warrantyPeriod = `${num} ${unit}${parseInt(num) > 1 ? 's' : ''}`;
  } else if (fullText.includes('2 year') || fullText.includes('2 yr') || fullText.includes('24 month')) {
    warrantyPeriod = '2 Years';
  } else if (fullText.includes('3 year') || fullText.includes('3 yr') || fullText.includes('36 month')) {
    warrantyPeriod = '3 Years';
  }

  // 8. PRODUCT NAME EXTRACTION
  let productName = '';
  // Look for line items or product descriptions
  for (const line of lines) {
    const l = line.toLowerCase();
    const isHeaderOrMetadata =
      l.includes('tax invoice') ||
      l.includes('bill of supply') ||
      l.includes('original for recipient') ||
      l.includes('sl no') ||
      l.includes('hsn/sac') ||
      l.includes('gstin') ||
      l.includes('total amount') ||
      l.includes('grand total') ||
      l.includes('customer name') ||
      l.includes('shipping address') ||
      l.includes('billing address') ||
      l.includes('phone') ||
      l.includes('email');

    if (!isHeaderOrMetadata && line.length > 5 && line.length < 70) {
      // Prioritize lines containing detected brand name or item description
      if (detectedBrand && line.toLowerCase().includes(detectedBrand.toLowerCase())) {
        productName = line;
        break;
      }
      if (!productName && /[a-zA-Z]{3,}/.test(line)) {
        productName = line;
      }
    }
  }

  // Clean fallback values (NO fake random numbers!)
  if (!productName) {
    if (detectedBrand) {
      productName = `${detectedBrand} Product`;
    } else {
      const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      productName = cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1);
    }
  }

  if (!detectedBrand) {
    const firstWord = productName.split(' ')[0];
    detectedBrand = firstWord.length > 2 && !/^(item|product|invoice|bill)$/i.test(firstWord)
      ? firstWord
      : 'Generic';
  }

  if (!detectedVendor) {
    detectedVendor = 'Official Store';
  }

  const isFallback = text.trim().length === 0;

  const fieldsExtracted = {
    productName: !isFallback && productName.length > 0 && !productName.toLowerCase().includes('product'),
    brand: !isFallback && detectedBrand !== 'Generic',
    serialNumber: !isFallback && serialNumber.length > 0,
    purchaseDate: !isFallback && purchaseDate.length > 0,
    price: !isFallback && price > 0,
    invoiceNumber: !isFallback && invoiceNumber.length > 0,
    vendor: !isFallback && detectedVendor !== 'Official Store',
  };

  return {
    productName,
    brand: detectedBrand,
    serialNumber,
    purchaseDate,
    price,
    invoiceNumber,
    vendor: detectedVendor,
    warrantyPeriod,
    isFallback,
    fieldsExtracted,
  };
}

/**
 * Parses flexible date strings like "15/01/2024", "15-Jan-2024", "2024-05-15", "15.08.2023" into YYYY-MM-DD.
 */
function parseFlexibleDate(dateStr: string): string | null {
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  };

  const str = dateStr.trim().replace(/,/g, '');

  // Format: YYYY-MM-DD
  const isoMatch = str.match(/\b(20\d{2})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})\b/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    if (parseInt(m) <= 12 && parseInt(d) <= 31) return `${y}-${m}-${d}`;
  }

  // Format: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/\b(\d{1,2})[\/\.\-](\d{1,2}|[a-zA-Z]{3,9})[\/\.\-](20\d{2}|\d{2})\b/);
  if (dmyMatch) {
    let d = dmyMatch[1].padStart(2, '0');
    let mRaw = dmyMatch[2].toLowerCase();
    let y = dmyMatch[3];

    if (y.length === 2) y = '20' + y;

    let m = '';
    if (months[mRaw]) {
      m = months[mRaw];
    } else if (!isNaN(parseInt(mRaw))) {
      m = mRaw.padStart(2, '0');
    }

    if (m && parseInt(m) <= 12 && parseInt(d) <= 31) {
      return `${y}-${m}-${d}`;
    }
  }

  return null;
}

/**
 * Infers category based on product name and brand keywords.
 */
export function inferCategoryFromProduct(productName: string, brand: string): ProductCategory {
  const combined = (productName + ' ' + brand).toLowerCase();

  if (/phone|iphone|galaxy s|pixel|realme|oneplus|redmi|mobile|smartphone|cellular/i.test(combined)) {
    return 'Mobile';
  }
  if (/laptop|macbook|thinkpad|notebook|zenbook|ideapad|pavilion|inspiron|legion|surface/i.test(combined)) {
    return 'Laptop';
  }
  if (/ac|air conditioner|refrigerator|fridge|washing machine|microwave|oven|dishwasher|cooler|geyser/i.test(combined)) {
    return 'Appliances';
  }
  if (/playstation|xbox|nintendo|ps5|ps4|gaming|gpu|graphics card|joystick/i.test(combined)) {
    return 'Gaming';
  }
  if (/car|bike|motorcycle|scooter|vehicle|ev|bullet|honda|maruti|hyundai|tvs|hero/i.test(combined)) {
    return 'Vehicle';
  }
  if (/chair|table|desk|sofa|bed|mattress|furniture|wardrobe|ikea/i.test(combined)) {
    return 'Furniture';
  }
  if (/light|lamp|fan|purifier|vacuum|dyson|kitchen|cookware/i.test(combined)) {
    return 'Home';
  }

  return 'Electronics';
}

/**
 * Generic OCR Engine: Extracts raw text and categorizes entities into structured types
 * (Prices, Dates, Identifiers, Contact Info, Organizations, Products).
 */
export async function performGenericOCR(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<GenericOCRResult> {
  let rawText = '';
  const fileType = file.type || '';
  const isPdf = fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  let extractionMethod: 'PDF Direct Text' | 'Tesseract.js Engine' = 'Tesseract.js Engine';

  if (onProgress) onProgress('Preparing document for Generic OCR...', 0.1);

  try {
    if (isPdf) {
      if (onProgress) onProgress('Parsing PDF text content...', 0.2);
      rawText = await extractTextFromPdfFile(file);

      if (rawText && rawText.trim().length >= 20) {
        extractionMethod = 'PDF Direct Text';
      } else {
        if (onProgress) onProgress('Rendering PDF page to image for OCR...', 0.4);
        const canvas = await renderPdfPageToCanvas(file);
        if (canvas) {
          if (onProgress) onProgress('Recognizing raw optical characters...', 0.6);
          rawText = await runTesseractOCR(canvas, onProgress);
        }
      }
    } else {
      if (onProgress) onProgress('Enhancing image contrast for OCR...', 0.3);
      const processedImage = await preprocessImageForOCR(file);

      if (onProgress) onProgress('Recognizing raw optical characters...', 0.5);
      rawText = await runTesseractOCR(processedImage, onProgress);
    }
  } catch (err) {
    console.warn('Generic OCR error:', err);
  }

  if (onProgress) onProgress('Categorizing and identifying info types...', 0.9);

  const result = categorizeGenericOCRText(rawText, file.name, extractionMethod);

  if (onProgress) onProgress('Complete', 1.0);

  return result;
}

/**
 * Identifies entity categories (Prices, Dates, IDs, Contacts, Products, Companies) from raw text.
 */
function categorizeGenericOCRText(
  text: string,
  fileName: string,
  extractionMethod: 'PDF Direct Text' | 'Tesseract.js Engine'
): GenericOCRResult {
  const fullTextLower = text.toLowerCase();

  // 1. Document Type Classification
  let documentType: GenericOCRResult['documentType'] = 'General Document';
  if (fullTextLower.includes('tax invoice') || fullTextLower.includes('bill of supply') || fullTextLower.includes('gstin')) {
    documentType = 'Tax Invoice';
  } else if (fullTextLower.includes('cash receipt') || fullTextLower.includes('receipt') || fullTextLower.includes('cash memo')) {
    documentType = 'Store Receipt';
  } else if (fullTextLower.includes('warranty') || fullTextLower.includes('guarantee')) {
    documentType = 'Warranty Card';
  } else if (fullTextLower.includes('electricity') || fullTextLower.includes('water bill') || fullTextLower.includes('broadband')) {
    documentType = 'Utility Bill';
  } else if (fullTextLower.includes('waybill') || fullTextLower.includes('tracking') || fullTextLower.includes('courier')) {
    documentType = 'Shipping Label';
  }

  // 2. Extract Prices / Currency Amounts
  const priceMatches = Array.from(
    text.matchAll(/(?:₹|rs\.?|inr|\$|€)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|\b[0-9]{3,7}\b(?:\/-)?)/gi)
  );
  const pricesSet = new Set<string>();
  for (const m of priceMatches) {
    const val = m[0].trim();
    if (val.length > 1) pricesSet.add(val);
  }

  // 3. Extract Dates
  const dateMatches = Array.from(
    text.matchAll(/\b(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}|\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi)
  );
  const datesSet = new Set<string>();
  for (const m of dateMatches) {
    datesSet.add(m[0].trim());
  }

  // 4. Extract Identifiers (Invoice #, Serial #, Order ID, GSTIN, HSN, IMEI)
  const idMatches = Array.from(
    text.matchAll(/(?:invoice|inv|order|bill|serial|s\/n|sn|gstin|hsn|cin|pan|imei)\s*(?:no|num|number|#)?[:\s]*([a-zA-Z0-9\/-]{4,30})/gi)
  );
  const identifiersSet = new Set<string>();
  for (const m of idMatches) {
    if (m[0] && m[0].length < 45) {
      identifiersSet.add(m[0].trim());
    }
  }

  // 5. Extract Contacts (Emails, Phones, Websites)
  const emailMatches = Array.from(text.matchAll(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g));
  const phoneMatches = Array.from(text.matchAll(/\b(?:\+91[\s\-]?)?[6-9]\d{9}\b/g));
  const webMatches = Array.from(text.matchAll(/\b(?:https?:\/\/)?www\.[A-Za-z0-9.\/-]+\b/g));
  const contactsSet = new Set<string>();
  for (const m of emailMatches) contactsSet.add(`Email: ${m[0]}`);
  for (const m of phoneMatches) contactsSet.add(`Phone: ${m[0]}`);
  for (const m of webMatches) contactsSet.add(`Web: ${m[0]}`);

  // 6. Extract Organizations / Stores
  const orgSet = new Set<string>();
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length > 0) {
    // Check top lines for vendor
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      if (lines[i].length > 3 && lines[i].length < 40 && !lines[i].toLowerCase().includes('invoice')) {
        orgSet.add(lines[i]);
        break;
      }
    }
  }

  // 7. Extract Products / Line items
  const productSet = new Set<string>();
  for (const line of lines) {
    if (
      line.length > 8 &&
      line.length < 60 &&
      !line.toLowerCase().includes('total') &&
      !line.toLowerCase().includes('invoice') &&
      !line.toLowerCase().includes('address') &&
      !line.toLowerCase().includes('gst')
    ) {
      productSet.add(line);
      if (productSet.size >= 5) break;
    }
  }

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const summary = `Classified as ${documentType}. Identified ${pricesSet.size} price values, ${datesSet.size} dates, and ${identifiersSet.size} reference identifiers.`;

  return {
    documentType,
    rawText: text,
    charCount,
    wordCount,
    extractionMethod,
    entities: {
      prices: Array.from(pricesSet),
      dates: Array.from(datesSet),
      identifiers: Array.from(identifiersSet),
      contacts: Array.from(contactsSet),
      products: Array.from(productSet),
      organizations: Array.from(orgSet),
    },
    summary,
  };
}
