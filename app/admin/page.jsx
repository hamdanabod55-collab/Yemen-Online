'use client';
import React, { useState } from 'react';
import { ShieldAlert, Store, UserPlus, Power, Calendar, ShieldCheck, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stores, setStores] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const supabase = createClient();

  React.useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setPageLoading(true);
    // Fetch merchants and join user email if possible, else just fetch merchants
    const { data, error } = await supabase
      .from('merchants')
      .select(`
        id,
        store_name,
        status,
        subscription_end,
        user_id,
        slug,
        users ( email )
      `);
      
    if (data) {
      const formatted = data.map(m => ({
        id: m.id,
        name: m.store_name,
        owner: m.users?.email || 'N/A',
        status: m.status === 'active' ? 'Active' : 'Inactive',
        subEnd: m.subscription_end ? new Date(m.subscription_end).toISOString().split('T')[0] : 'N/A',
        slug: m.slug,
        tier: 'Basic'
      }));
      setStores(formatted);
    }
    setPageLoading(false);
  };

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Controlled Inputs
  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    password: '',
    tier: 'basic',
    months: 1
  });

  const toggleStatus = async (id) => {
    const store = stores.find(s => s.id === id);
    if (!store) return;
    
    const newStatus = store.status === 'Active' ? 'suspended' : 'active';
    
    const { error } = await supabase
      .from('merchants')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      fetchStores(); // Refresh securely
    } else {
      alert('Failed to update status');
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: formData.storeName,
          email: formData.email,
          password: formData.password,
          tier: formData.tier === 'اشتراك Basic' ? 'basic' : formData.tier === 'اشتراك Pro' ? 'pro' : 'basic', 
          months: parseInt(formData.months) || 1
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        // Reset form on success
        setFormData({ storeName: '', email: '', password: '', tier: 'basic', months: 1 });
        setIsCreating(false);
        fetchStores(); // Automatically pull the new store
      } else {
        setErrorMsg(data.error || 'فشل في إنشاء المتجر');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('مشكلة في الاتصال بالشبكة');
    }

    setLoading(false);
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
          <h3 className="font-bold text-2xl text-white">
            {pageLoading ? '...' : stores.filter(s => s.status === 'Active').length}
          </h3>
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

      {/* Add Store Form */}
      {isCreating && (
        <form onSubmit={handleCreateStore} className="bg-dark-surface p-4 rounded-2xl border border-primary/20 space-y-3">
          <h3 className="text-sm font-bold text-white mb-2">بيانات التاجر الجديد</h3>
          
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-lg text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-2 rounded-lg text-xs font-bold text-center">
              {successMsg}
            </div>
          )}

          <input 
            type="text" 
            required
            value={formData.storeName}
            onChange={(e) => setFormData({...formData, storeName: e.target.value})}
            placeholder="اسم المتجر" 
            className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary disabled:opacity-50" 
            disabled={loading}
          />
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="البريد الإلكتروني للتاجر" 
              className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary disabled:opacity-50 text-left" 
              dir="ltr"
              disabled={loading}
            />
            <input 
              type="password" 
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="كلمة السر (6+ أحرف)" 
              className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary disabled:opacity-50 text-left" 
              dir="ltr"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select 
              value={formData.tier}
              onChange={(e) => setFormData({...formData, tier: e.target.value})}
              className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary appearance-none disabled:opacity-50"
              disabled={loading}
            >
              <option value="basic">اشتراك Basic</option>
              <option value="pro">اشتراك Pro</option>
              <option value="enterprise">اشتراك Premium</option>
            </select>
            <input 
              type="number" 
              required
              min={1}
              value={formData.months}
              onChange={(e) => setFormData({...formData, months: parseInt(e.target.value)})}
              placeholder="مدة الاشتراك (أشهر)" 
              className="w-full bg-dark-elevated text-sm text-white rounded-lg py-2.5 px-3 outline-none border border-white/5 focus:border-primary disabled:opacity-50" 
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm mt-2 flex justify-center items-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'جاري الإنشاء والتحقق...' : 'حفظ وإنشاء لوحة تحكم التاجر'}
          </button>
        </form>
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
                <Link prefetch={false} href={`/store/${store.slug || store.id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
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
