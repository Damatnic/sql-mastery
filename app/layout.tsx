import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
  title: 'SQL Mastery - Learn SQL From Zero to Pro',
  description: 'Interactive SQL learning platform with hands-on practice and a real SQLite engine running in your browser via SQL.js. Master SQL from basic queries to advanced window functions.',
  keywords: ['SQL', 'learn SQL', 'SQL tutorial', 'database', 'SQL Server', 'interactive learning', 'SQL.js'],
  authors: [{ name: "Nicholas D'Amato" }],
  openGraph: {
    title: 'SQL Mastery - Learn SQL From Zero to Pro',
    description: 'Interactive SQL learning platform with hands-on practice and a real SQLite engine in your browser via SQL.js.',
    type: 'website',
    url: 'https://damato-sql.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SQL Mastery - Learn SQL From Zero to Pro',
    description: 'Interactive SQL learning platform with a real SQLite engine in your browser via SQL.js.',
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
        {children}
      </body>
    </html>
  );
}
