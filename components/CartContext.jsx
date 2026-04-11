'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yemenOnlineCart');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('yemenOnlineCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, storeInfo) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        qty: 1, 
        storeName: storeInfo.name, 
        storePhone: storeInfo.phone 
      }];
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
