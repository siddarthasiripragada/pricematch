import Link from 'next/link';
import type { Flyer } from '@/lib/types';

export function FlyerSwitcher({ flyers, activeFlyerId }: { flyers: Flyer[]; activeFlyerId: string }) {
  return (
    <nav className="flyerSwitcher" aria-label="Switch store flyer">
      {flyers.map((flyer) => (
        <Link key={flyer.id} href={`/flyers/${flyer.id}`} className={flyer.id === activeFlyerId ? 'active' : ''} aria-current={flyer.id === activeFlyerId ? 'page' : undefined}>
          <span>{flyer.logoText}</span>
          {flyer.store}
        </Link>
      ))}
    </nav>
  );
}
