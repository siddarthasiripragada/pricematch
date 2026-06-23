import Link from 'next/link';
import { searchProducts } from '@/lib/search';

export default async function ResultsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q ?? '';
  const results = await searchProducts(query);

  return (
    <main className="resultsShell">
      <Link href="/" className="backLink">← Back to flyers</Link>
      <h1>Price comparison</h1>
      <p className="muted">Matched OCR query: <strong>{query || 'produce'}</strong></p>
      <div className="tableCard">
        <div className="tableHeader"><span>Store</span><span>Product</span><span>Price</span><span>Unit</span></div>
        {results.map((result) => (
          <div className="tableRow" key={result.id}>
            <span>{result.store_name}</span>
            <span>{result.product.name}</span>
            <strong>${result.price_value.toFixed(2)}</strong>
            <span>{result.price_unit}</span>
          </div>
        ))}
        {!results.length && <p className="emptyState">No matches found. Try tapping directly on a clearer item name or price block.</p>}
      </div>
    </main>
  );
}
