import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClickTracker } from '@/components/ClickTracker';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://damato-sql.vercel.app'),
  title: 'sql-mastery',
  description:
    "Personal SQL practice. Lessons I built while taking Advanced SQL at WCTC, kept here as reference. SQLite runs in the browser via sql.js.",
  authors: [{ name: "Nicholas D'Amato" }],
  robots: { index: false, follow: false },
  openGraph: {
    title: 'sql-mastery',
    description: 'Personal SQL practice. SQLite runs in the browser via sql.js.',
    type: 'website',
    url: 'https://damato-sql.vercel.app',
  },
  twitter: {
    card: 'summary',
    title: 'sql-mastery',
    description: 'Personal SQL practice. SQLite runs in the browser via sql.js.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}
      >
        <ClickTracker />
        {children}
      </body>
    </html>
  );
}
