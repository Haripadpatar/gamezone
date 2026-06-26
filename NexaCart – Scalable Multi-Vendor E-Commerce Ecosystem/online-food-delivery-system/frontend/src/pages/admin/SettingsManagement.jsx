import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-hot-toast';
import { Settings, Save, MapPin, Phone, Clock, DollarSign } from 'lucide-react';

const SettingsManagement = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    shopAddress: '',
    shopLatLng: '',
    shopPhone: '',
    deliveryHours: '',
    deliveryFee0To3: '',
    deliveryFee3To6: '',
    deliveryFee6To10: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await settingsAPI.adminGet();
        if (res.data) {
          setFormData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.adminUpdate(formData);
      toast.success('Shop settings updated successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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

      {/* Title */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <h3 className="font-extrabold text-white text-lg">Shop & Delivery Configurations</h3>
        <p className="text-slate-500 text-xs mt-0.5">Customize your merchant details, WhatsApp links, and road distance fees</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full">
        
        {/* Section 1: Store profile */}
        <div className="flex flex-col gap-5">
          <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-rose-500" /> Store Profile
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Shop Name</label>
              <input
                type="text"
                required
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">WhatsApp / Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="shopPhone"
                  value={formData.shopPhone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Shop Address</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Map Coordinates (Lat,Lng)</label>
              <input
                type="text"
                required
                name="shopLatLng"
                value={formData.shopLatLng}
                onChange={handleInputChange}
                placeholder="12.9716,77.5946"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Delivery Working Hours</label>
            <div className="relative">
              <input
                type="text"
                required
                name="deliveryHours"
                value={formData.deliveryHours}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <Clock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Section 2: Delivery charge tiers */}
        <div className="flex flex-col gap-5">
          <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-rose-500" /> Delivery Distance Fee Tiers
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Tier 1 */}
            <div className="flex flex-col gap-1.5 bg-slate-950 border border-slate-850 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tier 1 (0 to 3 km)</span>
              <label className="text-xs text-slate-300 mt-2 font-semibold">Delivery Charge (₹)</label>
              <input
                type="number"
                required
                name="deliveryFee0To3"
                value={formData.deliveryFee0To3}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 mt-1 focus:outline-none"
              />
            </div>

            {/* Tier 2 */}
            <div className="flex flex-col gap-1.5 bg-slate-950 border border-slate-850 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tier 2 (3 to 6 km)</span>
              <label className="text-xs text-slate-300 mt-2 font-semibold">Delivery Charge (₹)</label>
              <input
                type="number"
                required
                name="deliveryFee3To6"
                value={formData.deliveryFee3To6}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 mt-1 focus:outline-none"
              />
            </div>

            {/* Tier 3 */}
            <div className="flex flex-col gap-1.5 bg-slate-950 border border-slate-850 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tier 3 (6 to 10 km)</span>
              <label className="text-xs text-slate-300 mt-2 font-semibold">Delivery Charge (₹)</label>
              <input
                type="number"
                required
                name="deliveryFee6To10"
                value={formData.deliveryFee6To10}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 mt-1 focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-slate-800 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl border border-rose-500/20 shadow-md shadow-rose-950/15 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Saving Configurations...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Configurations
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default SettingsManagement;
