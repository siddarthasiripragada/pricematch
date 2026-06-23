import { Suspense } from 'react';
import Link from 'next/link';
import { ResultsClient } from './results-client';

export default function ResultsPage() {
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
          <input name="q" placeholder="Search product e.g. milk" />
          <button type="submit">Search</button>
        </form>
      </section>
      <Suspense fallback={<p className="emptyState">Loading results…</p>}><ResultsClient /></Suspense>
    </main>
  );
}
