'use client';

import { useDrag, usePinch } from '@use-gesture/react';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';

type Props = {
  src: string;
  alt: string;
  onRegionSelected: (imageDataUrl: string) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function ZoomableFlyer({ src, alt, onRegionSelected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastTap = useRef(0);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);

  const style = useMemo(
    () => ({ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})` }),
    [transform]
  );

  useDrag(({ offset: [x, y], pinching, cancel }) => {
    if (pinching) return cancel();
    if (transform.scale <= 1) return;
    setTransform((current) => ({ ...current, x, y }));
  }, { target: containerRef, from: () => [transform.x, transform.y], eventOptions: { passive: false } });

  usePinch(({ offset: [scale] }) => {
    setTransform((current) => ({ ...current, scale: clamp(scale, 1, 5) }));
  }, { target: containerRef, scaleBounds: { min: 1, max: 5 }, rubberband: true, eventOptions: { passive: false } });

  async function cropRegion(clientX: number, clientY: number) {
    const image = imageRef.current;
    if (!image) return;
    setIsSelecting(true);
    try {
      const rect = image.getBoundingClientRect();
      const naturalX = ((clientX - rect.left) / rect.width) * image.naturalWidth;
      const naturalY = ((clientY - rect.top) / rect.height) * image.naturalHeight;
      const cropSize = Math.min(520, image.naturalWidth, image.naturalHeight);
      const sx = clamp(naturalX - cropSize / 2, 0, image.naturalWidth - cropSize);
      const sy = clamp(naturalY - cropSize / 2, 0, image.naturalHeight - cropSize);
      const canvas = document.createElement('canvas');
      canvas.width = cropSize;
      canvas.height = cropSize;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, cropSize, cropSize);
      onRegionSelected(canvas.toDataURL('image/png'));
    } finally {
      window.setTimeout(() => setIsSelecting(false), 250);
    }
  }

  function handleTap(event: React.PointerEvent<HTMLDivElement>) {
    if (Math.abs(transform.x) > 4 || Math.abs(transform.y) > 4) return;
    const now = Date.now();
    if (now - lastTap.current < 280) {
      setTransform((current) => current.scale > 1 ? { scale: 1, x: 0, y: 0 } : { ...current, scale: 2.5 });
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    window.setTimeout(() => {
      if (Date.now() - lastTap.current >= 260) cropRegion(event.clientX, event.clientY);
    }, 270);
  }

  return (
    <div ref={containerRef} className="viewer" onPointerUp={handleTap}>
      <div className="flyerImage" style={style}>
        <Image ref={imageRef} src={src} alt={alt} fill priority sizes="100vw" crossOrigin="anonymous" />
      </div>
      <div className="viewerHint">Pinch to zoom • Double tap to zoom • Tap produce to OCR search</div>
      {isSelecting && <div className="scanPulse">Scanning selected flyer region…</div>}
    </div>
  );
}
