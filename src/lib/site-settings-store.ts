import 'server-only';
import { cache } from 'react';
import { prisma } from './prisma';
import { retryTransient, isTransientError } from './public-query';
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
//
// Fast-path snapshot strategy:
//  1. One quick attempt against the live DB.
//  2. On transient failure (Aurora waking) → try snapshot immediately
//     so the visitor gets real content in < 2s instead of waiting 30s.
//  3. If no snapshot → retry with backoff (DB still gets to wake up).
//  4. If retries exhausted → hardcoded defaults.
export const getSiteSettings = cache(async function getSiteSettings() {
  // Step 1 — fast path: live DB.
  let firstError: unknown;
  try {
    return mergeSiteSettings(await getSavedSiteSettingMap());
  } catch (error) {
    firstError = error;
  }

  // Step 2 — transient error: check snapshot before waiting for retries.
  if (isTransientError(firstError)) {
    try {
      const snapshot = await readSnapshot();
      if (snapshot) {
        console.log('[site-settings] DB waking; served from snapshot');
        return snapshot.settings;
      }
    } catch (snapError) {
      console.error('[site-settings] snapshot read failed', snapError);
    }
  }

  // Step 3 — no snapshot: retry with backoff, then fall back to defaults.
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
