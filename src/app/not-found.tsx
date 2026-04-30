import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center px-6 lg:px-12">
        <div>
          <div className="eyebrow text-copper">404</div>
          <h1 className="display text-7xl md:text-9xl mt-4 leading-[0.9]">
            We couldn't find<br /><span className="display-italic">that page.</span>
          </h1>
          <Link href="/" className="btn-primary mt-12">Return Home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
