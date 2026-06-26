import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { ArrowRight, ShoppingBag, Layers } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  subCategories?: Category[];
}

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

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          axiosClient.get('/api/v1/categories'),
          axiosClient.get('/api/v1/products?sizeCount=8'),
        ]);

        if (catsRes.data.success) {
          setCategories(catsRes.data.data.slice(0, 6)); // Display top 6
        }
        if (prodsRes.data.success) {
          setProducts(prodsRes.data.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch marketplace data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#090d16] text-white min-h-screen relative overflow-hidden pb-16">
      {/* Background Orbs */}
      <div className="absolute top-[-25%] left-[-25%] w-[80%] h-[80%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-25%] w-[80%] h-[80%] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:py-32 flex flex-col items-center text-center">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-900/50 mb-6 animate-pulse">
          E-Commerce Ecosystem
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-3xl leading-tight">
          NexaCart Enterprise <br />
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Multi-Vendor Marketplace
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          Shop high-quality, verified products directly from independent, moderated vendors. Secure, transparent, and ultra-fast.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="px-8 py-3.5 rounded-full gradient-btn font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-full bg-[#0e1423] border border-slate-800 hover:border-slate-700 font-semibold flex items-center justify-center transition-all"
          >
            Become a Seller
          </Link>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-slate-500 text-xs mt-1">Browse items by verified platform categories</p>
          </div>
          <Link to="/categories" className="text-indigo-450 hover:text-indigo-400 text-sm font-semibold flex items-center space-x-1 transition-colors">
            <span>All Categories</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-800/40 border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0c1222]/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-[#0f172a] transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Layers size={20} />
                </div>
                <span className="text-sm font-bold text-center text-slate-200 group-hover:text-white truncate max-w-full">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Catalog</h2>
            <p className="text-slate-500 text-xs mt-1">Explore some of our latest verified products</p>
          </div>
          <Link to="/products" className="text-indigo-450 hover:text-indigo-400 text-sm font-semibold flex items-center space-x-1 transition-colors">
            <span>See All Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-800/40 border border-slate-800"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-[#0c1222]/85 border border-slate-850 rounded-2xl text-slate-400">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-[#0c1222]/85 border border-slate-850 rounded-2xl text-slate-400">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        )}
      </section>
    </div>
  );
};

export default Home;
