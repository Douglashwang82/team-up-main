import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TeamUp - Find Your Sports Partners',
  description: 'Connect with other sports enthusiasts and book courts together',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* <AuthProvider> */}
        <ToastProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </ToastProvider>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
