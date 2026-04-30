/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.dreamdriveauto.com' }
    ]
  },
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
    // ssh2/ssh2-sftp-client load native .node binaries; keep them external
    // so webpack doesn't try to bundle them.
    serverComponentsExternalPackages: ['ssh2', 'ssh2-sftp-client', 'cpu-features']
  }
};

export default nextConfig;
