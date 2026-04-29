import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

/**
 * Display serif — near-identical match for Reckless Rockfi (paid font in the
 * original HTML). Free, self-hosted via Google Fonts. Used for all major
 * headings via the `--font-display` CSS variable.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

/**
 * Body sans — replaces Suisseintl (paid). Inter is a near-identical alternative
 * with the same x-height proportions and tight letter-spacing tolerance.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'OncoDigest',
    template: '%s — OncoDigest',
  },
  description:
    'OncoDigest — articles, congrès et lives en oncologie digestive pour les professionnels de santé.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f9f7f3',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
