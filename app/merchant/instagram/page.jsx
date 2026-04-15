'use client';
import { useState, useEffect, Suspense } from 'react';
import { ArrowRight, Save, Instagram, AlertCircle, CheckCircle, Facebook, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function InstagramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthCode = searchParams.get('code');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [merchantId, setMerchantId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [instaPageId, setInstaPageId] = useState('');
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);
  const [customMessage, setCustomMessage] = useState('مرحباً، شكراً لتواصلكم مع متجرنا! للطلب يرجى زيارة الرابط التالي: {slug}');
  
  const supabase = createClient();

  // Load Merchant Defaults
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: merchantData, error: dbError } = await supabase
        .from('merchants')
        .select('id, insta_page_id, auto_reply_enabled, insta_token_expires_at')
        .eq('user_id', user.id)
        .single();

      if (dbError) {
        console.error('Database configuration missing or schema drift:', dbError);
        setErrorMsg('خطأ في قاعدة البيانات: لم يتم العثور على الأعمدة الجديدة. يرجى التأكد من تشغيل وتحديث ملف (supabase_instagram.sql) في منصة Supabase.');
      }

      if (merchantData) {
        setMerchantId(merchantData.id);
        setInstaPageId(merchantData.insta_page_id || '');
        setAutoReplyEnabled(merchantData.auto_reply_enabled || false);
        setTokenExpirationDate(merchantData.insta_token_expires_at ? new Date(merchantData.insta_token_expires_at) : null);

        // Fetch custom message settings
        const { data: settingsData } = await supabase
          .from('auto_reply_settings')
          .select('custom_message')
          .eq('merchant_id', merchantData.id)
          .single();

        if (settingsData) {
          setCustomMessage(settingsData.custom_message);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // Execute Meta OAuth Callback Automatically
  useEffect(() => {
    if (oauthCode && merchantId && userId && !syncingMeta) {
      setSyncingMeta(true);
      
      const processMetaHandshake = async () => {
        try {
          // Visually clean the dirty OAuth URL for a pristine UX
          window.history.replaceState(null, '', '/merchant/instagram');
          
          const redirectUri = window.location.origin + '/merchant/instagram';
          const res = await fetch('/api/auth/facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: oauthCode, redirectUri, merchantId, userId })
          });
          
          const result = await res.json();
          if (res.ok && result.success) {
            setInstaPageId(result.instaPageId);
            setAutoReplyEnabled(true);
            setSuccessMsg('تم ربط حساب انستقرام وأعمال فيسبوك وتفعيل البوت بنجاح! 🚀');
          } else {
            setErrorMsg(result.error || 'فشل الاتصال بخوادم ميتا. حاول مجدداً.');
          }
        } catch (err) {
          setErrorMsg('فشل الإتصال بالشبكة لربط حساب انستقرام.');
        }
        setSyncingMeta(false);
      };
      
      processMetaHandshake();
    }
  }, [oauthCode, merchantId, userId, syncingMeta]);

  // Initiate Redirect Flow
  const initiateFacebookLogin = () => {
    const APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID;
    if (!APP_ID) {
      setErrorMsg('لم تقم الإدارة بربط NEXT_PUBLIC_FB_APP_ID بعد.');
      return;
    }
    const redirectUri = window.location.origin + '/merchant/instagram';
    const scope = 'pages_show_list,pages_messaging,instagram_basic,instagram_manage_messages';
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleToggle = async () => {
    if (!autoReplyEnabled && !instaPageId) {
      setErrorMsg('يجب ربط حساب إنستقرام بنجاح أولاً قبل تفعيل البوت.');
      return;
    }
    setErrorMsg('');
    
    const newStatus = !autoReplyEnabled;
    setAutoReplyEnabled(newStatus);
    if (merchantId) {
      await supabase.from('merchants').update({ auto_reply_enabled: newStatus }).eq('id', merchantId);
    }
  };

  const handleSaveMessage = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!merchantId) throw new Error('فشل التعرف على التاجر');
      
      const { error: settingsError } = await supabase
        .from('auto_reply_settings')
        .upsert({ 
          merchant_id: merchantId,
          custom_message: customMessage,
          updated_at: new Date().toISOString()
        }, { onConflict: 'merchant_id' });

      if (settingsError) throw new Error('فشل تحديث الرسالة المخصصة');

      setSuccessMsg('تم حفظ رسالة الرد بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (err) {
      setErrorMsg(err.message);
    }
    setSaving(false);
  };

  if (loading || syncingMeta) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-gray-400 font-bold">{syncingMeta ? 'جاري مصافحة سيرفرات Meta وجلب صلاحيات متجرك...' : 'جاري تحميل إعدادات إنستقرام...'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/merchant" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center">
          <Instagram size={24} className="ml-2 text-pink-500" /> Auto-Reply SaaS
        </h2>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center text-sm font-bold">
          <AlertCircle size={18} className="ml-2 flex-shrink-0" /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl flex items-center text-sm font-bold">
          <CheckCircle size={18} className="ml-2 flex-shrink-0" /> {successMsg}
        </div>
      )}

      {/* Expiration Health Diagnostic Alerts */}
      {instaPageId && tokenExpirationDate && (
        <>
          {tokenExpirationDate < new Date() ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl font-bold flex flex-col space-y-2">
              <div className="flex items-center">
                 <AlertCircle size={20} className="ml-2" />
                 <span>تحذير أمني: انتهت صلاحية الجلسة الموثوقة مع إنستقرام!</span>
              </div>
              <p className="text-xs font-normal mr-7">يرجى الضغط على زر "إعادة الربط والتحديث" أدناه فوراً لإعادة تفعيل البوت.</p>
            </div>
          ) : (tokenExpirationDate - new Date()) / (1000 * 60 * 60 * 24) < 7 ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl font-bold flex flex-col space-y-2">
              <div className="flex items-center">
                 <AlertCircle size={20} className="ml-2" />
                 <span>تنبيه: اقتراب انتهاء صلاحية الجلسة الذكية</span>
              </div>
              <p className="text-xs font-normal mr-7">لحماية متجرك لضمان عدم توقف البوت، نرجو إعادة تسجيل الدخول لتحديث الصلاحيات بضغطة زر واحدة.</p>
            </div>
          ) : null}
        </>
      )}

      {/* Modern 1-Click Meta Integrator UI */}
      <div className="bg-dark-surface p-6 rounded-2xl border border-white/5 flex flex-col items-center space-y-4 text-center">
         <div className="bg-[#1877F2]/10 p-4 rounded-full">
            <Facebook size={32} className="text-[#1877F2]" />
         </div>
         <div>
            <h3 className="text-lg font-bold text-white mb-2">الربط الذكي مع Meta</h3>
            <p className="text-xs text-gray-400 max-w-sm">اربط صفحة فيسبوك وحساب انستقرام التابع لك لمرة واحدة بضغطة زر. السيرفر سيقوم ببرمجة وجلب بيانات متجرك وحفظها دون أي تدخل منك.</p>
         </div>
         
         <button 
           onClick={initiateFacebookLogin}
           className="w-full max-w-xs bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#1877F2]/20 flex items-center justify-center mt-2"
         >
           {instaPageId ? <><CheckCircle size={18} className="ml-2" /> إعادة الربط والتحديث</> : <><Facebook size={18} className="ml-2" /> تسجيل الدخول فيسبوك</>}
         </button>

         {instaPageId && (
            <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-between items-center px-4">
              <span className="text-sm font-bold text-gray-300">حالة تشغيل البوت الأوتوماتيكي</span>
              <button 
                 type="button"
                 onClick={handleToggle}
                 className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${autoReplyEnabled ? 'bg-green-500' : 'bg-dark-elevated border border-white/10'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${autoReplyEnabled ? '-translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
         )}
      </div>

      {instaPageId && (
        <form onSubmit={handleSaveMessage} className="space-y-4">
          <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">صيغة الرد التلقائي</label>
              <textarea 
                required
                rows="4"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-pink-500 transition-all font-cairo"
              ></textarea>
              <div className="mt-2 bg-pink-500/10 border border-pink-500/20 rounded-lg p-2 flex items-start">
                 <Info size={14} className="text-pink-500 ml-1.5 mt-0.5 flex-shrink-0" />
                 <p className="text-[10px] text-pink-400/90 leading-relaxed">
                   استخدم المتغير <code className="bg-pink-500/20 px-1 py-0.5 rounded font-mono font-bold">{'{slug}'}</code> في رسالتك، ليقوم البوت آلياً باستبداله برابط الشراء المباشر الخاص بمتجرك وتوجيه العملاء للشراء فوراً.
                 </p>
              </div>
            </div>
          </div>

          <button 
            disabled={saving}
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center shadow-lg shadow-pink-500/20"
          >
            {saving ? 'جاري الحفظ...' : <><Save size={18} className="ml-2" /> حفظ وحماية الإعدادات</>}
          </button>
        </form>
      )}
    </div>
  );
}

export default function InstagramAutoReplySettings() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-gray-400 font-bold">جاري تحميل إعدادات السحابة...</p>
      </div>
    }>
      <InstagramContent />
    </Suspense>
  );
}

function Info({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}
