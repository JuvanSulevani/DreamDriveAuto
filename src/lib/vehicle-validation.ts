import { z } from 'zod';

// Postgres INT4 columns (price, msrp, mileage, etc.) top out at 2,147,483,647.
// Without an explicit upper bound an oversized entry passes Zod and then blows
// up at insert time with an opaque "server" error, so we cap every integer
// field here and return a clear, field-specific message instead.
const INT4_MAX = 2_147_483_647;

const optionalText = z.preprocess(
  emptyStringToNull,
  z.string().trim().optional().nullable()
).transform((value) => value || null);

const optionalUrl = z.preprocess(
  emptyStringToNull,
  z.string().trim().url().optional().nullable()
).transform((value) => value || null);

export const VehicleSchema = z.object({
  id: z.string().optional(),
  vin: z.string().trim().min(11).max(17),
  stockNumber: z.string().trim().min(1),
  year: z.number().int(),
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  trim: optionalText,
  bodyStyle: z.string().trim().min(1),
  condition: z.enum(['new', 'used', 'certified']),
  engine: optionalText,
  transmission: optionalText,
  drivetrain: optionalText,
  fuelType: optionalText,
  cityMpg: z.number().int().min(0).max(INT4_MAX).optional().nullable(),
  highwayMpg: z.number().int().min(0).max(INT4_MAX).optional().nullable(),
  exteriorColor: optionalText,
  interiorColor: optionalText,
  doors: z.number().int().min(0).max(INT4_MAX).optional().nullable(),
  seats: z.number().int().min(0).max(INT4_MAX).optional().nullable(),
  mileage: z.number().int().min(0).max(INT4_MAX, 'Mileage is too large'),
  price: z.number().int().min(0).max(INT4_MAX, 'Price is too large (max ~$21,474,836)'),
  msrp: z.number().int().min(0).max(INT4_MAX, 'MSRP is too large (max ~$21,474,836)').optional().nullable(),
  status: z.enum(['available', 'pending', 'sold', 'hidden']).default('available'),
  headline: optionalText,
  description: optionalText,
  features: optionalText,
  accidentFree: z.boolean().default(true),
  oneOwner: z.boolean().default(false),
  serviceRecords: z.boolean().default(false),
  carfaxUrl: optionalUrl,
  featured: z.boolean().default(false),
  favourite: z.boolean().default(false),
  photos: z.array(z.object({
    url: z.string().trim().min(1),
    alt: optionalText,
    isHero: z.boolean().optional()
  })).default([])
});

export type ParsedVehicleInput = z.infer<typeof VehicleSchema>;

export function parseVehicleInput(input: unknown) {
  return VehicleSchema.parse(input);
}

function emptyStringToNull(value: unknown) {
  return typeof value === 'string' && value.trim() === '' ? null : value;
}
