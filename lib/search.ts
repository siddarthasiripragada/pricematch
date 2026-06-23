import { prices, products } from '@/data/mock-data';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import type { SearchResult } from '@/lib/types';

const PRODUCE_CATEGORIES = ['vegetable', 'fruit'];
const STOP_WORDS = new Set(['and', 'the', 'for', 'with', 'per', 'lb', 'kg', 'each', 'ea', 'sale', 'save', 'fresh', 'organic', 'produce']);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const singularize = (value: string) => value.replace(/(?:es|s)$/i, '');

function queryTokens(query: string) {
  return normalize(query)
    .split(' ')
    .map(singularize)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token) && !/^\d+(?:\.\d+)?$/.test(token));
}

function scoreProduct(productName: string, tokens: string[]) {
  const normalizedName = normalize(productName);
  const nameTokens = normalizedName.split(' ').map(singularize);
  return tokens.reduce((score, token) => {
    if (nameTokens.includes(token)) return score + 4;
    if (nameTokens.some((nameToken) => nameToken.includes(token) || token.includes(nameToken))) return score + 2;
    if (normalizedName.includes(token)) return score + 1;
    return score;
  }, 0);
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const tokens = queryTokens(query);
  const normalized = normalize(tokens.join(' '));

  if (hasSupabaseConfig && supabase && normalized) {
    const { data, error } = await supabase
      .from('prices')
      .select('id, product_id, store_name, price_value, price_unit, flyer_image_url, products!inner(id, name, category, image_url)')
      .in('products.category', PRODUCE_CATEGORIES)
      .or(tokens.map((token) => `name.ilike.%${token}%`).join(','), { foreignTable: 'products' })
      .order('price_value', { ascending: true })
      .limit(25);

    if (!error && data) {
      return data.map((row: any) => ({ ...row, product: row.products }));
    }
  }

  const produceProducts = products.filter((product) => PRODUCE_CATEGORIES.includes(product.category));
  const scoredProducts = produceProducts
    .map((product) => ({ product, score: tokens.length ? scoreProduct(product.name, tokens) : 1 }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));

  const matchedIds = new Set(scoredProducts.map(({ product }) => product.id));

  return prices
    .filter((price) => matchedIds.has(price.product_id))
    .map((price) => ({ ...price, product: products.find((product) => product.id === price.product_id)! }))
    .sort((a, b) => a.price_value - b.price_value || a.product.name.localeCompare(b.product.name));
}
