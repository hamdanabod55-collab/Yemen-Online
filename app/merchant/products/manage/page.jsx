'use client';
import { useState, useEffect } from 'react';
import { Package, Trash2, Edit2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getCurrencyDisplays } from '@/lib/currency';

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // RLS naturally restricts to the merchant's items, but we explicitly filter anyway for safety.
      // Ensuring it queries securely mapped ID.
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (merchant) {
        const { data, error } = await supabase.from('products').select('*').eq('merchant_id', merchant.id);
        setProducts(data || []);
      } else {
        setProducts([]); // No fake data fallback
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف المنتج؟")) {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id)); // Optimistic UI
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/merchant" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold text-white">إدارة المنتجات</h2>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {products.map(item => {
            const currencyStr = getCurrencyDisplays(item.price);
            return (
            <div key={item.id} className="bg-dark-surface p-4 rounded-2xl border border-white/5 flex items-center">
              <div className="h-16 w-16 rounded-xl overflow-hidden ml-3 relative flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm mb-1">{item.name}</h4>
                <p className="text-secondary font-bold text-sm mb-1">${item.price}</p>
                <p className="text-gray-500 font-bold text-[10px]">{currencyStr.combined}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )})}
          
          {products.length === 0 && (
            <div className="text-center flex flex-col items-center justify-center text-gray-400 py-10">
              <Package size={40} className="mb-2 opacity-50" />
              <p>لا توجد منتجات مضافة.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
