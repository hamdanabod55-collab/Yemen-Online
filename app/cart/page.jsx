'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, MapPin, Trash2, ArrowRight, Plus, Minus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { getCurrencyDisplays } from '@/lib/currency';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalUsd } = useCart();
  
  // Strict Grouping: Only include items with store_id
  const groupedCart = React.useMemo(() => {
    const validItems = cartItems.filter(item => item.store_id);
    const groups = validItems.reduce((acc, item) => {
      if (!acc[item.store_id]) {
        acc[item.store_id] = {
          store_id: item.store_id,
          storeName: item.storeName,
          storePhone: item.storePhone,
          items: [],
          totalUsd: 0,
        };
      }
      acc[item.store_id].items.push(item);
      acc[item.store_id].totalUsd += (item.price * item.qty);
      return acc;
    }, {});
    return Object.values(groups);
  }, [cartItems]);

  const overallValidTotalUsd = groupedCart.reduce((sum, group) => sum + group.totalUsd, 0);
  const currencyInfo = getCurrencyDisplays(overallValidTotalUsd);

  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('customerCacheLoc');
    if (stored) {
      try {
        setLocation(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored location", e);
      }
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('متصفحك لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLoc);
        setIsLocating(false);
        localStorage.setItem('customerCacheLoc', JSON.stringify(newLoc));
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('يرجى تفعيل صلاحية الوصول للموقع لإكمال الطلب.');
        } else {
          setLocationError('حدث خطأ أثناء تحديد موقعك. يرجى المحاولة مرة أخرى.');
        }
      }
    );
  };

  const checkoutViaWhatsApp = (group) => {
    if (!group || group.items.length === 0) return;

    if (!location) {
      setLocationError('يرجى تفعيل الموقع لإكمال الطلب قبل الإرسال');
      const element = document.getElementById('location-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Optional: flash effect
        element.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => element.classList.remove('ring-2', 'ring-red-500'), 1500);
      }
      return;
    }

    const rawPhone = group.storePhone;
    if (!rawPhone) {
      setLocationError(`عذراً، المتجر (${group.storeName}) لم يقم بإضافة رقم واتساب لاستقبال الطلبات.`);
      return;
    }

    const phone = String(rawPhone).replace('+', '');

    let message = `مرحباً، أود طلب المشتريات التالية من متجركم (${group.storeName}) عبر *Yemen Online*:%0A%0A`;
    group.items.forEach(i => {
      message += `- ${i.name} / العدد: ${i.qty} / السعر: $${i.price}%0A`;
    });
    
    const groupCurrency = getCurrencyDisplays(group.totalUsd);
    message += `%0A*الإجمالي: $${group.totalUsd} (${groupCurrency.yer})*%0A%0A`;

    message += `📍 موقع العميل للتوصيل:%0Ahttps://www.google.com/maps?q=${location.lat},${location.lng}%0A%0A`;

    window.location.href = `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div className="p-4 pb-12 space-y-6">
      <div className="flex items-center mb-6 pt-4">
        <Link href="/" className="p-2 bg-dark-elevated rounded-full hover:bg-white/10 transition-colors ml-3">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <h2 className="text-2xl font-bold text-white">سلة المشتريات</h2>
      </div>

      {groupedCart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ShoppingBag size={64} className="mb-4 opacity-50" />
          <p>سلتك فارغة أو تحتوي على منتجات غير صالحة.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Global Location Section */}
          <div id="location-section" className="p-4 bg-dark-surface rounded-2xl border border-white/5 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <MapPin size={18} className={location ? 'text-primary' : 'text-gray-500'} />
                <span className="text-sm font-medium text-gray-300">موقع التوصيل</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${location ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {location ? 'تم تحديد الموقع' : 'مطلوب لإكمال الطلب'}
              </span>
            </div>

            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className={`w-full py-3 rounded-lg border transition-all flex items-center justify-center text-sm font-bold ${location
                  ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
            >
              {isLocating ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
              ) : (
                <MapPin size={16} className="ml-2" />
              )}
              {isLocating ? 'جاري تحديد موقعك...' : location ? 'تحديث الموقع' : 'تحديد موقعي الآن'}
            </button>

            {locationError && (
              <div className="flex items-center space-x-1 space-x-reverse text-[10px] text-red-400 mt-2 bg-red-400/5 p-2 rounded border border-red-400/10">
                <AlertCircle size={12} className="flex-shrink-0" />
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Logistics Concept Message */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start space-x-3 space-x-reverse">
            <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-primary block mb-1">الطلب عبر الواتساب</strong>
              هذه المنصة لا تتدخل في السداد أو التوصيل. سيتم إنشاء طلب منفصل لكل متجر لتنسيق التوصيل والدفع معه مباشرة.
            </p>
          </div>

          {/* Store Groups */}
          {groupedCart.map(group => {
            const groupCurrency = getCurrencyDisplays(group.totalUsd);
            return (
              <div key={group.store_id} className="bg-dark-surface rounded-2xl border border-secondary/20 shadow-lg overflow-hidden">
                <div className="bg-dark-elevated p-4 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-lg">{group.storeName}</h3>
                    <p className="text-xs text-gray-400 mt-1">طلب منفصل إلى الواتساب الخاص بالمتجر</p>
                  </div>
                  <div className="text-left">
                    <div className="text-secondary font-bold text-lg">${group.totalUsd.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400">{groupCurrency.combined}</div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {group.items.map(item => {
                    const itemCurrency = getCurrencyDisplays(item.price * item.qty);
                    return (
                      <div key={item.id} className="flex justify-between items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div>
                          <h4 className="text-white font-bold mb-2">{item.name}</h4>
                          <div className="flex items-center space-x-2 space-x-reverse bg-dark-elevated w-fit rounded-lg px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="text-gray-400 hover:text-white"><Plus size={14} /></button>
                            <span className="text-sm font-bold w-4 text-center text-white">{item.qty}</span>
                            <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="text-gray-400 hover:text-white"><Minus size={14} /></button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between h-full">
                          <span className="font-bold text-white">${item.price}</span>
                          <span className="text-[10px] text-gray-500 mt-1">{itemCurrency.combined}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 p-2 mt-2 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="p-4 bg-dark-elevated/50">
                  <button
                    onClick={() => checkoutViaWhatsApp(group)}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(37,211,102,0.3)] transition-transform active:scale-95 flex items-center justify-center text-md"
                  >
                    <MessageCircle size={20} className="ml-2" />
                    إرسال هذا الطلب للمتجر
                  </button>
                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}

