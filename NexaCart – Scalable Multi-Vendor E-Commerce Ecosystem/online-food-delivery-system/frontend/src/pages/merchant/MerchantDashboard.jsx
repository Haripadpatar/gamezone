import React, { useState, useEffect, useRef } from 'react';
import { orderAPI, settingsAPI } from '../../services/api';
import MerchantNav from '../../components/MerchantNav';
import { toast } from 'react-hot-toast';
import { 
  MapPin, Phone, Clock, FileText, CheckCircle2, ChevronDown, ChevronUp,
  Volume2, VolumeX, MessageSquare, AlertCircle, ShoppingBag, Landmark,
  TrendingUp, Calendar, AlertTriangle, RefreshCw, Star, Trash2
} from 'lucide-react';

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

const getSseUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  if (!baseUrl) {
    return `${window.location.origin}/api${path}`;
  }
  return `${baseUrl}${path}`;
};

const MerchantOrderMap = ({ order, googleMapsKey, mapsLoaded, shopCoordinates }) => {
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

  return (
    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-800/80">
      {googleMapsKey && mapsLoaded ? (
        <div 
          ref={mapRef} 
          className="w-full h-32 rounded-xl border border-slate-800 overflow-hidden bg-slate-950"
        />
      ) : (
        /* Relative Simulated Map Fallback */
        <div 
          className="w-full h-32 rounded-xl border border-slate-800 bg-slate-950 relative overflow-hidden select-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #1e1b4b 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
            backgroundSize: '16px 16px, 8px 8px, 8px 8px',
            backgroundColor: '#020617'
          }}
        >
          <div 
            className="absolute w-4 h-4 -ml-2 -mt-2 flex items-center justify-center z-10"
            style={{ left: '50%', top: '50%' }}
          >
            <MapPin className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          </div>

          <div 
            className="absolute w-4 h-4 -ml-2 -mt-2 flex items-center justify-center z-20"
            style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
};

const MerchantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    todayOrders: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Real-time notification variables
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState(new Set());
  
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [shopCoordinates, setShopCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });

  const audioRef = useRef(null);

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

  const fetchDashboardData = async (isSilent = false) => {
    try {
      const [ordersRes, statsRes, settingsRes] = await Promise.all([
        orderAPI.adminGetAll(),
        orderAPI.adminGetDashboardStats(),
        settingsAPI.getPublic()
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data);

      // Set Maps configurations
      if (settingsRes.data?.googleMapsApiKey) {
        setGoogleMapsKey(settingsRes.data.googleMapsApiKey);
        loadGoogleMapsScript(settingsRes.data.googleMapsApiKey);
      }
      if (settingsRes.data?.shopLatLng) {
        const parts = settingsRes.data.shopLatLng.split(',');
        setShopCoordinates({
          lat: parseFloat(parts[0]) || 12.9716,
          lng: parseFloat(parts[1]) || 77.5946
        });
      }

    } catch (err) {
      console.error('Failed to load merchant dashboard data', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const refreshStatsOnly = async () => {
    try {
      const statsRes = await orderAPI.adminGetDashboardStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to refresh stats', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();

    // Establish Server-Sent Events (SSE) Stream
    const token = localStorage.getItem('token');
    if (!token) return;

    const sseUrl = getSseUrl(`/admin/orders/stream?token=${token}`);
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      setSseConnected(true);
      console.log("SSE Stream to merchant dashboard connected successfully.");
    };

    eventSource.addEventListener("CONNECTED", (e) => {
      console.log("SSE Connection details received:", e.data);
    });

    eventSource.addEventListener("NEW_ORDER", (e) => {
      try {
        const newOrder = JSON.parse(e.data);
        console.log("SSE New Order alert:", newOrder);

        setOrders(prev => {
          if (prev.some(o => o.id === newOrder.id)) return prev;
          
          // Toast notification
          toast(`🔔 New Order! ${newOrder.orderNumber} placed by ${newOrder.customerName}`, {
            icon: '🥩',
            duration: 4500
          });

          // Play Audio chime
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(err => console.log('Audio playback blocked:', err));
          }

          // Mark card as blinking
          setNewlyArrivedIds(prevIds => {
            const next = new Set(prevIds);
            next.add(newOrder.id);
            return next;
          });

          // Automatically clear blink highlight after 25 seconds
          setTimeout(() => {
            setNewlyArrivedIds(prevIds => {
              const next = new Set(prevIds);
              next.delete(newOrder.id);
              return next;
            });
          }, 25000);

          return [newOrder, ...prev];
        });

        refreshStatsOnly();
      } catch (err) {
        console.error("Error processing SSE new order:", err);
      }
    });

    eventSource.addEventListener("ORDER_UPDATED", (e) => {
      try {
        const updatedOrder = JSON.parse(e.data);
        console.log("SSE Order Updated alert:", updatedOrder);

        setOrders(prev => {
          return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        });

        toast(`ℹ️ Order ${updatedOrder.orderNumber} status changed: ${updatedOrder.status}`, {
          icon: '📦'
        });

        refreshStatsOnly();
      } catch (err) {
        console.error("Error processing SSE status update:", err);
      }
    });

    eventSource.onerror = (err) => {
      setSseConnected(false);
      console.warn("SSE stream disconnected or encountered an error. Browser will auto-reconnect.");
    };

    return () => {
      eventSource.close();
      console.log("SSE stream closed.");
    };
  }, [soundEnabled]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.adminUpdateStatus(orderId, newStatus);
      toast.success(`Order updated to: ${newStatus}`);
      fetchDashboardData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getWhatsAppLink = (order) => {
    const msg = `Hello ${order.customerName},\nThis is the restaurant staff. Your order *${order.orderNumber}* status has been updated to: *${order.status}*.\nWe will notify you immediately as it ships. Thank you!`;
    return `https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED': return 'bg-rose-500/10 border-rose-500/20 text-rose-450';
      case 'CONFIRMED': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'PREPARING': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'DELIVERED': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'CANCELLED': return 'bg-slate-800 border-slate-700 text-slate-500';
      default: return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  // Define Kanban board swimlanes
  const swimlanes = [
    { title: 'New Orders', status: ['PLACED'], color: 'border-t-rose-500/80', bg: 'bg-rose-950/5' },
    { title: 'Accepted', status: ['CONFIRMED'], color: 'border-t-blue-500/80', bg: 'bg-blue-950/5' },
    { title: 'Preparing', status: ['PREPARING'], color: 'border-t-amber-500/80', bg: 'bg-amber-950/5' },
    { title: 'Out For Delivery', status: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'], color: 'border-t-indigo-500/80', bg: 'bg-indigo-950/5' },
    { title: 'Delivered', status: ['DELIVERED'], color: 'border-t-emerald-500/80', bg: 'bg-emerald-950/5' }
  ];

  const getOrdersForSwimlane = (statuses) => {
    return orders.filter(o => statuses.includes(o.status));
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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 text-left animate-fadeIn">
      
      {/* Sound chime loader */}
      <audio 
        ref={audioRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav" 
        preload="auto"
      />

      <MerchantNav />

      {/* Header bar controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
        <div className="text-left flex flex-col gap-1">
          <h2 className="font-extrabold text-white text-xl flex items-center gap-3">
            Real-Time Order Ticker
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 border ${
              sseConnected 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              {sseConnected ? 'LIVE FEED ACTIVE' : 'STREAM OFFLINE (POLLING)'}
            </span>
          </h2>
          <p className="text-slate-500 text-xs">Instantly displays new customer bookings and maps routes using Server-Sent Events.</p>
        </div>

        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (audioRef.current) audioRef.current.play().catch(() => {});
          }}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
            soundEnabled 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-450' 
              : 'bg-slate-950 border-slate-850 text-slate-500'
          }`}
        >
          {soundEnabled ? (
            <><Volume2 className="w-4 h-4" /> Sound Alerts: ON</>
          ) : (
            <><VolumeX className="w-4 h-4" /> Sound Alerts: OFF</>
          )}
        </button>
      </div>

      {/* Analytics stats metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-4.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-rose-500" /> Today's Orders
          </span>
          <span className="text-2xl font-black text-white">{stats.todayOrders || 0}</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Pending Orders
          </span>
          <span className="text-2xl font-black text-white">{stats.pendingOrders || 0}</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Delivered Orders
          </span>
          <span className="text-2xl font-black text-white">{stats.deliveredOrders || 0}</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" /> Today's Revenue
          </span>
          <span className="text-2xl font-black text-white">₹{stats.revenueToday ? parseFloat(stats.revenueToday).toFixed(2) : '0.00'}</span>
        </div>
      </div>

      {/* Main Grid: Swimlanes and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        
        {/* Kanban Board columns */}
        <div className="lg:col-span-3 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {swimlanes.map((lane, laneIdx) => {
            const laneOrders = getOrdersForSwimlane(lane.status);
            return (
              <div 
                key={laneIdx} 
                className={`flex flex-col border border-slate-800/70 rounded-2xl p-3 min-h-[500px] ${lane.bg}`}
              >
                {/* Column Header */}
                <div className={`pb-2.5 mb-3 border-b border-slate-800/60 flex items-center justify-between border-t-4 ${lane.color} pt-1.5`}>
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-wide truncate pr-1">
                    {lane.title}
                  </span>
                  <span className="bg-slate-950 border border-slate-850 text-[10px] font-extrabold text-slate-400 px-2 py-0.5 rounded-full shrink-0">
                    {laneOrders.length}
                  </span>
                </div>

                {/* Feed of Cards */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[680px] pr-0.5 custom-scrollbar">
                  {laneOrders.length === 0 ? (
                    <div className="py-12 text-center text-[10px] text-slate-600 italic">No orders</div>
                  ) : (
                    laneOrders.map(order => {
                      const isExpanded = expandedOrderId === order.id;
                      const isNew = order.status === 'PLACED';
                      const isNewlyArrived = newlyArrivedIds.has(order.id);
                      
                      return (
                        <div 
                          key={order.id} 
                          className={`bg-slate-950/80 border rounded-xl p-3.5 transition-all flex flex-col gap-2.5 text-left relative ${
                            isNewlyArrived 
                              ? 'border-rose-500 shadow-md shadow-rose-950/20 ring-1 ring-rose-500/30' 
                              : isNew 
                                ? 'border-rose-950/70 hover:border-slate-700' 
                                : 'border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          {/* Order number & time */}
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-extrabold text-xs text-rose-500">{order.orderNumber}</span>
                            <span className="text-[9px] text-slate-500 font-semibold shrink-0">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Customer */}
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-200 text-xs truncate">{order.customerName}</span>
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                              📞 {order.phone}
                            </span>
                          </div>

                          {/* Items summary */}
                          <div className="bg-slate-900/30 border border-slate-900 p-2.5 rounded-lg flex flex-col gap-1.5 text-[11px]">
                            {order.items.map((item) => {
                              const unit = ['Chicken', 'Mutton', 'Fish'].includes(item.product?.category?.name || '') ? 'kg' : 'unit';
                              return (
                                <div key={item.id} className="flex justify-between text-slate-400 font-medium">
                                  <span className="truncate pr-1">{item.product?.name || 'Deleted Item'}</span>
                                  <span className="text-slate-300 font-bold shrink-0">x{item.quantity} {unit}</span>
                                </div>
                              );
                            })}
                            <div className="border-t border-slate-900 pt-1.5 mt-0.5 flex justify-between font-extrabold text-slate-200">
                              <span>Total Amount:</span>
                              <span className="text-rose-450">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          {/* Distance & Delivery Fee info */}
                          <div className="flex justify-between items-center text-[10px] text-slate-500 bg-slate-900/20 p-2 rounded-lg border border-slate-900/30">
                            <span>Dist: <strong>{order.distanceKm} km</strong></span>
                            <span>Fee: <strong>₹{order.deliveryCharge}</strong></span>
                          </div>

                          {/* Expand details button */}
                          <button
                            onClick={() => toggleExpandOrder(order.id)}
                            className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1 py-1.5 bg-slate-900/60 border border-slate-850 rounded-lg cursor-pointer"
                          >
                            {isExpanded ? 'Hide Map & Address' : 'View Address & Map'}
                          </button>

                          {/* Collapsible Address & Map */}
                          {isExpanded && (
                            <div className="flex flex-col gap-2 mt-1 border-t border-slate-900 pt-2 text-[10px]">
                              <p className="text-slate-450 leading-relaxed font-medium">
                                <strong className="text-slate-500 font-bold">Address:</strong> {order.address}
                              </p>
                              {order.notes && (
                                <p className="text-slate-400 italic">
                                  <strong className="text-amber-500/80 font-bold">Note:</strong> "{order.notes}"
                                </p>
                              )}
                              
                              {/* Mini map */}
                              <MerchantOrderMap 
                                order={order}
                                googleMapsKey={googleMapsKey}
                                mapsLoaded={mapsLoaded}
                                shopCoordinates={shopCoordinates}
                              />
                            </div>
                          )}

                          {/* Quick Contacts panel */}
                          <div className="grid grid-cols-3 gap-1">
                            <a 
                              href={`tel:${order.phone}`} 
                              className="bg-slate-900 hover:bg-slate-850 border border-slate-900 text-[9px] font-extrabold text-center py-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer text-slate-350"
                            >
                              Call
                            </a>
                            <a 
                              href={getWhatsAppLink(order)} 
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="bg-slate-900 hover:bg-slate-855 border border-slate-900 text-[9px] font-extrabold text-center py-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer text-slate-350"
                            >
                              WhatsApp
                            </a>
                            {order.latitude && order.longitude && (
                              <a 
                                href={`https://www.google.com/maps/dir/?api=1&origin=${shopCoordinates.lat},${shopCoordinates.lng}&destination=${order.latitude},${order.longitude}`} 
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="bg-slate-900 hover:bg-slate-855 border border-slate-900 text-[9px] font-extrabold text-center py-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer text-slate-350"
                              >
                                Route
                              </a>
                            )}
                          </div>

                          {/* Quick order status progression buttons */}
                          <div className="flex flex-col gap-1 border-t border-slate-900 pt-2 mt-1">
                            {order.status === 'PLACED' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] py-2 rounded-lg transition-colors cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                  className="bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/50 text-rose-500 font-extrabold text-[9px] px-2.5 py-2 rounded-lg transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'PREPARING')}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[9px] py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Start Preparing
                              </button>
                            )}
                            {order.status === 'PREPARING' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Ready / Ship Order
                              </button>
                            )}
                            {order.status === 'READY_FOR_PICKUP' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'OUT_FOR_DELIVERY')}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Ship Order
                              </button>
                            )}
                            {order.status === 'OUT_FOR_DELIVERY' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                Deliver Order
                              </button>
                            )}
                            {['DELIVERED', 'CANCELLED'].includes(order.status) && (
                              <span className="text-center text-[9px] font-bold text-slate-600 py-1 bg-slate-900/20 border border-slate-900/30 rounded-lg">
                                {order.status === 'DELIVERED' ? '🎉 Order Complete' : '❌ Cancelled'}
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Sidebar: Top Selling Products and controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Top Selling Products card widget */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 text-rose-500 fill-rose-500" /> Top Selling Items
              </h3>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            
            {(!stats.topProducts || stats.topProducts.length === 0) ? (
              <div className="py-6 text-center text-xs text-slate-500 italic">No sales recorded yet.</div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {stats.topProducts.map((prod, idx) => (
                  <div key={prod.id} className="flex items-center justify-between text-xs border-b border-slate-850/80 last:border-none pb-2 last:pb-0">
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <span className="text-[10px] font-black bg-slate-800 border border-slate-700 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-200 truncate">{prod.name}</span>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <span className="font-black text-rose-400">{prod.quantity} kg</span>
                      <span className="text-[9px] text-slate-500 font-medium">₹{prod.price}/kg</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue and Settings Quick Summary card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
            <h4 className="font-bold text-slate-400 uppercase tracking-wide border-b border-slate-850 pb-2">Revenue Statistics</h4>
            
            <div className="flex justify-between items-center border-b border-slate-850/50 pb-2">
              <span className="text-slate-500">Revenue (Today):</span>
              <strong className="text-white">₹{stats.revenueToday ? parseFloat(stats.revenueToday).toFixed(2) : '0.00'}</strong>
            </div>

            <div className="flex justify-between items-center border-b border-slate-850/50 pb-2">
              <span className="text-slate-500">Revenue (Month):</span>
              <strong className="text-white">₹{stats.revenueThisMonth ? parseFloat(stats.revenueThisMonth).toFixed(2) : '0.00'}</strong>
            </div>

            <div className="flex justify-between items-center pb-0">
              <span className="text-slate-500">Total Registered:</span>
              <strong className="text-white">{stats.totalOrders || 0} orders</strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MerchantDashboard;
