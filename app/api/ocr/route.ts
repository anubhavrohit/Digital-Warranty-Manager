import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, mode = 'warranty', apiKey: userApiKey } = await req.json();

    const apiKey =
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini AI API Key not configured. Please enter a key or set GEMINI_API_KEY.' },
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
    // Use gemini-1.5-flash for fast multimodal vision OCR
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    if (mode === 'warranty') {
      const prompt = `You are an expert OCR AI engine specialized in invoice and warranty document parsing. Analyze the attached bill/invoice/receipt document image and extract the following structured JSON fields. Return ONLY valid JSON with no markdown formatting or extra text.

JSON Schema:
{
  "productName": "Exact full name of product purchased",
  "brand": "Manufacturer or brand name",
  "category": "One of: Electronics | Appliances | Mobile | Laptop | Gaming | Furniture | Vehicle | Home | Other",
  "purchaseDate": "YYYY-MM-DD",
  "warrantyPeriod": "e.g. 1 Year, 2 Years, 6 Months",
  "price": 14999.00,
  "invoiceNumber": "Invoice or order number if present, else empty string",
  "vendor": "Store or seller name (e.g. Amazon India, Croma)",
  "serialNumber": "Serial number or IMEI if present, else empty string",
  "notes": "Extracted warranty policy terms and key details",
  "rawText": "Complete transcribed optical text from document"
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        success: true,
        data: {
          ...parsedData,
          isFallback: false,
          extractionMethod: 'Gemini Multimodal AI Vision Engine',
          fieldsExtracted: {
            productName: Boolean(parsedData.productName),
            brand: Boolean(parsedData.brand && parsedData.brand !== 'Generic'),
            serialNumber: Boolean(parsedData.serialNumber),
            purchaseDate: Boolean(parsedData.purchaseDate),
            price: Number(parsedData.price) > 0,
            invoiceNumber: Boolean(parsedData.invoiceNumber),
            vendor: Boolean(parsedData.vendor && parsedData.vendor !== 'Official Store'),
          },
        },
      });
    } else {
      // Generic OCR & Deep Scan Mode
      const prompt = `You are a high-precision generic OCR AI engine. Perform complete optical text extraction and deep document classification on the attached file image. Return ONLY valid JSON matching this schema with no extra text.

JSON Schema:
{
  "documentType": "One of: Tax Invoice / E-Bill | Retail Store Receipt | Warranty Certificate | Shipping & Delivery Label | Utility & Telecom Bill | Vehicle Service & Reg | Salary & Payslip | Medical & Pharmacy Bill | Insurance Policy | General Document",
  "confidence": 98,
  "indicators": ["Reason indicator 1", "Reason indicator 2"],
  "summary": "Short natural language summary of document content",
  "rawText": "Full complete transcribed optical text from document",
  "entities": {
    "prices": ["₹24,999.00"],
    "dates": ["YYYY-MM-DD or DD/MM/YYYY"],
    "identifiers": ["Invoice #: INV-123", "GSTIN: 27AAAAA0000A1Z5"],
    "contacts": ["Phone: 9876543210", "Email: shop@store.com"],
    "products": ["Item 1 description", "Item 2 description"],
    "organizations": ["Store Name / Company Name"]
  }
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
      ]);

      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        success: true,
        data: {
          documentType: parsedData.documentType || 'General Document',
          classification: {
            type: parsedData.documentType || 'General Document',
            confidence: parsedData.confidence || 95,
            indicators: parsedData.indicators || ['Multimodal AI Vision Classification'],
            features: {
              hasTaxInfo: Boolean(parsedData.entities?.identifiers?.some((id: string) => /gstin|tax/i.test(id))),
              hasPrices: Boolean(parsedData.entities?.prices?.length > 0),
              hasDates: Boolean(parsedData.entities?.dates?.length > 0),
              hasIdentifiers: Boolean(parsedData.entities?.identifiers?.length > 0),
              hasContactInfo: Boolean(parsedData.entities?.contacts?.length > 0),
            },
          },
          rawText: parsedData.rawText || '',
          charCount: (parsedData.rawText || '').length,
          wordCount: (parsedData.rawText || '').trim().split(/\s+/).length,
          extractionMethod: 'Gemini Multimodal AI Vision Engine',
          entities: {
            prices: parsedData.entities?.prices || [],
            dates: parsedData.entities?.dates || [],
            identifiers: parsedData.entities?.identifiers || [],
            contacts: parsedData.entities?.contacts || [],
            products: parsedData.entities?.products || [],
            organizations: parsedData.entities?.organizations || [],
          },
          summary: parsedData.summary || 'Multimodal AI Vision Document Analysis',
        },
      });
    }
  } catch (err: any) {
    console.error('AI OCR Route Error:', err);
    let errorMessage = err.message || 'AI OCR processing failed.';
    if (errorMessage.includes('API_KEY_SERVICE_BLOCKED') || err.status === 403) {
      errorMessage = 'Gemini AI Error (403 Forbidden): The provided API key is blocked or "Generative Language API" is disabled in Google Cloud Console / AI Studio for project 625421628083. Please enable the Generative Language API or generate a new key at https://aistudio.google.com/app/apikey.';
    } else if (errorMessage.includes('API key not valid')) {
      errorMessage = 'Gemini AI Error: Invalid API key provided. Please generate a valid API key at https://aistudio.google.com/app/apikey.';
    }
    return NextResponse.json({ error: errorMessage }, { status: err.status || 500 });
  }
}
