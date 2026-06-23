import { NextResponse } from 'next/server';
import { searchFlyerItems } from '@/lib/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const results = searchFlyerItems(query).map(({ flyer, page, product }) => ({
    flyerId: flyer.id,
    store: flyer.store,
    pageNumber: page.pageNumber,
    product
  }));

  return NextResponse.json({ query, results });
}
