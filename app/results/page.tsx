import Link from 'next/link';
import { searchFlyerItems, formatDateRange } from '@/lib/search';

export default function ResultsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q ?? '';
  const results = searchFlyerItems(query).sort((a, b) => a.product.price - b.product.price);

  return (
    <main className="appShell">
      <header className="siteHeader">
        <Link href="/" className="brand">Price<span>Match</span></Link>
        <nav className="siteNav"><Link href="/">Flyers</Link></nav>
      </header>
      <section className="heroPanel compact">
        <p className="eyebrow">Cross-flyer price comparison</p>
        <h1>Compare prices</h1>
        <form action="/results" className="heroSearch">
          <input name="q" defaultValue={query} placeholder="Search product e.g. milk" />
          <button type="submit">Search</button>
        </form>
      </section>
      <section className="comparisonGrid">
        {results.map(({ flyer, page, product }) => (
          <article key={product.id} className="dealCard">
            <div>
              <p className="storeName">{flyer.store}</p>
              <h2>{product.name}</h2>
              <p className="muted">{product.brand} • {product.unit} • {formatDateRange(flyer.validFrom, flyer.validTo)}</p>
            </div>
            <strong className="pricePill">${product.price.toFixed(2)}</strong>
            <Link className="button" href={`/flyers/${flyer.id}?page=${page.pageNumber}&item=${product.id}`}>View in Flyer</Link>
          </article>
        ))}
        {query && !results.length ? <p className="emptyState">No matching flyer product found.</p> : null}
      </section>
    </main>
  );
}
