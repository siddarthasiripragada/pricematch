export type ProductCategory = 'vegetable' | 'fruit';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  image_url?: string | null;
};

export type Price = {
  id: string;
  product_id: string;
  store_name: string;
  price_value: number;
  price_unit: 'per lb' | 'per kg' | 'per item' | string;
  flyer_image_url: string;
};

export type Flyer = {
  id: string;
  storeName: string;
  imageUrl: string;
  thumbnailUrl: string;
};

export type SearchResult = Price & {
  product: Product;
};
