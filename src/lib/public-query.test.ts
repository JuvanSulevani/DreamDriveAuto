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

test('safePublicQuery serves the snapshot when DB fails and snapshot returns data', async () => {
  const snapshotData = { vehicles: [{ id: 'from-snapshot' }], total: 1 };
  const originalError = console.error;
  const originalLog = console.log;
  console.error = () => {};
  console.log = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => { throw new Error('db down'); },
      { vehicles: [], total: 0 },
      async () => snapshotData
    );

    assert.deepEqual(result, snapshotData);
  } finally {
    console.error = originalError;
    console.log = originalLog;
  }
});

test('safePublicQuery falls through to empty fallback when snapshot also returns null', async () => {
  const fallback = { vehicles: [], total: 0 };
  const originalError = console.error;
  console.error = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => { throw new Error('db down'); },
      fallback,
      async () => null
    );

    assert.deepEqual(result, fallback);
  } finally {
    console.error = originalError;
  }
});

test('safePublicQuery falls through to empty fallback when snapshot itself throws', async () => {
  const fallback = { vehicles: [], total: 0 };
  const originalError = console.error;
  console.error = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => { throw new Error('db down'); },
      fallback,
      async () => { throw new Error('s3 down'); }
    );

    assert.deepEqual(result, fallback);
  } finally {
    console.error = originalError;
  }
});
