export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string | string[];
  tag?: string | null;
  likes?: number;
  description?: string;
}

export function getProductCategories(product: Product): string[] {
  if (typeof product.category === 'string') return [product.category];
  return product.category || [];
}

export function shuffleProducts<T>(products: T[]): T[] {
  return [...products].sort(() => Math.random() - 0.5);
}

export function recommendFromPreferences(
  allProducts: Product[],
  likedProducts: Product[],
  excludedIds: Set<number>,
  limit = 8
): Product[] {
  if (likedProducts.length === 0) {
    return shuffleProducts(allProducts.filter(p => !excludedIds.has(p.id))).slice(0, limit);
  }

  const preferredCategories = new Set(likedProducts.flatMap(getProductCategories));
  const scored = allProducts
    .filter(p => !excludedIds.has(p.id))
    .map(product => {
      const overlap = getProductCategories(product).filter(c => preferredCategories.has(c)).length;
      return { product, score: overlap };
    })
    .sort((a, b) => b.score - a.score || Math.random() - 0.5);

  const matched = scored.filter(item => item.score > 0).map(item => item.product);
  const rest = scored.filter(item => item.score === 0).map(item => item.product);
  return [...matched, ...rest].slice(0, limit);
}
