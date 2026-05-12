import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicUploadUrl } from './uploads';

test('getPublicUploadUrl serves private S3 uploads through the app when no public base URL is set', () => {
  assert.equal(
    getPublicUploadUrl({ bucket: 'dream-drive-private', region: 'ca-central-1' }, 'inventory/hero image.webp'),
    '/api/uploads/inventory/hero%20image.webp'
  );
});

test('getPublicUploadUrl preserves configured CDN or public bucket URLs', () => {
  assert.equal(
    getPublicUploadUrl(
      { bucket: 'dream-drive-public', region: 'ca-central-1', publicBaseUrl: 'https://cdn.example.com/uploads' },
      'inventory/car.webp'
    ),
    'https://cdn.example.com/uploads/inventory/car.webp'
  );
});
