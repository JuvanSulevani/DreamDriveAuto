'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Photo = { url: string; alt: string | null };

export default function VehicleGallery({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const advance = (delta: number) =>
    setActive((i) => (i + delta + photos.length) % photos.length);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') advance(-1);
      else if (e.key === 'ArrowRight') advance(1);
      else if (e.key === 'Escape') setLightbox(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/10] bg-ink-700 flex items-center justify-center text-ash font-mono text-xs">
        No images
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden bg-ink-700 cursor-zoom-in"
        onClick={() => setLightbox(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={photos[active].url}
          alt={photos[active].alt || ''}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        />

        {photos.length > 1 && (
          <>
            <button
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center hover:bg-copper transition-colors"
              onClick={(e) => { e.stopPropagation(); advance(-1); }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center hover:bg-copper transition-colors"
              onClick={(e) => { e.stopPropagation(); advance(1); }}
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-4 right-4 font-mono text-[10px] tracking-ticker bg-ink/70 backdrop-blur px-2.5 py-1.5">
              {String(active + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-5 md:grid-cols-8 gap-2 mt-3">
          {photos.map((p, i) => (
            <button
              key={i}
              className={`gallery-thumb aspect-[4/3] overflow-hidden ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.alt || ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 backdrop-blur flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            aria-label="Close"
            className="absolute top-6 right-6 text-cream hover:text-copper transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X size={26} />
          </button>

          {/* Counter */}
          {photos.length > 1 && (
            <div className="absolute top-6 left-6 font-mono text-[11px] tracking-ticker text-ash">
              {String(active + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </div>
          )}

          {/* Image — stopPropagation so clicking the image itself doesn't close */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[active].url}
            alt={photos[active].alt || ''}
            className="max-w-full max-h-full object-contain px-16 md:px-24"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ink/80 border hairline flex items-center justify-center hover:bg-copper transition-colors text-cream"
                onClick={(e) => { e.stopPropagation(); advance(-1); }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ink/80 border hairline flex items-center justify-center hover:bg-copper transition-colors text-cream"
                onClick={(e) => { e.stopPropagation(); advance(1); }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
