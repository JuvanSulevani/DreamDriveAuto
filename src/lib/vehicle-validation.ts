import { z } from 'zod';

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
  cityMpg: z.number().int().optional().nullable(),
  highwayMpg: z.number().int().optional().nullable(),
  exteriorColor: optionalText,
  interiorColor: optionalText,
  doors: z.number().int().optional().nullable(),
  seats: z.number().int().optional().nullable(),
  mileage: z.number().int().min(0),
  price: z.number().int().min(0),
  msrp: z.number().int().min(0).optional().nullable(),
  status: z.enum(['available', 'pending', 'sold', 'hidden']).default('available'),
  headline: optionalText,
  description: optionalText,
  features: optionalText,
  accidentFree: z.boolean().default(true),
  oneOwner: z.boolean().default(false),
  serviceRecords: z.boolean().default(false),
  carfaxUrl: optionalUrl,
  featured: z.boolean().default(false),
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
