import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { Heart, Trash2, Eye } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface WishlistResponse {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productPrice: number;
  productImage?: string;
  addedAt: string;
}

const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get('/api/v1/wishlist');
      if (response.data.success) {
        setWishlist(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      const response = await axiosClient.delete(`/api/v1/wishlist/products/${productId}`);
      if (response.data.success) {
        // Remove from local state
        setWishlist(wishlist.filter((w) => w.productId !== productId));
      }
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          <Heart size={28} className="text-red-500 fill-red-500" />
          <span>My Wishlist</span>
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/45 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-[#0c1222]/55 border border-slate-800 rounded-2xl p-8 flex flex-col items-center">
            <Heart size={48} className="text-slate-650 mb-4" />
            <h2 className="text-xl font-bold mb-2">Wishlist is empty</h2>
            <p className="text-slate-550 text-sm mb-6">Explore the store catalog to add items here.</p>
            <Link to="/products" className="px-6 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 font-semibold text-sm transition-colors">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group bg-[#0c1222]/65 border border-slate-850 hover:border-slate-750 rounded-2xl p-5 flex flex-col transition-colors"
              >
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-4 relative">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-400 hover:text-white transition-all hover:bg-red-650 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col">
                  <Link to={`/products/${item.productSlug}`} className="hover:text-indigo-400 transition-colors font-bold text-base text-white mb-2 line-clamp-1">
                    {item.productName}
                  </Link>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-850 mt-auto">
                    <span className="font-extrabold text-white">${item.productPrice.toFixed(2)}</span>
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="flex items-center space-x-1.5 py-2 px-3 rounded-lg bg-indigo-650 hover:bg-indigo-500 font-semibold text-xs text-white"
                    >
                      <Eye size={12} />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
