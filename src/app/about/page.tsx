import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/site-settings-store';

export const metadata = { title: 'About' };
// ISR: static content driven by site settings; cached at the CDN and
// regenerated hourly. Settings saves purge this on demand.
export const revalidate = 3600;

export default async function AboutPage() {
  const { about, pages } = await getSiteSettings();
  if (!pages.aboutVisible) notFound();

  return (
    <>
      <Header />
      <main className="pt-32 pb-24">
        <div className="px-6 lg:px-12">
          <div className="eyebrow text-copper">{about.eyebrow}</div>
          <h1 className="display text-6xl md:text-9xl mt-4 leading-[0.88] tracking-tightest max-w-5xl">
            {about.heading} <span className="display-italic">{about.headingAccent}</span>
          </h1>
        </div>

        <div className="px-6 lg:px-12 mt-24 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-3">
            <div className="eyebrow">{about.storyLabel}</div>
          </div>
          <div className="md:col-span-9 max-w-3xl space-y-6 text-cream/90 leading-relaxed text-lg">
            <p>{about.story.primary}</p>
            <p>{about.story.secondary}</p>
            <p className="display-italic text-2xl text-copper">
              "{about.story.quote}"
            </p>
          </div>
        </div>

        <div className="px-6 lg:px-12 mt-32 border-t hairline pt-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3"><div className="eyebrow">By the numbers</div></div>
            <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-500">
              {about.stats.map((stat) => (
                <Stat key={`${stat.value}-${stat.label}`} n={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-12 mt-32 border-t hairline pt-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-7">
              <div className="eyebrow">{about.visitEyebrow}</div>
              <h2 className="display text-5xl md:text-7xl mt-4 leading-[0.95]">
                {about.visitHeading}<br /><span className="display-italic">{about.visitAccent}</span>
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
