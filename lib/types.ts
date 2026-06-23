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

export type FlyerItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  unit: string;
  category: string;
  bbox: BoundingBox;
};

export type FlyerPageData = {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  items: FlyerItem[];
};

export type Flyer = {
  store: string;
  storeKey: StoreKey;
  flyerId: string;
  title: string;
  validFrom: string;
  validTo: string;
  thumbnailUrl: string;
  pages: FlyerPageData[];
};

export type FlyerSearchMatch = {
  flyer: Flyer;
  page: FlyerPageData;
  item: FlyerItem;
};
