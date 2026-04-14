'use client';
import { useState, useEffect } from 'react';
import { MapPin, User, Package, Save, Loader2, LogOut, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch User Session
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setName(user.user_metadata?.name || '');
        setEmail(user.email || '');
      }
    };
    getUserData();

    // 2. Fetch Stored Location from LocalStorage
    const storedLoc = localStorage.getItem('customerCacheLoc');
    if (storedLoc) {
      setLocation(JSON.parse(storedLoc));
    }

    // 3. Mock RLS Order Fetch (Customer -> only sees own orders)
    // await supabase.from('orders').select('*').eq('customer_id', user.id);
    setOrders([
      { id: 'ORD-001', store: 'مخبز الأمانة', total: '$14.00', status: 'مكتمل' }
    ]);
  }, [supabase]);

  const handleGetLocation = () => {
    setLoadingLoc(true);
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم تحديد الموقع.");
      setLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      localStorage.setItem('customerCacheLoc', JSON.stringify(coords));
      setLoadingLoc(false);
    }, (err) => {
      alert("فشل تحديد الموقع: الرجاء السماح بصلاحيات الـ GPS.");
      setLoadingLoc(false);
    }, { timeout: 10000 });
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    
    // Update Name across Supabase Auth and DB Users table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { name: name }
      });
      // Optionally sync to user DB table
      await supabase.from('users').update({ name, location }).eq('id', user.id);
    }
    
    setTimeout(() => {
      setSaving(false);
      alert('تم حفظ البيانات بنجاح!');
    }, 500);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between pb-4 border-b border-white/5 pt-2">
        <h2 className="text-xl font-bold text-white">حسابي</h2>
        <button onClick={handleSignOut} className="p-2 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500/20 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-gray-400">البيانات الشخصية</h3>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <User size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم الكامل"
            className="w-full bg-dark-elevated text-white rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-primary transition-all"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-gray-400" />
          </div>
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full bg-dark-elevated text-gray-400 rounded-xl py-3 pr-10 pl-4 outline-none border border-transparent opacity-80"
          />
        </div>
      </div>

      <div className="bg-dark-surface p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-400">موقعي للطلب</h3>
          {location && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-1 rounded-md font-bold">مُخزن</span>}
        </div>
        
        <button 
          onClick={handleGetLocation}
          className="w-full bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center"
        >
          {loadingLoc ? <Loader2 size={18} className="animate-spin ml-2" /> : <MapPin size={18} className="ml-2" />}
          تحديد موقعي الحالي (GPS)
        </button>
        {location && (
          <div className="text-xs text-gray-500 text-center bg-dark-elevated p-2 rounded-lg">
            خط العرض: {location.lat.toFixed(6)} | خط الطول: {location.lng.toFixed(6)}
          </div>
        )}
      </div>

      <button 
        onClick={handleUpdateProfile}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(227,27,35,0.39)] transition-transform active:scale-95 flex justify-center items-center"
      >
        {saving ? <Loader2 size={18} className="animate-spin ml-2" /> : <Save size={18} className="ml-2" />}
        تسجيل التحديثات
      </button>

      {/* Orders List */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 mb-3">طلباتي السابقة</h3>
        <div className="bg-dark-surface rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
          {orders.map(o => (
            <div key={o.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-dark-elevated rounded-xl">
                  <Package size={20} className="text-gray-400" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-mono block mb-0.5">{o.id}</span>
                  <p className="text-sm font-bold text-white">{o.store}</p>
                </div>
              </div>
              <div className="text-end">
                <span className="block text-primary font-bold text-sm">{o.total}</span>
                <span className="text-[10px] text-green-500">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
