'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ZoomableFlyer } from '@/components/ZoomableFlyer';
import { extractTextFromImage } from '@/lib/ocr';
import type { Flyer } from '@/lib/types';

type FlyerRegion = {
  imageDataUrl: string;
  x: number;
  y: number;
};

export function FlyerClient({ flyer }: { flyer: Flyer }) {
  const router = useRouter();
  const [status, setStatus] = useState('Tap a fruit or vegetable label to search.');

  async function handleRegionSelected({ imageDataUrl, x, y }: FlyerRegion) {
    const timeout = window.setTimeout(() => setStatus('OCR is taking longer than 2 seconds; still working…'), 2000);
    setStatus(`Scanning flyer at x:${x}, y:${y}…`);
    try {
      const text = await extractTextFromImage(imageDataUrl);
      const query = text || 'produce';
      setStatus(`Searching produce prices for “${query}”…`);
      router.push(`/results?q=${encodeURIComponent(query)}&flyer=${encodeURIComponent(flyer.id)}&x=${x}&y=${y}`);
    } catch {
      setStatus('OCR could not read that spot in under 2 seconds. Try tapping a clearer product name or price block.');
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
