import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CallGenie AI - AI-Powered Cold Calling Platform',
  description: 'Deploy multilingual AI voice agents that automatically call customers, qualify leads, and book appointments.',
  keywords: ['AI', 'cold calling', 'lead generation', 'voice AI', 'sales automation'],
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
      </body>
    </html>
  );
}
