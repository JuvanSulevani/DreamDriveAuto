import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { getS3UploadConfig, getUploadPrefix } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const config = getS3UploadConfig();
  if (!config) return NextResponse.json({ error: 'upload_storage_not_configured' }, { status: 404 });

  const { key: keyParts } = await params;
  const key = keyParts.map(decodeURIComponent).join('/');
  if (!key || !key.startsWith(getUploadPrefix())) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  try {
    const client = new S3Client({ region: config.region });
    const object = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));

    if (!object.Body) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const bytes = Buffer.from(await object.Body.transformToByteArray());
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': object.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('[uploads.get]', error);
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
