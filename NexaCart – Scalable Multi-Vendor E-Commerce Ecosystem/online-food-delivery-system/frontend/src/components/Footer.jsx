import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

const Footer = () => {
  const [settings, setSettings] = useState({
    shopName: 'FreshCut Non-Veg Hub',
    shopAddress: '123 Market Road, Bangalore, Karnataka, India',
    shopPhone: '+919876543210',
    deliveryHours: '08:00 AM - 09:00 PM',
  });

  useEffect(() => {
    settingsAPI.getPublic()
      .then((res) => {
        if (res.data) setSettings(res.data);
      })
      .catch((err) => console.log('Error loading settings for footer', err));
  }, []);

  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-slate-900">
        
        {/* Col 1: Brand Info */}
        <div className="flex flex-col gap-4">
          <span className="text-xl font-bold tracking-tight text-white">
            FreshCut <span className="text-rose-500">Hub</span>
          </span>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Order premium quality raw chicken, mutton, fresh water fish, seafood, and farm eggs. Trimmed, cleaned, packaged, and delivered straight to your kitchen.
          </p>
          <div className="flex items-center gap-2 mt-2 text-rose-500/80 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            100% Halal & Hygienically Processed
          </div>
        </div>

        {/* Col 2: Contact Details */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Contact Us</h4>
          <ul className="flex flex-col gap-3.5 text-slate-400 text-sm">
            <li className="flex gap-2.5 items-start">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{settings.shopAddress}</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Phone className="w-4 h-4 text-rose-500 shrink-0" />
              <a href={`tel:${settings.shopPhone}`} className="hover:text-white transition-colors">{settings.shopPhone}</a>
            </li>
            <li className="flex gap-2.5 items-center">
              <Clock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{settings.deliveryHours}</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Delivery Zones & Charges */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Delivery Rules</h4>
          <ul className="flex flex-col gap-2.5 text-slate-400 text-sm">
            <li className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>0 - 3 km (Local delivery)</span>
              <span className="text-rose-400 font-semibold">₹50</span>
            </li>
            <li className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>3 - 6 km</span>
              <span className="text-rose-400 font-semibold">₹80</span>
            </li>
            <li className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>6 - 10 km</span>
              <span className="text-rose-400 font-semibold">₹120</span>
            </li>
            <li className="flex justify-between text-rose-500 font-semibold text-xs mt-1">
              <span>Above 10 km</span>
              <span>Not Deliverable</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs text-slate-500 font-medium">
        <p>© {new Date().getFullYear()} {settings.shopName}. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <a href="/merchant/login" className="hover:text-rose-500 transition-colors">Merchant Portal</a>
          <span>•</span>
          <p>Hygienic Meat Delivery at Your Doorstep.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
