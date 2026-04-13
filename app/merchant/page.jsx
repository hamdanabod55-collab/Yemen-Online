'use client';
import React, { useState } from 'react';
import { Package, TrendingUp, Users, PlusCircle, Settings, FileText, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function MerchantDashboard() {
  const stats = [
    { label: 'إجمالي المبيعات', value: '$840.00', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'طلبات اليوم', value: '12', icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'العملاء المستهدفين', value: '340', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' }
  ];

  const supabase = createClient();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [merchantObj, setMerchantObj] = useState(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();

        let ordersData = null;
        if (merchant) {
          setMerchantObj(merchant);
          const { data, error } = await supabase.from('orders').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: false }).limit(10);
          ordersData = data || [];
        } else {
          // Strict block on client: no fake data ever
          ordersData = [];
        }

        setRecentOrders(ordersData);
      }
      setLoading(false);
    };
    fetchStats();
  }, [supabase]);

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Merchant Header */}
      <div className="flex items-center justify-between pb-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-white">لوحة التحكم التاجر</h2>
          <p className="text-xs text-gray-400 mt-1">مرحباً بك، {merchantObj?.store_name || 'في لوحة تحكم التاجر'}</p>
        </div>
        <Link href="/merchant/settings" className="p-2 bg-dark-elevated rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
          <Settings size={20} className="text-gray-400" />
        </Link>
      </div>

      {/* Store URL Display */}
      {merchantObj && (
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl flex justify-between items-center mb-4">
          <div className="truncate flex-1" dir="ltr">
            <span className="text-xs text-primary font-mono block truncate">
              {typeof window !== 'undefined' ? window.location.origin : 'https://yemen-online.com'}/store/{merchantObj.slug || merchantObj.id}
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/store/${merchantObj.slug || merchantObj.id}`);
              alert('تم نسخ رابط المتجر!');
            }}
            className="text-xs bg-primary text-white font-bold px-3 py-1.5 rounded-lg ml-2"
          >
            نسخ الرابط
          </button>
        </div>
      )}

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl bg-dark-surface border border-white/5 ${i === 0 ? 'col-span-2' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon size={16} className={stat.color} />
                </div>
              </div>
              <h3 className={`font-bold ${i === 0 ? 'text-2xl' : 'text-xl'} text-white`}>{stat.value}</h3>
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 space-x-reverse">
        <Link href="/merchant/products/add" className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(227,27,35,0.39)] transition-transform active:scale-95 flex items-center justify-center text-sm">
          <PlusCircle size={18} className="ml-1" /> إضافة منتج
        </Link>
        <Link href="/merchant/products/manage" className="flex-1 bg-dark-surface border border-white/10 hover:bg-dark-elevated text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center text-sm">
          <Package size={18} className="ml-1" /> إدارة المنتجات
        </Link>
      </div>
      
      {/* SaaS Auto-Reply Link */}
      <div>
        <Link href="/merchant/instagram" className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center text-sm shadow-lg shadow-purple-500/30 border border-white/10">
          <MessageCircle size={18} className="ml-2" /> إعدادات الرد التلقائي (Instagram Bot)
        </Link>
      </div>

      {/* Order Management Database Hook Simulator */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-400">آخر الطلبات (Supabase)</h3>
          <span className="text-xs text-primary font-bold cursor-pointer hover:underline">عرض الكل</span>
        </div>

        <div className="bg-dark-surface rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono mb-1 block">{order.id}</span>
                  <h4 className="text-sm font-bold text-white">{order.customer}</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${order.status === 'معلق' ? 'bg-secondary/20 text-secondary' : 'bg-green-500/20 text-green-500'
                  }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1">{order.items}</p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">{order.time}</span>
                <span className="text-sm font-bold text-white">{order.total}</span>
              </div>

              {/* Communication Layer Layer */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                <button className="bg-[#25D366]/10 text-[#25D366] py-1.5 rounded-lg text-xs font-bold hover:bg-[#25D366] hover:text-dark transition-colors">
                  مراسلة العميل عبر واتساب
                </button>
                <button className="bg-dark-elevated text-gray-300 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                  تحديث الحالة للطلب
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
