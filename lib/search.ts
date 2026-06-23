import { flyers } from '@/data/mock-data';
import type { FlyerProduct, FlyerSearchMatch } from '@/lib/types';

export function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function itemMatchesQuery(product: FlyerProduct, query: string) {
  const haystack = normalizeSearch(`${product.name} ${product.brand ?? ''} ${product.category} ${product.unit ?? ''}`);
  return normalizeSearch(query).split(' ').filter(Boolean).every((token) => haystack.includes(token));
}

export function searchFlyerItems(query: string, flyerId?: string): FlyerSearchMatch[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];

  return flyers
    .filter((flyer) => !flyerId || flyer.id === flyerId)
    .flatMap((flyer) => flyer.pages.flatMap((page) => page.products
      .filter((product) => itemMatchesQuery(product, normalized))
      .map((product) => ({ flyer, page, product }))));
}

export function formatDateRange(validFrom: string, validTo: string) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${new Date(`${validFrom}T00:00:00Z`).toLocaleDateString('en-CA', options)} – ${new Date(`${validTo}T00:00:00Z`).toLocaleDateString('en-CA', { ...options, year: 'numeric' })}`;
}
