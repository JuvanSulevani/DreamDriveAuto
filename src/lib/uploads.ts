import { randomUUID } from 'crypto';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const IMAGE_EXTENSIONS_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif'
};

export type S3UploadConfig = {
  bucket: string;
  region: string;
  publicBaseUrl?: string;
};

export function isAllowedUploadType(type: string) {
  return Object.hasOwn(IMAGE_EXTENSIONS_BY_TYPE, type);
}

export function createUploadKey(type: string, now = Date.now()) {
  const extension = IMAGE_EXTENSIONS_BY_TYPE[type] ?? 'jpg';
  const prefix = getUploadPrefix();
  return `${prefix}${now}-${randomUUID()}.${extension}`;
}

export function getS3UploadConfig(env: NodeJS.ProcessEnv = process.env): S3UploadConfig | null {
  const bucket = env.UPLOADS_S3_BUCKET;
  if (!bucket) return null;

  return {
    bucket,
    region: env.UPLOADS_S3_REGION || env.AWS_REGION || env.AWS_DEFAULT_REGION || 'us-east-1',
    publicBaseUrl: env.UPLOADS_PUBLIC_BASE_URL?.replace(/\/$/, '')
  };
}

export function getPublicUploadUrl(config: S3UploadConfig, key: string) {
  if (config.publicBaseUrl) return `${config.publicBaseUrl}/${key}`;
  return `/api/uploads/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export function localUploadsEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV !== 'production';
}

function normalizePrefix(prefix: string) {
  const trimmed = prefix.replace(/^\/+|\/+$/g, '');
  return trimmed ? `${trimmed}/` : '';
}

export function getUploadPrefix(env: NodeJS.ProcessEnv = process.env) {
  return normalizePrefix(env.UPLOADS_S3_PREFIX || 'uploads');
}
