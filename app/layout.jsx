import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CartProvider } from '@/components/CartContext';

export const metadata = {
  title: 'Yemen Online - Marketplace',
  description: 'منصة ويب تجمع المتاجر الإلكترونية المحلية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-dark text-white font-arabic antialiased max-w-md mx-auto overflow-x-hidden min-h-screen flex flex-col relative shadow-2xl">
        <CartProvider>
          <Header />
          
          {/* Main Content */}
          <main className="flex-1 pb-20">
            {children}
          </main>
          
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
