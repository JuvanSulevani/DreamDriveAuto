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

// Simulate Aurora's P1010 "user denied" code — the transient error that
// triggers the snapshot fast-path when the DB is waking up.
function transientDbError() {
  const err = new Error('Aurora waking up');
  (err as unknown as Record<string, unknown>).code = 'P1010';
  return err;
}

test('safePublicQuery serves the snapshot immediately when DB fails with a transient error', async () => {
  const snapshotData = { vehicles: [{ id: 'from-snapshot' }], total: 1 };
  const originalError = console.error;
  const originalLog = console.log;
  console.error = () => {};
  console.log = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => { throw transientDbError(); },
      { vehicles: [], total: 0 },
      async () => snapshotData
    );

    assert.deepEqual(result, snapshotData);
  } finally {
    console.error = originalError;
    console.log = originalLog;
  }
});

test('safePublicQuery skips snapshot on non-transient errors and returns fallback', async () => {
  const fallback = { vehicles: [], total: 0 };
  let snapshotCalled = false;
  const originalError = console.error;
  console.error = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => { throw new Error('real bug — not transient'); },
      fallback,
      async () => { snapshotCalled = true; return null; }
    );

    assert.deepEqual(result, fallback);
    assert.equal(snapshotCalled, false, 'snapshot should not be tried for non-transient errors');
  } finally {
    console.error = originalError;
  }
});

test('safePublicQuery falls through to retry then fallback when snapshot returns null', async () => {
  const fallback = { vehicles: [], total: 0 };
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => { throw transientDbError(); },
      fallback,
      async () => null   // snapshot has nothing — falls through to retry
    );

    // retry also fails (all calls throw) → empty fallback
    assert.deepEqual(result, fallback);
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
});

test('safePublicQuery falls through to fallback when snapshot itself throws', async () => {
  const fallback = { vehicles: [], total: 0 };
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};

  try {
    const result = await safePublicQuery(
      'inventory.list',
      async () => { throw transientDbError(); },
      fallback,
      async () => { throw new Error('s3 down'); }
    );

    assert.deepEqual(result, fallback);
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
});
