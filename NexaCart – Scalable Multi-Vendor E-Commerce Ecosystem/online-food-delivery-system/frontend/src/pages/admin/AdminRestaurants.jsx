import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-hot-toast';
import { Trash2, Edit2, PlusCircle, X, Store, Star, MapPin } from 'lucide-react';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal/form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: 26.3484,
    longitude: 92.6838,
    logo: '',
    banner: '',
    rating: 4.5,
    cuisineType: '',
    isOpen: true,
  });

  const fetchRestaurants = async () => {
    try {
      const res = await restaurantAPI.adminGetAll();
      setRestaurants(res.data);
    } catch (err) {
      toast.error('Failed to load restaurants');
    }
  };

  useEffect(() => {
    const loadRestaurants = async () => {
      setLoading(true);
      await fetchRestaurants();
      setLoading(false);
    };
    loadRestaurants();
  }, []);

  const openAddModal = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      latitude: 26.3484,
      longitude: 92.6838,
      logo: '',
      banner: '',
      rating: 4.5,
      cuisineType: '',
      isOpen: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      latitude: restaurant.latitude || 26.3484,
      longitude: restaurant.longitude || 92.6838,
      logo: restaurant.logo || '',
      banner: restaurant.banner || '',
      rating: restaurant.rating || 4.5,
      cuisineType: restaurant.cuisineType || '',
      isOpen: restaurant.isOpen !== undefined ? restaurant.isOpen : true,
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant? This will remove all linked menu items and is irreversible.")) return;

    try {
      await restaurantAPI.adminDelete(id);
      toast.success("Restaurant deleted successfully");
      fetchRestaurants();
    } catch (err) {
      toast.error("Failed to delete restaurant");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error("Name and Address are required fields");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      cuisineType: formData.cuisineType.trim(),
      logo: formData.logo.trim(),
      banner: formData.banner.trim(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      rating: parseFloat(formData.rating),
    };

    try {
      if (editingRestaurant) {
        await restaurantAPI.adminUpdate(editingRestaurant.id, payload);
        toast.success("Restaurant updated successfully");
      } else {
        await restaurantAPI.adminCreate(payload);
        toast.success("Restaurant created successfully");
      }
      setModalOpen(false);
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save restaurant details");
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

      {/* Restaurant List Header */}
      <div className="flex justify-between items-center bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div className="text-left">
          <h3 className="font-extrabold text-white text-lg">Partner Restaurants</h3>
          <p className="text-slate-500 text-xs mt-0.5">Manage partner restaurants, delivery positions, and open/closed times</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Restaurant
        </button>
      </div>

      {/* Restaurant Grid/List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          {restaurants.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No restaurants registered. Click "Add Restaurant" to get started.
            </div>
          ) : (
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs">
                  <th className="py-3 px-4 text-left">Restaurant Details</th>
                  <th className="py-3 px-4 text-left">Cuisine Type</th>
                  <th className="py-3 px-4 text-left">Contact Info</th>
                  <th className="py-3 px-4 text-left">Coordinates</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {restaurants.map((rest) => (
                  <tr key={rest.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-850 border border-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {rest.logo ? (
                            <img src={rest.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-slate-200 block">{rest.name}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px]">{rest.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {rest.cuisineType || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-300">{rest.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{rest.latitude?.toFixed(4)}, {rest.longitude?.toFixed(4)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                        rest.isOpen 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                      }`}>
                        {rest.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(rest)}
                          className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl transition-all cursor-pointer"
                          title="Edit Restaurant"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRestaurant(rest.id)}
                          className="p-2 text-slate-500 hover:text-rose-500 bg-slate-950 hover:bg-rose-500/10 border border-slate-850 rounded-xl transition-all cursor-pointer"
                          title="Delete Restaurant"
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingRestaurant ? 'Modify Restaurant details' : 'Register New Restaurant'}
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
              
              {/* Row 1: Name and Cuisine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Biryani Express"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Cuisine Types *</label>
                  <input
                    type="text"
                    required
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleInputChange}
                    placeholder="e.g. Fast Food, Biryani"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Row 2: Address and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Physical Address *</label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Haiborgaon, Nagaon"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Contact Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Row 3: Logo and Banner URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Logo Image URL</label>
                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Banner Background URL</label>
                  <input
                    type="text"
                    name="banner"
                    value={formData.banner}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Row 4: Coordinates (Latitude/Longitude) and Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Rating (0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Row 5: Open Status Switch */}
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="checkbox"
                  id="isOpen"
                  name="isOpen"
                  checked={formData.isOpen}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-rose-500 bg-slate-950 border-slate-800 focus:ring-rose-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="isOpen" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Currently Open for Business
                </label>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-800 pt-5 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-855 px-5 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl text-xs font-bold border border-rose-500/20 shadow-md shadow-rose-950/15 cursor-pointer"
                >
                  Save Restaurant
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRestaurants;
