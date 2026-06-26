import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductImage from '../../components/ProductImage';
import { toast } from 'react-hot-toast';
import { Search, ShoppingCart, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('name-asc'); // price-asc, price-desc, name-asc, name-desc

  // Fetch categories on mount
  useEffect(() => {
    categoryAPI.getAll()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch products when search parameters or filters change
  useEffect(() => {
    setLoading(true);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    
    productAPI.search(query, category)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error('Error loading products:', err);
        toast.error('Failed to load products');
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams(searchQuery, selectedCategory);
  };

  const handleCategorySelect = (categoryId) => {
    const newCategory = selectedCategory === String(categoryId) ? '' : String(categoryId);
    setSelectedCategory(newCategory);
    updateParams(searchQuery, newCategory);
  };

  const updateParams = (query, category) => {
    const params = {};
    if (query) params.query = query;
    if (category) params.category = category;
    setSearchParams(params);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // Sort Products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Our Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">Browse our premium farm-fresh raw meats and seafood</p>
      </div>

      {/* Search and Filters Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md flex">
          <input
            type="text"
            placeholder="Search chicken, mutton, prawns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Sort selector */}
        <div className="flex gap-4 w-full lg:w-auto items-center justify-end">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer border-none p-0 w-full"
            >
              <option value="name-asc" className="bg-slate-950">Name (A-Z)</option>
              <option value="name-desc" className="bg-slate-950">Name (Z-A)</option>
              <option value="price-asc" className="bg-slate-950">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-950">Price: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Grid: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Categories Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Categories</h3>
            </div>

            <div className="flex flex-wrap lg:flex-col gap-2">
              <button
                onClick={() => { setSelectedCategory(''); updateParams(searchQuery, ''); }}
                className={`text-sm font-semibold px-4 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`text-sm font-semibold px-4 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    selectedCategory === String(cat.id)
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-850 h-80 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800/60 p-6">
              <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-white">No products found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">
                Try searching for something else or clearing the search keyword.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory(''); updateParams('', ''); }}
                className="mt-5 text-sm font-semibold text-rose-500 border border-rose-500/20 bg-rose-500/5 px-5 py-2.5 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
              {sortedProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="group bg-slate-900/70 border border-slate-800/60 rounded-2xl overflow-hidden hover:border-rose-500/20 transition-all flex flex-col h-full"
                >
                  {/* Image wrapper */}
                  <Link to={`/product/${prod.id}`} className="relative block aspect-square bg-slate-850 overflow-hidden">
                    <ProductImage 
                      product={prod} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    {prod.stock === 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-slate-950/80 text-rose-500 text-xs font-bold px-2.5 py-1 rounded-md">
                        Sold Out
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex flex-col flex-grow gap-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <Link to={`/product/${prod.id}`} className="hover:text-rose-400 transition-colors">
                        <h3 className="font-bold text-slate-100 text-base line-clamp-1">{prod.name}</h3>
                      </Link>
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded shrink-0">
                        {prod.category?.name || 'Item'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500">Price</span>
                        <p className="font-extrabold text-white text-lg">₹{prod.price} <span className="text-xs text-slate-400 font-normal">/ kg</span></p>
                      </div>
                      
                      {prod.stock > 0 ? (
                        <button 
                          onClick={() => handleAddToCart(prod)}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-2.5 rounded-xl transition-all shadow-md shadow-rose-950/15 cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-xs text-rose-500 font-bold px-2.5 py-1.5 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                          Out Of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Catalog;
