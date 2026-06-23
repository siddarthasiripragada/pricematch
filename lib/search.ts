import { flyers } from '@/data/mock-data';
import type { FlyerItem, FlyerSearchMatch } from '@/lib/types';

export function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function itemMatchesQuery(item: FlyerItem, query: string) {
  const haystack = normalizeSearch(`${item.name} ${item.brand} ${item.category} ${item.unit}`);
  return normalizeSearch(query).split(' ').filter(Boolean).every((token) => haystack.includes(token));
}

export function searchFlyerItems(query: string, flyerId?: string): FlyerSearchMatch[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];

  return flyers
    .filter((flyer) => !flyerId || flyer.flyerId === flyerId)
    .flatMap((flyer) => flyer.pages.flatMap((page) => page.items
      .filter((item) => itemMatchesQuery(item, normalized))
      .map((item) => ({ flyer, page, item }))));
}

export function formatDateRange(validFrom: string, validTo: string) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${new Date(`${validFrom}T00:00:00Z`).toLocaleDateString('en-CA', options)} – ${new Date(`${validTo}T00:00:00Z`).toLocaleDateString('en-CA', { ...options, year: 'numeric' })}`;
}
