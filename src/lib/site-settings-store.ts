import 'server-only';
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

export async function getSiteSettings() {
  try {
    return mergeSiteSettings(await getSavedSiteSettingMap());
  } catch (error) {
    console.error('[site-settings] falling back to defaults', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getEditableSiteSettings() {
  const settings = await getSiteSettings();
  return {
    fields: SITE_SETTING_FIELDS,
    values: flattenSiteSettings(settings)
  };
}
