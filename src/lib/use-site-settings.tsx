'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from './site-settings';

/**
 * Site settings flow:
 *  - The root layout (server component) calls getSiteSettings() once per request
 *    and renders <SiteSettingsProvider value={settings}>.
 *  - Both the SSR pass AND the client's hydration use that same value, so
 *    consumers (Header, Footer) never flash through the defaults on reload.
 *  - Default settings still back the context for any tree that somehow renders
 *    without the provider (e.g. error boundaries).
 */
const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS);

export function SiteSettingsProvider({
  value,
  children
}: {
  value: SiteSettings;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
