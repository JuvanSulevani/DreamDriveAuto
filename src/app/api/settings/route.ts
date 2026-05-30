import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SITE_SETTING_KEYS } from '@/lib/site-settings';
import { writeSnapshot } from '@/lib/snapshot';
import { revalidatePublicContent } from '@/lib/revalidate';
import { retryTransient } from '@/lib/public-query';

export const runtime = 'nodejs';

const Schema = z.object({
  updates: z.array(z.object({
    key: z.string().min(1).refine((key) => SITE_SETTING_KEYS.has(key) || key.startsWith('syndication.'), 'Unsupported setting key'),
    value: z.string()
  }))
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const all = await retryTransient('settings.list', () => prisma.setting.findMany());
  return NextResponse.json({ settings: Object.fromEntries(all.map((s) => [s.key, s.value])) });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = Schema.parse(body);
    // Upserts are idempotent, so it's safe to re-run the whole batch if a
    // transient Aurora wake-up error interrupts it mid-loop.
    await retryTransient('settings.update', async () => {
      for (const u of data.updates) {
        await prisma.setting.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value }
        });
      }
    });
    // Refresh the S3 snapshot so it reflects the just-saved values. Errors
    // are swallowed inside writeSnapshot — the DB write already succeeded.
    await writeSnapshot();
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
