import React, { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Edit, Trash2, Plus, X, Check } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface ProductVariant {
  id?: number;
  sku: string;
  size?: string;
  color?: string;
  priceModifier: number;
  stockQuantity: number;
  lowStockThreshold?: number;
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
  images: any[]; // incoming can have url/imageUrl
  variants: ProductVariant[];
  isApproved: boolean;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Variant helper states
  const [varSku, setVarSku] = useState('');
  const [varSize, setVarSize] = useState('');
  const [varColor, setVarColor] = useState('');
  const [varPriceMod, setVarPriceMod] = useState('0');
  const [varStock, setVarStock] = useState('10');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/v1/products/vendor');
      if (response.data.success) {
        setProducts(response.data.data.content);
      }
    } catch (err: any) {
      setError('Failed to fetch your store products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitData = async () => {
      await fetchProducts();
      try {
        const catRes = await axiosClient.get('/api/v1/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchInitData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setCategorySlug(categories[0]?.slug || '');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setVariants([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategorySlug(prod.categorySlug);
    setPrice(prod.price.toString());
    setDescription(prod.description);

    // Map images
    const primImg = prod.images.find((i) => i.isFeatured)?.imageUrl || prod.images[0]?.imageUrl || '';
    setImageUrl(primImg);

    setVariants(prod.variants);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!varSku) return;
    const newVar: ProductVariant = {
      sku: varSku,
      size: varSize || undefined,
      color: varColor || undefined,
      priceModifier: parseFloat(varPriceMod) || 0,
      stockQuantity: parseInt(varStock, 10) || 0,
    };
    setVariants([...variants, newVar]);
    setVarSku('');
    setVarSize('');
    setVarColor('');
    setVarPriceMod('0');
    setVarStock('10');
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await axiosClient.delete(`/api/v1/products/${slug}`);
      if (response.data.success) {
        setProducts(products.filter((p) => p.slug !== slug));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categorySlug) {
      alert('Please fill in required fields.');
      return;
    }

    const payload = {
      name,
      categorySlug,
      price: parseFloat(price),
      description,
      images: imageUrl ? [{ url: imageUrl, isPrimary: true }] : [],
      variants: variants.length > 0 ? variants : [{
        sku: `${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        priceModifier: 0,
        stockQuantity: 10,
        lowStockThreshold: 3
      }],
      isActive: editingProduct ? editingProduct.isActive : true
    };

    try {
      if (editingProduct) {
        const res = await axiosClient.put(`/api/v1/products/${editingProduct.slug}`, payload);
        if (res.data.success) {
          fetchProducts();
          setIsModalOpen(false);
        }
      } else {
        const res = await axiosClient.post('/api/v1/products', payload);
        if (res.data.success) {
          fetchProducts();
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving product.');
    }
  };

  if (loading && products.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Manage Products</h2>
          <p className="text-slate-500 text-xs mt-0.5">Edit existing listings or post a new catalog item</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-lg gradient-btn font-semibold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 bg-[#0c1222]/55 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          No products in your store yet. Click Add Product to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const mainImg = prod.images?.find((img) => img.isFeatured)?.imageUrl || prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
            return (
              <div
                key={prod.id}
                className="bg-[#0c1222]/65 border border-slate-850 rounded-2xl overflow-hidden hover:border-slate-750 transition-colors flex flex-col"
              >
                <div className="aspect-video w-full bg-slate-900 overflow-hidden relative">
                  <img src={mainImg} alt={prod.name} className="h-full w-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        prod.isApproved ? 'bg-green-950 text-green-400 border border-green-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                      }`}
                    >
                      {prod.isApproved ? 'Approved' : 'Pending Moderation'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        prod.isActive ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {prod.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    {prod.categoryName}
                  </p>
                  <h3 className="font-bold text-white text-base mb-1 line-clamp-1">{prod.name}</h3>
                  <p className="text-lg font-extrabold text-white mb-4">${prod.price.toFixed(2)}</p>

                  <div className="flex justify-end gap-2 border-t border-slate-850 pt-4 mt-auto">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-2 bg-[#0e1423] border border-slate-800 hover:border-slate-700 text-indigo-400 rounded-lg hover:text-white transition-all cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.slug)}
                      className="p-2 bg-[#0e1423] border border-slate-800 hover:border-slate-700 text-red-400 rounded-lg hover:text-white transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#090d16]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1222] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-6">
              {editingProduct ? 'Edit Catalog Product' : 'List New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
                    placeholder="e.g. Wireless Headset"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 py-3.5 px-3 rounded-lg border border-slate-800 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Base Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
                    placeholder="99.99"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Primary Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0e1423] text-sm text-slate-300 px-4 py-3 rounded-lg border border-slate-800 focus:outline-none"
                    placeholder="Full product catalog details..."
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="border-t border-slate-850 pt-6">
                <h4 className="font-bold text-sm text-white mb-4">Product Variants (At least one SKU required)</h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4 items-end bg-[#0e1423]/45 border border-slate-850 p-4 rounded-xl">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">SKU *</label>
                    <input
                      type="text"
                      value={varSku}
                      onChange={(e) => setVarSku(e.target.value)}
                      placeholder="SKU-1"
                      className="w-full bg-[#090d16] text-xs text-slate-300 px-2 py-2 rounded border border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Size</label>
                    <input
                      type="text"
                      value={varSize}
                      onChange={(e) => setVarSize(e.target.value)}
                      placeholder="M, L, XL"
                      className="w-full bg-[#090d16] text-xs text-slate-300 px-2 py-2 rounded border border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Color</label>
                    <input
                      type="text"
                      value={varColor}
                      onChange={(e) => setVarColor(e.target.value)}
                      placeholder="Black"
                      className="w-full bg-[#090d16] text-xs text-slate-300 px-2 py-2 rounded border border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Price Mod ($)</label>
                    <input
                      type="number"
                      value={varPriceMod}
                      onChange={(e) => setVarPriceMod(e.target.value)}
                      className="w-full bg-[#090d16] text-xs text-slate-300 px-2 py-2 rounded border border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Stock Qty</label>
                    <input
                      type="number"
                      value={varStock}
                      onChange={(e) => setVarStock(e.target.value)}
                      className="w-full bg-[#090d16] text-xs text-slate-300 px-2 py-2 rounded border border-slate-800"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Variant Row</span>
                    </button>
                  </div>
                </div>

                {/* Variants List Table */}
                {variants.length > 0 && (
                  <div className="overflow-x-auto border border-slate-850 rounded-xl">
                    <table className="w-full text-xs text-slate-400 text-left">
                      <thead className="bg-[#0e1423] text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Size</th>
                          <th className="px-4 py-3">Color</th>
                          <th className="px-4 py-3">Price Mod</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, i) => (
                          <tr key={i} className="border-b border-slate-850 last:border-0 hover:bg-slate-900/40">
                            <td className="px-4 py-3 font-semibold text-white">{v.sku}</td>
                            <td className="px-4 py-3">{v.size || '-'}</td>
                            <td className="px-4 py-3">{v.color || '-'}</td>
                            <td className="px-4 py-3">${v.priceModifier.toFixed(2)}</td>
                            <td className="px-4 py-3">{v.stockQuantity}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(i)}
                                className="text-red-400 hover:text-red-350 cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-[#0e1423] border border-slate-800 hover:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg gradient-btn font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
