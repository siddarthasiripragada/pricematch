import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PriceMatch Flyers',
  description: 'Compare fruit and vegetable flyer prices across grocery stores.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
