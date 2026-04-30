import type { Vehicle, Photo } from '@prisma/client';

export type VehicleWithPhotos = Vehicle & { photos: Photo[] };

export type SyndicationChannel = 'autotrader' | 'cargurus' | 'generic';

export type FeedResult = {
  channel: SyndicationChannel;
  filename: string;
  contentType: string;
  body: string;
  vehicleCount: number;
};

export type DeliveryConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  remotePath: string;
};
