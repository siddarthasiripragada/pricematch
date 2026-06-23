import Link from 'next/link';
import { searchProducts } from '@/lib/search';

export default async function ResultsPage({ searchParams }: { searchParams: { q?: string; flyer?: string; x?: string; y?: string } }) {
  const query = searchParams.q ?? '';
  const results = await searchProducts(query);
  const lowestPrice = results[0]?.price_value;

  return (
    <main className="resultsShell">
      <Link href={searchParams.flyer ? `/flyers/${searchParams.flyer}` : '/'} className="backLink">← Back to flyer</Link>
      <h1>Price comparison</h1>
      <p className="muted">
        Matched OCR query: <strong>{query || 'produce'}</strong>
        {searchParams.x && searchParams.y ? <span> from flyer point ({searchParams.x}, {searchParams.y})</span> : null}
      </p>
      <div className="tableCard" role="table" aria-label="Produce price comparison">
        <div className="tableHeader" role="row"><span>Store</span><span>Product</span><span>Price</span><span>Unit</span></div>
        {results.map((result) => {
          const isLowest = result.price_value === lowestPrice;
          return (
            <details className={`tableRow ${isLowest ? 'lowestPrice' : ''}`} key={result.id} role="row">
              <summary>
                <span>{result.store_name}</span>
                <span>{result.product.name}</span>
                <strong>${result.price_value.toFixed(2)}</strong>
                <span>{result.price_unit}</span>
              </summary>
              <div className="resultDetails">
                <p><strong>{result.product.name}</strong> is a {result.product.category} at {result.store_name}.</p>
                <Link href={result.flyer_image_url} target="_blank">Open source flyer image</Link>
              </div>
            </details>
          );
        })}
        {!results.length && <p className="emptyState">No fruit or vegetable matches found. Try tapping directly on a clearer item name or price block.</p>}
      </div>
    </main>
  );
}
