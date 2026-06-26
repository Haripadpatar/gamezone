import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { restaurantAPI, productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { 
  Star, Clock, MapPin, Phone, ArrowLeft, ShoppingBag, Plus, Minus 
} from 'lucide-react';
import ProductImage from '../../components/ProductImage';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMockDetails = (name) => {
    switch (name) {
      case 'Lutumari Fast Food':
        return { time: '15 min', dist: '2.3 km', price: '₹120 onwards' };
      case 'Nagaon Spicy Kitchen':
        return { time: '20 min', dist: '3.1 km', price: '₹220 onwards' };
      case 'Abar Taste Kora':
        return { time: '25 min', dist: '1.8 km', price: '₹130 onwards' };
      case 'Biryani Express Nagaon':
        return { time: '30 min', dist: '4.2 km', price: '₹150 onwards' };
      case 'Chowmein Hub':
        return { time: '12 min', dist: '1.2 km', price: '₹99 onwards' };
      case 'Fish Corner':
        return { time: '22 min', dist: '2.9 km', price: '₹140 onwards' };
      default:
        return { time: '25 min', dist: '2.5 km', price: '₹150 onwards' };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const restRes = await restaurantAPI.getById(id);
        setRestaurant(restRes.data);

        const prodRes = await productAPI.getByRestaurant(id);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        toast.error('Failed to load restaurant details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!restaurant) return null;

  const mock = getMockDetails(restaurant.name);

  // Group products by category
  const groupedProducts = products.reduce((acc, prod) => {
    const catName = prod.category?.name || 'Others';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(prod);
    return acc;
  }, {});

  const handleAddToCart = (product) => {
    const isWeighted = ['Chicken', 'Mutton', 'Fish'].includes(product.category?.name || '');
    const defaultQty = isWeighted ? 0.5 : 1.0;
    const unit = isWeighted ? 'kg' : 'unit';

    if (product.stock <= 0) {
      toast.error('Item is out of stock!');
      return;
    }

    const added = addToCart(product, defaultQty);
    if (added) {
      toast.success(`${product.name} added to cart`);
    }
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 text-left animate-fadeIn">
      
      {/* Back navigation link */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Restaurants
        </Link>
      </div>

      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden h-[240px] sm:h-[320px] bg-slate-950 border border-slate-800/80 group">
        <img 
          src={restaurant.banner || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200'} 
          alt={restaurant.name} 
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-[10000ms] ease-out"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent"></div>
        
        {/* Floating circular logo */}
        <div className="absolute bottom-6 left-6 sm:left-10 flex items-end gap-4 sm:gap-6 z-10">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-slate-900 shadow-2xl bg-slate-950 shrink-0">
            <img 
              src={restaurant.logo || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150'} 
              alt={restaurant.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1.5 pb-1">
            <div className="flex gap-2 items-center">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                restaurant.isOpen 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
              }`}>
                {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow">
              {restaurant.name}
            </h1>
            <p className="text-xs text-slate-300 font-medium drop-shadow line-clamp-1 max-w-xl">
              {restaurant.cuisineType || 'Fast Food, Biryani, Indian'}
            </p>
          </div>
        </div>
      </section>

      {/* Info Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rating</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span className="text-sm font-black text-white">{restaurant.rating || '4.5'}</span>
            <span className="text-[10px] text-slate-500 font-bold">(50+ orders)</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Distance</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-extrabold text-white">{mock.dist}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Delivery Time</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-extrabold text-white">{mock.time}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Location & Phone</span>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-slate-300">
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>{restaurant.phone || '+91 98765 43210'}</span>
          </div>
        </div>

      </section>

      {/* Menu / Products Grid */}
      <section className="flex flex-col gap-8 mt-4">
        <div className="border-b border-slate-850 pb-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" /> Menu Catalog
          </h2>
          <p className="text-slate-500 text-xs mt-1">Order fresh items directly prepared by {restaurant.name}.</p>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/20 rounded-2xl border border-slate-850/60 flex flex-col items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-slate-700 animate-bounce" />
            This restaurant hasn't listed any items yet.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.keys(groupedProducts).map((catName) => (
              <div key={catName} className="flex flex-col gap-5">
                <h3 className="text-lg font-black text-rose-400 border-l-3 border-rose-500 pl-3">
                  {catName}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedProducts[catName].map((prod) => {
                    const qty = getCartQuantity(prod.id);
                    const isWeighted = ['Chicken', 'Mutton', 'Fish'].includes(prod.category?.name || '');
                    const unit = isWeighted ? 'kg' : 'unit';
                    const step = isWeighted ? 0.5 : 1.0;

                    return (
                      <div 
                        key={prod.id} 
                        className="group bg-slate-900/40 border border-slate-850/80 rounded-2xl overflow-hidden hover:border-slate-800 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-850/60">
                          <ProductImage product={prod} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                          {prod.stock <= 0 && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                              <span className="text-xs font-black text-rose-500 border border-rose-500/20 bg-rose-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-5 flex flex-col flex-grow gap-2.5 justify-between">
                          <div className="text-left flex flex-col gap-1">
                            <h4 className="font-extrabold text-slate-100 text-sm line-clamp-1">
                              {prod.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                              {prod.description || 'Prepared fresh using high-quality ingredients and strict safety protocols.'}
                            </p>
                          </div>

                          <div className="flex justify-between items-center gap-4 border-t border-slate-850/40 pt-3 mt-1.5">
                            <div className="text-left">
                              <span className="text-xs text-slate-500 block">Price</span>
                              <span className="font-black text-slate-100 text-sm">
                                ₹{prod.price} <span className="text-[10px] text-slate-500 font-normal">/ {unit}</span>
                              </span>
                            </div>

                            {/* Cart Add/Remove actions */}
                            {prod.stock > 0 && (
                              <div>
                                {qty > 0 ? (
                                  <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl overflow-hidden shadow-inner">
                                    <button 
                                      onClick={() => updateQuantity(prod.id, qty - step)}
                                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer transition-colors"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="px-3 text-xs font-black text-rose-400">
                                      {qty} <span className="text-[9px] font-normal text-slate-500">{unit}</span>
                                    </span>
                                    <button 
                                      onClick={() => {
                                        if (qty + step > prod.stock) {
                                          toast.error(`Stock limit reached (${prod.stock} ${unit}s)`);
                                          return;
                                        }
                                        updateQuantity(prod.id, qty + step);
                                      }}
                                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer transition-colors"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(prod)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add to Cart
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default RestaurantDetails;
