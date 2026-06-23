'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import type { Flyer, FlyerItem } from '@/lib/types';
import { formatDateRange, itemMatchesQuery } from '@/lib/search';

export function FlyerClient({ flyer, initialPage, initialItemId }: { flyer: Flyer; initialPage: number; initialItemId?: string }) {
  const zoomRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [query, setQuery] = useState('');
  const [activeItemId, setActiveItemId] = useState(initialItemId);
  const page = flyer.pages.find((candidate) => candidate.pageNumber === pageNumber) ?? flyer.pages[0];
  const activeItem = page.items.find((item) => item.id === activeItemId);
  const matches = useMemo(() => query ? page.items.filter((item) => itemMatchesQuery(item, query)) : [], [page.items, query]);
  const noMatch = query.trim() && matches.length === 0;

  function focusItem(item: FlyerItem) {
    setActiveItemId(item.id);
    const scale = 2.2;
    const centerX = 480 - (item.bbox.x + item.bbox.width / 2) * scale;
    const centerY = 360 - (item.bbox.y + item.bbox.height / 2) * scale;
    zoomRef.current?.setTransform(centerX, centerY, scale, 450, 'easeOut');
  }

  useEffect(() => {
    if (initialItemId && activeItem) window.setTimeout(() => focusItem(activeItem), 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[0]) focusItem(matches[0]);
  }

  return (
    <section className="flyerViewer">
      <aside className="viewerPanel">
        <form onSubmit={submitSearch} className="flyerSearch">
          <label htmlFor="flyer-search">Search inside flyer</label>
          <input id="flyer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="milk, eggs, bread…" />
          <button type="submit">Find item</button>
        </form>
        {noMatch ? <p className="emptyState">No matching flyer item found.</p> : null}
        {matches.length ? (
          <div className="matchList">
            {matches.map((item) => <button key={item.id} type="button" onClick={() => focusItem(item)}>{item.name} • ${item.price.toFixed(2)}</button>)}
          </div>
        ) : null}
        <div className="pageControls">
          <button type="button" disabled={page.pageNumber === 1} onClick={() => { setPageNumber(page.pageNumber - 1); setActiveItemId(undefined); }}>Previous</button>
          <span>Page {page.pageNumber} of {flyer.pages.length}</span>
          <button type="button" disabled={page.pageNumber === flyer.pages.length} onClick={() => { setPageNumber(page.pageNumber + 1); setActiveItemId(undefined); }}>Next</button>
        </div>
      </aside>

      <div className="canvasShell">
        <TransformWrapper ref={zoomRef} minScale={0.6} initialScale={0.85} maxScale={5} centerOnInit wheel={{ step: 0.16 }} doubleClick={{ mode: 'toggle' }}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="floatingToolbar"><button onClick={() => zoomOut()}>−</button><button onClick={() => resetTransform()}>Reset</button><button onClick={() => zoomIn()}>+</button></div>
              <TransformComponent wrapperClass="transformWrapper" contentClass="transformContent">
                <div className="flyerPage" style={{ width: page.width, height: page.height }}>
                  {/* Native img keeps overlay coordinates in the same flyer coordinate system. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.imageUrl} alt={`${flyer.store} flyer page ${page.pageNumber}`} draggable={false} />
                  {page.items.map((item) => {
                    const active = item.id === activeItemId || matches.some((match) => match.id === item.id);
                    return <button key={item.id} type="button" className={`productBox ${active ? 'active' : ''}`} onClick={() => focusItem(item)} style={{ left: item.bbox.x, top: item.bbox.y, width: item.bbox.width, height: item.bbox.height }} aria-label={`View ${item.name}`} />;
                  })}
                  {activeItem ? <div className="itemTooltip" style={{ left: activeItem.bbox.x, top: activeItem.bbox.y + activeItem.bbox.height + 8 }}><strong>{activeItem.name}</strong><span>{activeItem.brand}</span><b>${activeItem.price.toFixed(2)} / {activeItem.unit}</b><small>{flyer.store} • {formatDateRange(flyer.validFrom, flyer.validTo)}</small></div> : null}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </section>
  );
}
