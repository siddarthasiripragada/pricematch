import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findFlyer } from '@/data/mock-data';
import { formatDateRange } from '@/lib/search';
import { FlyerClient } from './viewer-client';

export default function FlyerPage({ params, searchParams }: { params: { id: string }; searchParams: { page?: string; item?: string } }) {
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
      <FlyerClient flyer={flyer} initialPage={Number(searchParams.page ?? 1)} initialItemId={searchParams.item} />
    </main>
  );
}
