import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import MerchantNav from '../../components/MerchantNav';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Image, ShieldCheck, X } from 'lucide-react';

const MerchantProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrls: []
  });

  const [imageInput, setImageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productAPI.adminGetAll(),
        categoryAPI.getAll()
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      toast.error('Failed to load catalog data');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchProductsAndCategories();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!formData.name.trim()) {
      toast.error("Please enter the product name first before uploading an image");
      return;
    }

    setUploadingImage(true);
    try {
      const res = await productAPI.adminUploadImage(file, formData.name);
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, res.data.url]
      }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image to Cloudinary");
    } finally {
      setUploadingImage(false);
    }
  };

  const addImageUrlDirectly = () => {
    if (!imageInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, imageInput.trim()]
    }));
    setImageInput('');
  };

  const removeImageUrl = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      imageUrls: []
    });
    setShowAddModal(true);
  };

  const openEditModal = (prod) => {
    setCurrentProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      categoryId: prod.category?.id || categories[0]?.id || '',
      imageUrls: prod.images ? prod.images.map(img => img.imageUrl) : []
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.categoryId) {
      toast.error("Please fill out all required fields");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
      categoryId: parseInt(formData.categoryId),
      imageUrls: formData.imageUrls
    };

    try {
      await productAPI.adminCreate(payload);
      toast.success("Product added successfully!");
      setShowAddModal(false);
      fetchProductsAndCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.categoryId) {
      toast.error("Please fill out all required fields");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
      categoryId: parseInt(formData.categoryId),
      imageUrls: formData.imageUrls
    };

    try {
      await productAPI.adminUpdate(currentProduct.id, payload);
      toast.success("Product updated successfully!");
      setShowEditModal(false);
      fetchProductsAndCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await productAPI.adminDelete(id);
      toast.success("Product deleted successfully!");
      fetchProductsAndCategories();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <MerchantNav />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mt-20"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left animate-fadeIn">
      
      <MerchantNav />

      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="font-extrabold text-white text-lg">Product Catalog & Inventory</h3>
          <p className="text-slate-500 text-xs mt-0.5">Add fresh food items, edit catalog details, and manage stock quantities.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-950/20 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            No products found in your store catalog. Click "Add New Item" to populate.
          </div>
        ) : (
          products.map((prod) => {
            const hasStock = prod.stock > 0;
            const primaryImg = prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : null;

            return (
              <div 
                key={prod.id} 
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col h-full hover:border-slate-700 transition-all"
              >
                {/* Product image block */}
                <div className="aspect-video w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
                  {primaryImg ? (
                    <img 
                      src={primaryImg} 
                      alt={prod.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl">🍲</div>
                  )}

                  {/* Stock status badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {hasStock ? (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-md">
                        In Stock: {prod.stock}
                      </span>
                    ) : (
                      <span className="bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[10px] font-bold px-2.5 py-1 rounded-md animate-pulse">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4.5 flex flex-col flex-grow gap-2 text-left">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-extrabold text-white text-base truncate">{prod.name}</h4>
                    <span className="bg-slate-950 border border-slate-800 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                      {prod.category?.name || 'Category'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{prod.description || 'No description provided'}</p>
                  
                  <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Unit Price</span>
                      <span className="font-black text-slate-200 text-sm">₹{prod.price}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-450 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-450 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0e0a1f] border border-indigo-950 rounded-3xl w-full max-w-[550px] max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-indigo-950/60 flex items-center justify-between text-left">
              <h3 className="font-extrabold text-slate-100 text-base">
                {showAddModal ? "Add New Food Item" : `Edit Catalog: ${currentProduct?.name}`}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-6 flex flex-col gap-4 text-left">
              
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Food Item Name *</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Garlic Butter Chicken"
                  className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A short appetizing description of the meat preparation..."
                  className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70"
                ></textarea>
              </div>

              {/* Grid: Price, Stock, Category */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="250.00"
                    className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70"
                  />
                </div>

                {/* Stock */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Stock Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="30"
                    className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70"
                  />
                </div>

                {/* Category selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Category *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Product Images Manager */}
              <div className="flex flex-col gap-2.5 border-t border-indigo-950/40 pt-4 mt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Product Images</label>
                
                {/* Upload block */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 font-semibold mb-0.5">Upload Photo to Cloud</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-[10px] text-slate-450 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#120d29] file:text-slate-300 file:cursor-pointer"
                    />
                    {uploadingImage && <span className="text-[8px] text-rose-500 mt-1 animate-pulse">Uploading photo...</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 font-semibold mb-0.5">Add Direct URL</span>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-indigo-950/60 rounded-lg py-1.5 px-2 text-[10px] text-slate-200 focus:outline-none placeholder-slate-700"
                      />
                      <button
                        type="button"
                        onClick={addImageUrlDirectly}
                        className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-900/50 text-[10px] font-bold px-2 rounded-lg cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Uploaded Image list review */}
                {formData.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 bg-slate-950/50 p-2.5 rounded-xl border border-indigo-950/30 max-h-[100px] overflow-y-auto">
                    {formData.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-indigo-950/60 shrink-0 group">
                        <img src={url} alt="product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(idx)}
                          className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit triggers */}
              <div className="mt-4 pt-4 border-t border-indigo-950/40 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="bg-slate-950 hover:bg-slate-900 border border-indigo-950/60 text-slate-400 hover:text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-rose-950/20 transition-all border border-rose-500/20 cursor-pointer"
                >
                  {showAddModal ? "Add Product" : "Save Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MerchantProducts;
