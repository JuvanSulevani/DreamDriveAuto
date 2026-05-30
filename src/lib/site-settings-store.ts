import 'server-only';
import { cache } from 'react';
import { prisma } from './prisma';
import { retryTransient } from './public-query';
import { readSnapshot } from './snapshot';
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTING_FIELDS,
  SITE_SETTING_KEYS,
  flattenSiteSettings,
  mergeSiteSettings
} from './site-settings';

export async function getSavedSiteSettingMap() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: Array.from(SITE_SETTING_KEYS) } }
  });

  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
}

// Wrapped in React.cache() so calls from the root layout, individual pages,
// and the sitemap all share a single read per server request.
//
// Snapshot-first: the S3 snapshot holds current settings and is rewritten on
// every admin save, so reading it keeps every (now dynamic) public page fast
// and Aurora-independent — the DB stays paused, no keep-warm cost. The DB is
// only touched if no snapshot exists yet (brand-new environment).
export const getSiteSettings = cache(async function getSiteSettings() {
  // Step 1 — snapshot (current, no DB, keeps Aurora asleep).
  try {
    const snapshot = await readSnapshot();
    if (snapshot) return snapshot.settings;
  } catch (snapError) {
    console.error('[site-settings] snapshot read failed', snapError);
  }

  // Step 2 — no snapshot: read the DB with retry, then hardcoded defaults.
  try {
    return mergeSiteSettings(await retryTransient('site-settings', getSavedSiteSettingMap));
  } catch (error) {
    console.error('[site-settings] retry exhausted; falling back to defaults', error);
    return DEFAULT_SITE_SETTINGS;
  }
});

export async function getEditableSiteSettings() {
  const settings = await getSiteSettings();
  return {
    fields: SITE_SETTING_FIELDS,
    values: flattenSiteSettings(settings)
  };
}
