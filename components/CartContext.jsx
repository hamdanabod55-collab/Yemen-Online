'use client';
import { Home, ShoppingBag, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItems } = useCart();

  const tabs = [
    { id: '/', icon: Home, label: 'الرئيسية' },
    { id: '/notifications', icon: MessageCircle, label: 'الرسائل' },
    { id: '/cart', icon: ShoppingBag, label: 'السلة' },
    { id: '/merchant', icon: User, label: 'لوحة التحكم' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-dark-surface border-t border-dark-elevated pb-safe z-50">
      <div className="flex justify-between items-center px-6 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.id || (tab.id !== '/' && pathname.startsWith(tab.id));
          return (
            <Link
              key={tab.id}
              href={tab.id}
              prefetch={false}
              className="flex flex-col items-center justify-center space-y-1 relative"
            >
              <div className={`p-1.5 rounded-full transition-all duration-300 relative ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                <Icon size={24} />
                {tab.id === '/cart' && cartItems?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg shadow-primary/40 animate-pulse border border-dark-surface">
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
