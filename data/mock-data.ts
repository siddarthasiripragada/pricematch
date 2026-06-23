import type { Flyer, FlyerItem, FlyerSearchMatch } from '@/lib/types';

const baseItems: Array<Omit<FlyerItem, 'id' | 'bbox'> & { key: string }> = [
  { key: 'milk', name: 'Milk', brand: 'Neilson', price: 4.99, unit: '4L', category: 'Dairy' },
  { key: 'eggs', name: 'Large Eggs', brand: 'Burnbrae', price: 3.49, unit: '12 pack', category: 'Dairy' },
  { key: 'bread', name: 'Whole Wheat Bread', brand: 'Dempster\'s', price: 2.99, unit: '675g', category: 'Bakery' },
  { key: 'chicken', name: 'Chicken Breast', brand: 'Maple Leaf', price: 5.99, unit: 'per lb', category: 'Meat' },
  { key: 'apples', name: 'Gala Apples', brand: 'Fresh', price: 1.49, unit: 'per lb', category: 'Produce' },
  { key: 'cereal', name: 'Cereal', brand: 'Cheerios', price: 4.49, unit: '430g', category: 'Pantry' }
];

const boxes = [
  { x: 70, y: 210, width: 250, height: 170 },
  { x: 350, y: 210, width: 250, height: 170 },
  { x: 630, y: 210, width: 250, height: 170 },
  { x: 70, y: 430, width: 250, height: 170 },
  { x: 350, y: 430, width: 250, height: 170 },
  { x: 630, y: 430, width: 250, height: 170 }
];

const storeData = [
  ['Walmart', 'walmart', 'Rollback grocery deals', [4.99, 3.49, 2.47, 5.97, 1.67, 3.97]],
  ['FreshCo', 'freshco', 'FreshCo lowest price flyer', [4.88, 3.29, 2.49, 5.49, 1.49, 4.29]],
  ['Real Canadian Superstore', 'real-canadian-superstore', 'PC Optimum weekly offers', [5.29, 3.79, 2.79, 5.99, 1.39, 4.99]],
  ['Loblaws', 'loblaws', 'Market fresh weekly flyer', [5.49, 3.99, 3.29, 6.49, 1.99, 5.49]],
  ['No Frills', 'no-frills', 'Won’t be beat flyer', [4.79, 3.19, 2.29, 5.29, 1.29, 3.99]],
  ['Metro', 'metro', 'Metro weekly savings', [5.19, 3.69, 2.99, 6.29, 1.79, 4.79]],
  ['Costco', 'costco', 'Warehouse grocery values', [12.49, 8.99, 6.99, 24.99, 6.49, 9.99]]
] as const;

export const flyers: Flyer[] = storeData.map(([store, storeKey, title, prices]) => ({
  store,
  storeKey,
  flyerId: `${storeKey}-weekly-2026-06-23`,
  title,
  validFrom: '2026-06-23',
  validTo: '2026-06-29',
  thumbnailUrl: `/flyers/${storeKey}/page-1.svg`,
  pages: [1, 2].map((pageNumber) => ({
    pageNumber,
    imageUrl: `/flyers/${storeKey}/page-${pageNumber}.svg`,
    width: 960,
    height: 720,
    items: baseItems.map((item, index) => ({
      ...item,
      id: `${storeKey}-${pageNumber}-${item.key}`,
      price: Number((prices[index] + (pageNumber === 2 ? 0.5 : 0)).toFixed(2)),
      bbox: boxes[index]
    }))
  }))
}));

export function findFlyer(flyerId: string) {
  return flyers.find((flyer) => flyer.flyerId === flyerId);
}

export function findItem(flyerId: string, pageNumber: number, itemId: string): FlyerSearchMatch | undefined {
  const flyer = findFlyer(flyerId);
  const page = flyer?.pages.find((candidate) => candidate.pageNumber === pageNumber);
  const item = page?.items.find((candidate) => candidate.id === itemId);
  return flyer && page && item ? { flyer, page, item } : undefined;
}
