import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import CommandPalette from '@/components/CommandPalette';

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-indigo-400 focus:ring-2 focus:ring-indigo-400"
        >
          skip to content
        </a>
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
