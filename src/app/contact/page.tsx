import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadForm from '@/components/LeadForm';
import { Phone, Mail, MapPin } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings-store';

export const metadata = { title: 'Contact' };
// ISR: static content driven by site settings; cached at the CDN and
// regenerated hourly. Settings saves purge this on demand.
export const revalidate = 3600;

export default async function ContactPage() {
  const { dealer, contact } = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 lg:sticky lg:top-32 self-start">
            <div className="eyebrow text-copper">{contact.eyebrow}</div>
            <h1 className="display text-6xl md:text-8xl mt-4 leading-[0.92]">
              {contact.heading}<br /><span className="display-italic">{contact.headingAccent}</span>
            </h1>
            <p className="text-ash mt-6 leading-relaxed max-w-md">
              {contact.intro}
            </p>

            <div className="mt-12 space-y-6">
              <Item icon={<Phone size={16} className="text-copper" />} label="Phone" value={dealer.phone} href={`tel:${dealer.phone.replace(/[^0-9+]/g, '')}`} />
              <Item icon={<Mail size={16} className="text-copper" />} label="Email" value={dealer.email} href={`mailto:${dealer.email}`} />
              <Item icon={<MapPin size={16} className="text-copper" />} label="Showroom" value={dealer.address} />
            </div>

            <div className="mt-12 border-t hairline pt-8">
              <div className="eyebrow mb-4">Hours</div>
              {dealer.hours.map((h) => (
                <div key={h.day} className="flex justify-between font-mono text-xs py-1.5">
                  <span className="text-ash">{h.day}</span>
                  <span className="text-cream">{h.hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="border hairline p-8 md:p-12">
              <div className="eyebrow mb-3">Send a message</div>
              <h3 className="display text-3xl mb-10">How can we help?</h3>
              <LeadForm source="contact_page" cta="Send Message" dealerName={dealer.name} />
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
