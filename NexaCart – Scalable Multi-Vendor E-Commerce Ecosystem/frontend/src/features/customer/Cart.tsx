import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../core/hooks/useCart';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, loading, updateItemQuantity, removeItemFromCart, fetchCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQtyChange = (variantId: number, currentQty: number, change: number) => {
    const nextQty = currentQty + change;
    if (nextQty >= 1) {
      updateItemQuantity(variantId, nextQty);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl font-extrabold text-white mb-8">Shopping Basket</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-[#0c1222]/55 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto flex flex-col items-center">
            <ShoppingBag size={48} className="text-slate-650 mb-4" />
            <h2 className="text-xl font-bold mb-2">Your basket is empty</h2>
            <p className="text-slate-500 text-sm mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="px-6 py-3 rounded-full gradient-btn font-semibold text-sm flex items-center space-x-2">
              <ArrowLeft size={16} />
              <span>Go Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#0c1222]/60 border border-slate-800 rounded-2xl gap-4 hover:border-slate-750/80 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <Link to={`/products/${item.productSlug}`} className="hover:text-indigo-400 font-bold text-white transition-colors line-clamp-1">
                        {item.productName}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">
                        SKU: {item.sku} {item.size ? `| Size: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-0 border-slate-850 pt-4 sm:pt-0">
                    <div className="flex items-center space-x-3 bg-[#0e1423] border border-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => handleQtyChange(item.productVariantId, item.quantity, -1)}
                        className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold text-white w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.productVariantId, item.quantity, 1)}
                        className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6 sm:mt-3">
                      <span className="text-base font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeItemFromCart(item.productVariantId)}
                        className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                <h3 className="font-bold text-lg text-white border-b border-slate-850 pb-4">Order Summary</h3>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery</span>
                    <span className="text-green-400 font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-slate-850 pt-4 flex justify-between text-base font-extrabold text-white">
                    <span>Total Amount</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl gradient-btn font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-650/10 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>

                <div className="text-center pt-2">
                  <Link to="/products" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
