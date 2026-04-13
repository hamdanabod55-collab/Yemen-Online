'use client';
import React from 'react';
import { Share2, Heart, ShieldCheck, MessageCircle, Info, ShoppingBag, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { getCurrencyDisplays } from '@/lib/currency';
import { createClient } from '@/lib/supabase/client';

export default function StoreProfile({ params }) {
  const { id } = params;
  const [store, setStore] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const supabase = createClient();
  const { addToCart } = useCart();

  React.useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      // Fetch Merchant (Store) securely by ID or Slug without tripping DB type errors
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const queryColumn = isUUID ? 'id' : 'slug';

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq(queryColumn, id)
        .single();

      if (merchantData) {
        setStore({
          id: merchantData.id,
          name: merchantData.store_name,
          category: merchantData.description || 'متجر مسجل',
          verified: merchantData.status === 'active',
          phone: merchantData.whatsapp_number || '',
          cover: merchantData.banner_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        });

        // Fetch Products for this Merchant
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchantData.id);

        if (productsData) {
          const formattedProducts = productsData.map(p => ({
            id: p.id,
            name: p.name,
            desc: p.description || '',
            price: p.price_usd,
            image: p.image_url || 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=300&q=80'
          }));
          setProducts(formattedProducts);
        }
      }
      setLoading(false);
    };

    if (id) {
      fetchStoreData();
    }
  }, [id, supabase]);

  if (loading) {
    return <div className="p-10 text-center text-white">جاري تحميل باقة المتجر...</div>;
  }

  if (!store) {
    return <div className="p-10 text-center text-white">عذراً، هذا المتجر غير متاح أو تم إيقافه.</div>;
  }

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
              <div className="bg-dark-elevated py-1.5 px-4 rounded-xl flex items-center border border-white/5 space-x-3 space-x-reverse">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <ShoppingBag size={14} className="text-gray-400" />
                  <span className="text-gray-300 font-medium text-xs">{products.length} منتجات</span>
                </div>
                {store.verified && (
                  <div className="flex items-center space-x-1 space-x-reverse border-r border-white/10 pr-3">
                    <CheckCircle size={14} className="text-blue-400" />
                    <span className="text-blue-400 font-medium text-xs">موثق</span>
                  </div>
                )}
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
          {products.map((item) => {
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
            )
          })}
        </div>
      </div>
    </div>
  );
}
