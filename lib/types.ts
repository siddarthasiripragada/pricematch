export type StoreKey =
  | 'walmart'
  | 'freshco'
  | 'real-canadian-superstore'
  | 'loblaws'
  | 'no-frills'
  | 'metro'
  | 'costco';

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FlyerProduct = {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  unit?: string;
  store: string;
  flyerId: string;
  pageNumber: number;
  bbox: BoundingBox;
  confidence?: number;
  source?: 'manual' | 'ocr' | 'ai-detected' | 'mock';
};

export type FlyerSourceType = 'real-image' | 'real-pdf-page' | 'mock-svg';

export type FlyerPage = {
  pageNumber: number;
  imageUrl: string;
  realImageUrl?: string;
  sourceType: FlyerSourceType;
  sourceName?: string;
  sourceUrl?: string;
  width: number;
  height: number;
  products: FlyerProduct[];
};

export type Flyer = {
  id: string;
  store: string;
  storeKey: StoreKey;
  title: string;
  validFrom: string;
  validTo: string;
  coverImageUrl: string;
  logoText: string;
  pages: FlyerPage[];
};

export type FlyerSearchMatch = {
  flyer: Flyer;
  page: FlyerPage;
  product: FlyerProduct;
};
