'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { FlyerSwitcher } from '@/components/FlyerSwitcher';
import { getAssetPath } from '@/lib/assets';
import type { Flyer, FlyerProduct } from '@/lib/types';
import { formatDateRange, itemMatchesQuery } from '@/lib/search';

type PendingFocus = { pageNumber: number; productId: string } | null;
type ImageStatus = 'loading' | 'loaded' | 'error';

export function FlyerClient({ flyer, allFlyers }: { flyer: Flyer; allFlyers: Flyer[] }) {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get('page') ?? 1);
  const initialItemId = searchParams.get('item') ?? undefined;
  const zoomRef = useRef<ReactZoomPanPinchRef | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [query, setQuery] = useState('');
  const [activeProductId, setActiveProductId] = useState<string | undefined>(initialItemId);
  const [pendingFocus, setPendingFocus] = useState<PendingFocus>(initialItemId ? { pageNumber: initialPage, productId: initialItemId } : null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>('loading');
  const [showHotspots, setShowHotspots] = useState(false);

  const page = flyer.pages.find((candidate) => candidate.pageNumber === pageNumber) ?? flyer.pages[0];
  const pageImageSrc = getAssetPath(page.imageUrl);
  const activeProduct = imageStatus === 'loaded' ? page.products.find((product) => product.id === activeProductId) : undefined;
  const matches = useMemo(
    () => query ? flyer.pages.flatMap((candidatePage) => candidatePage.products
      .filter((product) => itemMatchesQuery(product, query))
      .map((product) => ({ pageNumber: candidatePage.pageNumber, product }))) : [],
    [flyer.pages, query]
  );
  const noMatch = query.trim() && matches.length === 0;

  function fitPage(duration = 250) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) {
      zoomRef.current?.resetTransform(duration, 'easeOut');
      return;
    }
    const padding = bounds.width < 760 ? 20 : 56;
    const scale = Math.min((bounds.width - padding) / page.width, (bounds.height - padding) / page.height, 1);
    const safeScale = Math.max(0.25, scale);
    const x = (bounds.width - page.width * safeScale) / 2;
    const y = (bounds.height - page.height * safeScale) / 2;
    zoomRef.current?.setTransform(x, y, safeScale, duration, 'easeOut');
  }

  function transformToProduct(product: FlyerProduct) {
    if (imageStatus !== 'loaded') return;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const scale = Math.min(3.2, Math.max(1.4, bounds.width / Math.max(product.bbox.width * 2.8, 1)));
    const x = bounds.width / 2 - (product.bbox.x + product.bbox.width / 2) * scale;
    const y = bounds.height / 2 - (product.bbox.y + product.bbox.height / 2) * scale;
    zoomRef.current?.setTransform(x, y, scale, 450, 'easeOut');
  }

  function jumpToProduct(product: FlyerProduct) {
    if (imageStatus !== 'loaded' || product.pageNumber !== pageNumber) {
      setPendingFocus({ pageNumber: product.pageNumber, productId: product.id });
      setActiveProductId(undefined);
      if (product.pageNumber !== pageNumber) setPageNumber(product.pageNumber);
      return;
    }
    setActiveProductId(product.id);
    window.setTimeout(() => transformToProduct(product), 40);
  }

  function changePage(nextPage: number) {
    const boundedPage = Math.min(flyer.pages.length, Math.max(1, nextPage));
    setActiveProductId(undefined);
    setPageNumber(boundedPage);
  }

  useEffect(() => {
    setImageStatus('loading');
    setActiveProductId(undefined);
  }, [flyer.id, page.pageNumber, page.imageUrl]);

  useEffect(() => {
    if (imageStatus !== 'loaded') return;
    const timer = window.setTimeout(() => fitPage(0), 60);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageStatus, flyer.id, page.pageNumber]);

  useEffect(() => {
    if (imageStatus !== 'loaded' || !pendingFocus || pendingFocus.pageNumber !== page.pageNumber) return;
    const product = page.products.find((candidate) => candidate.id === pendingFocus.productId);
    if (!product) return;
    setActiveProductId(product.id);
    window.setTimeout(() => transformToProduct(product), 120);
    setPendingFocus(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageStatus, page.pageNumber, pendingFocus]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[0]) jumpToProduct(matches[0].product);
  }

  return (
    <section className="flyerViewer">
      <aside className="viewerPanel">
        <FlyerSwitcher flyers={allFlyers} activeFlyerId={flyer.id} />
        <form onSubmit={submitSearch} className="flyerSearch">
          <label htmlFor="flyer-search">Search inside this flyer</label>
          <input id="flyer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="milk, eggs, bread…" />
          <button type="submit">Find item in flyer image</button>
        </form>
        <label className="hotspotToggle"><input type="checkbox" checked={showHotspots} onChange={(event) => setShowHotspots(event.target.checked)} /> Show mapped hotspots</label>
        {noMatch ? <p className="emptyState">No matching item found in this flyer.</p> : null}
        {matches.length ? <div className="matchList" aria-label="Flyer search results">{matches.map(({ pageNumber: matchPage, product }) => <button key={product.id} type="button" onClick={() => jumpToProduct(product)}>Page {matchPage}: {product.name} • {product.brand} • ${product.price.toFixed(2)}</button>)}</div> : null}
        <div className="pageStrip" aria-label="Flyer page thumbnails">{flyer.pages.map((candidatePage) => <button key={candidatePage.pageNumber} type="button" className={candidatePage.pageNumber === page.pageNumber ? 'selected' : ''} onClick={() => changePage(candidatePage.pageNumber)}><img src={getAssetPath(candidatePage.imageUrl)} alt="" /><span>Page {candidatePage.pageNumber}</span></button>)}</div>
        <div className="pageControls"><button type="button" disabled={page.pageNumber === 1} onClick={() => changePage(page.pageNumber - 1)}>Previous page</button><span>Page {page.pageNumber} of {flyer.pages.length}</span><button type="button" disabled={page.pageNumber === flyer.pages.length} onClick={() => changePage(page.pageNumber + 1)}>Next page</button></div>
      </aside>

      <div className="canvasShell" ref={canvasRef}>
        <TransformWrapper ref={zoomRef} minScale={0.25} initialScale={0.85} maxScale={5} limitToBounds={false} centerOnInit panning={{ velocityDisabled: false }} pinch={{ step: 8 }} wheel={{ step: 0.16 }} doubleClick={{ mode: 'zoomIn' }}>
          {({ zoomIn, zoomOut }) => (
            <>
              <div className="floatingToolbar"><button type="button" onClick={() => zoomOut()}>−</button><button type="button" onClick={() => fitPage()}>Fit page</button><button type="button" onClick={() => zoomIn()}>+</button></div>
              <TransformComponent wrapperClass="transformWrapper" contentClass="transformContent">
                <div className="flyerPage" style={{ width: page.width, height: page.height }}>
                  <span className={`sourceBadge ${page.sourceType === 'mock-svg' ? 'demo' : 'real'}`}>{page.sourceType === 'mock-svg' ? 'Demo flyer' : 'Real flyer image'}</span>
                  {imageStatus === 'loading' ? <div className="flyerLoading">Loading flyer image…</div> : null}
                  {imageStatus === 'error' ? <div className="flyerError"><strong>Flyer image could not be loaded</strong><code>{pageImageSrc}</code></div> : null}
                  <img src={pageImageSrc} alt={`${flyer.store} flyer page ${page.pageNumber}`} draggable={false} onLoad={() => setImageStatus('loaded')} onError={() => { setImageStatus('error'); if (process.env.NODE_ENV === 'development') console.error('Failed to load flyer image:', pageImageSrc); }} />
                  {imageStatus === 'loaded' ? page.products.map((product) => { const active = product.id === activeProductId || matches.some((match) => match.product.id === product.id); return <button key={product.id} type="button" className={`productBox ${active ? 'active' : ''} ${showHotspots ? 'visible' : ''}`} onClick={() => jumpToProduct(product)} style={{ left: product.bbox.x, top: product.bbox.y, width: product.bbox.width, height: product.bbox.height }} aria-label={`View ${product.name}`} />; }) : null}
                  {activeProduct ? <div className="itemTooltip" style={{ left: Math.min(activeProduct.bbox.x, page.width - 260), top: Math.min(activeProduct.bbox.y + activeProduct.bbox.height + 8, page.height - 155) }}><strong>{activeProduct.name}</strong><span>{activeProduct.brand}</span><b>${activeProduct.price.toFixed(2)} / {activeProduct.unit}</b><small>{flyer.store} • Page {activeProduct.pageNumber} • {formatDateRange(flyer.validFrom, flyer.validTo)}</small><small>{activeProduct.source === 'mock' ? 'Mapped item (demo data)' : `Mapped item${activeProduct.confidence ? ` • confidence ${Math.round(activeProduct.confidence * 100)}%` : ''}`}</small></div> : null}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </section>
  );
}
