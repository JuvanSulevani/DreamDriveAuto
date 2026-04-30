import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { DEALER } from '@/lib/dealer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic']
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600']
});

// Use system fallback for body — Geist is a CSS variable served via next/font in some templates,
// but to keep this self-contained and avoid extra fonts, we use a refined system stack as the body.
const geistFallback = {
  variable: '--font-geist',
  className: ''
};

export const metadata: Metadata = {
  title: { default: `${DEALER.name} — Curated Performance & Luxury Automobiles`, template: `%s · ${DEALER.name}` },
  description:
    'A boutique automotive showroom of meticulously sourced performance, luxury, and pre-owned vehicles. By appointment in Seattle.',
  metadataBase: new URL(DEALER.website),
  openGraph: {
    type: 'website',
    title: DEALER.name,
    description: 'Curated performance & luxury automobiles. Seattle.',
    url: DEALER.website
  }
};

export const viewport = {
  themeColor: '#0B0B0B',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrains.variable} ${geistFallback.variable}`}
      style={{
        // Define --font-geist with a refined system stack
        ['--font-geist' as string]:
          'ui-sans-serif, -apple-system, "Helvetica Neue", "Segoe UI", system-ui, sans-serif'
      }}
    >
      <body className="bg-ink text-cream font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
