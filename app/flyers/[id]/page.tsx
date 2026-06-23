import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlyerClient } from './viewer-client';
import { flyers } from '@/data/mock-data';

export default function FlyerPage({ params }: { params: { id: string } }) {
  const flyer = flyers.find((item) => item.id === params.id);
  if (!flyer) notFound();

  return (
    <main className="viewerShell">
      <header className="viewerTopbar">
        <Link href="/">← Flyers</Link>
        <strong>{flyer.storeName}</strong>
      </header>
      <FlyerClient flyer={flyer} />
    </main>
  );
}
