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
// and the sitemap all share a single DB read per server request.
// This is the FIRST db read of every request (from the layout), so wrapping
// it in retryTransient absorbs the Aurora Serverless v2 wake-up window
// (15-30s) for the whole request — subsequent queries on the now-warm DB
// won't need to wait again.
export const getSiteSettings = cache(async function getSiteSettings() {
  try {
    return mergeSiteSettings(await retryTransient('site-settings', getSavedSiteSettingMap));
  } catch (error) {
    console.error('[site-settings] db failed; attempting snapshot fallback', error);
    const snapshot = await readSnapshot();
    if (snapshot) {
      console.log('[site-settings] served from snapshot');
      return snapshot.settings;
    }
    console.error('[site-settings] no snapshot — falling back to defaults');
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
