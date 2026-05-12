import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/site-settings-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
