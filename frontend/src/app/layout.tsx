import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://callgenie-ai-frontend.vercel.app';

const title = 'CallGenie AI — AI Voice Agents That Call Your Leads For You';
const description =
  'Deploy multilingual AI voice agents that automatically call your leads, qualify them, and book appointments — at 1/10th the cost of human agents.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | CallGenie AI',
  },
  description,
  applicationName: 'CallGenie AI',
  keywords: [
    'AI cold calling',
    'AI voice agent',
    'automated outbound calling',
    'lead generation',
    'sales automation',
    'AI sales agent',
    'multilingual voice AI',
    'CallGenie',
  ],
  authors: [{ name: 'CallGenie AI' }],
  creator: 'CallGenie AI',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'CallGenie AI',
    title,
    description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-dark-950">
            {children}
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
