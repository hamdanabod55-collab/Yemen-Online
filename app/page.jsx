import React from 'react';
import { Star, MapPin, Store, ChevronLeft, SearchX } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Init generic public supabase client for server components
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic'; // Ensure live dashboard updates for public index

export default async function Home({ searchParams }) {
  // Fetch real merchants from DB
  const { data: merchants, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const activeStores = merchants || [];

  // Filtering Logic based on search
  const query = searchParams?.q?.toLowerCase() || '';
  const filteredStores = query 
    ? activeStores.filter(s => 
        s.store_name?.toLowerCase().includes(query) || 
        s.description?.toLowerCase().includes(query)
      )
    : activeStores;

  return (
    <div className="space-y-6 pt-2">
      {/* Featured Promo Banner */}
      <section className="px-4">
        <div className="bg-gradient-to-r from-primary to-[#ff4b51] rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-primary/20">
          <div className="relative z-10 w-3/4">
            <h2 className="text-xl font-bold text-white mb-2">ادعم المتاجر المحلية!</h2>
            <p className="text-sm text-white/90 mb-4">اكتشف أفضل المتاجر اليمنية واطلب منها مباشرة بدون رسوم توصيل مخفية.</p>
            <button className="bg-white text-primary px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center">
              تصفح الآن <ChevronLeft size={16} className="mr-1" />
            </button>
          </div>
          <div className="absolute left-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-10px] left-4 text-6xl opacity-20 drop-shadow-lg text-white">
            <Store size={80} />
          </div>
        </div>
      </section>

      {/* Directory & Stores */}
      <section className="px-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">المتاجر المتاحة</h3>
          <button className="text-sm text-primary font-medium">تصفية</button>
        </div>
        
        <div className="space-y-4">
          {filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <SearchX size={48} className="mb-3 opacity-50" />
              <p>عذراً، لم تجد بحثك عن "{query}" نتائج.</p>
            </div>
          ) : (
            filteredStores.map(store => (
            <Link 
              key={store.id} 
              href={`/store/${store.slug || store.id}`}
              className={`block bg-dark-surface rounded-2xl overflow-hidden shadow-none border relative group transition-all duration-300 border-white/5 hover:border-primary/30`}
            >
              <div className="relative h-36 w-full">
                <img 
                  src={store.banner_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'} 
                  alt={store.store_name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent"></div>
                
                {/* Visual Fake Indicators for aesthetics until schema expands */}
                <span className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                  مفتوح
                </span>
              </div>
              
              <div className="p-4 relative -mt-6">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-white font-bold text-lg drop-shadow-md">{store.store_name}</h4>
                </div>
                
                <p className="text-sm text-gray-400 mb-3 line-clamp-1">{store.description || 'متجر مسجل في النظام'}</p>
                
                <div className="flex items-center text-xs text-gray-400">
                  <MapPin size={14} className="text-primary ml-1" />
                  <span>اليمن</span>
                </div>
              </div>
            </Link>
          )))}
        </div>
      </section>
    </div>
  );
}
