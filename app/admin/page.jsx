'use client';
import React, { useState } from 'react';
import { ShieldAlert, Store, UserPlus, Power, Calendar, ShieldCheck, Eye, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  // DB Mock for Admin Dashboard (Yemen Online - Master Control)
  const [stores, setStores] = useState([
    { id: 'S-1', name: 'مخبز الأمانة', owner: 'ali_bakery', status: 'Active', subEnd: '2026-12-01', tier: 'Premium' },
    { id: 'S-2', name: 'إلكترونيات التقنية', owner: 'tech_admin1', status: 'Inactive', subEnd: '2026-04-01', tier: 'Pro' },
  ]);

  const [isCreating, setIsCreating] = useState(false);

  const toggleStatus = (id) => {
    setStores(stores.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return s;
    }));
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Admin Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 pt-2">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
            <ShieldAlert size={24} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">الإدارة العامة</h2>
            <p className="text-xs text-gray-400 mt-1">Yemen Online Master Control</p>
          </div>
        </div>
      </div>

      {/* Global Analytics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-dark-surface border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">المتاجر النشطة</span>
            <Store size={16} className="text-green-400" />
          </div>
          <h3 className="font-bold text-2xl text-white">24</h3>
        </div>
        <div className="p-4 rounded-2xl bg-dark-surface border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400 font-medium">اشتراكات الشهر</span>
            <Calendar size={16} className="text-secondary" />
          </div>
          <h3 className="font-bold text-2xl text-white">$450</h3>
        </div>
      </div>

      {/* Actions */}
      <div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(227,27,35,0.39)] transition-transform active:scale-95 flex items-center justify-center text-sm"
        >
          <UserPlus size={18} className="ml-2" />
          إنشاء متجر جديد (تخصيص يوزر وباسورد)
        </button>
      </div>

      {/* Add Store Form Mock */}
      {isCreating && (
        <div className="bg-dark-surface p-4 rounded-2xl border border-primary/20 space-y-3">
          <h3 className="text-sm font-bold text-white mb-2">بيانات التاجر الجديد</h3>
          <input type="text" placeholder="اسم المتجر" className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="اسم المستخدم (للدخول)" className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary" />
            <input type="password" placeholder="كلمة السر" className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary appearance-none">
              <option>اشتراك Basic</option>
              <option>اشتراك Pro</option>
              <option>اشتراك Premium</option>
            </select>
            <input type="number" placeholder="مدة الاشتراك (أشهر)" className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary" />
          </div>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm mt-2">
            حفظ وإنشاء لوحة تحكم التاجر
          </button>
        </div>
      )}

      {/* Stores Directory */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-400">إدارة المتاجر</h3>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="bg-dark-surface p-1.5 rounded-lg border border-white/5">
              <Search size={16} className="text-gray-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-dark-surface rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
          {stores.map((store) => (
            <div key={store.id} className="p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                    <h4 className="text-sm font-bold text-white">{store.name}</h4>
                    {store.tier === 'Premium' && <ShieldCheck size={14} className="text-secondary" />}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono block">يوزر التاجر: {store.owner}</span>
                </div>
                <button 
                  onClick={() => toggleStatus(store.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                    store.status === 'Active' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500' 
                      : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-green-500/10 hover:border-green-500/20 hover:text-green-500'
                  } transition-colors`}
                >
                  <Power size={18} />
                  <span className="text-[10px] font-bold mt-1">{store.status === 'Active' ? 'إيقاف' : 'تفعيل'}</span>
                </button>
              </div>

              <div className="flex justify-between items-center bg-dark-elevated p-2 rounded-lg">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-300">ينتهي الاشتراك: {store.subEnd}</span>
                </div>
                <button className="text-xs text-primary font-bold hover:underline">تمديد</button>
              </div>

              <div className="flex items-center pt-1">
                <Link href={`/store/${store.id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
                  <Eye size={14} className="ml-1" />
                  دخول كمتفرج
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
