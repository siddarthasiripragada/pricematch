'use client';

import { useCallback, useRef, useState } from 'react';

type Props = {
  src: string;
  alt: string;
  onRegionSelected: (payload: { imageDataUrl: string; x: number; y: number }) => void;
};

type TapMarker = { x: number; y: number; id: number } | null;
type Transform = { scale: number; x: number; y: number };

const MAX_SCALE = 5;
const MIN_SCALE = 1;
const TAP_MOVE_TOLERANCE = 10;
const DOUBLE_TAP_MS = 280;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function ZoomableFlyer({ src, alt, onRegionSelected }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; transform: Transform } | null>(null);
  const velocity = useRef({ x: 0, y: 0, time: 0 });
  const inertiaFrame = useRef<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [tapMarker, setTapMarker] = useState<TapMarker>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });

  const stopInertia = useCallback(() => {
    if (inertiaFrame.current) window.cancelAnimationFrame(inertiaFrame.current);
    inertiaFrame.current = null;
  }, []);

  const startInertia = useCallback(() => {
    if (transform.scale <= 1) return;
    let vx = velocity.current.x;
    let vy = velocity.current.y;
    const step = () => {
      vx *= 0.92;
      vy *= 0.92;
      if (Math.abs(vx) < 0.08 && Math.abs(vy) < 0.08) {
        inertiaFrame.current = null;
        return;
      }
      setTransform((current) => ({ ...current, x: current.x + vx, y: current.y + vy }));
      inertiaFrame.current = window.requestAnimationFrame(step);
    };
    stopInertia();
    inertiaFrame.current = window.requestAnimationFrame(step);
  }, [stopInertia, transform.scale]);

  const updateScale = useCallback((nextScale: number, centerX = window.innerWidth / 2, centerY = window.innerHeight / 2) => {
    stopInertia();
    setTransform((current) => {
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const ratio = scale / current.scale;
      return {
        scale,
        x: scale === 1 ? 0 : centerX - (centerX - current.x) * ratio,
        y: scale === 1 ? 0 : centerY - (centerY - current.y) * ratio
      };
    });
  }, [stopInertia]);

  const cropRegion = useCallback(async (clientX: number, clientY: number) => {
    const image = imageRef.current;
    if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) return;

    const rect = image.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;

    setIsSelecting(true);
    setTapMarker({ x: clientX, y: clientY, id: Date.now() });
    try {
      const naturalX = ((clientX - rect.left) / rect.width) * image.naturalWidth;
      const naturalY = ((clientY - rect.top) / rect.height) * image.naturalHeight;
      const cropSize = Math.min(620, image.naturalWidth, image.naturalHeight);
      const sx = clamp(naturalX - cropSize / 2, 0, image.naturalWidth - cropSize);
      const sy = clamp(naturalY - cropSize / 2, 0, image.naturalHeight - cropSize);

      const canvas = document.createElement('canvas');
      canvas.width = cropSize * 2;
      canvas.height = cropSize * 2;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      context.imageSmoothingEnabled = true;
      context.filter = 'contrast(1.25) saturate(0.55) grayscale(1)';
      context.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, canvas.width, canvas.height);
      onRegionSelected({ imageDataUrl: canvas.toDataURL('image/png'), x: Math.round(naturalX), y: Math.round(naturalY) });
    } finally {
      window.setTimeout(() => setIsSelecting(false), 320);
      window.setTimeout(() => setTapMarker(null), 900);
    }
  }, [onRegionSelected]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stopInertia();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pointerStart.current = { x: event.clientX, y: event.clientY };
    velocity.current = { x: 0, y: 0, time: performance.now() };

    if (activePointers.current.size === 2) {
      const points = Array.from(activePointers.current.values());
      pinchStart.current = { distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), transform };
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const previous = activePointers.current.get(event.pointerId);
    if (!previous) return;
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.current.size === 2 && pinchStart.current) {
      const points = Array.from(activePointers.current.values());
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      updateScale(pinchStart.current.transform.scale * (distance / pinchStart.current.distance), (points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2);
      return;
    }

    if (transform.scale > 1) {
      const now = performance.now();
      const elapsed = Math.max(now - velocity.current.time, 16);
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      velocity.current = { x: (dx / elapsed) * 16, y: (dy / elapsed) * 16, time: now };
      setTransform((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    activePointers.current.delete(event.pointerId);
    pinchStart.current = null;
    pointerStart.current = null;
    if (!start || activePointers.current.size > 0) return;

    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved > TAP_MOVE_TOLERANCE) {
      startInertia();
      return;
    }

    const now = Date.now();
    const previousTap = lastTap.current;
    if (previousTap && now - previousTap.time < DOUBLE_TAP_MS && Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y) < 40) {
      lastTap.current = null;
      updateScale(transform.scale > 1.05 ? 1 : 2.6, event.clientX, event.clientY);
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

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    updateScale(transform.scale + (event.deltaY < 0 ? 0.24 : -0.24), event.clientX, event.clientY);
  }

  return (
    <div className="viewer" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
      <div className="transformWrapper">
        <div className="transformContent" style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})` }}>
          <img id="flyer-image" ref={imageRef} className="flyerImageElement" src={src} alt={alt} crossOrigin="anonymous" decoding="async" loading="lazy" draggable={false} />
        </div>
      </div>
      <div className="floatingToolbar" aria-label="Flyer zoom controls">
        <button type="button" onClick={() => updateScale(transform.scale - 0.4)} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => setTransform({ scale: 1, x: 0, y: 0 })}>Reset</button>
        <button type="button" onClick={() => updateScale(transform.scale + 0.4)} aria-label="Zoom in">+</button>
      </div>
      {tapMarker && <div key={tapMarker.id} className="tapRipple" style={{ left: tapMarker.x, top: tapMarker.y }} />}
      <div className="viewerHint">Pinch or mouse wheel to zoom • Drag while zoomed • Double tap to zoom • Tap produce to search</div>
      {isSelecting && <div className="scanPulse">Scanning selected flyer region…</div>}
    </div>
  );
}
