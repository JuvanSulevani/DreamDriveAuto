import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVehicleInput } from './vehicle-validation';

test('parseVehicleInput treats blank optional strings as empty values instead of validation failures', () => {
  const parsed = parseVehicleInput({
    vin: 'WP0AB2A91PS221049',
    stockNumber: 'DDA-T001',
    year: 2024,
    make: 'Porsche',
    model: '911',
    trim: '',
    bodyStyle: 'Coupe',
    condition: 'used',
    engine: '',
    transmission: '',
    drivetrain: '',
    fuelType: '',
    cityMpg: null,
    highwayMpg: null,
    exteriorColor: '',
    interiorColor: '',
    doors: 2,
    seats: 4,
    mileage: 1200,
    price: 14990000,
    msrp: null,
    status: 'available',
    headline: '',
    description: '',
    features: '',
    accidentFree: true,
    oneOwner: false,
    serviceRecords: false,
    carfaxUrl: '',
    featured: false,
    photos: [{ url: '/api/uploads/uploads/test.webp', alt: '' }]
  });

  assert.equal(parsed.carfaxUrl, null);
  assert.equal(parsed.trim, null);
  assert.equal(parsed.engine, null);
  assert.equal(parsed.photos[0].alt, null);
});
