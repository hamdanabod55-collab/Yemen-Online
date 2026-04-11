'use client';
import { Search, MapPin, User, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };
  return (
    <header className="sticky top-0 z-50 bg-dark-surface border-b border-dark-elevated shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Marketplace Address/Location */}
        <div className="flex items-start flex-col">
          <span className="text-xs text-gray-400">التوصيل إلى</span>
          <button className="flex items-center space-x-1 space-x-reverse text-sm font-bold text-white hover:text-primary transition-colors">
            <MapPin size={16} className="text-primary" />
            <span className="truncate max-w-[120px]">صنعاء، حدة</span>
          </button>
        </div>

        {/* Profile Icons */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <Link href="/notifications" className="relative p-2 text-white hover:bg-dark-elevated rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </Link>
          <Link href="/account" className="p-2 text-white hover:bg-dark-elevated rounded-full transition-colors">
            <User size={20} />
          </Link>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-0">
            <Search size={18} className="text-gray-400 hover:text-white transition-colors" />
          </button>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن متاجر، منتجات..." 
            className="w-full bg-dark-elevated text-sm text-white rounded-xl py-2.5 pr-10 pl-4 outline-none focus:ring-1 focus:ring-primary transition-all placeholder-gray-500"
          />
        </form>
      </div>
    </header>
  );
}
