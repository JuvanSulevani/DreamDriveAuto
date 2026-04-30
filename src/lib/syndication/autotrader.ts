import { stringify } from 'csv-stringify/sync';
import type { VehicleWithPhotos, FeedResult } from './types';
import { DEALER } from '@/lib/dealer';

/**
 * AutoTrader inventory feed generator.
 *
 * AutoTrader does not provide a public REST API for inventory updates.
 * Listings are syndicated by uploading a delimited inventory feed to
 * AutoTrader's SFTP intake on a fixed schedule (commonly every 4-24 hours).
 * AutoTrader pulls and ingests the file on its end.
 *
 * The column set below follows AutoTrader's standard inventory specification.
 * If your AutoTrader contact provides a different/custom spec, adjust here.
 *
 * Reference: AutoTrader Inventory Provider documentation, "Standard CSV Feed".
 */
const AUTOTRADER_COLUMNS = [
  'DealerID', 'StockNumber', 'VIN', 'Year', 'Make', 'Model', 'Trim',
  'BodyStyle', 'Condition', 'Mileage', 'Price', 'MSRP',
  'ExteriorColor', 'InteriorColor', 'Engine', 'Transmission', 'Drivetrain',
  'FuelType', 'CityMPG', 'HighwayMPG', 'Doors', 'Seats',
  'Description', 'Features', 'PhotoURLs', 'CarfaxURL',
  'Status', 'DateAdded', 'DateUpdated'
];

export function buildAutoTraderFeed(vehicles: VehicleWithPhotos[]): FeedResult {
  const dealerId = process.env.AUTOTRADER_DEALER_ID || process.env.DEALER_ID || '';

  const rows = vehicles.map((v) => ({
    DealerID: dealerId,
    StockNumber: v.stockNumber,
    VIN: v.vin,
    Year: v.year,
    Make: v.make,
    Model: v.model,
    Trim: v.trim ?? '',
    BodyStyle: v.bodyStyle,
    Condition: v.condition === 'certified' ? 'Certified' : v.condition === 'new' ? 'New' : 'Used',
    Mileage: v.mileage,
    Price: (v.price / 100).toFixed(2),
    MSRP: v.msrp ? (v.msrp / 100).toFixed(2) : '',
    ExteriorColor: v.exteriorColor ?? '',
    InteriorColor: v.interiorColor ?? '',
    Engine: v.engine ?? '',
    Transmission: v.transmission ?? '',
    Drivetrain: v.drivetrain ?? '',
    FuelType: v.fuelType ?? '',
    CityMPG: v.cityMpg ?? '',
    HighwayMPG: v.highwayMpg ?? '',
    Doors: v.doors ?? '',
    Seats: v.seats ?? '',
    Description: cleanText(v.description ?? ''),
    Features: v.features ?? '',
    // AutoTrader accepts | -delimited URL list
    PhotoURLs: v.photos.map((p) => absolutize(p.url)).join('|'),
    CarfaxURL: v.carfaxUrl ?? '',
    Status: v.status === 'available' ? 'Active' : v.status === 'sold' ? 'Sold' : 'Hold',
    DateAdded: toDate(v.createdAt),
    DateUpdated: toDate(v.updatedAt)
  }));

  const body = stringify(rows, {
    header: true,
    columns: AUTOTRADER_COLUMNS,
    quoted_string: true
  });

  return {
    channel: 'autotrader',
    filename: filename('autotrader', dealerId),
    contentType: 'text/csv',
    body,
    vehicleCount: vehicles.length
  };
}

function filename(prefix: string, dealerId: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}_${dealerId || 'inventory'}_${ts}.csv`;
}

function toDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function cleanText(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

function absolutize(url: string) {
  if (url.startsWith('http')) return url;
  const base = (DEALER.website || '').replace(/\/$/, '');
  return `${base}${url}`;
}
