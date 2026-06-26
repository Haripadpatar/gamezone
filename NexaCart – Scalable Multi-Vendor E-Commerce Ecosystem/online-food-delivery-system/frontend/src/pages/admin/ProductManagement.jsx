import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, restaurantAPI } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import ProductImage from '../../components/ProductImage';
import { toast } from 'react-hot-toast';
import { Trash2, Edit2, PlusCircle, X, Image as ImageIcon, Upload } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    restaurantId: '',
    imageUrls: [],
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user?.role === 'ADMIN');
        }

        const catRes = await categoryAPI.getAll();
        setCategories(catRes.data);

        try {
          const restRes = await restaurantAPI.getAll();
          setRestaurants(restRes.data);
        } catch (err) {
          console.error("Failed to load restaurants list", err);
        }

        await fetchProducts();
      } catch (err) {
        toast.error('Failed to load catalog data');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      restaurantId: restaurants.length > 0 ? String(restaurants[0].id) : '',
      imageUrls: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.category ? String(product.category.id) : '',
      restaurantId: product.restaurant ? String(product.restaurant.id) : (restaurants.length > 0 ? String(restaurants[0].id) : ''),
      imageUrls: product.images ? product.images.map(img => img.imageUrl) : [],
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!formData.name.trim()) {
      toast.error("Please enter the product name first before uploading images");
      return;
    }

    setUploadingImage(true);
    toast.loading("Uploading image to Cloudinary...", { id: 'uploading' });

    try {
      const uploadedUrls = [...formData.imageUrls];
      for (let i = 0; i < files.length; i++) {
        const res = await productAPI.adminUploadImage(files[i], formData.name);
        uploadedUrls.push(res.data.url);
      }
      setFormData((prev) => ({ ...prev, imageUrls: uploadedUrls }));
      toast.success("Images uploaded successfully!", { id: 'uploading' });
    } catch (err) {
      toast.error("Failed to upload image. Make sure credentials are valid.", { id: 'uploading' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action is irreversible.")) return;

    try {
      await productAPI.adminDelete(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
      categoryId: parseInt(formData.categoryId),
      restaurantId: isAdmin && formData.restaurantId ? parseInt(formData.restaurantId) : null,
      imageUrls: formData.imageUrls,
    };

    try {
      if (editingProduct) {
        await productAPI.adminUpdate(editingProduct.id, payload);
        toast.success("Product updated successfully");
      } else {
        await productAPI.adminCreate(payload);
        toast.success("Product created successfully");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product details");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <AdminNav />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mt-20"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* Admin Nav */}
      <AdminNav />

      {/* Product List Header */}
      <div className="flex justify-between items-center bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div className="text-left">
          <h3 className="font-extrabold text-white text-lg">Product Inventory</h3>
          <p className="text-slate-500 text-xs mt-0.5">Manage items, pricing, stock levels, and upload images</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              Your inventory is empty. Click "Add Product" to create one.
            </div>
          ) : (
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4 text-left">Item Details</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  {isAdmin && <th className="py-3 px-4 text-left">Restaurant</th>}
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Stock Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => {
                  const hasImage = prod.images && prod.images.length > 0;
                  const firstImage = hasImage ? prod.images[0].imageUrl : 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100';
                  const unit = ['Chicken', 'Mutton', 'Fish'].includes(prod.category?.name || '') ? 'kg' : 'unit';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-850/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-850 border border-slate-800 rounded-lg overflow-hidden shrink-0">
                            <ProductImage product={prod} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-slate-200 block">{prod.name}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px]">{prod.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {prod.category?.name || 'Unassigned'}
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-slate-400 font-medium">
                          {prod.restaurant?.name || 'None'}
                        </td>
                      )}
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        ₹{prod.price} <span className="text-[10px] text-slate-500 font-normal">/ {unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-bold ${prod.stock <= 2 ? 'text-amber-500' : 'text-slate-300'}`}>
                          {prod.stock} {unit}s
                        </span>
                        {prod.stock === 0 && (
                          <span className="text-[9px] font-black text-rose-500 block">Out of Stock</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 text-slate-500 hover:text-rose-500 bg-slate-950 hover:bg-rose-500/10 border border-slate-850 rounded-xl transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingProduct ? 'Modify Product Details' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-white bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
              
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Product Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Fresh Chicken Breast"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Product Category *</label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-950">{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Restaurant Selection for Admins */}
              {isAdmin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Restaurant *</label>
                  <select
                    name="restaurantId"
                    required
                    value={formData.restaurantId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {restaurants.map((rest) => (
                      <option key={rest.id} value={rest.id} className="bg-slate-950">{rest.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 2: Price and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Price (in ₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 299.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Inventory Stock Level *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="e.g. 15.0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Product Description</label>
                <textarea
                  rows="2"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide cut specifications, hygiene details etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              {/* Row 4: Multi-Image Cloudinary Uploader */}
              <div className="flex flex-col gap-3.5 border-t border-slate-800 pt-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-500" /> Product Images
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Select image files to upload to Cloudinary directly.</p>
                </div>

                {/* Upload Trigger Input */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-rose-500" />
                    <span>Choose files...</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Previews & deletions */}
                {formData.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative w-20 h-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-850 group/img">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-1 -right-1 p-1 bg-slate-950/80 rounded-full border border-slate-800 text-rose-500 hover:text-rose-400 opacity-90 transition-all cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-800 pt-5 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-850 px-5 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl text-xs font-bold border border-rose-500/20 shadow-md shadow-rose-950/15 cursor-pointer"
                >
                  Save Product
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
