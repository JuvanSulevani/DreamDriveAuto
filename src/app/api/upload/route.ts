import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { authOptions } from '@/lib/auth';
import { getExplicitAwsCredentials } from '@/lib/aws-credentials';
import {
  MAX_UPLOAD_BYTES,
  createUploadKey,
  getPublicUploadUrl,
  getS3UploadConfig,
  isAllowedUploadType,
  localUploadsEnabled
} from '@/lib/uploads';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }
  if (!isAllowedUploadType(file.type)) {
    return NextResponse.json({ error: 'bad_type' }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = createUploadKey(file.type);
  const s3Config = getS3UploadConfig();

  if (s3Config) {
    const credentials = getExplicitAwsCredentials();
    const client = new S3Client({ region: s3Config.region, ...(credentials && { credentials }) });
    await client.send(new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable'
    }));

    return NextResponse.json({ url: getPublicUploadUrl(s3Config, key) });
  }

  if (!localUploadsEnabled()) {
    return NextResponse.json({ error: 'upload_storage_not_configured' }, { status: 500 });
  }

  const filePath = path.join(process.cwd(), 'public', key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  return NextResponse.json({ url: `/${key}` });
}
