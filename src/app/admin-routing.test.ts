import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const appRoot = join(process.cwd(), 'src/app');

test('admin login route is outside the authenticated admin shell layout', () => {
  assert.equal(
    existsSync(join(appRoot, 'admin/login/page.tsx')),
    false,
    'src/app/admin/login/page.tsx inherits src/app/admin/layout.tsx and renders the admin sidebar'
  );
  assert.equal(
    existsSync(join(appRoot, '(admin-auth)/admin/login/page.tsx')),
    true,
    'login should keep the /admin/login URL through a route group outside src/app/admin/layout.tsx'
  );
});
