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
  title: 'TeamUp - 尋找你的運動夥伴',
  description: '與其他運動愛好者建立聯繫，共同預約球場',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
        <ToastProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
