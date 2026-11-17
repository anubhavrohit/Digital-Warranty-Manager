import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CATEGORY_FALLBACKS: Record<string, string> = {
  Mobile: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  Laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  Appliances: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
  Gaming: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
  Furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
  Vehicle: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
  Home: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  Other: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
};

// Verified official brand domains - ONLY used when exact verified brand is detected
const VERIFIED_BRAND_DOMAINS: Record<string, string> = {
  apple: 'apple.com',
  samsung: 'samsung.com',
  sony: 'sony.com',
  lg: 'lg.com',
  dell: 'dell.com',
  hp: 'hp.com',
  lenovo: 'lenovo.com',
  asus: 'asus.com',
  acer: 'acer.com',
  boat: 'boat-lifestyle.com',
  noise: 'gonoise.com',
  oneplus: 'oneplus.com',
  xiaomi: 'mi.com',
  redmi: 'mi.com',
  realme: 'realme.com',
  cosmicbyte: 'thecosmicbyte.com',
  whirlpool: 'whirlpoolindia.com',
  bosch: 'bosch-home.in',
  dyson: 'dyson.in',
  philips: 'philips.com',
  ikea: 'ikea.com',
  amazon: 'amazon.com',
  flipkart: 'flipkart.com',
  croma: 'croma.com',
  canon: 'canon.com',
  nikon: 'nikon.com',
  godrej: 'godrej.com',
  voltas: 'voltas.com',
  panasonic: 'panasonic.com',
  bose: 'bose.com',
  jbl: 'jbl.com',
  logitech: 'logitech.com',
  motorola: 'motorola.com',
  tata: 'tatamotors.com',
  maruti: 'marutisuzuki.com',
  hyundai: 'hyundai.com',
  honda: 'honda2wheelersindia.com',
};

// Document & non-product keywords to never query external web search for
const DOCUMENT_KEYWORDS = [
  'icard', 'i-card', 'idcard', 'id card', 'invoice', 'bill', 'receipt', 'tax invoice',
  'cash memo', 'document', 'scanned', 'challan', 'statement', 'certificate', 'pass',
  'salary', 'payslip', 'prescription', 'order', 'unknown', 'generic', 'other'
];

/**
 * 1. Live Retail & E-Commerce Catalog Search:
 * Completely resilient on Vercel and AWS datacenter serverless functions.
 * Returns high-resolution (1000px+) official product photography directly from retailer CDNs.
 */
async function searchAmazonCatalog(query: string): Promise<string[]> {
  try {
    const url = 'https://www.amazon.in/s?k=' + encodeURIComponent(query);
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const text = await res.text();
    const re = /<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="([^"]+)"/g;
    let m;
    const images: string[] = [];

    while ((m = re.exec(text)) !== null) {
      // Upgrade thumbnail to high-resolution (1000px)
      const highRes = m[1].replace(/\._[^.]+\.jpg$/i, '._SL1000_.jpg');
      if (!images.includes(highRes)) {
        images.push(highRes);
      }
    }

    return images.slice(0, 8);
  } catch (err) {
    console.warn('Retail product catalog search error:', err);
    return [];
  }
}

/**
 * 2. DuckDuckGo Image Search: High precision for exact product models
 */
async function searchDuckDuckGoImages(query: string): Promise<string[]> {
  try {
    const tokenRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(query), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });

    const tokenHtml = await tokenRes.text();
    const tokenMatch = tokenHtml.match(/vqd=([0-9-]+)/);
    if (!tokenMatch) return [];

    const vqd = tokenMatch[1];
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        next: { revalidate: 3600 },
      }
    );

    const data = await imgRes.json();
    const results = (data.results || [])
      .map((r: any) => r.image)
      .filter((img: string) => typeof img === 'string' && img.startsWith('http') && !img.includes('.svg') && !img.includes('.gif'))
      .slice(0, 6);

    return results;
  } catch (err) {
    console.warn('DuckDuckGo image search failed:', err);
    return [];
  }
}

/**
 * 3. Wikipedia Article Summary Image API: High quality verified product & brand photography
 */
async function searchWikipediaImage(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&origin=*&srlimit=1`;
    const sRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'WarrantyVaultApp/1.0 (contact@warrantyvault.app)' },
      next: { revalidate: 86400 },
    });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const firstTitle = sData.query?.search?.[0]?.title;
    if (!firstTitle) return null;

    const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstTitle)}`;
    const sumRes = await fetch(sumUrl, {
      headers: { 'User-Agent': 'WarrantyVaultApp/1.0 (contact@warrantyvault.app)' },
      next: { revalidate: 86400 },
    });
    if (!sumRes.ok) return null;
    const sumData = await sumRes.json();
    const imgUrl = sumData.originalimage?.source || sumData.thumbnail?.source;
    if (imgUrl && !imgUrl.endsWith('.svg') && !imgUrl.endsWith('.gif')) {
      return imgUrl;
    }
    return null;
  } catch (err) {
    console.warn('Wikipedia image search failed:', err);
    return null;
  }
}

/**
 * 4. Wikimedia Commons Open Product Images Search:
 * Completely open REST API with origin=*, never blocks datacenter IPs.
 */
async function searchWikimediaCommons(query: string): Promise<string[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|mime&format=json&origin=*`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'WarrantyVaultApp/1.0 (https://warrantyvault.app; contact@warrantyvault.app)',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const pages = data.query?.pages || {};
    const urls: string[] = [];

    for (const p of Object.values(pages) as any[]) {
      const info = p.imageinfo?.[0];
      if (
        info &&
        info.url &&
        (info.mime === 'image/jpeg' || info.mime === 'image/png' || info.mime === 'image/webp') &&
        !info.url.includes('.svg') &&
        !info.url.includes('.gif') &&
        !info.url.toLowerCase().includes('flag') &&
        !info.url.toLowerCase().includes('map')
      ) {
        urls.push(info.url);
      }
    }

    return urls;
  } catch (err) {
    console.warn('Wikimedia Commons search failed:', err);
    return [];
  }
}

/**
 * Verified Brand Logo (ONLY for confirmed recognized brands, NEVER for arbitrary strings)
 */
function getVerifiedBrandLogoUrl(brand: string): string | null {
  if (!brand) return null;
  const clean = brand.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!clean || clean === 'generic' || clean === 'other' || clean === 'unknown') return null;

  for (const [key, domain] of Object.entries(VERIFIED_BRAND_DOMAINS)) {
    if (clean === key || (key.length >= 4 && (clean.startsWith(key) || clean.endsWith(key)))) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('productName') || '';
    const brand = searchParams.get('brand') || '';
    const serial = searchParams.get('serialNumber') || searchParams.get('serial') || '';
    const category = searchParams.get('category') || 'Electronics';

    const cleanQuery = query.trim();
    const cleanBrand = brand.trim();

    // If query is empty or just generic document terms, return clean curated category photo
    const isDocTerm =
      !cleanQuery ||
      DOCUMENT_KEYWORDS.some((kw) => cleanQuery.toLowerCase().includes(kw)) ||
      (cleanBrand && DOCUMENT_KEYWORDS.some((kw) => cleanBrand.toLowerCase().includes(kw)));

    if (isDocTerm && (!cleanBrand || cleanBrand.toLowerCase() === 'generic')) {
      return NextResponse.json({
        success: true,
        imageUrl: CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Electronics,
        source: 'Curated Category Photo',
        alternatives: [],
      });
    }

    // Build the most descriptive product query
    const isBrandInQuery = cleanBrand && cleanQuery.toLowerCase().includes(cleanBrand.toLowerCase());
    const searchQuery = cleanBrand && !isBrandInQuery
      ? `${cleanBrand} ${cleanQuery}`
      : cleanQuery || cleanBrand;

    // 1. Primary: Retail Product Catalog (1000px+ HD photos, never blocked on Vercel/datacenter IPs)
    const catalogResults = await searchAmazonCatalog(searchQuery);
    if (catalogResults.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: catalogResults[0],
        source: 'Live Product Photo',
        alternatives: catalogResults.slice(1),
      });
    }

    // 2. Secondary: DuckDuckGo live product photo search
    const ddgResults = await searchDuckDuckGoImages(searchQuery);
    if (ddgResults.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: ddgResults[0],
        source: 'Web Product Search',
        alternatives: ddgResults.slice(1),
      });
    }

    // 3. Tertiary: Wikipedia official article product photo
    const wikiPhoto = await searchWikipediaImage(searchQuery);
    if (wikiPhoto) {
      return NextResponse.json({
        success: true,
        imageUrl: wikiPhoto,
        source: 'Wikipedia Product Archive',
        alternatives: [],
      });
    }

    // 4. Quaternary: Wikimedia Commons Open Product Archive
    const wikiCommons = await searchWikimediaCommons(searchQuery);
    if (wikiCommons.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: wikiCommons[0],
        source: 'Wikimedia Product Archive',
        alternatives: wikiCommons.slice(1),
      });
    }

    // 5. Quinary: Verified Brand Official Logo (ONLY for confirmed real brands like Apple, Sony, Samsung)
    const verifiedLogo = getVerifiedBrandLogoUrl(cleanBrand);
    if (verifiedLogo) {
      return NextResponse.json({
        success: true,
        imageUrl: verifiedLogo,
        source: `${cleanBrand} Official Logo`,
        alternatives: [],
      });
    }

    // 6. Curated High-Resolution Category Photography Fallback
    const fallbackImage = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Electronics;
    return NextResponse.json({
      success: true,
      imageUrl: fallbackImage,
      source: 'Curated Category Photo',
      alternatives: [],
    });
  } catch (err: any) {
    console.error('Product image search API error:', err);
    return NextResponse.json(
      {
        success: true,
        imageUrl: CATEGORY_FALLBACKS.Electronics,
        source: 'Curated Category Photo',
        alternatives: [],
      },
      { status: 200 }
    );
  }
}
