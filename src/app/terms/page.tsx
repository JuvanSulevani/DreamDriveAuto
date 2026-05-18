import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Terms' };
// Dynamic so the header nav always reflects current page-visibility settings.
export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-3xl">
        <div className="eyebrow text-copper">Terms</div>
        <h1 className="display text-6xl mt-4">Terms of Use</h1>
        <div className="mt-12 space-y-6 text-cream/85 leading-relaxed">
          <p>
            Vehicle pricing on this site is subject to change. While we make every effort to ensure accuracy,
            errors do occur. Final price is determined at the time of sale and confirmed by an authorized representative.
          </p>
          <p>
            Vehicle availability shown on this site reflects our best understanding at the time of your visit and
            is not guaranteed. Photographs are representative and may show optional equipment.
          </p>
          <p>
            Estimated payments shown are for illustrative purposes only and do not constitute an offer to lend.
            Actual terms depend on creditworthiness and lender approval.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
