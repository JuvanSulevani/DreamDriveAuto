import test from 'node:test';
import assert from 'node:assert/strict';
import { safePublicQuery } from './public-query';

test('safePublicQuery returns fallback data when a public database query fails', async () => {
  const fallback = { vehicles: [], total: 0 };
  const originalError = console.error;
  console.error = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => {
        throw new Error('database unavailable');
      },
      fallback
    );

    assert.deepEqual(result, fallback);
  } finally {
    console.error = originalError;
  }
});
