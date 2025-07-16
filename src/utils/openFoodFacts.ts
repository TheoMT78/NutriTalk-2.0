export interface OFFProduct {
  product_name: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    'vitamin-a_100g'?: number;
    'vitamin-c_100g'?: number;
    calcium_100g?: number;
    iron_100g?: number;
  };
  code: string;
  serving_size?: string;
}

import aliments from '../data/aliments.json';

export function loadLocalFoodBase(): OFFProduct[] {
  return aliments as OFFProduct[];
}

export async function fetchProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,nutriments,code,serving_size`;
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!data.product) return null;
    return data.product as OFFProduct;
  } catch {
    return null;
  }
}

export async function searchProduct(query: string): Promise<OFFProduct[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&fields=product_name,nutriments,code,serving_size`;
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return (data.products as OFFProduct[]) || [];
  } catch {
    return [];
  }
}

export async function searchProductFallback(query: string): Promise<OFFProduct[]> {
  let results = await searchProduct(query);
  if (results.length > 0) return results;
  const terms = query.split(/\s+/).filter(Boolean);
  const synonyms: Record<string, string[]> = {
    farine: ['flour'],
    flour: ['farine'],
    beurre: ['butter'],
    butter: ['beurre'],
    riz: ['rice'],
    rice: ['riz']
  };
  for (const term of terms) {
    results = await searchProduct(term);
    if (results.length > 0) return results;
    const extra = synonyms[term.toLowerCase()] || [];
    for (const alt of extra) {
      results = await searchProduct(alt);
      if (results.length > 0) return results;
    }
  }
  return [];
}
