import React, { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Boxes, AlertTriangle, ArrowUpRight, Search, Check, Edit2 } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface ProductVariant {
  id: number;
  sku: string;
  size?: string;
  color?: string;
  priceModifier: number;
  stockQuantity: number;
  lowStockThreshold: number;
  productName: string;
  productSlug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  isActive: boolean;
  images: any[];
  variants: ProductVariant[];
}

const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/v1/products/vendor');
      if (response.data.success) {
        const prods: Product[] = response.data.data.content;
        setProducts(prods);

        // Flatten variants list with parent details
        const list: ProductVariant[] = [];
        prods.forEach((p) => {
          if (p.variants) {
            p.variants.forEach((v) => {
              list.push({
                ...v,
                productName: p.name,
                productSlug: p.slug,
              });
            });
          }
        });
        setVariantsList(list);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStartUpdate = (v: ProductVariant) => {
    setUpdatingId(v.id);
    setNewStockVal(v.stockQuantity.toString());
  };

  const handleSaveStock = async (variant: ProductVariant) => {
    const nextQty = parseInt(newStockVal, 10);
    if (isNaN(nextQty) || nextQty < 0) return;

    // Find the parent product in state
    const parentProd = products.find((p) => p.name === variant.productName);
    if (!parentProd) return;

    // Build the request variants list, replacing the target variant's stock
    const updatedVariants = parentProd.variants.map((v) => {
      if (v.id === variant.id) {
        return {
          sku: v.sku,
          size: v.size,
          color: v.color,
          priceModifier: v.priceModifier,
          stockQuantity: nextQty,
          lowStockThreshold: v.lowStockThreshold || 5,
        };
      }
      return {
        sku: v.sku,
        size: v.size,
        color: v.color,
        priceModifier: v.priceModifier,
        stockQuantity: v.stockQuantity,
        lowStockThreshold: v.lowStockThreshold || 5,
      };
    });

    const payload = {
      name: parentProd.name,
      categorySlug: parentProd.categorySlug,
      price: parentProd.price,
      description: parentProd.description,
      isActive: parentProd.isActive,
      images: parentProd.images.map((i: any) => ({ url: i.imageUrl || i.url, isPrimary: i.isFeatured || i.isPrimary })),
      variants: updatedVariants,
    };

    try {
      setLoading(true);
      const response = await axiosClient.put(`/api/v1/products/${parentProd.slug}`, payload);
      if (response.data.success) {
        await fetchInventory();
        setUpdatingId(null);
      }
    } catch (err) {
      alert('Failed to update variant stock.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVariants = variantsList.filter(
    (v) =>
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && products.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Inventory Control</h2>
        <p className="text-slate-500 text-xs mt-0.5">Track, edit, and audit variant stock quantities</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Total SKU Variants</p>
            <h3 className="text-xl font-extrabold text-white">{variantsList.length}</h3>
          </div>
          <div className="p-2.5 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded-lg">
            <Boxes size={18} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Low Stock Warning</p>
            <h3 className="text-xl font-extrabold text-amber-400">
              {variantsList.filter((v) => v.stockQuantity <= (v.lowStockThreshold || 5)).length}
            </h3>
          </div>
          <div className="p-2.5 bg-amber-950 text-amber-450 border border-amber-900 rounded-lg">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Total Stock Items</p>
            <h3 className="text-xl font-extrabold text-white">
              {variantsList.reduce((sum, v) => sum + v.stockQuantity, 0)}
            </h3>
          </div>
          <div className="p-2.5 bg-purple-950 text-purple-400 border border-purple-900 rounded-lg">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex max-w-md relative">
        <input
          type="text"
          placeholder="Filter SKU or product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0e1423] text-sm text-slate-350 pl-4 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
        />
        <Search size={16} className="absolute right-3.5 top-3.5 text-slate-500" />
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-400 text-left">
            <thead className="bg-[#0c1222] border-b border-slate-800 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU Code</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4">Stock level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((v) => {
                const isLow = v.stockQuantity <= (v.lowStockThreshold || 5);
                const isEditing = updatingId === v.id;

                return (
                  <tr key={v.id} className="border-b border-slate-850 hover:bg-slate-900/20 last:border-0">
                    <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{v.productName}</td>
                    <td className="px-6 py-4 font-mono text-xs">{v.sku}</td>
                    <td className="px-6 py-4 text-slate-300">{v.size || 'Standard'}</td>
                    <td className="px-6 py-4 text-slate-300">{v.color || '-'}</td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={newStockVal}
                          onChange={(e) => setNewStockVal(e.target.value)}
                          className="w-20 bg-[#090d16] border border-indigo-550 rounded px-2 py-1 text-white text-xs font-semibold"
                        />
                      ) : (
                        <span className={`font-semibold ${isLow ? 'text-amber-450' : 'text-slate-200'}`}>
                          {v.stockQuantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          v.stockQuantity === 0
                            ? 'bg-red-950 text-red-400 border border-red-900'
                            : isLow
                            ? 'bg-amber-950 text-amber-400 border border-amber-900'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        }`}
                      >
                        {v.stockQuantity === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Good'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveStock(v)}
                          className="text-xs text-indigo-400 hover:text-white font-bold inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Save</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartUpdate(v)}
                          className="text-xs text-slate-400 hover:text-indigo-400 inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
