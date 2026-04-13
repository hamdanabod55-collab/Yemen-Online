'use client';
import { Search, MapPin, User, Bell, ShoppingBag } from 'lucide-react';
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
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2 space-x-reverse min-w-0 pr-1">
          <div className="bg-yellow-400 p-1.5 rounded-lg shadow-lg flex-shrink-0">
            <ShoppingBag size={20} className="text-dark font-black" />
          </div>
          <div className="flex flex-col truncate leading-tight">
            <span className="text-lg font-black tracking-tighter text-white">
              Yemen<span className="text-yellow-400 tracking-normal ml-1">Online</span>
            </span>
          </div>
        </Link>

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
