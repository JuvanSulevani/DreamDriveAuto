import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/site-settings-store';

export const metadata = { title: 'Terms' };
// Dynamic so the header nav always reflects current page-visibility settings
// and the body picks up edits the customer makes in the admin panel.
export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const { legal } = await getSiteSettings();
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-3xl">
        <div className="eyebrow text-copper">{legal.terms.eyebrow}</div>
        <h1 className="display text-6xl mt-4">{legal.terms.heading}</h1>
        <div className="mt-12 space-y-6 text-cream/85 leading-relaxed">
          <LegalBody body={legal.terms.body} />
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
