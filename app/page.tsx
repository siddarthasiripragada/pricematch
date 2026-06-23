import Image from 'next/image';
import Link from 'next/link';
import { flyers } from '@/data/mock-data';

const produceChips = ['Apples', 'Avocados', 'Tomatoes', 'Lettuce'];

export default function Home() {
  return (
    <main className="homeShell">
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Premium flyer price matching</p>
          <h1>Find the Lowest Grocery Prices Instantly</h1>
          <p className="heroSubtext">Tap any flyer item → OCR → Compare prices across stores</p>
          <div className="heroActions" aria-label="Primary actions">
            <Link className="button primaryButton" href={`/flyers/${flyers[0].id}`}>Open flyer scanner</Link>
            <Link className="button ghostButton" href="/results?q=apples">Compare apples</Link>
          </div>
          <div className="produceChips" aria-label="Popular produce searches">
            {produceChips.map((chip) => <span key={chip}>{chip}</span>)}
          </div>
        </div>
        <div className="heroMockup" aria-label="Animated flyer viewer mockup">
          <div className="mockupPhone">
            <div className="mockupToolbar"><span /> <strong>Flyer Lens</strong> <span /></div>
            <div className="mockupFlyer">
              <Image src={flyers[1].thumbnailUrl} alt="Animated grocery flyer preview" fill sizes="360px" priority />
              <div className="scanRing" />
              <div className="ocrBubble">OCR: Tomatoes $1.99/lb</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sectionHeader">
        <p className="eyebrow">Weekly flyers</p>
        <h2>Choose a store and tap produce to compare.</h2>
      </section>
      <section className="flyerGrid" aria-label="Available store flyers">
        {flyers.map((flyer, index) => (
          <Link key={flyer.id} href={`/flyers/${flyer.id}`} className="flyerCard" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="storeBadge" aria-hidden="true">{flyer.logo}</div>
            <div className="flyerThumb">
              <Image src={flyer.thumbnailUrl} alt={`${flyer.storeName} flyer thumbnail`} width={640} height={420} sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="flyerCardBody">
              <span>{flyer.storeName}</span>
              <small>Weekly fruit & vegetable flyer</small>
            </div>
          </Link>
        ))}
      </section>
      <nav className="mobileBottomNav" aria-label="Mobile navigation">
        <Link href="/">Flyers</Link>
        <Link href="/results?q=produce">Deals</Link>
        <Link href={`/flyers/${flyers[0].id}`}>Scan</Link>
      </nav>
    </main>
  );
}
