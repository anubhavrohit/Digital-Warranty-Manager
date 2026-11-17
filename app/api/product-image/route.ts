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

async function searchDuckDuckGoImages(query: string): Promise<string[]> {
  try {
    const tokenRes = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });
    const tokenHtml = await tokenRes.text();
    const tokenMatch = tokenHtml.match(/vqd=([0-9-]+)/);
    if (!tokenMatch) return [];

    const vqd = tokenMatch[1];
    const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });

    const data = await imgRes.json();
    const results = (data.results || [])
      .map((r: any) => r.image)
      .filter((img: string) => typeof img === 'string' && img.startsWith('http') && !img.includes('.svg'))
      .slice(0, 6);

    return results;
  } catch (err) {
    console.warn('DuckDuckGo image search failed:', err);
    return [];
  }
}

async function searchWikipediaImage(query: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json&origin=*`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'WarrantyVault/1.0 (https://warrantyvault.app)' },
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    const pages = data.query?.pages || {};

    for (const p of Object.values(pages) as any[]) {
      const src = p.thumbnail?.source;
      if (src && !src.includes('flag') && !src.includes('map') && !src.includes('.svg')) {
        return src;
      }
    }
    return null;
  } catch (err) {
    console.warn('Wikipedia image search failed:', err);
    return null;
  }
}

function getBrandLogoUrl(brand: string): string | null {
  if (!brand || brand === 'Generic' || brand.length < 2) return null;
  const clean = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://www.google.com/s2/favicons?domain=${clean}.com&sz=256`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('productName') || '';
    const brand = searchParams.get('brand') || '';
    const category = searchParams.get('category') || 'Electronics';

    const cleanQuery = query.trim();
    const cleanBrand = brand.trim();

    if (!cleanQuery && !cleanBrand) {
      return NextResponse.json({
        success: true,
        imageUrl: CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Electronics,
        source: 'Category Default',
        alternatives: [],
      });
    }

    const searchQuery = cleanBrand && !cleanQuery.toLowerCase().includes(cleanBrand.toLowerCase())
      ? `${cleanBrand} ${cleanQuery}`
      : cleanQuery;

    // 1. Try DuckDuckGo Image Search for real product photos
    const ddgResults = await searchDuckDuckGoImages(searchQuery);
    if (ddgResults.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: ddgResults[0],
        source: 'Web Product Search',
        alternatives: ddgResults.slice(1),
      });
    }

    // 2. Try Wikipedia Page Thumbnail
    const wikiImage = await searchWikipediaImage(searchQuery);
    if (wikiImage) {
      return NextResponse.json({
        success: true,
        imageUrl: wikiImage,
        source: 'Wikipedia Product Archive',
        alternatives: [],
      });
    }

    // 3. Try Brand Logo Favicon
    const brandLogo = getBrandLogoUrl(cleanBrand);
    if (brandLogo) {
      return NextResponse.json({
        success: true,
        imageUrl: brandLogo,
        source: 'Brand Logo',
        alternatives: [],
      });
    }

    // 4. Fallback to curated high-resolution category photography
    const fallbackImage = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Electronics;
    return NextResponse.json({
      success: true,
      imageUrl: fallbackImage,
      source: 'Curated Category Photo',
      alternatives: [],
    });
  } catch (err: any) {
    console.error('Product image search API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch product photo',
      imageUrl: CATEGORY_FALLBACKS.Electronics,
    }, { status: 500 });
  }
}

