import { notFound } from 'next/navigation';
import { getSiteSettings } from '@/lib/site-settings-store';
import FinancingForm from './financing-form';

export const dynamic = 'force-dynamic';

export default async function FinancingPage() {
  const { pages } = await getSiteSettings();
  if (!pages.financingVisible) notFound();
  return <FinancingForm />;
}
