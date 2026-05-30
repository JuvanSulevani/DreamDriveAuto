import { notFound } from 'next/navigation';
import { getSiteSettings } from '@/lib/site-settings-store';
import TradeInForm from './trade-in-form';

// ISR: static content driven by site settings; cached at the CDN and
// regenerated hourly. Settings saves purge this on demand.
export const revalidate = 3600;

export default async function TradeInPage() {
  const { pages } = await getSiteSettings();
  if (!pages.tradeInVisible) notFound();
  return <TradeInForm />;
}
