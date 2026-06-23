import Link from 'next/link';
import { searchFlyerItems, formatDateRange } from '@/lib/search';

export default function ResultsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q ?? '';
  const results = searchFlyerItems(query).sort((a, b) => a.item.price - b.item.price);

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
        {results.map(({ flyer, page, item }) => (
          <article key={item.id} className="dealCard">
            <div>
              <p className="storeName">{flyer.store}</p>
              <h2>{item.name}</h2>
              <p className="muted">{item.brand} • {item.unit} • {formatDateRange(flyer.validFrom, flyer.validTo)}</p>
            </div>
            <strong className="pricePill">${item.price.toFixed(2)}</strong>
            <Link className="button" href={`/flyers/${flyer.flyerId}?page=${page.pageNumber}&item=${item.id}`}>View in Flyer</Link>
          </article>
        ))}
        {query && !results.length ? <p className="emptyState">No matching flyer item found.</p> : null}
      </section>
    </main>
  );
}
