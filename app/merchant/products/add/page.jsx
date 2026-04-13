'use client';
import { useState } from 'react';
import { Upload, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(''); // Would typically be handled via Supabase storage upload
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMSG('');

    try {
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc, price, image })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
        setName(''); setDesc(''); setPrice(''); setImage('');
        
        // Next.js App Router aggressively caches client navigation. Bust it!
        router.push('/merchant/products/manage');
        router.refresh();
      } else {
        setErrorMSG(data.error || 'Failed to add product');
      }
    } catch (err) {
      setErrorMSG('Network error');
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/merchant" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold text-white">إضافة منتج جديد</h2>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl flex items-center">
          <AlertCircle size={18} className="ml-2" /> تمت إضافة المنتج بنجاح!
        </div>
      )}

      {errorMSG && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center">
          <AlertCircle size={18} className="ml-2" /> {errorMSG}
        </div>
      )}

      <form onSubmit={handleAddProduct} className="space-y-4">
        <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">اسم المنتج</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">السعر (بالدولار)</label>
            <input 
              required
              type="number" 
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">رابط صورة المنتج (مؤقت)</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Upload size={18} className="text-gray-400" />
              </div>
              <input 
                type="url" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">وصف المنتج</label>
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
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center"
        >
          {loading ? 'جاري الحفظ...' : <><Plus size={18} className="ml-2" /> نشر المنتج</>}
        </button>
      </form>
    </div>
  );
}
