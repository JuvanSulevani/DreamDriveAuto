import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import type { DeliveryConfig, FeedResult } from './types';

export async function uploadToSftp(config: DeliveryConfig, feed: FeedResult): Promise<string> {
  const sftp = new SftpClient();

  await sftp.connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    readyTimeout: 30000
  });

  try {
    const remote = path.posix.join(config.remotePath || '/', feed.filename);
    await sftp.put(Buffer.from(feed.body, 'utf-8'), remote);
    return remote;
  } finally {
    await sftp.end();
  }
}

export type SftpDbOverrides = {
  host?: string;
  user?: string;
  pass?: string;
  port?: string;
  path?: string;
};

export function deliveryConfigForChannel(
  channel: 'autotrader' | 'cargurus',
  dbOverrides?: SftpDbOverrides
): DeliveryConfig | null {
  const prefix = channel.toUpperCase();
  // DB-stored credentials take priority over env vars
  const host = dbOverrides?.host || process.env[`${prefix}_SFTP_HOST`];
  const user = dbOverrides?.user || process.env[`${prefix}_SFTP_USER`];
  const pass = dbOverrides?.pass || process.env[`${prefix}_SFTP_PASS`];
  if (!host || !user || !pass) return null;
  return {
    host,
    port: Number(dbOverrides?.port || process.env[`${prefix}_SFTP_PORT`] || 22),
    username: user,
    password: pass,
    remotePath: dbOverrides?.path || process.env[`${prefix}_SFTP_PATH`] || '/'
  };
}
