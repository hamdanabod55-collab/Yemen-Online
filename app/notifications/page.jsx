'use client';
import { Bell, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'order', title: 'طلب جديد', message: 'لقد تم استلام طلب جديد لمتجر الأمانة.', time: 'منذ 5 دقائق', isRead: false },
    { id: 2, type: 'system', title: 'تحديث الحماية', message: 'تم تفعيل التوثيق الثنائي لحسابك بنجاح.', time: 'منذ ساعتين', isRead: true },
    { id: 3, type: 'system', title: 'مرحباً بك', message: 'أهلاً بك في منصة Yemen Online التجارية.', time: 'منذ يوم', isRead: true },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center pb-4 border-b border-white/5 pt-2">
        <Link href="/" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-xl font-bold text-white">الإشعارات</h2>
      </div>

      <div className="space-y-3">
        {notifications.map(notif => (
          <div key={notif.id} className={`p-4 rounded-2xl border flex space-x-3 space-x-reverse transition-colors ${notif.isRead ? 'bg-dark-surface border-white/5' : 'bg-primary/5 border-primary/20'}`}>
            <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 ${notif.type === 'order' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
              {notif.type === 'order' ? <Package size={18} /> : <ShieldCheck size={18} />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm mb-1 ${notif.isRead ? 'text-gray-300 font-medium' : 'text-white font-bold'}`}>{notif.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{notif.message}</p>
              <span className="text-[10px] text-gray-500">{notif.time}</span>
            </div>
            {!notif.isRead && (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
              </div>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center">
            <Bell size={48} className="opacity-20 mb-4" />
            <p>لا توجد إشعارات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
