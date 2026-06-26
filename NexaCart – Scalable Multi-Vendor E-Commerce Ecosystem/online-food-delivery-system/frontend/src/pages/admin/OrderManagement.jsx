import React, { useState, useEffect, useRef } from 'react';
import { orderAPI, settingsAPI } from '../../services/api';
import AdminNav from '../../components/AdminNav';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp, MapPin, Phone, Clock, FileText, CheckCircle2 } from 'lucide-react';

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3c300" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

const AdminOrderMap = ({ order, googleMapsKey, mapsLoaded, shopCoordinates }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapsLoaded && mapRef.current && order && order.latitude && order.longitude) {
      const customerPos = { lat: order.latitude, lng: order.longitude };
      
      const mapOptions = {
        center: customerPos,
        zoom: 13,
        styles: darkMapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);

      // Shop Marker
      new window.google.maps.Marker({
        position: shopCoordinates,
        map: map,
        title: "FreshCut Shop",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        }
      });

      // Customer Marker
      new window.google.maps.Marker({
        position: customerPos,
        map: map,
        title: `${order.customerName}'s Delivery Location`,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        }
      });

      // Fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(shopCoordinates);
      bounds.extend(customerPos);
      map.fitBounds(bounds);
    }
  }, [mapsLoaded, order, shopCoordinates]);

  if (!order.latitude || !order.longitude) return null;

  // Calculate simulated position
  const dx = order.longitude - shopCoordinates.lng;
  const dy = order.latitude - shopCoordinates.lat;
  const simX = 50 + (dx / 0.015) * 50;
  const simY = 50 - (dy / 0.015) * 50;
  const clampedX = Math.max(5, Math.min(95, simX));
  const clampedY = Math.max(5, Math.min(95, simY));

  const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${shopCoordinates.lat},${shopCoordinates.lng}&destination=${order.latitude},${order.longitude}`;

  return (
    <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-slate-800">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Delivery Map Location</span>
        <a 
          href={googleMapsDirUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1 transition-colors"
        >
          Open in Google Maps →
        </a>
      </div>
      
      {googleMapsKey && mapsLoaded ? (
        <div 
          ref={mapRef} 
          className="w-full h-40 rounded-xl border border-slate-800 overflow-hidden bg-slate-950"
        />
      ) : (
        /* Relative Simulated Map Fallback */
        <div 
          className="w-full h-40 rounded-xl border border-slate-800 bg-slate-950 relative overflow-hidden select-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #1e1b4b 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
            backgroundSize: '16px 16px, 8px 8px, 8px 8px',
            backgroundColor: '#020617'
          }}
        >
          {/* Shop Pin */}
          <div 
            className="absolute w-4 h-4 -ml-2 -mt-2 flex items-center justify-center z-10"
            style={{ left: '50%', top: '50%' }}
          >
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="absolute bottom-4 bg-red-500 text-white font-extrabold text-[7px] px-1 rounded shadow whitespace-nowrap">Shop</span>
          </div>

          {/* Customer Location Pin */}
          <div 
            className="absolute w-4 h-4 -ml-2 -mt-2 flex items-center justify-center z-20"
            style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="absolute bottom-4 bg-emerald-500 text-white font-extrabold text-[7px] px-1 rounded shadow whitespace-nowrap">{order.customerName.split(' ')[0]}</span>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center text-[9px] text-slate-500">
        <span>Coordinates: {order.latitude.toFixed(5)}, {order.longitude.toFixed(5)}</span>
        <span>Distance: {order.distanceKm} km</span>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [shopCoordinates, setShopCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });

  const loadGoogleMapsScript = (apiKey) => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => setMapsLoaded(false);
    document.head.appendChild(script);
  };

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.adminGetAll();
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        settingsAPI.getPublic()
          .then(res => {
            if (res.data?.googleMapsApiKey) {
              setGoogleMapsKey(res.data.googleMapsApiKey);
              loadGoogleMapsScript(res.data.googleMapsApiKey);
            }
            if (res.data?.shopLatLng) {
              const parts = res.data.shopLatLng.split(',');
              setShopCoordinates({
                lat: parseFloat(parts[0]) || 12.9716,
                lng: parseFloat(parts[1]) || 77.5946
              });
            }
          })
          .catch(err => console.error("Error loading settings in admin:", err))
      ]);
      setLoading(false);
    };
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.adminUpdateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <AdminNav />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto mt-20"></div>
      </div>
    );
  }

  const statusOptions = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* Admin Nav */}
      <AdminNav />

      {/* Header */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <h3 className="font-extrabold text-white text-lg">Order Management</h3>
        <p className="text-slate-500 text-xs mt-0.5">Track customer orders, review delivery distance fees, and update status tiers</p>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No orders have been placed yet.
          </div>
        ) : (
          <div className="flex flex-col">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div key={order.id} className="border-b border-slate-800/80 last:border-none flex flex-col">
                  
                  {/* Order Overview Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/10 transition-colors">
                    
                    {/* Col 1: ID, Name, Phone */}
                    <div className="text-left flex flex-col gap-1">
                      <span className="font-black text-rose-500 text-base">{order.orderNumber}</span>
                      <span className="font-bold text-slate-200 text-sm">{order.customerName}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.phone}
                      </span>
                    </div>

                    {/* Col 2: Date, Amount */}
                    <div className="text-left flex flex-col gap-1">
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                      <span className="font-extrabold text-slate-200 text-sm">
                        ₹{order.totalAmount}
                        <span className="text-[10px] text-slate-500 font-normal ml-1">(inc. ₹{order.deliveryCharge} delivery)</span>
                      </span>
                      <div className="flex gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-450 uppercase">
                          {order.paymentMethod === 'ONLINE' ? '💳 ONLINE' : '💵 COD'}
                        </span>
                        {order.paymentStatus === 'PAID' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">PAID</span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">PENDING</span>
                        )}
                      </div>
                    </div>

                    {/* Col 3: Status Selector */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-xs text-slate-400 font-semibold shrink-0">Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt} className="bg-slate-950 font-bold">{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Col 4: Expand Toggle */}
                    <button
                      onClick={() => toggleExpandOrder(order.id)}
                      className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Collapse <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>View Details <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>

                  </div>

                  {/* Expanded Items & Address Row */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/40 bg-slate-950/20 grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-fadeIn">
                      
                      {/* Left: Ordered Items list */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Order Items
                        </h4>
                        <div className="flex flex-col gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
                          {order.items.map((item) => {
                            const unit = ['Chicken', 'Mutton', 'Fish'].includes(item.product?.category?.name || '') ? 'kg' : 'unit';
                            return (
                              <div key={item.id} className="flex justify-between items-center text-xs">
                                <span>{item.product?.name || 'Deleted Product'} ({item.quantity} {unit})</span>
                                <span className="font-bold">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                              </div>
                            );
                          })}
                          <div className="border-t border-slate-800/80 pt-2 flex justify-between text-xs font-bold text-slate-400">
                            <span>Subtotal:</span>
                            <span>₹{order.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-rose-500">
                            <span>Grand Total:</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Address & notes */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Delivery Info
                        </h4>
                        <div className="flex flex-col gap-3.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-900 text-xs">
                          <div className="flex gap-2 items-start">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-slate-500 block font-semibold">Address</span>
                              <p className="mt-0.5 text-slate-300 leading-relaxed">{order.address}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                            <div>
                              <span className="text-slate-500 block font-semibold">Distance Matrix</span>
                              <p className="mt-0.5 text-slate-300">{order.distanceKm} km</p>
                            </div>
                          </div>
                          {order.notes && (
                            <div className="flex gap-2 items-start border-t border-slate-800 pt-2">
                              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-slate-500 block font-semibold">Customer Notes</span>
                                <p className="mt-0.5 text-slate-400 italic">"{order.notes}"</p>
                              </div>
                            </div>
                          )}
                          <AdminOrderMap 
                            order={order} 
                            googleMapsKey={googleMapsKey} 
                            mapsLoaded={mapsLoaded} 
                            shopCoordinates={shopCoordinates} 
                          />
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default OrderManagement;
