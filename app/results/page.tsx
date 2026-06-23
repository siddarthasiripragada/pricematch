import Image from 'next/image';
import Link from 'next/link';
import { flyers } from '@/data/mock-data';
import { searchProducts } from '@/lib/search';

const logoForStore = (storeName: string) => flyers.find((flyer) => flyer.storeName === storeName)?.logo ?? storeName.slice(0, 2).toUpperCase();

export default async function ResultsPage({ searchParams }: { searchParams: { q?: string; flyer?: string; x?: string; y?: string } }) {
  const query = searchParams.q ?? '';
  const results = await searchProducts(query);
  const lowestPrice = results[0]?.price_value;

  return (
    <main className="resultsShell">
      <Link href={searchParams.flyer ? `/flyers/${searchParams.flyer}` : '/'} className="backLink">← Back to flyer</Link>
      <section className="resultsHero">
        <p className="eyebrow">Lowest price first</p>
        <h1>Price comparison</h1>
        <p className="muted">
          Matched OCR query: <strong>{query || 'produce'}</strong>
          {searchParams.x && searchParams.y ? <span> from flyer point ({searchParams.x}, {searchParams.y})</span> : null}
        </p>
      </section>
      <div className="comparisonGrid" aria-label="Produce price comparison">
        {results.map((result, index) => {
          const isLowest = result.price_value === lowestPrice;
          return (
            <article className={`dealCard ${isLowest ? 'bestDeal' : ''}`} key={result.id} style={{ animationDelay: `${index * 70}ms` }}>
              {isLowest && <span className="bestDealBadge">Best Deal</span>}
              <div className="productImageWrap">
                {result.product.image_url ? <Image src={result.product.image_url} alt={result.product.name} width={112} height={112} /> : <span>{result.product.name[0]}</span>}
              </div>
              <div className="dealInfo">
                <div className="storeLine"><span className="storeLogo">{logoForStore(result.store_name)}</span>{result.store_name}</div>
                <h2>{result.product.name}</h2>
                <p className="muted">{result.product.category} • source weekly flyer</p>
              </div>
              <div className="priceBlock">
                <strong>${result.price_value.toFixed(2)}</strong>
                <span>/{result.price_unit}</span>
                <Link href={result.flyer_image_url} target="_blank">Open flyer</Link>
              </div>
            </article>
          );
        })}
        {!results.length && <p className="emptyState">No fruit or vegetable matches found. Try tapping directly on a clearer item name or price block.</p>}
      </div>
    </main>
  );
}
