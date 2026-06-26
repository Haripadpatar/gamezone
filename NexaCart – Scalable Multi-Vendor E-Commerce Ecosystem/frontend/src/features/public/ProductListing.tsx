import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { Search, SlidersHorizontal, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImage {
  id: number;
  imageUrl: string;
  isFeatured: boolean;
}

interface ProductVariant {
  id: number;
  sku: string;
  size?: string;
  color?: string;
  priceModifier: number;
  stockQuantity: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  storeName: string;
  categoryName: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters from searchParams
  const keyword = searchParams.get('keyword') || '';
  const categorySlug = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';

  // Local state for sidebar filters (for instant changes)
  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSize, setLocalSize] = useState(size);
  const [localColor, setLocalColor] = useState(color);

  // Sync state if URL search query changes
  useEffect(() => {
    setLocalKeyword(keyword);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalSize(size);
    setLocalColor(color);
  }, [keyword, minPrice, maxPrice, size, color]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosClient.get('/api/v1/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.set('keyword', keyword);
        if (categorySlug) queryParams.set('category', categorySlug);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (size) queryParams.set('size', size);
        if (color) queryParams.set('color', color);
        queryParams.set('page', page.toString());
        queryParams.set('sizeCount', '9'); // 9 items per page

        const response = await axiosClient.get(`/api/v1/products?${queryParams.toString()}`);
        if (response.data.success) {
          setProducts(response.data.data.content);
          setTotalPages(response.data.data.totalPages);
          setTotalElements(response.data.data.totalElements);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categorySlug, minPrice, maxPrice, size, color, page]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localKeyword) newParams.set('keyword', localKeyword);
    else newParams.delete('keyword');

    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');

    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');

    if (localSize) newParams.set('size', localSize);
    else newParams.delete('size');

    if (localColor) newParams.set('color', localColor);
    else newParams.delete('color');

    newParams.set('page', '0'); // reset page
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setLocalKeyword('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalSize('');
    setLocalColor('');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="bg-[#090d16] text-white min-h-screen relative overflow-hidden py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-white">Filters</h3>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <form onSubmit={handleApplyFilters} className="space-y-6">
                {/* Keyword search */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Search Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Keyword..."
                      value={localKeyword}
                      onChange={(e) => setLocalKeyword(e.target.value)}
                      className="w-full bg-[#0e1423] text-sm text-slate-300 pl-3 pr-8 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Search size={14} className="absolute right-3 top-3 text-slate-500" />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('category');
                        newParams.set('page', '0');
                        setSearchParams(newParams);
                      }}
                      className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                        !categorySlug ? 'bg-indigo-950 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('category', cat.slug);
                          newParams.set('page', '0');
                          setSearchParams(newParams);
                        }}
                        className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors truncate ${
                          categorySlug === cat.slug
                            ? 'bg-indigo-950 text-indigo-400 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Price Range ($)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="w-1/2 bg-[#0e1423] text-sm text-slate-300 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="w-1/2 bg-[#0e1423] text-sm text-slate-300 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. M, L, XL"
                    value={localSize}
                    onChange={(e) => setLocalSize(e.target.value)}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Black, White"
                    value={localColor}
                    onChange={(e) => setLocalColor(e.target.value)}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg gradient-btn font-semibold text-sm cursor-pointer"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Product Grid & List */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-slate-400">
                Showing {products.length} of {totalElements} results
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl bg-[#0c1222]/60 border border-slate-800"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 glass-panel rounded-2xl border border-slate-800 text-slate-400">
                No products found matching your search.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const mainImg = product.images?.find((img) => img.isFeatured)?.imageUrl || product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col bg-[#0c1222]/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-300"
                      >
                        <Link to={`/products/${product.slug}`} className="relative block aspect-video w-full overflow-hidden bg-slate-900">
                          <img
                            src={mainImg}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            <span>{product.categoryName}</span>
                            <span className="text-indigo-400">{product.storeName}</span>
                          </div>

                          <Link to={`/products/${product.slug}`} className="hover:text-indigo-400 transition-colors">
                            <h3 className="text-base font-bold text-white line-clamp-1 mb-2">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">
                            {product.description}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-auto">
                            <span className="text-lg font-extrabold text-white">
                              ${product.price.toFixed(2)}
                            </span>
                            <Link
                              to={`/products/${product.slug}`}
                              className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-400 hover:bg-indigo-650 hover:text-white transition-all"
                            >
                              <ShoppingBag size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-10">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className="p-2 rounded-lg bg-[#0e1423] border border-slate-850 hover:bg-[#121a2e] disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                          page === i
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-[#0e1423] border border-slate-850 text-slate-400 hover:bg-[#121a2e] hover:text-white'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages - 1}
                      className="p-2 rounded-lg bg-[#0e1423] border border-slate-850 hover:bg-[#121a2e] disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
