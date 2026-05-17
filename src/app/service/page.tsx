import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';

export const metadata = { title: 'Service' };

export default function ServicePage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12">
        <div className="eyebrow text-copper">Service & Maintenance</div>
        <h1 className="display text-6xl md:text-9xl mt-4 leading-[0.9] tracking-tightest max-w-5xl">
          Service that <span className="display-italic">respects</span> your car.
        </h1>
        <p className="mt-10 text-ash max-w-2xl text-lg leading-relaxed">
          We partner with authorized service centres across the GTA to keep every car we sell
          maintained to factory spec — using the right parts, the right tools, and the right people.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 border-t hairline pt-20">
          <Service title="Routine Maintenance" body="Oil changes, filters, fluids, brakes — done with OEM parts on schedule." />
          <Service title="Diagnostic & Repair" body="Factory-trained technicians, dealer-grade scan tools, and warranty-respecting procedures." />
          <Service title="Pre-Purchase Inspection" body="Buying private-party? We'll inspect any car you're considering. Written report included." />
        </div>

        <div className="mt-32 border-t hairline pt-20 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <div className="eyebrow">Service Partners</div>
            <h2 className="display text-5xl md:text-6xl mt-4">A network of specialists.</h2>
            <p className="text-ash mt-6 max-w-lg leading-relaxed">
              From German marques to overlanding rigs, we keep a short list of independent shops
              we trust with our own cars. We make introductions and coordinate work on your behalf.
            </p>
            <Link href="/contact" className="btn-primary mt-10">
              Schedule Service <ArrowRight size={14} />
            </Link>
          </div>
          <div className="md:col-span-5">
            <div className="border hairline p-8">
              <div className="eyebrow mb-6">Concierge Service</div>
              <p className="text-cream leading-relaxed">
                We'll pick up your car, deliver a loaner, supervise the work, and return it freshly washed.
                Available within 30 miles of the showroom.
              </p>
              <div className="mt-6 font-mono text-xs text-ash">$95 / visit · Free for vehicles purchased here</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Service({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="display text-3xl">{title}</div>
      <p className="text-ash text-sm mt-4 leading-relaxed">{body}</p>
    </div>
  );
}
