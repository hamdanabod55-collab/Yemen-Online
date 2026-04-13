'use client';
import React, { useState } from 'react';
import { Package, TrendingUp, Users, PlusCircle, Settings, FileText } from 'lucide-react';
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
  const [aggStats, setAggStats] = useState({ sales: 0, today: 0, customers: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
        
        let ordersData = null;
        let mSales = 0;
        let mToday = 0;
        let mCustomers = new Set();

        if (merchant) {
          setMerchantObj(merchant);
          const { data, error } = await supabase.from('orders').select('*, users(email)').eq('merchant_id', merchant.id).order('created_at', { ascending: false });
          if (data) {
             ordersData = data.slice(0, 10);
             const todayString = new Date().toDateString();
             data.forEach(o => {
                mSales += parseFloat(o.total_price || 0);
                if (new Date(o.created_at).toDateString() === todayString) {
                   mToday++;
                }
                if (o.customer_id) mCustomers.add(o.customer_id);
             });
          }
        }

        setRecentOrders(ordersData || []);
        setAggStats({ sales: mSales, today: mToday, customers: mCustomers.size });
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
        <div className="p-4 rounded-2xl bg-dark-surface border border-white/5 col-span-2">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs text-gray-400 font-medium">إجمالي المبيعات</span>
             <div className="p-1.5 rounded-lg bg-green-400/10">
               <TrendingUp size={16} className="text-green-400" />
             </div>
          </div>
          <h3 className="font-bold text-2xl text-white">${aggStats.sales.toFixed(2)}</h3>
        </div>
        <div className="p-4 rounded-2xl bg-dark-surface border border-white/5">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs text-gray-400 font-medium">طلبات اليوم</span>
             <div className="p-1.5 rounded-lg bg-primary/10">
               <Package size={16} className="text-primary" />
             </div>
          </div>
          <h3 className="font-bold text-xl text-white">{aggStats.today}</h3>
        </div>
        <div className="p-4 rounded-2xl bg-dark-surface border border-white/5">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs text-gray-400 font-medium">قاعدة العملاء</span>
             <div className="p-1.5 rounded-lg bg-blue-400/10">
               <Users size={16} className="text-blue-400" />
             </div>
          </div>
          <h3 className="font-bold text-xl text-white">{aggStats.customers}</h3>
        </div>
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
                <div className="flex-1 overflow-hidden pr-2">
                  <span className="text-[10px] text-gray-500 font-mono mb-1 block truncate">#{order.id.split('-')[0]}</span>
                  <h4 className="text-sm font-bold text-white truncate">{order.users?.email || 'عميل مجهول'}</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 flex-shrink-0 rounded-md ${
                  order.status === 'pending' ? 'bg-secondary/20 text-secondary' : 'bg-green-500/20 text-green-500'
                }`}>
                  {order.status === 'pending' ? 'معلق' : order.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                <span className="text-sm font-bold text-white">${parseFloat(order.total_price).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="p-10 text-center text-gray-500 text-xs">لا توجد طلبات حتى الآن</div>
          )}
        </div>
      </section>
    </div>
  );
}
