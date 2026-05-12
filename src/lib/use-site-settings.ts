'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from './site-settings';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/site-settings', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!cancelled && data?.settings) setSettings(data.settings);
      })
      .catch(() => {
        // Public pages keep working with bundled defaults if the settings API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
