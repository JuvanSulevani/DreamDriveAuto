import { notFound } from 'next/navigation';
import { getSiteSettings } from '@/lib/site-settings-store';
import FinancingForm from './financing-form';

// ISR: static content driven by site settings; cached at the CDN and
// regenerated hourly. Settings saves purge this on demand.
export const revalidate = 3600;

export default async function FinancingPage() {
  const { pages } = await getSiteSettings();
  if (!pages.financingVisible) notFound();
  return <FinancingForm />;
}
