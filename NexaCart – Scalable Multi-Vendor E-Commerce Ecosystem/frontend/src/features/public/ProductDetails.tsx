import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { useCart } from '../../core/hooks/useCart';
import { useAuth } from '../../core/hooks/useAuth';
import { ShoppingCart, Heart, Shield, RefreshCcw, Truck, AlertTriangle, ArrowLeft } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

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
  categorySlug: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItemToCart, loading: cartLoading } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get(`/api/v1/products/${slug}`);
        if (response.data.success) {
          const prod: Product = response.data.data;
          setProduct(prod);
          if (prod.images && prod.images.length > 0) {
            const featured = prod.images.find((i) => i.isFeatured);
            setActiveImage(featured ? featured.imageUrl : prod.images[0].imageUrl);
          }
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="text-yellow-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Failed to load product</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'Product details not available.'}</p>
        <Link to="/products" className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? product.price + selectedVariant.priceModifier
    : product.price;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedVariant) return;

    setActionSuccess(null);
    setActionError(null);

    try {
      await addItemToCart(selectedVariant.id, quantity);
      setActionSuccess('Added to cart successfully!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Could not add to cart.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionSuccess(null);
    setActionError(null);

    try {
      const response = await axiosClient.post(`/api/v1/wishlist/products/${product.id}`);
      if (response.data.success) {
        setActionSuccess('Product added to wishlist!');
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to add to wishlist.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link to="/products" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>

        {/* Product Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              <img src={activeImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`h-20 w-28 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === img.imageUrl ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <span>{product.categoryName}</span>
              <span className="text-indigo-400 font-semibold">{product.storeName}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">{product.name}</h1>
            <p className="text-2xl font-extrabold text-white mb-6">${currentPrice.toFixed(2)}</p>

            <div className="border-t border-b border-slate-850 py-6 mb-6">
              <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2">Description</h3>
              <p className="text-slate-350 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Select Variant */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Select Variant (Size / Color)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-indigo-500 bg-indigo-950/20 text-white'
                          : 'border-slate-800 bg-[#0c1222]/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold text-slate-200">
                        {v.size || 'Standard'} {v.color ? `/ ${v.color}` : ''}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Stock: {v.stockQuantity} &bull; SKU: {v.sku}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {actionSuccess && (
              <div className="mb-4 p-3.5 rounded-lg bg-green-950/50 border border-green-800 text-green-400 text-sm text-center">
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="mb-4 p-3.5 rounded-lg bg-red-950/50 border border-red-800 text-red-450 text-sm text-center">
                {actionError}
              </div>
            )}

            {/* Quantity Selector & Actions */}
            {selectedVariant && selectedVariant.stockQuantity > 0 ? (
              <div className="flex gap-4 items-center">
                <div className="w-32">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Qty</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 py-3.5 px-3 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    {[...Array(Math.min(10, selectedVariant.stockQuantity))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex gap-3 pt-5">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="flex-1 py-3.5 rounded-xl gradient-btn font-semibold flex items-center justify-center space-x-2 text-sm shadow-lg shadow-indigo-650/10 cursor-pointer"
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className="p-3.5 rounded-xl bg-[#0e1423] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <Heart size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 flex items-center space-x-2.5">
                <AlertTriangle size={18} />
                <span className="text-sm font-semibold">Out of Stock</span>
              </div>
            )}

            {/* Delivery/Warranty info */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-850 pt-8 mt-8 text-slate-400 text-xs text-center">
              <div className="flex flex-col items-center">
                <Truck size={20} className="text-indigo-400 mb-2" />
                <span className="font-semibold text-slate-300">Fast Shipping</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Every vendor ships direct</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield size={20} className="text-indigo-400 mb-2" />
                <span className="font-semibold text-slate-300">Secure Checkout</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Fully encrypted payments</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCcw size={20} className="text-indigo-400 mb-2" />
                <span className="font-semibold text-slate-300">Approved Sellers</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Quality check moderation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
