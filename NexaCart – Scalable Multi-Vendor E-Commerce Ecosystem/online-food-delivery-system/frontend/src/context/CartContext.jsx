import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart items from localStorage on mount
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from storage', e);
      }
    }
  }, []);

  // Sync cart items with localStorage
  const saveCartToStorage = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1) => {
    if (cartItems.length > 0) {
      const currentRestaurantId = cartItems[0].product.restaurant?.id;
      const targetRestaurantId = product.restaurant?.id;

      if (currentRestaurantId && targetRestaurantId && currentRestaurantId !== targetRestaurantId) {
        const confirmClear = window.confirm(
          "Your current cart contains items from another restaurant. Continuing will clear your current cart."
        );
        if (confirmClear) {
          const updatedCart = [{ product, quantity }];
          saveCartToStorage(updatedCart);
          return true;
        } else {
          return false;
        }
      }
    }

    const existingIndex = cartItems.findIndex((item) => item.product.id === product.id);
    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({ product, quantity });
    }

    saveCartToStorage(updatedCart);
    return true;
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.product.id === productId ? { ...item, quantity: parseFloat(quantity) } : item
    );

    saveCartToStorage(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter((item) => item.product.id !== productId);
    saveCartToStorage(updatedCart);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.product.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
