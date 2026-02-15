import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BusinessProvider } from '@/contexts/BusinessContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

import { AuthGuard } from '@/components/auth/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NicoPOS - Multi-Business System',
  description: 'Point of Sale & Inventory System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <BusinessProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <Toaster />
          </BusinessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
