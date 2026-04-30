import Link from 'next/link';
import { formatPrice, formatMiles } from '@/lib/format';
import { ArrowUpRight } from 'lucide-react';

type Photo = { url: string; alt: string | null };
type Vehicle = {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  bodyStyle: string;
  condition: string;
  mileage: number;
  price: number;
  exteriorColor: string | null;
  drivetrain: string | null;
  transmission: string | null;
  engine: string | null;
  photos: Photo[];
};

export default function VehicleCard({ v, index = 0 }: { v: Vehicle; index?: number }) {
  const photo = v.photos[0]?.url;
  const condition =
    v.condition === 'certified' ? 'CPO' : v.condition === 'new' ? 'New' : 'Pre-Owned';

  return (
    <Link href={`/inventory/${v.slug}`} className="card-link group block">
      <div className="relative overflow-hidden bg-ink-700">
        <div className="aspect-[4/3] relative">
          {photo ? (
            // Using <img> over next/image so unconfigured remote hosts still render in the seed.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={v.photos[0]?.alt || `${v.year} ${v.make} ${v.model}`}
              className="card-image absolute inset-0 w-full h-full object-cover"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ash font-mono text-xs">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        </div>

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="font-mono text-[10px] text-cream tracking-ticker bg-ink/70 backdrop-blur px-2.5 py-1.5">
            {condition}
          </div>
          <div className="font-mono text-[10px] text-cream tracking-ticker bg-ink/70 backdrop-blur px-2.5 py-1.5">
            {v.year}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full border border-cream/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <ArrowUpRight size={14} className="text-cream" />
        </div>
      </div>

      <div className="pt-5 flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="display text-2xl leading-none tracking-tightest truncate">
            {v.make} {v.model}
          </div>
          <div className="eyebrow mt-2 text-[10px]">
            {v.trim && <span>{v.trim} · </span>}
            {v.bodyStyle}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="display text-xl tabular leading-none">
            {formatPrice(v.price)}
          </div>
          <div className="eyebrow text-[9px] text-ash mt-2">
            {formatMiles(v.mileage)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t hairline grid grid-cols-3 gap-4">
        <Spec label="Drive" value={v.drivetrain || '—'} />
        <Spec label="Trans" value={v.transmission?.split(' ')[0] || '—'} />
        <Spec label="Color" value={v.exteriorColor || '—'} />
      </div>
    </Link>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="spec-label">{label}</div>
      <div className="spec-value truncate text-xs mt-1">{value}</div>
    </div>
  );
}
