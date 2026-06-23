import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findFlyer, flyers } from '@/data/mock-data';
import { formatDateRange } from '@/lib/search';
import { FlyerClient } from './viewer-client';

export function generateStaticParams() {
  return flyers.map((flyer) => ({ id: flyer.id }));
}

export default function FlyerPage({ params }: { params: { id: string } }) {
  const flyer = findFlyer(params.id);
  if (!flyer) notFound();

  return (
    <main className="viewerShell">
      <header className="viewerTopbar">
        <Link href="/">← Flyers</Link>
        <div>
          <strong>{flyer.store}</strong>
          <span>{flyer.title} • {formatDateRange(flyer.validFrom, flyer.validTo)}</span>
        </div>
        <Link href="/results?q=milk">Compare</Link>
      </header>
      <Suspense fallback={<div className="emptyState">Loading flyer viewer…</div>}><FlyerClient flyer={flyer} allFlyers={flyers} /></Suspense>
    </main>
  );
}
