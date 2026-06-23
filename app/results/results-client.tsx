'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { searchFlyerItems, formatDateRange } from '@/lib/search';

export function ResultsClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const results = Object.values(
    searchFlyerItems(query).reduce<Record<string, ReturnType<typeof searchFlyerItems>[number]>>((lowestByFlyer, match) => {
      const current = lowestByFlyer[match.flyer.id];
      if (!current || match.product.price < current.product.price) lowestByFlyer[match.flyer.id] = match;
      return lowestByFlyer;
    }, {})
  ).sort((a, b) => a.product.price - b.product.price);

  return (
    <section className="comparisonGrid">
      {query && results.length ? <p className="comparisonIntro">Lowest matching deal per flyer, sorted by price. Open any result to jump straight to the mapped product box in the flyer image.</p> : null}
      {results.map(({ flyer, page, product }) => (
        <article key={product.id} className="dealCard">
          <div>
            <p className="storeName">{flyer.store}</p>
            <h2>{product.name}</h2>
            <p className="muted">{product.brand} • {product.unit} • {formatDateRange(flyer.validFrom, flyer.validTo)}</p>
            <span className="sourceNote">{page.sourceType === 'mock-svg' ? 'Demo/mapped data' : 'Mapped item'}</span>
          </div>
          <strong className="pricePill">${product.price.toFixed(2)}</strong>
          <Link className="button" href={`/flyers/${flyer.id}?page=${page.pageNumber}&item=${product.id}`}>View in Flyer</Link>
        </article>
      ))}
      {query && !results.length ? <p className="emptyState">No matching flyer product found.</p> : null}
    </section>
  );
}
