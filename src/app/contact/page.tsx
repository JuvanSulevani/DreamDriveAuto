import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadForm from '@/components/LeadForm';
import { DEALER } from '@/lib/dealer';
import { Phone, Mail, MapPin } from 'lucide-react';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 lg:sticky lg:top-32 self-start">
            <div className="eyebrow text-copper">Get in touch</div>
            <h1 className="display text-6xl md:text-8xl mt-4 leading-[0.92]">
              Visit, call,<br /><span className="display-italic">or write.</span>
            </h1>
            <p className="text-ash mt-6 leading-relaxed max-w-md">
              We respond to every inquiry personally — no auto-replies, no boiler plates.
              Whether you're shopping, trading, or just curious, we'd love to hear from you.
            </p>

            <div className="mt-12 space-y-6">
              <Item icon={<Phone size={16} className="text-copper" />} label="Phone" value={DEALER.phone} href={`tel:${DEALER.phone.replace(/[^0-9+]/g, '')}`} />
              <Item icon={<Mail size={16} className="text-copper" />} label="Email" value="hello@dreamdriveauto.com" href="mailto:hello@dreamdriveauto.com" />
              <Item icon={<MapPin size={16} className="text-copper" />} label="Showroom" value={DEALER.address} />
            </div>

            <div className="mt-12 border-t hairline pt-8">
              <div className="eyebrow mb-4">Hours</div>
              {DEALER.hours.map((h) => (
                <div key={h.day} className="flex justify-between font-mono text-xs py-1.5">
                  <span className="text-ash">{h.day}</span>
                  <span className="text-cream">{h.open} — {h.close}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="border hairline p-8 md:p-12">
              <div className="eyebrow mb-3">Send a message</div>
              <h3 className="display text-3xl mb-10">How can we help?</h3>
              <LeadForm source="contact_page" cta="Send Message" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Item({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <>
      <div className="w-10 h-10 border hairline flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <div className="spec-label">{label}</div>
        <div className="text-cream mt-1">{value}</div>
      </div>
    </>
  );
  if (href) return <a href={href} className="flex items-center gap-4 group hover:text-copper">{inner}</a>;
  return <div className="flex items-center gap-4">{inner}</div>;
}
