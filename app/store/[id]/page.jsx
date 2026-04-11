'use client';
import React from 'react';
import { Share2, Heart, ShieldCheck, MessageCircle, Star, Info } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { getCurrencyDisplays } from '@/lib/currency';

export default function StoreProfile({ params }) {
  // In reality, this will fetch from Supabase: `const { id } = params; const pb = await db.from('stores').eq('id', id)`
  const store = {
    name: 'مخبز الأمانة',
    category: 'مخبوزات مميزة وحلويات يمنية',
    verified: true,
    rating: 4.8,
    reviews: 240,
    phone: '+967733000000',
    cover: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    products: [
      { id: 1, name: 'روتي يمني طازج', desc: 'ربطة 5 حبات من الروتي الفاخر', price: 2, image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=300&q=80' },
      { id: 2, name: 'كيكة العسل', desc: 'قطعة غنية بالكريمة والعسل الطبيعي', price: 15, image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=300&q=80' },
      { id: 3, name: 'بيتزا وسط', desc: 'عجينة رقيقة مع جبن الموزاريلا والزيتون', price: 20, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' }
    ]
  };

  const { addToCart } = useCart();

  return (
    <div className="pb-10">
      {/* Dynamic Cover Section */}
      <div className="relative h-60 w-full">
        <img src={store.cover} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <Link href="/" className="w-10 h-10 bg-dark/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-dark-elevated">
            <Share2 size={20} />
          </Link>
          <div className="flex space-x-2 space-x-reverse">
            <button className="w-10 h-10 bg-dark/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-red-500 transition-colors">
              <Heart size={20} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4">
          <div className="bg-dark-surface rounded-2xl p-4 shadow-xl border border-white/5 relative">
            {/* Supabase Subscription Enforcement indicator */}
            {store.verified && (
              <div className="absolute -top-3 -right-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                <ShieldCheck size={12} className="mr-1" /> متجر موثق
              </div>
            )}
            
            <div className="flex justify-between items-center mb-3">
              <div>
                <h1 className="text-xl font-bold text-white mb-1">{store.name}</h1>
                <p className="text-xs text-gray-400">{store.category}</p>
              </div>
              <div className="bg-dark-elevated py-1.5 px-3 rounded-xl flex flex-col items-center border border-white/5">
                <div className="flex items-center text-secondary mb-0.5">
                  <span className="font-bold mr-1">{store.rating}</span>
                  <Star size={12} weight="fill" className="fill-secondary" />
                </div>
                <span className="text-[10px] text-gray-400">{store.reviews} تقييم</span>
              </div>
            </div>

            {/* Zero Logistics: Direct Chat Buttons */}
            <div className="flex space-x-2 space-x-reverse mt-2">
              <Link 
                href={`https://wa.me/${store.phone.replace('+', '')}?text=مرحباً، أستفسر من متجركم عبر اليمن أونلاين`}
                className="flex-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-dark py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
              >
                واتساب المتجر
              </Link>
              <button className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center">
                <MessageCircle size={14} className="ml-1" />
                محادثة داخلية
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Catalog */}
      <div className="px-4 py-8 space-y-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">المنتجات</h2>
          <Info size={16} className="text-gray-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {store.products.map((item) => {
            const currencyStr = getCurrencyDisplays(item.price);
            return (
            <div key={item.id} className="bg-dark-surface rounded-2xl p-2 border border-white/5 flex flex-col">
              <div className="h-24 w-full rounded-xl overflow-hidden mb-2 relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{item.name}</h3>
              <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 mb-1 flex-1">{item.desc}</p>
              
              <div className="text-secondary font-bold text-sm mb-1">${item.price} <span className="text-[9px] text-gray-500 font-normal">({currencyStr.yer})</span></div>

              <div className="flex items-center justify-end mt-auto pt-2 border-t border-white/5">
                <button onClick={() => addToCart(item, store)} className="w-full text-xs font-bold text-dark bg-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/90 transition-colors">
                  أضف للسلة
                </button>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
