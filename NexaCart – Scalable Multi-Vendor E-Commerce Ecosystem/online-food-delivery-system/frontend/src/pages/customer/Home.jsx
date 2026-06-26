import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantAPI, settingsAPI, productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { 
  Search, Star, Clock, MapPin, Flame, ShieldCheck, Truck, UtensilsCrossed, ShoppingCart
} from 'lucide-react';
import ProductImage from '../../components/ProductImage';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [shopPhone, setShopPhone] = useState('+919876543210');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const fetchRestaurants = async (query = '') => {
    try {
      setLoading(true);
      let res;
      if (query.trim()) {
        res = await restaurantAPI.search(query);
      } else {
        res = await restaurantAPI.getAll();
      }
      setRestaurants(res.data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await fetchRestaurants();
      await fetchProducts();
      try {
        const settingsRes = await settingsAPI.getPublic();
        if (settingsRes.data?.shopPhone) {
          setShopPhone(settingsRes.data.shopPhone);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    initPage();
  }, []);

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
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Debounce or search on change
    fetchRestaurants(val);
  };

  const getMockDetails = (name) => {
    // Generate Zomato-style mock parameters based on restaurant names
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

  const filteredProducts = products.filter((prod) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      prod.name.toLowerCase().includes(q) ||
      (prod.description && prod.description.toLowerCase().includes(q)) ||
      (prod.category?.name && prod.category.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-10 px-4 sm:px-6 py-6 max-w-7xl mx-auto text-left animate-fadeIn">
      
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden h-[260px] sm:h-[320px] flex items-center bg-slate-950 border border-slate-800/80 group">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] overflow-hidden pointer-events-none">
          <img 
            src="/hero_banner.jpg" 
            alt="Premium food selection" 
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-[10000ms] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40 md:hidden"></div>
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>
        </div>

        <div className="relative z-10 px-6 sm:px-10 py-6 max-w-xl flex flex-col gap-3.5 text-left h-full justify-center">
          <div className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-rose-450 w-fit">
            <Flame className="w-3.5 h-3.5 fill-rose-500" />
            Nagaon's Premium Multi-Vendor Platform
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Discover the Best <br />
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              Restaurants & Food
            </span>
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-md">
            Order fresh meals, rolls, burgers, chowmeins, and premium biryanis from top local kitchens delivered straight to your door.
          </p>

          <div className="flex gap-4 mt-1 border-t border-slate-800/60 pt-3 text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> Multi-Vendor Scoping
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-500" /> Fast Distance Matrix Routing
            </div>
          </div>
        </div>
      </section>

      {/* 2. Restaurant Search Bar */}
      <section className="max-w-2xl mx-auto w-full -mt-16 sm:-mt-20 relative z-20 px-4">
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 flex items-center gap-2 group focus-within:border-rose-500/50 focus-within:ring-1 focus-within:ring-rose-500/20 transition-all duration-300">
          <Search className="w-5 h-5 text-slate-500 ml-3.5 group-focus-within:text-rose-400 transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for restaurants and food..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 py-3.5 pl-1.5 pr-4 border-none outline-none font-bold"
          />
        </div>
      </section>

      {/* 3. Popular Restaurants Section */}
      <section className="flex flex-col gap-6 mt-4">
        <div>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl tracking-tight uppercase flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-rose-500" /> Popular Restaurants Near You
          </h2>
          <p className="text-slate-500 text-xs mt-1">Explore top-rated local kitchens, dynamic starting rates, and live delivery updates.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-900/60 h-72 rounded-2xl border border-slate-850"></div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/20 rounded-2xl border border-slate-850/60 flex flex-col items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-slate-700 animate-bounce" />
            No restaurants found matching your query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => {
              const details = getMockDetails(rest.name);
              
              return (
                <Link
                  key={rest.id}
                  to={`/restaurant/${rest.id}`}
                  className="group bg-slate-900/40 border border-slate-850/80 rounded-2xl overflow-hidden hover:border-rose-500/20 hover:shadow-lg hover:shadow-rose-950/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full cursor-pointer"
                >
                  {/* Restaurant Banner Image */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-850/60">
                    <img 
                      src={rest.banner || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'} 
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Open Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider border ${
                        rest.isOpen 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                      }`}>
                        {rest.isOpen ? '🟢 Open' : '🔴 Closed'}
                      </span>
                    </div>

                    {/* Logo Overlay */}
                    <div className="absolute -bottom-5 right-4 w-12 h-12 rounded-full overflow-hidden border-2 border-slate-900 shadow-xl bg-slate-950 flex items-center justify-center shrink-0">
                      <img 
                        src={rest.logo || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80'} 
                        alt="logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Restaurant Info Content */}
                  <div className="p-5 flex flex-col flex-grow gap-2.5">
                    
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-100 text-base line-clamp-1 group-hover:text-rose-400 transition-colors">
                        {rest.name}
                      </h3>
                      
                      <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-emerald-400 text-xs font-black shrink-0">
                        <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                        {rest.rating ? rest.rating.toFixed(1) : '4.5'}
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs font-semibold leading-relaxed truncate">
                      {rest.cuisineType || 'Fast Food & Non-Veg'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-850 text-[10px] text-slate-400 font-bold">
                      <div className="flex flex-col gap-0.5 items-start">
                        <span className="text-slate-500 uppercase tracking-wide">Deliv Time</span>
                        <span className="text-slate-200 flex items-center gap-1 font-extrabold mt-0.5">
                          <Clock className="w-3 h-3 text-rose-500" /> {details.time}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5 items-start">
                        <span className="text-slate-500 uppercase tracking-wide">Distance</span>
                        <span className="text-slate-200 flex items-center gap-1 font-extrabold mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500" /> {details.dist}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5 items-start">
                        <span className="text-slate-500 uppercase tracking-wide">Starting</span>
                        <span className="text-rose-400 font-black mt-0.5">
                          {details.price}
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Delicious Food Items Section */}
      <section className="flex flex-col gap-6 mt-4">
        <div>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl tracking-tight uppercase flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 fill-rose-500" /> Delicious Dishes & Food Items
          </h2>
          <p className="text-slate-500 text-xs mt-1">Directly browse all hot items from all partner kitchens in Nagaon.</p>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-900/60 h-72 rounded-2xl border border-slate-850"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/20 rounded-2xl border border-slate-850/60 flex flex-col items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-slate-700 animate-bounce" />
            No dishes found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredProducts.map((prod) => {
              const isWeighted = ['Chicken', 'Mutton', 'Fish'].includes(prod.category?.name || '');
              const unit = isWeighted ? 'kg' : 'unit';

              return (
                <div 
                  key={prod.id} 
                  className="group bg-slate-900/40 border border-slate-850/80 rounded-2xl overflow-hidden hover:border-rose-500/20 hover:shadow-lg hover:shadow-rose-950/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Image wrapper */}
                  <Link to={`/product/${prod.id}`} className="relative block aspect-video bg-slate-950 overflow-hidden border-b border-slate-850/60">
                    <ProductImage 
                      product={prod} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    {prod.stock === 0 ? (
                      <div className="absolute top-2.5 right-2.5 bg-slate-950/80 text-rose-500 text-[10px] font-black px-2.5 py-1 rounded border border-rose-500/20">
                        Sold Out
                      </div>
                    ) : (
                      prod.restaurant && (
                        <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-xs text-slate-350 text-[9px] font-black px-2 py-0.5 rounded border border-slate-800">
                          🏨 {prod.restaurant.name}
                        </div>
                      )
                    )}
                  </Link>

                  <div className="p-5 flex flex-col flex-grow gap-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <Link to={`/product/${prod.id}`} className="hover:text-rose-450 transition-colors">
                        <h3 className="font-extrabold text-slate-100 text-sm line-clamp-1">{prod.name}</h3>
                      </Link>
                      <span className="text-[9px] bg-slate-850 text-slate-400 font-bold px-2 py-0.5 rounded shrink-0 border border-slate-800">
                        {prod.category?.name || 'Dish'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      {prod.description || 'Fresh non-veg specialties cooked to order using local spices.'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-850/40">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Price</span>
                        <p className="font-extrabold text-slate-100 text-sm">₹{prod.price} <span className="text-[10px] text-slate-500 font-normal">/ {unit}</span></p>
                      </div>
                      
                      {prod.stock > 0 ? (
                        <button 
                          onClick={() => handleAddToCart(prod)}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl transition-all shadow-md shadow-rose-950/15 cursor-pointer border border-rose-500/10"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-bold px-2 py-1 bg-rose-950/20 border border-rose-900/30 rounded-lg">
                          Out Of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
