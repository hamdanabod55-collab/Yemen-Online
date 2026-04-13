'use client';
import { useState, useEffect } from 'react';
import { Save, Store, Phone, ArrowRight, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Banners are wider
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.6); // 60% compression
      };
    };
  });
};

export default function MerchantSettingsPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [desc, setDesc] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [banner, setBanner] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
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
      // 1. Upload Banner Image if Provided
      let finalBannerUrl = banner;
      if (bannerFile) {
        const compressed = await compressImage(bannerFile);
        const fileExt = compressed.name.split('.').pop() || 'jpg';
        const fileName = `banner_${user.id}_${Date.now()}.${fileExt}`;
        
        const { error: upErr } = await supabase.storage.from('product_images').upload(fileName, compressed);
        if (!upErr) {
          const { data: pubData } = supabase.storage.from('product_images').getPublicUrl(fileName);
          finalBannerUrl = pubData.publicUrl;
        }
      }

      // 2. Submit Merchant record
      const { error } = await supabase.from('merchants').update({
        store_name: storeName,
        description: desc,
        whatsapp_number: waNumber,
        banner_url: finalBannerUrl
      }).eq('user_id', user.id);
      
      if (error) {
        alert('حدث خطأ أثناء الحفظ. تأكد من أنك تملك الصلاحية.');
      } else {
        // Enforce cache invalidation
        router.refresh();
        alert('تم تحديث إعدادات المتجر بنجاح!');
        router.push('/merchant');
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
            <label className="block text-xs font-bold text-gray-400 mb-2">صورة المتجر (الغلاف البانر)</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Upload size={18} className="text-gray-400" />
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer text-left"
                dir="ltr"
              />
            </div>
            {bannerFile ? (
              <p className="text-xs text-primary mt-2">محمل: {bannerFile.name}</p>
            ) : banner ? (
              <div className="mt-2 text-xs flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-400">الصورة الحالية:</span>
                <img src={banner} className="h-10 w-16 object-cover rounded shadow-md border border-white/10" />
              </div>
            ) : null}
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
