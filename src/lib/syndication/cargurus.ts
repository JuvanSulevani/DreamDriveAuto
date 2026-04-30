import { stringify } from 'csv-stringify/sync';
import type { VehicleWithPhotos, FeedResult } from './types';
import { DEALER } from '@/lib/dealer';

/**
 * CarGurus inventory feed generator.
 *
 * CarGurus uses a tab-delimited feed delivered to their SFTP intake.
 * The column set below mirrors the CarGurus "Inventory Sync v3" spec.
 *
 * Reference: CarGurus Dealer Portal > Inventory Feed Setup.
 */
const CARGURUS_COLUMNS = [
  'CG Dealer ID', 'Stock Number', 'VIN', 'Year', 'Make', 'Model', 'Trim',
  'Body Style', 'New/Used', 'Mileage', 'Price', 'MSRP',
  'Exterior Color', 'Interior Color', 'Engine', 'Transmission', 'Drivetrain',
  'Fuel Type', 'City MPG', 'Highway MPG', 'Doors',
  'Description', 'Options', 'Photo URLs',
  'Carfax 1-Owner', 'Carfax No Accidents', 'Carfax Service Records', 'Carfax Report URL',
  'Date In Stock'
];

export function buildCarGurusFeed(vehicles: VehicleWithPhotos[]): FeedResult {
  const dealerId = process.env.CARGURUS_DEALER_ID || process.env.DEALER_ID || '';

  const rows = vehicles.map((v) => ({
    'CG Dealer ID': dealerId,
    'Stock Number': v.stockNumber,
    VIN: v.vin,
    Year: v.year,
    Make: v.make,
    Model: v.model,
    Trim: v.trim ?? '',
    'Body Style': v.bodyStyle,
    'New/Used': v.condition === 'new' ? 'New' : v.condition === 'certified' ? 'Certified' : 'Used',
    Mileage: v.mileage,
    Price: (v.price / 100).toFixed(2),
    MSRP: v.msrp ? (v.msrp / 100).toFixed(2) : '',
    'Exterior Color': v.exteriorColor ?? '',
    'Interior Color': v.interiorColor ?? '',
    Engine: v.engine ?? '',
    Transmission: v.transmission ?? '',
    Drivetrain: v.drivetrain ?? '',
    'Fuel Type': v.fuelType ?? '',
    'City MPG': v.cityMpg ?? '',
    'Highway MPG': v.highwayMpg ?? '',
    Doors: v.doors ?? '',
    Description: cleanText(v.description ?? ''),
    Options: v.features ?? '',
    'Photo URLs': v.photos.map((p) => absolutize(p.url)).join(','),
    'Carfax 1-Owner': v.oneOwner ? '1' : '0',
    'Carfax No Accidents': v.accidentFree ? '1' : '0',
    'Carfax Service Records': v.serviceRecords ? '1' : '0',
    'Carfax Report URL': v.carfaxUrl ?? '',
    'Date In Stock': v.createdAt.toISOString().slice(0, 10)
  }));

  const body = stringify(rows, {
    header: true,
    delimiter: '\t', // CarGurus prefers TSV
    columns: CARGURUS_COLUMNS
  });

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    channel: 'cargurus',
    filename: `cargurus_${dealerId || 'inventory'}_${ts}.tsv`,
    contentType: 'text/tab-separated-values',
    body,
    vehicleCount: vehicles.length
  };
}

function cleanText(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

function absolutize(url: string) {
  if (url.startsWith('http')) return url;
  const base = (DEALER.website || '').replace(/\/$/, '');
  return `${base}${url}`;
}
