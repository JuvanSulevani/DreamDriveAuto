import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { buildAutoTraderFeed } from './autotrader';
import { buildCarGurusFeed } from './cargurus';
import { buildGenericXmlFeed } from './generic';
import { uploadToSftp, deliveryConfigForChannel, type SftpDbOverrides } from './sftp';
import type { SyndicationChannel, FeedResult } from './types';

const FEEDS_DIR = path.join(process.cwd(), 'feeds-output');

async function loadVehicles() {
  return prisma.vehicle.findMany({
    where: { status: 'available' },
    include: { photos: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
}

async function settingEnabled(channel: SyndicationChannel): Promise<boolean> {
  const setting = await prisma.setting.findUnique({
    where: { key: `syndication.${channel}.enabled` }
  });
  return setting?.value === 'true';
}

async function getSftpDbOverrides(channel: SyndicationChannel): Promise<SftpDbOverrides | undefined> {
  if (channel === 'generic') return undefined;
  const keys = [
    `syndication.${channel}.sftp.host`,
    `syndication.${channel}.sftp.user`,
    `syndication.${channel}.sftp.pass`,
    `syndication.${channel}.sftp.port`,
    `syndication.${channel}.sftp.path`,
  ];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    host: map[`syndication.${channel}.sftp.host`],
    user: map[`syndication.${channel}.sftp.user`],
    pass: map[`syndication.${channel}.sftp.pass`],
    port: map[`syndication.${channel}.sftp.port`],
    path: map[`syndication.${channel}.sftp.path`],
  };
}

async function buildFeed(channel: SyndicationChannel): Promise<FeedResult> {
  const vehicles = await loadVehicles();
  if (channel === 'autotrader') return buildAutoTraderFeed(vehicles);
  if (channel === 'cargurus') return buildCarGurusFeed(vehicles);
  return buildGenericXmlFeed(vehicles);
}

async function persistRunStart(channel: SyndicationChannel, vehicleCount: number) {
  return prisma.syndicationRun.create({
    data: { channel, vehicleCount, status: 'running' }
  });
}

async function persistRunSuccess(runId: string, filePath: string) {
  await prisma.syndicationRun.update({
    where: { id: runId },
    data: { status: 'success', finishedAt: new Date(), filePath }
  });
}

async function persistRunFailure(runId: string, message: string) {
  await prisma.syndicationRun.update({
    where: { id: runId },
    data: { status: 'failed', finishedAt: new Date(), errorMessage: message }
  });
}

async function writeLocal(feed: FeedResult): Promise<string> {
  await mkdir(FEEDS_DIR, { recursive: true });
  const filePath = path.join(FEEDS_DIR, feed.filename);
  await writeFile(filePath, feed.body, 'utf-8');
  return filePath;
}

export type RunOptions = {
  /** Generate feeds even if syndication is disabled (writes locally only). */
  force?: boolean;
  /** Skip SFTP delivery — write feeds to disk only. */
  dryRun?: boolean;
};

export type RunResult = {
  channel: SyndicationChannel;
  ok: boolean;
  vehicleCount: number;
  localPath?: string;
  remotePath?: string;
  error?: string;
};

export async function runSyndicationForChannel(
  channel: SyndicationChannel,
  opts: RunOptions = {}
): Promise<RunResult> {
  const enabled = channel === 'generic' ? true : await settingEnabled(channel);
  if (!enabled && !opts.force) {
    return { channel, ok: false, vehicleCount: 0, error: 'channel_disabled' };
  }

  const feed = await buildFeed(channel);
  const run = await persistRunStart(channel, feed.vehicleCount);

  try {
    const localPath = await writeLocal(feed);

    let remotePath: string | undefined;
    if (channel !== 'generic' && !opts.dryRun) {
      const dbOverrides = await getSftpDbOverrides(channel);
      const cfg = deliveryConfigForChannel(channel, dbOverrides);
      if (!cfg) {
        // Credentials missing; record success-with-local-only for visibility
        await persistRunSuccess(run.id, localPath);
        return { channel, ok: true, vehicleCount: feed.vehicleCount, localPath, error: 'sftp_credentials_missing' };
      }
      remotePath = await uploadToSftp(cfg, feed);
    }

    await persistRunSuccess(run.id, remotePath || localPath);

    // Track per-vehicle items
    const vehicles = await loadVehicles();
    await prisma.syndicationItem.createMany({
      data: vehicles.map((v) => ({ runId: run.id, vehicleId: v.id, action: 'upsert', ok: true }))
    });

    return { channel, ok: true, vehicleCount: feed.vehicleCount, localPath, remotePath };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await persistRunFailure(run.id, msg);
    return { channel, ok: false, vehicleCount: feed.vehicleCount, error: msg };
  }
}

export async function runAllChannels(opts: RunOptions = {}): Promise<RunResult[]> {
  const channels: SyndicationChannel[] = ['autotrader', 'cargurus', 'generic'];
  const results: RunResult[] = [];
  for (const c of channels) {
    results.push(await runSyndicationForChannel(c, opts));
  }
  return results;
}
