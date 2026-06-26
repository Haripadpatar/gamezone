import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const navigate = useNavigate();

  const subtotal = getSubtotal();

  const handleQtyChange = (item, action) => {
    const categoryName = item.product.category?.name || '';
    const isWeighted = ['Chicken', 'Mutton', 'Fish'].includes(categoryName);
    const step = isWeighted ? 0.5 : 1.0;
    
    let newQty = item.quantity;
    if (action === 'increase') {
      newQty += step;
    } else {
      newQty -= step;
    }

    if (newQty > item.product.stock) {
      toast.error(`Cannot exceed available stock of ${item.product.stock} ${isWeighted ? 'kg' : 'units'}`);
      return;
    }

    updateQuantity(item.product.id, newQty);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm">
          Looks like you haven't added any fresh cuts or seafood to your order yet.
        </p>
        <Link 
          to="/catalog" 
          className="mt-8 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transition-all border border-rose-500/30 inline-flex items-center gap-2"
        >
          Browse Fresh Meat
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Shopping Cart</h1>
        <p className="text-slate-400 text-sm mt-1">Review your fresh cuts before completing checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Item List (Left 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map((item) => {
            const categoryName = item.product.category?.name || '';
            const isWeighted = ['Chicken', 'Mutton', 'Fish'].includes(categoryName);
            const unit = isWeighted ? 'kg' : 'unit';

            return (
              <div 
                key={item.product.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 justify-between"
              >
                
                {/* Product details */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                    <img 
                      src={item.product.images && item.product.images.length > 0 ? item.product.images[0].imageUrl : 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100'} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left flex flex-col gap-1">
                    <Link to={`/product/${item.product.id}`} className="hover:text-rose-400 transition-colors font-bold text-slate-100 text-base">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                      {categoryName} • ₹{item.product.price} / {unit}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t border-slate-800/50 sm:border-none pt-4 sm:pt-0">
                  
                  {/* Plus/Minus quantity */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => handleQtyChange(item, 'decrease')}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-white px-2.5 min-w-[55px] text-center">
                      {item.quantity} {unit}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item, 'increase')}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-xs text-slate-500">Total</span>
                    <p className="font-extrabold text-slate-200">₹{Math.round(item.product.price * item.quantity * 100) / 100}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => { removeFromCart(item.product.id); toast.success('Removed item from cart'); }}
                    className="p-2 text-slate-500 hover:text-rose-500 bg-slate-950 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>

        {/* Order Summary (Right 1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 sticky top-24">
            <h3 className="font-bold text-lg text-slate-200 border-b border-slate-800 pb-3">Order Summary</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-3">
                <span className="text-left leading-relaxed">Delivery charge will be calculated during checkout based on road distance.</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transition-all border border-rose-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <Link 
                to="/catalog"
                className="text-xs font-semibold text-rose-500 hover:text-rose-400 text-center transition-colors"
              >
                Continue Slicing (Add More Cuts)
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
