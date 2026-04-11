'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MerchantLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const supabase = createClient();

  const handleMerchantLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("البريد الإلكتروني أو كلمة السر غير صحيحة.");
      setLoading(false);
      return;
    }

    if (data.session) {
      const user = data.user;
      const role = user.user_metadata?.role || 'customer';
      
      // Strict Role Validation
      if (role !== 'merchant' && role !== 'admin') {
        // Force sign out if not merchant
        await supabase.auth.signOut();
        setError("غير مصرح لك بالدخول إلى لوحة تحكم التجار.");
        setLoading(false);
        return;
      }

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/merchant');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col justify-center px-6">
      <div className="bg-dark-surface p-6 rounded-3xl border border-secondary/20 shadow-2xl space-y-6">
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="bg-secondary/10 p-3 rounded-full border border-secondary/20 mb-3">
            <Store size={32} className="text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">بوابة التاجر</h1>
          <p className="text-sm text-gray-400 text-center">
            خاص بالتجار والمدراء فقط. الرجاء إدخال البريد الإلكتروني وكلمة المرور.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleMerchantLogin} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input 
              required
              type="email" 
              placeholder="البريد الإلكتروني (الخاص بمتجرك)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-secondary transition-all placeholder-gray-500 text-left"
              dir="ltr"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input 
              required
              type="password" 
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-secondary transition-all placeholder-gray-500 text-left"
              dir="ltr"
            />
          </div>
          
          <button 
            disabled={loading || !email || !password}
            type="submit"
            className="w-full bg-secondary hover:bg-secondary/90 text-dark font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center opacity-100 disabled:opacity-50 mt-2"
          >
            {loading ? 'جاري التحقق...' : 'دخول إلى لوحة التحكم'}
          </button>
        </form>
      </div>
    </div>
  );
}
