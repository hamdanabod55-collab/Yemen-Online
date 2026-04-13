'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, MapPin, Trash2, ArrowRight, Plus, Minus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { getCurrencyDisplays } from '@/lib/currency';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalUsd } = useCart();
  const currencyInfo = getCurrencyDisplays(totalUsd);

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

  const checkoutViaWhatsApp = () => {
    // Zero Logistics Flow
    if (cartItems.length === 0) return;

    if (!location) {
      setLocationError('يرجى تفعيل الموقع لإكمال الطلب');
      const element = document.getElementById('location-section');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Grouping theoretically is optimal, but here we message the first store as a prototype constraint
    const rawPhone = cartItems[0].storePhone;
    if (!rawPhone) {
      setLocationError('عذراً، المتجر لم يقم بإضافة رقم واتساب لاستقبال الطلبات.');
      return;
    }

    const phone = String(rawPhone).replace('+', '');

    let message = `مرحباً، أود طلب المشتريات التالية من متجركم عبر *Yemen Online*:%0A%0A`;
    cartItems.forEach(i => {
      message += `- ${i.name} / العدد: ${i.qty} / السعر: $${i.price}%0A`;
    });
    message += `%0A*الإجمالي: $${totalUsd} (${currencyInfo.yer})*%0A%0A`;

    message += `📍 موقع العميل:%0Ahttps://www.google.com/maps?q=${location.lat},${location.lng}%0A%0A`;

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

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ShoppingBag size={64} className="mb-4 opacity-50" />
          <p>سلتك فارغة حالياً.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-dark-surface p-4 rounded-2xl border border-white/5 shadow-sm space-y-4">
            {cartItems.map(item => {
              const itemCurrency = getCurrencyDisplays(item.price * item.qty);
              return (
                <div key={item.id} className="flex justify-between items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-white font-bold mb-1">{item.name}</h4>
                    <p className="text-xs text-primary mb-2">من: {item.storeName}</p>
                    <div className="flex items-center space-x-2 space-x-reverse bg-dark-elevated w-fit rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="text-gray-400 hover:text-white"><Plus size={14} /></button>
                      <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
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

          {/* Logistics Concept Message */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start space-x-3 space-x-reverse">
            <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-primary block mb-1">الطلب عبر الواتساب</strong>
              هذه المنصة لا تتدخل في توصيل الطلبات. سيتم تحويلك لترتيب الدفع والتوصيل مع المتجر مباشرة.
            </p>
          </div>

          <div className="bg-dark-surface p-5 rounded-2xl border border-secondary/20 shadow-lg mt-6">
            <div className="flex justify-between text-lg mb-1">
              <span className="text-gray-300 font-bold">الإجمالي (USD)</span>
              <span className="text-secondary font-bold">${totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-6 pb-4 border-b border-white/5">
              <span>{currencyInfo.combined}</span>
            </div>

            {/* Location Section */}
            <div id="location-section" className="mb-6 p-4 bg-dark-elevated rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MapPin size={18} className={location ? 'text-primary' : 'text-gray-500'} />
                  <span className="text-sm font-medium text-gray-300">موقع التوصيل</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${location ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {location ? 'تم تحديد الموقع' : 'لم يتم تحديد الموقع'}
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

            <button
              onClick={checkoutViaWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(37,211,102,0.3)] transition-transform active:scale-95 flex items-center justify-center text-lg"
            >
              <MessageCircle size={22} className="ml-2" />
              إرسال الطلب للمتجر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
