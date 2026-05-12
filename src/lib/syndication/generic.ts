import { create } from 'xmlbuilder2';
import type { VehicleWithPhotos, FeedResult } from './types';
import { DEALER } from '@/lib/dealer';

/**
 * Generic XML feed (vAuto / Homenet compatible structure).
 * Many third-party listing aggregators (Cars.com, Edmunds, TrueCar) accept
 * a similar XML format. Use this as a starting point and adjust per aggregator spec.
 */
export function buildGenericXmlFeed(vehicles: VehicleWithPhotos[]): FeedResult {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('inventory', {
    dealer: DEALER.name,
    generated: new Date().toISOString()
  });

  for (const v of vehicles) {
    const node = root.ele('vehicle');
    node.ele('vin').txt(v.vin);
    node.ele('stockNumber').txt(v.stockNumber);
    node.ele('year').txt(String(v.year));
    node.ele('make').txt(v.make);
    node.ele('model').txt(v.model);
    if (v.trim) node.ele('trim').txt(v.trim);
    node.ele('bodyStyle').txt(v.bodyStyle);
    node.ele('condition').txt(v.condition);
    node.ele('mileage').txt(String(v.mileage));
    node.ele('price', { currency: 'CAD' }).txt((v.price / 100).toFixed(2));
    if (v.msrp) node.ele('msrp', { currency: 'CAD' }).txt((v.msrp / 100).toFixed(2));
    if (v.exteriorColor) node.ele('exteriorColor').txt(v.exteriorColor);
    if (v.interiorColor) node.ele('interiorColor').txt(v.interiorColor);
    if (v.engine) node.ele('engine').txt(v.engine);
    if (v.transmission) node.ele('transmission').txt(v.transmission);
    if (v.drivetrain) node.ele('drivetrain').txt(v.drivetrain);
    if (v.fuelType) node.ele('fuelType').txt(v.fuelType);
    if (v.cityMpg) node.ele('cityMpg').txt(String(v.cityMpg));
    if (v.highwayMpg) node.ele('highwayMpg').txt(String(v.highwayMpg));
    if (v.description) node.ele('description').txt(v.description);
    if (v.features) {
      const f = node.ele('features');
      v.features.split(',').forEach((feat) => f.ele('feature').txt(feat.trim()));
    }
    const photos = node.ele('photos');
    v.photos.forEach((p, i) => {
      photos.ele('photo', { primary: String(i === 0) }).txt(absolutize(p.url));
    });
    node.ele('history')
      .ele('oneOwner').txt(String(v.oneOwner)).up()
      .ele('accidentFree').txt(String(v.accidentFree)).up()
      .ele('serviceRecords').txt(String(v.serviceRecords));
  }

  const body = root.end({ prettyPrint: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    channel: 'generic',
    filename: `inventory_${ts}.xml`,
    contentType: 'application/xml',
    body,
    vehicleCount: vehicles.length
  };
}

function absolutize(url: string) {
  if (url.startsWith('http')) return url;
  const base = (DEALER.website || '').replace(/\/$/, '');
  return `${base}${url}`;
}
