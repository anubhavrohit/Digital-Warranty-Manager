import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  speed: string;
  status: 'free' | 'moderate' | 'busy' | 'offline';
  statusLabel: string;
  latencyMs: number | null;
  badgeColor: 'green' | 'yellow' | 'red' | 'gray';
  isRecommended?: boolean;
}

const SUPPORTED_MODELS: Omit<ModelInfo, 'status' | 'statusLabel' | 'latencyMs' | 'badgeColor'>[] = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Ultra fast & low latency (~1.3s). Best for quick document parsing.',
    speed: '~1-2s',
    isRecommended: true,
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    description: 'Balanced multimodal model (~4-6s). High accuracy on detailed invoices.',
    speed: '~4-6s',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    description: 'Flagship accuracy. May experience traffic spikes & queueing.',
    speed: '~8-15s',
  },
];

// In-memory cache for status checks
let cachedModelStatuses: ModelInfo[] | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 60000; // 60s cache

/**
 * Robust JSON sanitizer and parser to prevent OCR failures
 * caused by markdown fences, trailing commas, or control characters.
 */
function parseAndSanitizeJSON(raw: string): any {
  if (!raw || typeof raw !== 'string') {
    throw new Error('AI returned an empty or invalid text response');
  }

  // 1. Strip markdown fences (```json ... ```)
  let clean = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  // 2. Direct JSON parse
  try {
    return JSON.parse(clean);
  } catch {
    // 3. Extract outermost { ... }
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slice = clean.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(slice);
      } catch {
        // 4. Remove trailing commas before } or ] and illegal control characters
        const sanitized = slice
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\u0000-\u001F]+/g, ' ');
        return JSON.parse(sanitized);
      }
    }
    throw new Error('Unable to extract valid structured JSON from AI output');
  }
}

export async function GET(req: NextRequest) {
  try {
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true';
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 400 });
    }

    if (!forceRefresh && cachedModelStatuses && Date.now() - lastCheckTime < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        cached: true,
        updatedAt: new Date(lastCheckTime).toISOString(),
        models: cachedModelStatuses,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Ping models in parallel with a 4.5 second timeout
    const results = await Promise.all(
      SUPPORTED_MODELS.map(async (m): Promise<ModelInfo> => {
        const t0 = Date.now();
        try {
          const model = genAI.getGenerativeModel({ model: m.id });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('PING_TIMEOUT')), 4500)
          );

          await Promise.race([
            model.generateContent('ping'),
            timeoutPromise,
          ]);

          const latency = Date.now() - t0;
          let status: ModelInfo['status'] = 'free';
          let statusLabel = 'Free & Fast';
          let badgeColor: ModelInfo['badgeColor'] = 'green';

          if (latency > 3500) {
            status = 'moderate';
            statusLabel = 'Moderate Traffic';
            badgeColor = 'yellow';
          }

          return {
            ...m,
            status,
            statusLabel,
            latencyMs: latency,
            badgeColor,
          };
        } catch (err: any) {
          const latency = Date.now() - t0;
          if (err.message === 'PING_TIMEOUT' || err.status === 503 || err.status === 429) {
            return {
              ...m,
              status: 'busy',
              statusLabel: 'Busy / High Load',
              latencyMs: latency,
              badgeColor: 'red',
            };
          }
          return {
            ...m,
            status: 'offline',
            statusLabel: err.status === 404 ? 'Unavailable' : 'Degraded',
            latencyMs: null,
            badgeColor: 'gray',
          };
        }
      })
    );

    cachedModelStatuses = results;
    lastCheckTime = Date.now();

    return NextResponse.json({
      success: true,
      cached: false,
      updatedAt: new Date(lastCheckTime).toISOString(),
      models: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to inspect models' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const {
      imageBase64,
      mimeType,
      mode = 'warranty',
      selectedModel = 'auto',
      apiKey: userApiKey,
    } = await req.json();

    const apiKey =
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini AI API Key not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 400 }
      );
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required.' }, { status: 400 });
    }

    // Strip Base64 header prefix if present
    const cleanBase64 = imageBase64
      .replace(/^data:image\/\w+;base64,/, '')
      .replace(/^data:application\/pdf;base64,/, '');

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build model candidate sequence based on user preference
    const defaultOrder = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    let candidateList = [...defaultOrder];

    if (selectedModel && selectedModel !== 'auto' && defaultOrder.includes(selectedModel)) {
      candidateList = [selectedModel, ...defaultOrder.filter((m) => m !== selectedModel)];
    }

    let usedModel = candidateList[0];

    const tryGenerate = async (parts: any[]): Promise<string> => {
      let lastError: any;
      for (const modelName of candidateList) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json', // Enforce strict JSON output from Gemini
              maxOutputTokens: 2048,
            },
          });

          // Timeout after 14 seconds per candidate so we failover immediately if overloaded
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout after 14s on ${modelName}`)), 14000);
          });

          const result = await Promise.race([
            model.generateContent(parts),
            timeoutPromise,
          ]);

          usedModel = modelName;
          return result.response.text();
        } catch (err: any) {
          console.warn(`Model ${modelName} failed (${err.status || 'timeout'}): ${err.message?.slice(0, 120)}`);
          lastError = err;
          continue;
        }
      }
      throw lastError;
    };

    if (mode === 'warranty') {
      const prompt = `You are an expert OCR AI engine specialized in document parsing (bills, invoices, receipts, warranty certificates, ID/membership cards, service records, and general documents).
Analyze the attached document image and extract the following structured JSON fields.
If a field is not present in the document, provide a sensible default or empty string/0 as indicated in the schema.
Never refuse to parse or return conversational text. Always return valid JSON matching this schema:

{
  "productName": "Full name of product/item, or title/name of the document holder/service",
  "brand": "Manufacturer, brand, issuing organization, or 'Generic'",
  "category": "One of: Electronics | Appliances | Mobile | Laptop | Gaming | Furniture | Vehicle | Home | Other",
  "purchaseDate": "YYYY-MM-DD (or issue/valid date if invoice date is absent, else today's date)",
  "warrantyPeriod": "e.g. 1 Year, 2 Years, 6 Months, or 'Standard' if not specified",
  "price": 0.0,
  "invoiceNumber": "Invoice/order/reference/ID number if present, else empty string",
  "vendor": "Store, seller, issuer, or institution name",
  "serialNumber": "Serial number, IMEI, or unique ID number if present, else empty string",
  "notes": "Key details, policy terms, or summary of document",
  "rawText": "Complete transcribed optical text from document"
}`;

      const responseText = await tryGenerate([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
      ]);

      const parsedData = parseAndSanitizeJSON(responseText);
      const elapsedMs = Date.now() - t0;

      const safeData = {
        productName: parsedData.productName || 'Scanned Document',
        brand: parsedData.brand || 'Generic',
        category: parsedData.category || 'Electronics',
        purchaseDate: parsedData.purchaseDate || new Date().toISOString().split('T')[0],
        warrantyPeriod: parsedData.warrantyPeriod || '1 Year',
        price: typeof parsedData.price === 'number' ? parsedData.price : parseFloat(parsedData.price) || 0,
        invoiceNumber: parsedData.invoiceNumber || '',
        vendor: parsedData.vendor || 'Official Store',
        serialNumber: parsedData.serialNumber || '',
        notes: parsedData.notes || '',
        rawText: parsedData.rawText || '',
      };

      return NextResponse.json({
        success: true,
        data: {
          ...safeData,
          isFallback: false,
          modelUsed: usedModel,
          timeTakenMs: elapsedMs,
          extractionMethod: `Gemini AI (${usedModel})`,
          fieldsExtracted: {
            productName: Boolean(safeData.productName && safeData.productName !== 'Scanned Document'),
            brand: Boolean(safeData.brand && safeData.brand !== 'Generic'),
            serialNumber: Boolean(safeData.serialNumber),
            purchaseDate: Boolean(safeData.purchaseDate),
            price: Number(safeData.price) > 0,
            invoiceNumber: Boolean(safeData.invoiceNumber),
            vendor: Boolean(safeData.vendor && safeData.vendor !== 'Official Store'),
          },
        },
      });
    } else {
      // Generic OCR & Deep Scan Mode
      const prompt = `You are a high-precision document OCR and classification AI engine. Perform complete optical text extraction and classify the document. Always return valid JSON matching this schema:

{
  "documentType": "One of: Tax Invoice / E-Bill | Retail Store Receipt | Warranty Certificate | Shipping & Delivery Label | Utility & Telecom Bill | Vehicle Service & Reg | Salary & Payslip | Medical & Pharmacy Bill | Insurance Policy | Identity Card / ID | General Document",
  "confidence": 95,
  "indicators": ["Reason indicator 1", "Reason indicator 2"],
  "summary": "Short natural language summary of document content",
  "rawText": "Full complete transcribed optical text from document",
  "entities": {
    "prices": ["₹1,499.00"],
    "dates": ["YYYY-MM-DD"],
    "identifiers": ["INV-123", "ID-456"],
    "contacts": ["phone or email"],
    "products": ["Item description"],
    "organizations": ["Store/Company/Institution"]
  }
}`;

      const responseText = await tryGenerate([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
      ]);

      const parsedData = parseAndSanitizeJSON(responseText);
      const elapsedMs = Date.now() - t0;

      const rawEntities = parsedData.entities || {};
      const safeEntities = {
        prices: Array.isArray(rawEntities.prices) ? rawEntities.prices : [],
        dates: Array.isArray(rawEntities.dates) ? rawEntities.dates : [],
        identifiers: Array.isArray(rawEntities.identifiers) ? rawEntities.identifiers : [],
        contacts: Array.isArray(rawEntities.contacts) ? rawEntities.contacts : [],
        products: Array.isArray(rawEntities.products) ? rawEntities.products : [],
        organizations: Array.isArray(rawEntities.organizations) ? rawEntities.organizations : [],
      };

      return NextResponse.json({
        success: true,
        data: {
          documentType: parsedData.documentType || 'General Document',
          classification: {
            type: parsedData.documentType || 'General Document',
            confidence: parsedData.confidence || 95,
            indicators: Array.isArray(parsedData.indicators) ? parsedData.indicators : ['AI Document Classification'],
            features: {
              hasTaxInfo: Boolean(safeEntities.identifiers?.some((id: string) => /gstin|tax/i.test(id))),
              hasPrices: safeEntities.prices.length > 0,
              hasDates: safeEntities.dates.length > 0,
              hasIdentifiers: safeEntities.identifiers.length > 0,
              hasContactInfo: safeEntities.contacts.length > 0,
            },
          },
          rawText: parsedData.rawText || '',
          charCount: (parsedData.rawText || '').length,
          wordCount: (parsedData.rawText || '').trim().split(/\s+/).filter(Boolean).length,
          modelUsed: usedModel,
          timeTakenMs: elapsedMs,
          extractionMethod: `Gemini AI (${usedModel})`,
          entities: safeEntities,
          summary: parsedData.summary || 'Multimodal AI Vision Document Analysis',
        },
      });
    }
  } catch (err: any) {
    console.error('AI OCR Route Error:', err);
    let errorMessage = err.message || 'AI OCR processing failed.';
    if (errorMessage.includes('API_KEY_SERVICE_BLOCKED') || err.status === 403) {
      errorMessage = 'Gemini AI Error (403 Forbidden): The provided API key is blocked or "Generative Language API" is disabled. Please check your API key in AI Studio.';
    } else if (errorMessage.includes('API key not valid')) {
      errorMessage = 'Gemini AI Error: Invalid API key provided. Please generate a valid API key at https://aistudio.google.com/app/apikey.';
    }
    return NextResponse.json({ error: errorMessage }, { status: err.status || 500 });
  }
}
