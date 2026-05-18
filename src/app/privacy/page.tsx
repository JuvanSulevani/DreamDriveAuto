import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DEALER } from '@/lib/dealer';

export const metadata = { title: 'Privacy Policy' };
// Dynamic so the header nav always reflects current page-visibility settings.
export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-3xl">
        <div className="eyebrow text-copper">Privacy</div>
        <h1 className="display text-6xl mt-4">Privacy Policy</h1>

        <div className="mt-12 space-y-6 text-cream/85 leading-relaxed">
          <p>
            {DEALER.name} ("we," "our," "us") respects your privacy. This policy describes
            what information we collect, how we use it, and the choices you have.
          </p>
          <h2 className="display text-2xl mt-12">Information We Collect</h2>
          <p>
            We collect information you provide directly — through inquiry forms, financing
            applications, trade appraisals — and limited technical information automatically
            when you visit (IP address, browser type, pages viewed).
          </p>
          <h2 className="display text-2xl mt-12">How We Use It</h2>
          <p>
            To respond to your inquiries, evaluate financing applications, and improve our
            services. Financial information is shared only with lenders you authorize.
          </p>
          <h2 className="display text-2xl mt-12">Sharing</h2>
          <p>
            We do not sell your personal information. We may disclose it as required by law
            or to service providers acting on our behalf (lenders, payment processors, hosting).
          </p>
          <h2 className="display text-2xl mt-12">Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your personal information.
            Contact us at the address below.
          </p>
          <p className="text-ash text-sm mt-12">
            Last updated: {new Date().toISOString().slice(0, 10)}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
