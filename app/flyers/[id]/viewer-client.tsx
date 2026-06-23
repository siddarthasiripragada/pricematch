'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ZoomableFlyer } from '@/components/ZoomableFlyer';
import { extractTextFromImage } from '@/lib/ocr';
import type { Flyer } from '@/lib/types';

export function FlyerClient({ flyer }: { flyer: Flyer }) {
  const router = useRouter();
  const [status, setStatus] = useState('Tap a produce item to search.');

  async function handleRegionSelected(imageDataUrl: string) {
    const timeout = window.setTimeout(() => setStatus('OCR is taking longer than 2 seconds; still working…'), 2000);
    setStatus('Extracting flyer text with OCR…');
    try {
      const text = await extractTextFromImage(imageDataUrl);
      const query = text || 'produce';
      setStatus(`Searching for “${query}”…`);
      router.push(`/results?q=${encodeURIComponent(query)}&flyer=${encodeURIComponent(flyer.id)}`);
    } catch {
      setStatus('OCR failed for that region. Try a larger, clearer product label.');
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return (
    <>
      <ZoomableFlyer src={flyer.imageUrl} alt={`${flyer.storeName} flyer`} onRegionSelected={handleRegionSelected} />
      <div className="statusBar">{status}</div>
    </>
  );
}
