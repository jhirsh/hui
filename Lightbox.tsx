'use client';

import { useCallback, useEffect, useRef } from 'react';
import PhotoImg, { type ImgSrc } from './PhotoImg';

// Full-screen viewer for a set of images.
// index === null is closed; onIndex(null) closes, onIndex(i) jumps.
//
// Paging is a CSS scroll-snap track, not a swapped-out single image: native
// swipe, momentum and rubber-banding for free, arrows/keys just scroll it.
export default function Lightbox({
  items,
  index,
  onIndex,
  label = 'photo',
}: {
  items: ImgSrc[];
  index: number | null;
  onIndex: (i: number | null) => void;
  label?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onIndex(null), [onIndex]);

  // Scroll the track to `index` whenever it changes from the outside (open,
  // arrows, keys). No-op when the user's own swipe already put us there.
  const scrollTo = useCallback((i: number, behavior: ScrollBehavior) => {
    const el = track.current;
    if (!el) return;
    const left = i * el.clientWidth;
    if (Math.abs(el.scrollLeft - left) > 1) el.scrollTo({ left, behavior });
  }, []);

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      const i = (index + d + items.length) % items.length;
      onIndex(i);
      // Wrapping is a jump, not a slide — snapping across the whole track looks broken.
      scrollTo(i, Math.abs(i - index) === 1 ? 'smooth' : 'auto');
    },
    [index, items.length, label, onIndex, scrollTo]
  );

  // Swipe hint: a small nudge that settles back, so opening on a touch device
  // shows the photos move sideways. Arrows say it on desktop, so coarse only.
  const nudged = useRef(false);
  useEffect(() => {
    if (index === null) {
      nudged.current = false;
      return;
    }
    if (nudged.current) return;
    nudged.current = true;
    const el = track.current;
    // ponytail: fires on every open for now — gate on sessionStorage if it nags.
    if (!el || !matchMedia('(pointer: coarse)').matches) return;
    el.scrollBy({ left: 18, behavior: 'smooth' });
    const t = setTimeout(() => el.scrollBy({ left: -18, behavior: 'smooth' }), 500);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, close, go]);

  if (index === null) return null;
  const item = items[index];

  const arrow = 'absolute top-1/2 z-10 hidden sm:block -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20';

  return (
    <div
      // z above Leaflet: its panes and controls sit at 400–1000 in the root
      // stacking context, so a z-50 overlay lets the map punch through.
      className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm"
      onClick={close}
    >
      <div
        ref={(el) => {
          track.current = el;
          if (el && el.scrollLeft === 0 && index > 0) scrollTo(index, 'auto');
        }}
        // Mouse wheels only scroll vertically; map that onto the track so a
        // plain wheel pages the photos. Trackpad h-scroll comes through natively.
        onWheel={(e) => {
          const el = e.currentTarget;
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
          // Page a whole slide (a partial scroll just snaps back), and ignore the
          // rest of the wheel burst while that scroll is still in flight.
          if (el.scrollLeft % el.clientWidth === 0)
            el.scrollBy({ left: Math.sign(e.deltaY) * el.clientWidth, behavior: 'smooth' });
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index && items[i]) onIndex(i);
        }}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <div
            key={it.name}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center px-2 sm:px-24"
          >
            {/* Box is sized to the item's own aspect ratio (bounded by the slot)
                so the blur feather hugs the image, not the full screen. */}
            <div
              className="relative max-h-full"
              style={{
                width: `min(100%, ${((90 * it.width) / it.height).toFixed(3)}vh)`,
                aspectRatio: `${it.width} / ${it.height}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Every slide renders; loading="lazy" keeps off-screen ones from
                  fetching, so no index bookkeeping decides what's mounted. */}
              <PhotoImg
                photo={it}
                sizes="95vw"
                eager={i === index}
                feather
                imgClassName="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={(e) => (e.stopPropagation(), go(-1))}
        className={`${arrow} left-2 sm:left-6`}
        aria-label={`Previous ${label}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={(e) => (e.stopPropagation(), go(1))}
        className={`${arrow} right-2 sm:right-6`}
        aria-label={`Next ${label}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <button
        onClick={(e) => (e.stopPropagation(), close())}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6 sm:top-6"
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 text-xs text-white/60"
        onClick={(e) => e.stopPropagation()}
      >
        <span>
          {index + 1} / {items.length}
        </span>
        <a
          href={item.original}
          download
          className="rounded-full bg-white/10 px-3 py-1 text-white/80 hover:bg-white/20"
        >
          Download original
        </a>
      </div>
    </div>
  );
}
