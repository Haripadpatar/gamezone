import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-hot-toast';
import { Trash2, Edit2, PlusCircle, X } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal/form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? Products belonging to this category will have their category cleared.")) return;

    try {
      await categoryAPI.adminDelete(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category. Check backend logs.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await categoryAPI.adminUpdate(editingCategory.id, categoryName.trim());
        toast.success("Category updated successfully");
      } else {
        await categoryAPI.adminCreate(categoryName.trim());
        toast.success("Category created successfully");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category details");
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

      {/* Category List Header */}
      <div className="flex justify-between items-center bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div className="text-left">
          <h3 className="font-extrabold text-white text-lg">Product Categories</h3>
          <p className="text-slate-500 text-xs mt-0.5">Manage category tags used in filtering shop products</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Category Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden max-w-2xl mx-auto w-full">
        <div className="overflow-x-auto">
          {categories.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No categories configured. Click "Add Category" to create one.
            </div>
          ) : (
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-6 text-left">Category ID</th>
                  <th className="py-3 px-6 text-left">Category Name</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-400">{cat.id}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-200">{cat.name}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl transition-all cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-slate-500 hover:text-rose-500 bg-slate-950 hover:bg-rose-500/10 border border-slate-850 rounded-xl transition-all cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingCategory ? 'Modify Category' : 'Create Category'}
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Chicken"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
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
                  Save Category
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryManagement;
