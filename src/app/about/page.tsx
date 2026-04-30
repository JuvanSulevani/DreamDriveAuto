import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24">
        <div className="px-6 lg:px-12">
          <div className="eyebrow text-copper">About</div>
          <h1 className="display text-6xl md:text-9xl mt-4 leading-[0.88] tracking-tightest max-w-5xl">
            A small dealership <span className="display-italic">with strong opinions</span> about cars.
          </h1>
        </div>

        <div className="px-6 lg:px-12 mt-24 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-3">
            <div className="eyebrow">Our story</div>
          </div>
          <div className="md:col-span-9 max-w-3xl space-y-6 text-cream/90 leading-relaxed text-lg">
            <p>
              Dream Drive Auto was founded on a simple frustration: buying a used car shouldn't feel
              like a negotiation tactic competition. We started this dealership to do the opposite —
              to source carefully, document everything, price honestly, and treat every guest the way
              we'd want to be treated.
            </p>
            <p>
              We're small on purpose. A short floor of cars we believe in, photographed properly,
              inspected thoroughly. You'll meet the people who picked, vetted, and reconditioned the
              car you came to see — not a stranger reading from a printout.
            </p>
            <p className="display-italic text-2xl text-copper">
              "The car deserves to be presented the way it was designed."
            </p>
          </div>
        </div>

        <div className="px-6 lg:px-12 mt-32 border-t hairline pt-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3"><div className="eyebrow">By the numbers</div></div>
            <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-500">
              <Stat n="180+" label="Cars sold in 2024" />
              <Stat n="4.9" label="Average review" />
              <Stat n="0%" label="Forced add-ons" />
              <Stat n="7-Day" label="Return policy" />
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-12 mt-32 border-t hairline pt-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-7">
              <div className="eyebrow">Visit us</div>
              <h2 className="display text-5xl md:text-7xl mt-4 leading-[0.95]">
                Come by.<br /><span className="display-italic">Let's talk cars.</span>
              </h2>
            </div>
            <div className="md:col-span-5">
              <Link href="/contact" className="btn-primary">Book an Appointment</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="bg-ink p-8">
      <div className="display text-5xl tabular leading-none">{n}</div>
      <div className="eyebrow mt-3 text-ash">{label}</div>
    </div>
  );
}
