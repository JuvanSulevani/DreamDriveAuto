import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notifyLead } from '@/lib/email';
import { DEALER } from '@/lib/dealer';

export const runtime = 'nodejs';

const LeadSchema = z.object({
  type: z.enum(['contact', 'financing', 'trade_in', 'sell', 'test_drive']),
  vehicleId: z.string().optional(),
  source: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  payload: z.unknown().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LeadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        type: data.type,
        vehicleId: data.vehicleId,
        source: data.source,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        message: data.message,
        payload: data.payload ? JSON.stringify(data.payload) : null,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
        userAgent: req.headers.get('user-agent') ?? null
      }
    });

    // Fire-and-forget notification
    const subject = `[${DEALER.name}] New ${data.type.replace('_', ' ')} lead — ${data.firstName} ${data.lastName}`;
    const lines = [
      `Type: ${data.type}`,
      `Source: ${data.source ?? 'unknown'}`,
      `Vehicle: ${data.vehicleId ?? 'n/a'}`,
      `Name: ${data.firstName} ${data.lastName}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone ?? 'n/a'}`,
      '',
      `Message:`,
      data.message ?? '(none)',
      '',
      data.payload ? `Payload: ${JSON.stringify(data.payload, null, 2)}` : ''
    ];
    notifyLead(subject, lines.join('\n')).catch((e) => console.error('[email]', e));

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'validation', issues: e.issues }, { status: 400 });
    }
    console.error('[leads] error', e);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 });
  }
}
