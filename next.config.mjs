import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.dreamdriveauto.com' }
    ]
  },
  serverExternalPackages: ['ssh2', 'ssh2-sftp-client', 'cpu-features', '@aws-sdk/rds-signer', '@aws-sdk/client-s3', '@aws-sdk/credential-providers', '@aws-sdk/credential-provider-node']
};

export default nextConfig;
