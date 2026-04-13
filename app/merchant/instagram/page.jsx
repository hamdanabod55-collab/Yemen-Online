'use client';
import { useState, useEffect } from 'react';
import { ArrowRight, Save, Instagram, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function InstagramAutoReplySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [merchantId, setMerchantId] = useState(null);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [instaPageId, setInstaPageId] = useState('');
  const [instaAccessToken, setInstaAccessToken] = useState('');
  const [customMessage, setCustomMessage] = useState('مرحباً، شكراً لتواصلكم مع متجرنا! للطلب يرجى زيارة الرابط التالي: {slug}');
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch merchant core settings
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('id, insta_page_id, insta_access_token, auto_reply_enabled')
        .eq('user_id', user.id)
        .single();

      if (merchantData) {
        setMerchantId(merchantData.id);
        setInstaPageId(merchantData.insta_page_id || '');
        setInstaAccessToken(merchantData.insta_access_token || '');
        setAutoReplyEnabled(merchantData.auto_reply_enabled || false);

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

  const handleToggle = async () => {
    if (!autoReplyEnabled && !instaAccessToken.trim()) {
      setErrorMsg('يجب عليك تحديد (Access Token) وحفظه أولاً قبل تفعيل البوت.');
      return;
    }
    
    setErrorMsg('');
    const newStatus = !autoReplyEnabled;
    setAutoReplyEnabled(newStatus);
    
    // Save toggle instantly
    if (merchantId) {
      await supabase
        .from('merchants')
        .update({ auto_reply_enabled: newStatus })
        .eq('id', merchantId);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (autoReplyEnabled && !instaAccessToken.trim()) {
      setErrorMsg('لا يمكن تفعيل الرد التلقائي والحفظ بينما رمز التوثيق Access Token فارغ.');
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update Merchant Credentials
      const { error: merchantError } = await supabase
        .from('merchants')
        .update({ 
          insta_page_id: instaPageId,
          insta_access_token: instaAccessToken 
        })
        .eq('user_id', user.id); // Strict RLS Security isolated to auth.uid()

      if (merchantError) throw new Error('فشل تحديث بيانات التاجر');

      // Update Custom Message (Upsert since it might not exist)
      const { error: settingsError } = await supabase
        .from('auto_reply_settings')
        .upsert({ 
          merchant_id: merchantId,
          custom_message: customMessage,
          updated_at: new Date().toISOString()
        }, { onConflict: 'merchant_id' });

      if (settingsError) throw new Error('فشل تحديث الرسالة المخصصة');

      setSuccessMsg('تم حفظ بيانات بوت إنستقرام بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (err) {
      setErrorMsg(err.message);
    }
    
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">جاري تحميل إعدادات إنستقرام...</div>;

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/merchant" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center">
          <Instagram size={24} className="ml-2 text-pink-500" /> Auto-Reply Bot
        </h2>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-4">
        
        {/* Toggle Head */}
        <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
             <h3 className="text-sm font-bold text-white mb-1">حالة الرد التلقائي</h3>
             <p className="text-[10px] text-gray-400 max-w-[200px]">عند التفعيل، سيقوم النظام بالرد المباشر على عملاء إنستقرام برابط سلتهم.</p>
          </div>
          <button 
             type="button"
             onClick={handleToggle}
             className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${autoReplyEnabled ? 'bg-green-500' : 'bg-dark-elevated border border-white/10'}`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${autoReplyEnabled ? '-translate-x-6' : 'translate-x-0'}`}></div>
          </button>
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

        <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">Instagram Page ID <span className="text-red-500">*</span></label>
            <input 
              required
              type="text" 
              value={instaPageId}
              onChange={(e) => setInstaPageId(e.target.value)}
              placeholder="مثال: 123456789012345"
              className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-pink-500 transition-all text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">Graph API Access Token <span className="text-red-500">*</span></label>
            <textarea 
              required
              rows="3"
              value={instaAccessToken}
              onChange={(e) => setInstaAccessToken(e.target.value)}
              placeholder="EAAGm0PX4ZCkwBA..."
              className="w-full bg-dark-elevated text-gray-300 rounded-xl py-3 px-4 outline-none border border-transparent focus:border-pink-500 transition-all text-left font-mono text-[10px]"
              dir="ltr"
            ></textarea>
            <p className="text-[10px] text-gray-500 mt-2">يجب توليد هذا الرمز من Meta for Developers مع صلاحيات `pages_messaging`.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">صيغة الرد التلقائي (الذكية)</label>
            <textarea 
              required
              rows="4"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-dark-elevated text-white rounded-xl py-3 px-4 outline-none border border-transparent focus:border-pink-500 transition-all"
            ></textarea>
            <div className="mt-2 bg-pink-500/10 border border-pink-500/20 rounded-lg p-2 flex items-start">
               <Info size={14} className="text-pink-500 ml-1.5 mt-0.5 flex-shrink-0" />
               <p className="text-[10px] text-pink-400/90 leading-relaxed">
                 ملاحظة هامة: سيتم استبدال النص <code className="bg-pink-500/20 px-1 py-0.5 rounded font-mono font-bold">{'{slug}'}</code> تلقائياً برابط متجرك الفريد عند الرد على العميل بالخاص.
               </p>
            </div>
          </div>
        </div>

        <button 
          disabled={saving}
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center shadow-lg shadow-pink-500/20"
        >
          {saving ? 'جاري الحفظ...' : <><Save size={18} className="ml-2" /> حفظ إعدادات الربط</>}
        </button>
      </form>
    </div>
  );
}

// Minimal Info Icon Component to avoid large imports
function Info({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}
