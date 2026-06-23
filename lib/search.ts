import { prices, products } from '@/data/mock-data';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import type { SearchResult } from '@/lib/types';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const normalized = normalize(query);

  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase
      .from('prices')
      .select('id, product_id, store_name, price_value, price_unit, flyer_image_url, products!inner(id, name, category, image_url)')
      .ilike('products.name', `%${normalized}%`)
      .order('price_value', { ascending: true })
      .limit(25);

    if (!error && data) {
      return data.map((row: any) => ({ ...row, product: row.products }));
    }
  }

  const tokens = normalized.split(' ').filter(Boolean);
  const matchedProducts = products.filter((product) => {
    const name = normalize(product.name);
    return !tokens.length || tokens.some((token) => name.includes(token) || token.includes(name.replace(/s$/, '')));
  });

  return prices
    .filter((price) => matchedProducts.some((product) => product.id === price.product_id))
    .map((price) => ({ ...price, product: products.find((product) => product.id === price.product_id)! }))
    .sort((a, b) => a.price_value - b.price_value);
}
