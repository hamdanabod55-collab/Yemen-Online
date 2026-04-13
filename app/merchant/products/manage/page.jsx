'use client';
import { useState, useEffect } from 'react';
import { Package, Trash2, Edit2, ArrowRight, Save, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getCurrencyDisplays } from '@/lib/currency';

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  
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

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Using string image fallback since full file upload in edit modal is complex for inline
    const { error } = await supabase.from('products').update({
      name: editingProduct.name,
      price_usd: parseFloat(editingProduct.price_usd),
      description: editingProduct.description || '',
      image_url: editingProduct.image_url || ''
    }).eq('id', editingProduct.id);

    if (!error) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    } else {
      alert("فشل التحديث: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/merchant" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold text-white">إدارة المنتجات</h2>
      </div>

      {loading && !editingProduct ? (
        <div className="text-center text-gray-400 py-10">جاري التحميل...</div>
      ) : editingProduct ? (
        <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">تعديل المنتج</h3>
            <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">الاسم</label>
              <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">السعر (USD)</label>
              <input required type="number" step="0.01" value={editingProduct.price_usd} onChange={e => setEditingProduct({...editingProduct, price_usd: e.target.value})} className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">وصف</label>
              <textarea rows="2" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-primary transition-all"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">رابط الصورة (URL)</label>
              <input type="url" value={editingProduct.image_url || ''} onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-primary transition-all text-left" dir="ltr" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center">
              {loading ? '...' : <><Save size={18} className="ml-2" /> حفظ التعديلات</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(item => {
            const currencyStr = getCurrencyDisplays(item.price_usd || 0);
            return (
            <div key={item.id} className="bg-dark-surface p-4 rounded-2xl border border-white/5 flex items-center">
              <div className="h-16 w-16 rounded-xl overflow-hidden ml-3 relative flex-shrink-0">
                <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm mb-1">{item.name}</h4>
                <p className="text-secondary font-bold text-sm mb-1">${item.price_usd}</p>
                <p className="text-gray-500 font-bold text-[10px]">{currencyStr.combined}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button onClick={() => setEditingProduct(item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
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
