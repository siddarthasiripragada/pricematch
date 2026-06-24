import Link from 'next/link';
import { flyers } from '@/data/mock-data';
import { formatDateRange } from '@/lib/search';
import { getAssetPath } from '@/lib/assets';

export default function Home() {
  return (
    <main className="appShell">
      <header className="siteHeader">
        <Link href="/" className="brand">Price<span>Match</span></Link>
        <nav className="siteNav" aria-label="Primary navigation">
          <Link href="/">Flyers</Link>
          <Link href="/results?q=milk">Compare prices</Link>
        </nav>
      </header>

      <section className="heroPanel">
        <p className="eyebrow">Canadian grocery flyer browser</p>
        <h1>Browse flyers, search products, jump to the exact deal.</h1>
        <form action="/results" className="heroSearch">
          <input name="q" placeholder="Compare milk, eggs, chicken…" aria-label="Search all flyers" />
          <button type="submit">Compare</button>
        </form>
      </section>

      <section className="sectionHeader">
        <p className="eyebrow">Available flyers</p>
        <h2>Weekly store flyers</h2>
      </section>

      <section className="flyerGrid" aria-label="Available flyers">
        {flyers.map((flyer) => (
          <article key={flyer.id} className="flyerCard">
            <div className="flyerCover"><span className="logoPlaceholder">{flyer.logoText}</span><img src={getAssetPath(flyer.coverImageUrl)} alt={`${flyer.store} flyer cover`} /></div>
            <div className="flyerCardBody">
              <p className="storeName">{flyer.store}</p>
              <h3>{flyer.title}</h3>
              <p className="muted">Valid {formatDateRange(flyer.validFrom, flyer.validTo)}</p>
              <Link className="button" href={`/flyers/${flyer.id}`}>Open {flyer.store} flyer</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
