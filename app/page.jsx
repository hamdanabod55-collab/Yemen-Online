import React from 'react';
import { Star, MapPin, Store, ChevronLeft, SearchX } from 'lucide-react';
import Link from 'next/link';

export default function Home({ searchParams }) {
  const STORES = [
    {
      id: 'store-1',
      name: 'مخبز الأمانة',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      category: 'مخبوزات وحلويات',
      rating: 4.8,
      location: 'صنعاء، الستين',
      isOpen: true,
      subscription: 'Premium'
    },
    {
      id: 'store-2',
      name: 'إلكترونيات التقنية',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      category: 'إلكترونيات',
      rating: 4.5,
      location: 'عدن، كريتر',
      isOpen: true,
      subscription: 'Pro'
    },
    {
      id: 'store-3',
      name: 'متاجر الأناقة للأزياء',
      image: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=600&q=80',
      category: 'ملابس',
      rating: 4.9,
      location: 'تعز، شارع جمال',
      isOpen: false,
      subscription: 'Basic'
    }
  ];

  // Filtering Logic
  const query = searchParams?.q?.toLowerCase() || '';
  const filteredStores = query 
    ? STORES.filter(s => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query))
    : STORES;

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
              href={`/store/${store.id}`}
              className={`block bg-dark-surface rounded-2xl overflow-hidden shadow-none border relative group transition-all duration-300 ${
                store.subscription === 'Premium' ? 'border-secondary/50 shadow-[0_0_15px_rgba(255,184,0,0.1)]' : 'border-white/5 hover:border-primary/30'
              }`}
            >
              <div className="relative h-36 w-full">
                <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent"></div>
                
                {store.isOpen ? (
                  <span className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                    مفتوح
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                    مغلق
                  </span>
                )}

                {store.subscription === 'Premium' && (
                  <span className="absolute top-3 left-3 bg-secondary text-dark text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center justify-center">
                    <Star size={12} weight="fill" className="mr-0.5" /> مميز
                  </span>
                )}
              </div>
              
              <div className="p-4 relative -mt-6">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-white font-bold text-lg drop-shadow-md">{store.name}</h4>
                  <div className="flex items-center bg-dark-elevated px-2 py-1.5 rounded-lg border border-white/5">
                    <span className="text-xs font-bold text-white ml-1">{store.rating}</span>
                    <Star size={14} className="text-secondary fill-secondary" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{store.category}</p>
                
                <div className="flex items-center text-xs text-gray-400">
                  <MapPin size={14} className="text-primary ml-1" />
                  <span>{store.location}</span>
                </div>
              </div>
            </Link>
          )))}
        </div>
      </section>
    </div>
  );
}
