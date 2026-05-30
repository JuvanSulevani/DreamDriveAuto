'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import VehicleCard from '@/components/VehicleCard';
import InventoryFilters from '@/components/InventoryFilters';

/**
 * The full list of available vehicles is fetched once on the server (ISR) and
 * filtered/sorted here in the browser from the URL query string. This keeps the
 * /inventory page prerendered and Aurora-independent — applying a filter is a
 * client-side array operation, not a new DB-backed request.
 */
export type ListingVehicle = {
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
  vin: string | null;
  stockNumber: string | null;
  createdAt: number; // epoch ms — for the "newest" sort
  photos: { url: string; alt: string | null }[];
};

type Props = {
  vehicles: ListingVehicle[];
  makes: string[];
  bodyStyles: string[];
};

export default function InventoryBrowser({ vehicles, makes, bodyStyles }: Props) {
  const params = useSearchParams();

  const filtered = useMemo(() => {
    const q = (params.get('q') || '').toLowerCase();
    const make = params.get('make') || '';
    const bodyStyle = params.get('bodyStyle') || '';
    const condition = params.get('condition') || '';
    const priceMin = params.get('priceMin');
    const priceMax = params.get('priceMax');
    const yearMin = params.get('yearMin');
    const yearMax = params.get('yearMax');
    const sort = params.get('sort') || 'newest';

    const result = vehicles.filter((v) => {
      if (q) {
        const haystack = [v.make, v.model, v.trim, v.vin, v.stockNumber]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (make && v.make !== make) return false;
      if (bodyStyle && v.bodyStyle !== bodyStyle) return false;
      if (condition && v.condition !== condition) return false;
      if (priceMin && v.price < Math.round(Number(priceMin) * 100)) return false;
      if (priceMax && v.price > Math.round(Number(priceMax) * 100)) return false;
      if (yearMin && v.year < Number(yearMin)) return false;
      if (yearMax && v.year > Number(yearMax)) return false;
      return true;
    });

    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'mileage_asc': result.sort((a, b) => a.mileage - b.mileage); break;
      case 'year_desc': result.sort((a, b) => b.year - a.year); break;
      default: result.sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [vehicles, params]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-3">
        <InventoryFilters makes={makes} bodyStyles={bodyStyles} />
      </div>

      <div className="lg:col-span-9">
        {filtered.length === 0 ? (
          <div className="border hairline p-16 text-center">
            <div className="display text-4xl">No matches.</div>
            <p className="text-ash mt-4">Try widening your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
            {filtered.map((v, i) => <VehicleCard key={v.id} v={v} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
