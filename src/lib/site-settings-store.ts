import 'server-only';
import { cache } from 'react';
import { prisma } from './prisma';
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
export const getSiteSettings = cache(async function getSiteSettings() {
  try {
    return mergeSiteSettings(await getSavedSiteSettingMap());
  } catch (error) {
    console.error('[site-settings] falling back to defaults', error);
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
