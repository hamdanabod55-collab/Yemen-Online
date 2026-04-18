'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yemenOnlineCart');
    if (saved && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly filter out items without store_id and normalize to string
          const validItems = parsed
            .filter(item => item && item.store_id)
            .map(item => ({
              ...item,
              store_id: String(item.store_id)
            }));
          
          setCartItems(validItems);
          console.log("Cart Items Loaded & Cleaned:", validItems);
        }
      } catch (e) {
        console.error("Cart Load Error:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on updates only AFTER initial load
  useEffect(() => {
    if (isLoaded) {
      console.log("Saving Cart Items:", cartItems);
      localStorage.setItem('yemenOnlineCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, storeInfo) => {
    // Require store_id to prevent mixed/invalid orders
    if (!storeInfo || !storeInfo.id) {
      console.error("Cart Add Error: Missing store_id in storeInfo", storeInfo);
      alert("عذراً، بيانات المتجر غير مكتملة، لا يمكن إضافة المنتج للسلة.");
      return;
    }

    const normalizedStoreId = String(storeInfo.id);

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      const newItem = { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        qty: 1, 
        store_id: normalizedStoreId,
        storeName: storeInfo.name, 
        storePhone: storeInfo.phone 
      };
      console.log("Added new item to cart:", newItem);
      return [...prev, newItem];
    });
    alert(`تمت إضافة ${product.name} إلى السلة!`);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const totalUsd = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalUsd }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
