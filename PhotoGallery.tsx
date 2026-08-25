'use client';

import { useState } from 'react';
import PhotoImg, { type ImgSrc } from './PhotoImg';
import Lightbox from './Lightbox';

/**
 * A responsive grid of photos that opens a full-screen Lightbox on click.
 * Feed it a manifest written by `scripts/optimize-images.mjs`.
 *
 * ponytail: uniform tiles, no featured/portrait spans and no "show all" modal —
 * that layout logic lives in camino's own Gallery. Lift it here if a second
 * site needs it.
 */
export default function PhotoGallery({
  photos,
  columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  aspect = '1 / 1',
  className = '',
}: {
  photos: ImgSrc[];
  /** Tailwind column classes; override for a different density. */
  columns?: string;
  /** CSS aspect-ratio for each tile. */
  aspect?: string;
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <div className={`grid gap-3 ${columns} ${className}`}>
        {photos.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActive(i)}
            style={{ aspectRatio: aspect }}
            className="group relative block overflow-hidden rounded-md bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label={`Open ${p.name}`}
          >
            <PhotoImg
              photo={p}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              imgClassName="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>
      <Lightbox items={photos} index={active} onIndex={setActive} />
    </>
  );
}
