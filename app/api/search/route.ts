import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const results = await searchProducts(query);
  return NextResponse.json({ query, results });
}
