import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings-store';

export const dynamic = 'force-dynamic';

export default async function SellPage() {
  const { pages } = await getSiteSettings();
  if (!pages.sellVisible) notFound();
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-7xl mb-24">
          <div className="md:col-span-7">
            <div className="eyebrow text-copper">Sell to Us</div>
            <h1 className="display text-6xl md:text-8xl mt-4 leading-[0.92]">
              We buy<br /><span className="display-italic">your car.</span>
            </h1>
            <p className="text-ash mt-8 leading-relaxed text-lg max-w-2xl">
              No middleman, no consignment, no waiting for a private buyer. Our trade desk makes
              cash offers daily on enthusiast and luxury vehicles — even if you're not buying from us.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/trade-in" className="btn-primary">
                Get an Offer <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="btn-ghost">Talk to a Specialist</Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="border hairline p-8 space-y-8">
              <div>
                <div className="eyebrow mb-3">What we look for</div>
                <ul className="text-sm text-cream space-y-2">
                  <li>· Performance & enthusiast cars</li>
                  <li>· Luxury sedans & SUVs</li>
                  <li>· Trucks under 100k miles</li>
                  <li>· Clean-title, well-documented examples</li>
                </ul>
              </div>
              <div className="border-t hairline pt-8">
                <div className="eyebrow mb-3">What we pay</div>
                <p className="text-cream text-sm leading-relaxed">
                  Often above auction wholesale, especially on cars we know we can move quickly.
                  We offer real numbers, not lowball anchors.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="border-t hairline pt-20">
          <div className="eyebrow mb-3">How it works</div>
          <h2 className="display text-5xl md:text-6xl">Three steps. One day.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            <Step num="01" title="Tell us about it" body="Send VIN, photos, and a few details. Or bring it by the showroom." />
            <Step num="02" title="Get a written offer" body="Within 24 hours. Honored for seven days. Broken out so you see the math." />
            <Step num="03" title="Get paid" body="Same-day check, ACH, or apply toward your next car. Title work handled in-house." />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-ticker text-copper">{num}</div>
      <div className="display text-3xl mt-3">{title}</div>
      <p className="text-ash text-sm mt-4 leading-relaxed">{body}</p>
    </div>
  );
}
