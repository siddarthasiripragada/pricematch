import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Price Match / Flyer Viewer',
  description: 'Browse Canadian grocery flyers, search products, and compare prices.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-CA"><body>{children}</body></html>;
}
