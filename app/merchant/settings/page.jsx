'use client';
import { useState, useEffect } from 'react';
import { Save, Store, Phone, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function MerchantSettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [desc, setDesc] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchStoreProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch current store profile from 'merchants' table
        const { data } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
        if (data) {
          setStoreName(data.store_name || '');
          setDesc(data.description || '');
          setWaNumber(data.whatsapp_number || '');
          setBanner(data.banner_url || '');
        }
      }
    };
    fetchStoreProfile();
  }, [supabase]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('merchants').update({
        store_name: storeName,
        description: desc,
        whatsapp_number: waNumber,
        banner_url: banner
      }).eq('user_id', user.id);
      
      if (error) {
        alert('حدث خطأ أثناء الحفظ');
      } else {
        alert('تم حفظ إعدادات المتجر!');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/merchant" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold text-white">إعدادات المتجر</h2>
      </div>

      <form onSubmit={handleUpdateSettings} className="space-y-4">
        <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 space-y-4">
          
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 mb-2">اسم المتجر</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Store size={18} className="text-gray-400" />
              </div>
              <input 
                required
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 mb-2">رقم الواتساب لاستقبال الطلبات</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input 
                required
                type="tel" 
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="+967700000000"
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 mb-2">رابط صورة بانر المتجر</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ImageIcon size={18} className="text-gray-400" />
              </div>
              <input 
                type="url" 
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">تفاصيل إضافية / وصف المتجر</label>
            <textarea 
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-primary transition-all"
            ></textarea>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center"
        >
          {loading ? 'جاري الحفظ...' : <><Save size={18} className="ml-2" /> تحديث المتجر</>}
        </button>
      </form>
    </div>
  );
}
