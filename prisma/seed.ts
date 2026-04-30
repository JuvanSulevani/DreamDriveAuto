import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

type SeedVehicle = {
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyStyle: string;
  condition: 'new' | 'used' | 'certified';
  engine: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  cityMpg?: number;
  highwayMpg?: number;
  exteriorColor: string;
  interiorColor: string;
  doors: number;
  seats: number;
  mileage: number;
  priceCents: number;
  msrpCents?: number;
  vin: string;
  stockNumber: string;
  headline: string;
  description: string;
  features: string[];
  oneOwner?: boolean;
  accidentFree?: boolean;
  serviceRecords?: boolean;
  featured?: boolean;
  photos: { url: string; alt: string }[];
};

const vehicles: SeedVehicle[] = [
  {
    year: 2023, make: 'Porsche', model: '911', trim: 'Carrera S', bodyStyle: 'Coupe',
    condition: 'used',
    engine: '3.0L Twin-Turbo Flat-6', transmission: '8-Speed PDK', drivetrain: 'RWD',
    fuelType: 'Gasoline', cityMpg: 18, highwayMpg: 25,
    exteriorColor: 'Guards Red', interiorColor: 'Black Leather',
    doors: 2, seats: 4, mileage: 8420, priceCents: 14990000, msrpCents: 16450000,
    vin: 'WP0AB2A91PS221049', stockNumber: 'DDA-2301',
    headline: 'A pure expression of the modern 911',
    description:
      'One-owner 992 Carrera S with Sport Chrono, PASM, and the Sport Exhaust system. Maintained at an authorized Porsche center; complete service records on file. The Guards Red over black leather presents like new with no swirl marks or paint correction in its history.',
    features: ['Sport Chrono Package', 'PASM Sport Suspension', 'Sport Exhaust', 'Bose Surround Sound', 'Apple CarPlay', 'Heated Seats', 'BOSE Audio', 'Lane Keep Assist'],
    oneOwner: true, accidentFree: true, serviceRecords: true, featured: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1729592400535-c794f2182bec?auto=format&fit=crop&w=2400&q=80', alt: '911 front three quarter' },
      { url: 'https://images.unsplash.com/photo-1742414955049-d332bc45b51a?auto=format&fit=crop&w=2400&q=80', alt: '911 rear three quarter' },
      { url: 'https://images.unsplash.com/photo-1729592621193-22d8c2f6f4e7?auto=format&fit=crop&w=2400&q=80', alt: '911 side profile' }
    ]
  },
  {
    year: 2024, make: 'Land Rover', model: 'Defender', trim: '110 X-Dynamic SE', bodyStyle: 'SUV',
    condition: 'certified',
    engine: '3.0L Inline-6 MHEV', transmission: '8-Speed Automatic', drivetrain: '4WD',
    fuelType: 'Gasoline', cityMpg: 17, highwayMpg: 22,
    exteriorColor: 'Tasman Blue', interiorColor: 'Ebony Windsor Leather',
    doors: 4, seats: 7, mileage: 12350, priceCents: 7895000, msrpCents: 8920000,
    vin: 'SALEPBEU3R2231876', stockNumber: 'DDA-2402',
    headline: 'Capability without compromise',
    description:
      'CPO 2024 Defender 110 X-Dynamic SE in stunning Tasman Blue. Air suspension, electronic active differential, and the third row for full seven-passenger duty. Land Rover Approved warranty included.',
    features: ['Air Suspension', 'Active Differential', 'Meridian 3D Surround', 'Pano Roof', 'Heated/Cooled Seats', 'Wireless CarPlay', '360° Camera'],
    oneOwner: true, accidentFree: true, serviceRecords: true, featured: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1599364892454-576a3b328f19?auto=format&fit=crop&w=2400&q=80', alt: 'Defender exterior' },
      { url: 'https://images.unsplash.com/photo-1659596513612-23f9db4984aa?auto=format&fit=crop&w=2400&q=80', alt: 'Defender side' }
    ]
  },
  {
    year: 2022, make: 'BMW', model: 'M4', trim: 'Competition', bodyStyle: 'Coupe',
    condition: 'used',
    engine: '3.0L Twin-Turbo Inline-6', transmission: '8-Speed Automatic', drivetrain: 'RWD',
    fuelType: 'Gasoline', cityMpg: 16, highwayMpg: 23,
    exteriorColor: 'Isle of Man Green', interiorColor: 'Kyalami Orange',
    doors: 2, seats: 4, mileage: 18950, priceCents: 7295000, msrpCents: 8210000,
    vin: 'WBS43AY09NCJ12203', stockNumber: 'DDA-2203',
    headline: 'M Competition, in its most arresting spec',
    description:
      'A G82 M4 Competition in the unforgettable combination of Isle of Man Green over Kyalami Orange Merino. M Driver\'s Package, carbon bucket seats, and the M Carbon Exterior package. Two adult owners, no track use.',
    features: ['M Carbon Bucket Seats', 'M Driver\'s Package', 'Carbon Exterior', 'Adaptive M Suspension', 'Harman Kardon', 'Head-Up Display'],
    oneOwner: false, accidentFree: true, serviceRecords: true, featured: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1737077481251-bb8671f3f877?auto=format&fit=crop&w=2400&q=80', alt: 'M4 Competition front' },
      { url: 'https://images.unsplash.com/photo-1728060838342-cb9744a27d1b?auto=format&fit=crop&w=2400&q=80', alt: 'M4 Competition side' }
    ]
  },
  {
    year: 2024, make: 'Mercedes-Benz', model: 'G 550', trim: 'AMG Line', bodyStyle: 'SUV',
    condition: 'used',
    engine: '4.0L Twin-Turbo V8', transmission: '9-Speed Automatic', drivetrain: '4MATIC',
    fuelType: 'Gasoline', cityMpg: 13, highwayMpg: 17,
    exteriorColor: 'Obsidian Black', interiorColor: 'Macchiato Beige Nappa',
    doors: 4, seats: 5, mileage: 4200, priceCents: 16550000, msrpCents: 17820000,
    vin: 'W1NYC6BJ9RX446022', stockNumber: 'DDA-2404',
    headline: 'The icon, freshly delivered',
    description:
      'Effectively new 2024 G 550 with the AMG Line, Night Package, and Driver Assistance package. Three lockable differentials, Burmester audio, and the unmistakable presence only the G-Class commands.',
    features: ['Three Locking Differentials', 'Burmester 3D Audio', 'AMG Line', 'Night Package', 'Heated Steering Wheel', 'Massage Seats'],
    oneOwner: true, accidentFree: true, featured: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1699298784295-d542673bab22?auto=format&fit=crop&w=2400&q=80', alt: 'G 550 exterior' },
      { url: 'https://images.unsplash.com/photo-1569240651611-302c9897bde5?auto=format&fit=crop&w=2400&q=80', alt: 'G 550 side' }
    ]
  },
  {
    year: 2021, make: 'Audi', model: 'RS6', trim: 'Avant', bodyStyle: 'Wagon',
    condition: 'used',
    engine: '4.0L Twin-Turbo V8', transmission: '8-Speed Tiptronic', drivetrain: 'AWD',
    fuelType: 'Gasoline', cityMpg: 15, highwayMpg: 22,
    exteriorColor: 'Nardo Gray', interiorColor: 'Black Valcona',
    doors: 5, seats: 5, mileage: 23800, priceCents: 11850000,
    vin: 'WUAPCBF26MN903101', stockNumber: 'DDA-2105',
    headline: 'The fast wagon, perfected',
    description:
      'Nardo Gray RS6 Avant with the Carbon Optic, Executive, and Driver Assistance packages. 22" forged wheels and the optional Dynamic Plus package — all the right boxes ticked. Pristine interior with no signs of wear.',
    features: ['Carbon Optic Package', 'Dynamic Plus', '22" Forged Wheels', 'Bang & Olufsen 3D', 'Adaptive Cruise', 'Massage Seats'],
    oneOwner: true, accidentFree: true, serviceRecords: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1655195575608-96d2f48dadf7?auto=format&fit=crop&w=2400&q=80', alt: 'RS6 Avant' }
    ]
  },
  {
    year: 2023, make: 'Tesla', model: 'Model S', trim: 'Plaid', bodyStyle: 'Sedan',
    condition: 'used',
    engine: 'Tri-Motor Electric', transmission: '1-Speed Auto', drivetrain: 'AWD',
    fuelType: 'Electric', cityMpg: 121, highwayMpg: 107,
    exteriorColor: 'Solid Black', interiorColor: 'Cream',
    doors: 4, seats: 5, mileage: 14250, priceCents: 8995000, msrpCents: 10880000,
    vin: '5YJSA1E68PF498223', stockNumber: 'DDA-2306',
    headline: '1,020 horsepower, silent menace',
    description:
      'A 2023 Model S Plaid in solid black over cream. Carbon fiber spoiler, 21" Arachnid wheels, full self-driving capability, and the yoke-equipped cabin. Battery health at 96%.',
    features: ['Full Self-Driving', '21" Arachnid Wheels', 'Carbon Fiber Spoiler', 'Premium Audio', 'Glass Roof', 'Yoke Steering'],
    oneOwner: true, accidentFree: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1572029117144-b991c2eaee93?auto=format&fit=crop&w=2400&q=80', alt: 'Model S Plaid' }
    ]
  },
  {
    year: 2020, make: 'Toyota', model: 'Land Cruiser', trim: 'Heritage Edition', bodyStyle: 'SUV',
    condition: 'used',
    engine: '5.7L V8', transmission: '8-Speed Automatic', drivetrain: '4WD',
    fuelType: 'Gasoline', cityMpg: 13, highwayMpg: 17,
    exteriorColor: 'Magnetic Gray', interiorColor: 'Black Leather',
    doors: 4, seats: 5, mileage: 41200, priceCents: 7195000,
    vin: 'JTMCY7AJ4L4099221', stockNumber: 'DDA-2007',
    headline: 'Heritage Edition. Built to outlast you.',
    description:
      'One of 1,200 Heritage Edition Land Cruisers built for 2020. Bronze BBS wheels, deleted third row, blacked-out trim. A tool, an heirloom, and an investment in equal measure.',
    features: ['BBS Forged Wheels', 'Yakima Roof Rack', 'KDSS', 'Crawl Control', 'Multi-Terrain Select', 'JBL Audio'],
    oneOwner: false, accidentFree: true, serviceRecords: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1571066668832-cded680c95bb?auto=format&fit=crop&w=2400&q=80', alt: 'Land Cruiser' }
    ]
  },
  {
    year: 2024, make: 'Lucid', model: 'Air', trim: 'Grand Touring', bodyStyle: 'Sedan',
    condition: 'used',
    engine: 'Dual-Motor Electric', transmission: '1-Speed Auto', drivetrain: 'AWD',
    fuelType: 'Electric', cityMpg: 132, highwayMpg: 131,
    exteriorColor: 'Stellar White', interiorColor: 'Mojave',
    doors: 4, seats: 5, mileage: 6840, priceCents: 10495000, msrpCents: 12595000,
    vin: '50EA1FBA6RA009114', stockNumber: 'DDA-2408',
    headline: '516 miles of range. Quietly remarkable.',
    description:
      'Lucid Air Grand Touring in Stellar White over the rare Mojave interior. 21" Aero Range wheels, Surreal Sound Pro, DreamDrive Pro. The longest range EV you can buy.',
    features: ['DreamDrive Pro', 'Surreal Sound Pro', '21" Aero Wheels', 'Glass Canopy', 'Heated/Ventilated/Massage Seats'],
    oneOwner: true, accidentFree: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1701311521752-9f85d68d55ed?auto=format&fit=crop&w=2400&q=80', alt: 'Lucid Air' }
    ]
  }
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dreamdriveauto.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'changeme';
  const hash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hash },
    create: { email: adminEmail, password: hash, name: 'Dream Drive Admin', role: 'admin' }
  });

  for (const v of vehicles) {
    const slug = slugify(`${v.year}-${v.make}-${v.model}-${v.trim ?? ''}-${v.stockNumber}`);
    await prisma.vehicle.upsert({
      where: { vin: v.vin },
      update: {},
      create: {
        slug,
        vin: v.vin,
        stockNumber: v.stockNumber,
        year: v.year,
        make: v.make,
        model: v.model,
        trim: v.trim,
        bodyStyle: v.bodyStyle,
        condition: v.condition,
        engine: v.engine,
        transmission: v.transmission,
        drivetrain: v.drivetrain,
        fuelType: v.fuelType,
        cityMpg: v.cityMpg,
        highwayMpg: v.highwayMpg,
        exteriorColor: v.exteriorColor,
        interiorColor: v.interiorColor,
        doors: v.doors,
        seats: v.seats,
        mileage: v.mileage,
        price: v.priceCents,
        msrp: v.msrpCents,
        headline: v.headline,
        description: v.description,
        features: v.features.join(','),
        accidentFree: v.accidentFree ?? true,
        oneOwner: v.oneOwner ?? false,
        serviceRecords: v.serviceRecords ?? false,
        featured: v.featured ?? false,
        photos: {
          create: v.photos.map((p, i) => ({
            url: p.url,
            alt: p.alt,
            position: i,
            isHero: i === 0
          }))
        }
      }
    });
  }

  // Default settings
  await prisma.setting.upsert({
    where: { key: 'syndication.autotrader.enabled' },
    update: {},
    create: { key: 'syndication.autotrader.enabled', value: 'false' }
  });
  await prisma.setting.upsert({
    where: { key: 'syndication.cargurus.enabled' },
    update: {},
    create: { key: 'syndication.cargurus.enabled', value: 'false' }
  });

  console.log(`Seeded ${vehicles.length} vehicles + admin user (${adminEmail}).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
