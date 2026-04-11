'use client';
import { Home, ShoppingBag, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { id: '/', icon: Home, label: 'الرئيسية' },
    { id: '#', icon: MessageCircle, label: 'الرسائل' },
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
              className="flex flex-col items-center justify-center space-y-1"
            >
              <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                <Icon size={24} />
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
