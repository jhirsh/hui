'use client';

import { useEffect, useRef, useState } from 'react';

// The image fields shared by photos and sketches (a manifest entry minus the
// gallery-specific flags). Both Photo and Sketch satisfy this.
export type ImgSrc = {
  name: string;
  width: number;
  height: number;
  blurDataURL: string;
  avif: string; // srcset
  webp: string; // srcset
  fallback: string;
  original: string;
};

// Responsive <picture> with AVIF→WebP fallback and a blur-up placeholder.
// The browser picks the right srcset entry for the viewport + device pixel
// ratio, so grid cells load tiny derivatives and the lightbox loads a larger
// one — never the full-res original (that's behind the download link).
export default function PhotoImg({
  photo,
  sizes,
  eager = false,
  feather = false,
  imgClassName,
}: {
  photo: ImgSrc;
  sizes: string;
  eager?: boolean;
  // feather: render the blur as a contained image matching the final photo's
  // box (slightly enlarged, soft edges) instead of a full-bleed cover. Used in
  // the lightbox so the preview is ~the size of the photo, not full-screen.
  feather?: boolean;
  imgClassName: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // ponytail: covers the already-complete case — an image that finished loading
  // before React attached onLoad (cache hit, or eager start) never fires it.
  useEffect(() => {
    // naturalWidth guards lazy images: they report complete before they start.
    if (img.current?.complete && img.current.naturalWidth > 0) setLoaded(true);
  });
  return (
    <>
      {feather ? (
        <img
          aria-hidden
          src={photo.blurDataURL}
          className={`absolute inset-0 h-full w-full object-cover blur-2xl transition-opacity duration-500 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent),linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-composite:source-in] [mask-composite:intersect] ${
            loaded ? 'opacity-0' : 'opacity-80'
          }`}
          style={{ transform: 'scale(1.06)' }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-500"
          style={{ backgroundImage: `url("${photo.blurDataURL}")`, opacity: loaded ? 0 : 1 }}
        />
      )}
      <picture>
        <source type="image/avif" srcSet={photo.avif} sizes={sizes} />
        <source type="image/webp" srcSet={photo.webp} sizes={sizes} />
        <img
          ref={img}
          src={photo.fallback}
          alt={photo.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`${imgClassName} transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </>
  );
}
