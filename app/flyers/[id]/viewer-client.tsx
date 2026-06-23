'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { Flyer, FlyerProduct } from '@/lib/types';
import { formatDateRange, itemMatchesQuery } from '@/lib/search';

type PendingFocus = { pageNumber: number; productId: string } | null;

export function FlyerClient({ flyer, initialPage, initialItemId }: { flyer: Flyer; initialPage: number; initialItemId?: string }) {
  const zoomRef = useRef<ReactZoomPanPinchRef | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [query, setQuery] = useState('');
  const [activeProductId, setActiveProductId] = useState(initialItemId);
  const [pendingFocus, setPendingFocus] = useState<PendingFocus>(initialItemId ? { pageNumber: initialPage, productId: initialItemId } : null);

  const page = flyer.pages.find((candidate) => candidate.pageNumber === pageNumber) ?? flyer.pages[0];
  const activeProduct = page.products.find((product) => product.id === activeProductId);
  const matches = useMemo(
    () => query ? flyer.pages.flatMap((candidatePage) => candidatePage.products
      .filter((product) => itemMatchesQuery(product, query))
      .map((product) => ({ pageNumber: candidatePage.pageNumber, product }))) : [],
    [flyer.pages, query]
  );
  const noMatch = query.trim() && matches.length === 0;

  function transformToProduct(product: FlyerProduct) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    const scale = Math.min(3, Math.max(1.8, (bounds?.width ?? page.width) / Math.max(product.bbox.width * 2.6, 1)));
    const viewportWidth = bounds?.width ?? page.width;
    const viewportHeight = bounds?.height ?? page.height;
    const x = viewportWidth / 2 - (product.bbox.x + product.bbox.width / 2) * scale;
    const y = viewportHeight / 2 - (product.bbox.y + product.bbox.height / 2) * scale;
    zoomRef.current?.setTransform(x, y, scale, 450, 'easeOut');
  }

  function jumpToProduct(product: FlyerProduct) {
    setActiveProductId(product.id);
    if (product.pageNumber !== pageNumber) {
      setPendingFocus({ pageNumber: product.pageNumber, productId: product.id });
      setPageNumber(product.pageNumber);
      return;
    }
    window.setTimeout(() => transformToProduct(product), 40);
  }

  useEffect(() => {
    if (!pendingFocus || pendingFocus.pageNumber !== page.pageNumber) return;
    const product = page.products.find((candidate) => candidate.id === pendingFocus.productId);
    if (!product) return;
    setActiveProductId(product.id);
    window.setTimeout(() => transformToProduct(product), 120);
    setPendingFocus(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.pageNumber, pendingFocus]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[0]) jumpToProduct(matches[0].product);
  }

  return (
    <section className="flyerViewer">
      <aside className="viewerPanel">
        <form onSubmit={submitSearch} className="flyerSearch">
          <label htmlFor="flyer-search">Search inside this flyer</label>
          <input id="flyer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="milk, eggs, bread…" />
          <button type="submit">Find item in flyer image</button>
        </form>
        {noMatch ? <p className="emptyState">No matching item found in this flyer.</p> : null}
        {matches.length ? (
          <div className="matchList" aria-label="Flyer search results">
            {matches.map(({ pageNumber: matchPage, product }) => (
              <button key={product.id} type="button" onClick={() => jumpToProduct(product)}>
                Page {matchPage}: {product.name} • {product.brand} • ${product.price.toFixed(2)}
              </button>
            ))}
          </div>
        ) : null}
        <div className="pageControls">
          <button type="button" disabled={page.pageNumber === 1} onClick={() => { setPageNumber(page.pageNumber - 1); setActiveProductId(undefined); }}>Previous page</button>
          <span>Page {page.pageNumber} of {flyer.pages.length}</span>
          <button type="button" disabled={page.pageNumber === flyer.pages.length} onClick={() => { setPageNumber(page.pageNumber + 1); setActiveProductId(undefined); }}>Next page</button>
        </div>
      </aside>

      <div className="canvasShell" ref={canvasRef}>
        <TransformWrapper ref={zoomRef} minScale={0.45} initialScale={0.85} maxScale={5} centerOnInit panning={{ velocityDisabled: false }} pinch={{ step: 8 }} wheel={{ step: 0.16 }} doubleClick={{ mode: 'toggle' }}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="floatingToolbar"><button onClick={() => zoomOut()}>−</button><button onClick={() => resetTransform()}>Reset</button><button onClick={() => zoomIn()}>+</button></div>
              <TransformComponent wrapperClass="transformWrapper" contentClass="transformContent">
                <div className="flyerPage" style={{ width: page.width, height: page.height }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.imageUrl} alt={`${flyer.store} flyer page ${page.pageNumber}`} draggable={false} />
                  {page.products.map((product) => {
                    const active = product.id === activeProductId || matches.some((match) => match.product.id === product.id);
                    return <button key={product.id} type="button" className={`productBox ${active ? 'active' : ''}`} onClick={() => jumpToProduct(product)} style={{ left: product.bbox.x, top: product.bbox.y, width: product.bbox.width, height: product.bbox.height }} aria-label={`View ${product.name}`} />;
                  })}
                  {activeProduct ? <div className="itemTooltip" style={{ left: Math.min(activeProduct.bbox.x, page.width - 260), top: Math.min(activeProduct.bbox.y + activeProduct.bbox.height + 8, page.height - 135) }}><strong>{activeProduct.name}</strong><span>{activeProduct.brand}</span><b>${activeProduct.price.toFixed(2)} / {activeProduct.unit}</b><small>{flyer.store} • {formatDateRange(flyer.validFrom, flyer.validTo)}</small></div> : null}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </section>
  );
}
