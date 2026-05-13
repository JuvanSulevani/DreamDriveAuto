import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDatabaseUrl } from './database-url';

test('resolveDatabaseUrl prefers a static database URL over IAM mode', async () => {
  const url = 'postgresql://app:secret@example.test:5432/dealer';

  await assert.doesNotReject(async () => {
    const resolved = await resolveDatabaseUrl({
      DATABASE_AUTH_MODE: 'iam',
      DATABASE_URL: url
    } as NodeJS.ProcessEnv);

    assert.equal(resolved, url);
  });
});
