import { notFound } from 'next/navigation';
import { getSiteSettings } from '@/lib/site-settings-store';
import TradeInForm from './trade-in-form';

export const dynamic = 'force-dynamic';

export default async function TradeInPage() {
  const { pages } = await getSiteSettings();
  if (!pages.tradeInVisible) notFound();
  return <TradeInForm />;
}
