'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const supabase = createClient();

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (signInError) {
      setError("حدث خطأ في إرسال الرمز. يرجى المحاولة لاحقاً.");
    } else {
      setStep(2);
    }
    setLoading(false);
  };

  // Verify OTP & Create Profile
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError("الرمز غير صحيح أو منتهي الصلاحية.");
      setLoading(false);
      return;
    }

    // Checking if it's a new user by reading metadata
    if (data.session) {
      const user = data.user;
      
      // If we required a name and metadata doesn't have it, update it
      if (name && !user.user_metadata?.name) {
        await supabase.auth.updateUser({
          data: { name: name, role: 'customer' }
        });
        
        await supabase.from('users').upsert({ id: user.id, name: name, email: email, role: 'customer' });
      }
      
      // Check user role to redirect appropriately
      const role = user.user_metadata?.role || 'customer';
      if (role === 'admin' || role === 'merchant') {
        // Do NOT allow merchants/admins to use customer OTP flow natively
        await supabase.auth.signOut();
        setError("لا يمكن الدخول عبر هذا الرابط كتاجر أو مدير.");
        setLoading(false);
        return;
      }
      
      router.push('/account'); // Navigate to protected account dashboard
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col justify-center px-6">
      <div className="bg-dark-surface p-6 rounded-3xl border border-white/5 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h1>
          <p className="text-sm text-gray-400">
            {step === 1 ? 'أدخل بريدك الإلكتروني واسمك للدخول إلى حسابك أو التسجيل' : 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="الاسم الكامل (للمستخدمين الجدد)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all placeholder-gray-500"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input 
                type="email" 
                required
                placeholder="yemen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all placeholder-gray-500 text-left"
                dir="ltr"
              />
            </div>
            
            <button 
              disabled={loading || !email}
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center opacity-100 disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال الكود'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                required
                placeholder="الرمز (6 أرقام)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all placeholder-gray-500 text-center tracking-widest text-lg font-bold"
                dir="ltr"
                maxLength={6}
              />
            </div>
            
            <button 
              disabled={loading || otp.length < 6}
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center opacity-100 disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد'}
            </button>

            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors pt-2"
            >
              تغيير البريد الإلكتروني
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

