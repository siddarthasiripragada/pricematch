import type { Flyer, Price, Product } from '@/lib/types';

export const flyers: Flyer[] = [
  {
    id: 'fresh-market-weekly',
    storeName: 'Fresh Market',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=70'
  },
  {
    id: 'green-grocer-deals',
    storeName: 'Green Grocer',
    imageUrl: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1800&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=600&q=70'
  },
  {
    id: 'city-produce-flyer',
    storeName: 'City Produce',
    imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1800&q=90',
    thumbnailUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=70'
  }
];

export const products: Product[] = [
  { id: 'apple', name: 'Apples', category: 'fruit', image_url: null },
  { id: 'banana', name: 'Bananas', category: 'fruit', image_url: null },
  { id: 'tomato', name: 'Tomatoes', category: 'vegetable', image_url: null },
  { id: 'lettuce', name: 'Romaine Lettuce', category: 'vegetable', image_url: null },
  { id: 'carrot', name: 'Carrots', category: 'vegetable', image_url: null },
  { id: 'strawberry', name: 'Strawberries', category: 'fruit', image_url: null },
  { id: 'avocado', name: 'Avocados', category: 'fruit', image_url: null },
  { id: 'pepper', name: 'Bell Peppers', category: 'vegetable', image_url: null }
];

export const prices: Price[] = [
  { id: 'p1', product_id: 'apple', store_name: 'Fresh Market', price_value: 1.49, price_unit: 'per lb', flyer_image_url: flyers[0].imageUrl },
  { id: 'p2', product_id: 'apple', store_name: 'Green Grocer', price_value: 1.29, price_unit: 'per lb', flyer_image_url: flyers[1].imageUrl },
  { id: 'p3', product_id: 'banana', store_name: 'Fresh Market', price_value: 0.59, price_unit: 'per lb', flyer_image_url: flyers[0].imageUrl },
  { id: 'p4', product_id: 'banana', store_name: 'City Produce', price_value: 0.49, price_unit: 'per lb', flyer_image_url: flyers[2].imageUrl },
  { id: 'p5', product_id: 'tomato', store_name: 'Green Grocer', price_value: 2.29, price_unit: 'per lb', flyer_image_url: flyers[1].imageUrl },
  { id: 'p6', product_id: 'tomato', store_name: 'City Produce', price_value: 1.99, price_unit: 'per lb', flyer_image_url: flyers[2].imageUrl },
  { id: 'p7', product_id: 'lettuce', store_name: 'Fresh Market', price_value: 1.79, price_unit: 'per item', flyer_image_url: flyers[0].imageUrl },
  { id: 'p8', product_id: 'carrot', store_name: 'Green Grocer', price_value: 1.19, price_unit: 'per lb', flyer_image_url: flyers[1].imageUrl },
  { id: 'p9', product_id: 'strawberry', store_name: 'City Produce', price_value: 3.99, price_unit: 'per item', flyer_image_url: flyers[2].imageUrl },
  { id: 'p10', product_id: 'avocado', store_name: 'Fresh Market', price_value: 0.99, price_unit: 'per item', flyer_image_url: flyers[0].imageUrl },
  { id: 'p11', product_id: 'pepper', store_name: 'Green Grocer', price_value: 1.49, price_unit: 'per item', flyer_image_url: flyers[1].imageUrl }
];
