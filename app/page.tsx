import Image from 'next/image';
import Link from 'next/link';
import { flyers } from '@/data/mock-data';

export default function Home() {
  return (
    <main className="homeShell">
      <section className="hero">
        <p className="eyebrow">Mobile flyer price matching</p>
        <h1>Tap produce in a flyer and compare prices instantly.</h1>
        <p>Browse high-resolution grocery flyers, OCR the item under your finger, and rank fruit and vegetable prices by store.</p>
      </section>
      <section className="flyerGrid" aria-label="Available store flyers">
        {flyers.map((flyer) => (
          <Link key={flyer.id} href={`/flyers/${flyer.id}`} className="flyerCard">
            <Image src={flyer.thumbnailUrl} alt={`${flyer.storeName} flyer thumbnail`} width={640} height={420} sizes="(max-width: 768px) 100vw, 33vw" />
            <div><span>{flyer.storeName}</span><small>Weekly produce flyer</small></div>
          </Link>
        ))}
      </section>
    </main>
  );
}
