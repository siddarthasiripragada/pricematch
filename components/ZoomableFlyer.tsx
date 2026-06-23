'use client';

import { useCallback, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

type Props = {
  src: string;
  alt: string;
  onRegionSelected: (payload: { imageDataUrl: string; x: number; y: number }) => void;
};

const MAX_SCALE = 5;
const TAP_MOVE_TOLERANCE = 10;
const DOUBLE_TAP_MS = 280;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function ZoomableFlyer({ src, alt, onRegionSelected }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const cropRegion = useCallback(async (clientX: number, clientY: number) => {
    const image = imageRef.current;
    if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) return;

    const rect = image.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;

    setIsSelecting(true);
    try {
      const naturalX = ((clientX - rect.left) / rect.width) * image.naturalWidth;
      const naturalY = ((clientY - rect.top) / rect.height) * image.naturalHeight;
      const cropSize = Math.min(560, image.naturalWidth, image.naturalHeight);
      const sx = clamp(naturalX - cropSize / 2, 0, image.naturalWidth - cropSize);
      const sy = clamp(naturalY - cropSize / 2, 0, image.naturalHeight - cropSize);

      const canvas = document.createElement('canvas');
      canvas.width = cropSize;
      canvas.height = cropSize;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      context.imageSmoothingEnabled = false;
      context.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, cropSize, cropSize);
      onRegionSelected({ imageDataUrl: canvas.toDataURL('image/png'), x: Math.round(naturalX), y: Math.round(naturalY) });
    } finally {
      window.setTimeout(() => setIsSelecting(false), 250);
    }
  }, [onRegionSelected]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved > TAP_MOVE_TOLERANCE) return;

    const now = Date.now();
    const previousTap = lastTap.current;
    if (previousTap && now - previousTap.time < DOUBLE_TAP_MS && Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y) < 40) {
      lastTap.current = null;
      const state = transformRef.current?.instance.transformState;
      if (state && state.scale > 1.05) {
        transformRef.current?.resetTransform(180, 'easeOut');
      } else {
        transformRef.current?.zoomToElement('flyer-image', 2.6, 180, 'easeOut');
      }
      return;
    }

    lastTap.current = { time: now, x: event.clientX, y: event.clientY };
    window.setTimeout(() => {
      if (lastTap.current?.time === now) {
        lastTap.current = null;
        cropRegion(event.clientX, event.clientY);
      }
    }, DOUBLE_TAP_MS + 20);
  }

  return (
    <div className="viewer" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <TransformWrapper
        ref={transformRef}
        minScale={1}
        maxScale={MAX_SCALE}
        centerOnInit
        limitToBounds
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.16, smoothStep: 0.004 }}
        pinch={{ step: 6 }}
        panning={{ velocityDisabled: false }}
      >
        <TransformComponent wrapperClass="transformWrapper" contentClass="transformContent">
          <img id="flyer-image" ref={imageRef} className="flyerImageElement" src={src} alt={alt} crossOrigin="anonymous" decoding="async" draggable={false} />
        </TransformComponent>
      </TransformWrapper>
      <div className="viewerHint">Pinch or mouse wheel to zoom • Drag while zoomed • Double tap to zoom • Tap produce to search</div>
      {isSelecting && <div className="scanPulse">Scanning selected flyer region…</div>}
    </div>
  );
}
