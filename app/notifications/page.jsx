'use client';
import { useState, useEffect } from 'react';
import { Bell, ArrowRight, Package, ShieldCheck, Check } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
     const fetchNotes = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
           const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
           if (data) setNotifications(data);
        }
        setLoading(false);
     };
     fetchNotes();
  }, [supabase]);

  const markAsRead = async (id) => {
     const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
     if (!error) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
     }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold text-white">الإشعارات</h2>
      </div>

      <div className="space-y-3">
        {loading ? (
           <div className="text-center py-10 text-gray-500">جاري تحميل الإشعارات...</div>
        ) : notifications.map(notif => (
          <div key={notif.id} className={`p-4 rounded-2xl border flex space-x-3 space-x-reverse transition-colors ${notif.is_read ? 'bg-dark-surface border-white/5' : 'bg-primary/5 border-primary/20'}`}>
            <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 ${notif.type === 'order' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
              {notif.type === 'order' ? <Package size={18} /> : <ShieldCheck size={18} />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm mb-1 ${notif.is_read ? 'text-gray-300 font-medium' : 'text-white font-bold'}`}>{notif.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{notif.message}</p>
              <span className="text-[10px] text-gray-500">{new Date(notif.created_at).toLocaleString('ar-YE')}</span>
            </div>
            {!notif.is_read && (
              <div className="flex items-center">
                <button onClick={() => markAsRead(notif.id)} className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-white transition-colors flex items-center justify-center shadow-lg shadow-primary/10">
                   <Check size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center">
            <Bell size={48} className="opacity-20 mb-4" />
            <p>لا توجد إشعارات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
