import { NextResponse } from 'next/server';
import { searchFlyerItems } from '@/lib/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const results = searchFlyerItems(query).map(({ flyer, page, item }) => ({
    flyerId: flyer.flyerId,
    store: flyer.store,
    pageNumber: page.pageNumber,
    item
  }));

  return NextResponse.json({ query, results });
}
