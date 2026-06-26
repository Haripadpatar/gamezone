import React, { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Check, X } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface ProductImage {
  imageUrl: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  storeName: string;
  categoryName: string;
  isApproved: boolean;
  isActive: boolean;
  images: ProductImage[];
}

const ProductModeration: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      // Fetch products (unfiltered, and we display those with isApproved = false)
      const response = await axiosClient.get('/api/v1/products?sizeCount=100');
      if (response.data.success) {
        const list: Product[] = response.data.data.content;
        // Filter unapproved products
        setProducts(list.filter((p) => !p.isApproved));
      }
    } catch (err) {
      console.error('Failed to load products for moderation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleApprove = async (id: number, approve: boolean) => {
    try {
      setSubmittingId(id);
      const response = await axiosClient.post(`/api/v1/admin/products/${id}/approve?approved=${approve}`);
      if (response.data.success) {
        // Remove from list
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert('Failed to update product approval status.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading && products.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Catalog Moderation</h2>
        <p className="text-slate-500 text-xs mt-0.5">Review and approve vendor products before they are listed publicly</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-[#0c1222]/55 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          No products awaiting review. Everything is moderated!
        </div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-400 text-left">
              <thead className="bg-[#0c1222] border-b border-slate-800 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Vendor Store</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Base Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-850 hover:bg-slate-900/20 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">{p.description}</p>
                    </td>
                    <td className="px-6 py-4 text-indigo-400 font-semibold">{p.storeName}</td>
                    <td className="px-6 py-4 text-slate-350">{p.categoryName}</td>
                    <td className="px-6 py-4 font-bold text-white">${p.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950 text-amber-450 border border-amber-900">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleApprove(p.id, true)}
                          disabled={submittingId === p.id}
                          className="p-1.5 bg-green-950/80 border border-green-800 hover:bg-green-600 hover:text-white text-green-400 rounded-lg transition-all cursor-pointer"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleApprove(p.id, false)}
                          disabled={submittingId === p.id}
                          className="p-1.5 bg-red-950/80 border border-red-800 hover:bg-red-650 hover:text-white text-red-400 rounded-lg transition-all cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModeration;
