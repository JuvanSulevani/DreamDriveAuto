import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/site-settings-store';

export const metadata = { title: 'Privacy Policy' };
// ISR: static content driven by site settings; cached at the CDN and
// regenerated hourly. Settings saves purge this on demand.
export const revalidate = 3600;

export default async function PrivacyPage() {
  const { legal } = await getSiteSettings();
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-3xl">
        <div className="eyebrow text-copper">{legal.privacy.eyebrow}</div>
        <h1 className="display text-6xl mt-4">{legal.privacy.heading}</h1>
        <div className="mt-12 space-y-6 text-cream/85 leading-relaxed">
          <LegalBody body={legal.privacy.body} />
        </div>
      </main>
      <Footer />
    </>
  );
}

/**
 * Renders the customer-edited legal body. Paragraphs are separated by blank
 * lines; any paragraph that starts with "## " is rendered as a subheading.
 */
function LegalBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) =>
        block.startsWith('## ') ? (
          <h2 key={i} className="display text-2xl mt-12">{block.slice(3).trim()}</h2>
        ) : (
          <p key={i}>{block}</p>
        )
      )}
    </>
  );
}
