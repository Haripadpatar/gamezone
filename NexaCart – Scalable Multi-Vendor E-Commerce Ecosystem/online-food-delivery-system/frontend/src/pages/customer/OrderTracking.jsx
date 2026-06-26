import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, settingsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Clock, FileText, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';

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

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopPhone, setShopPhone] = useState('+919876543210');

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [shopCoordinates, setShopCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });

  const mapRef = useRef(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          orderAPI.track(orderNumber),
          settingsAPI.getPublic()
        ]);
        setOrder(orderRes.data);
        if (settingsRes.data?.shopPhone) {
          setShopPhone(settingsRes.data.shopPhone);
        }
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
        console.error('Error fetching order status:', err);
        toast.error('Unable to fetch order status. Check order number.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Connect to Server-Sent Events (SSE) for real-time tracking updates
    const sseUrl = getSseUrl(`/orders/track/${orderNumber}/stream`);
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log("SSE customer tracking stream connected.");
    };

    eventSource.addEventListener("ORDER_UPDATED", (e) => {
      try {
        const updatedOrder = JSON.parse(e.data);
        console.log("SSE customer order updated:", updatedOrder);
        setOrder(updatedOrder);
        toast.success(`Order status updated: ${updatedOrder.status}`, { icon: '📦' });
      } catch (err) {
        console.error("Error parsing customer SSE order update:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn("Customer SSE tracking stream disconnected. Browser will auto-reconnect.");
    };

    // Auto-refresh stats fallback every 35 seconds if SSE disconnects
    const interval = setInterval(fetchData, 35000);

    return () => {
      eventSource.close();
      clearInterval(interval);
      console.log("Customer SSE stream closed.");
    };
  }, [orderNumber]);

  useEffect(() => {
    if (mapsLoaded && mapRef.current && order && order.latitude && order.longitude) {
      const customerPos = { lat: order.latitude, lng: order.longitude };
      const mapOptions = {
        center: customerPos,
        zoom: 14,
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
        title: "Delivery Location",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        }
      });

      // Set bounds to cover both
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(shopCoordinates);
      bounds.extend(customerPos);
      map.fitBounds(bounds);
    }
  }, [mapsLoaded, order, shopCoordinates]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-extrabold text-white">Order Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">
          We couldn't find an order with the number <strong className="text-slate-400">"{orderNumber}"</strong>.
        </p>
        <Link to="/" className="mt-8 bg-rose-600 px-6 py-3 rounded-xl font-bold text-sm text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  // Define steps for the progress indicator
  const steps = [
    { key: 'PLACED', label: 'Placed', desc: 'Order received by shop' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Merchant accepted order' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Cutting & cleaning meat' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider is on the way' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Enjoy your fresh cuts!' },
  ];

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.key === status);
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  // Generate WhatsApp Order Summary Message
  const getWhatsAppLink = () => {
    const itemsText = order.items.map(item => {
      const unit = ['Chicken', 'Mutton', 'Fish'].includes(item.product?.category?.name || '') ? 'kg' : 'units';
      return `- ${item.product?.name || 'Product'} (${item.quantity} ${unit}): ₹${(item.unitPrice * item.quantity).toFixed(2)}`;
    }).join('\n');

    const msg = `*FreshCut Hub - Order Receipt*\n` +
      `----------------------------------------\n` +
      `*Order Number:* ${order.orderNumber}\n` +
      `*Status:* ${order.status}\n` +
      `*Customer Name:* ${order.customerName}\n` +
      `*Phone:* ${order.phone}\n` +
      `*Address:* ${order.address}\n\n` +
      `*Items Ordered:*\n${itemsText}\n\n` +
      `*Subtotal:* ₹${parseFloat(order.subtotal).toFixed(2)}\n` +
      `*Delivery Charge:* ₹${parseFloat(order.deliveryCharge).toFixed(2)}\n` +
      `*Grand Total:* ₹${parseFloat(order.totalAmount).toFixed(2)}\n` +
      `----------------------------------------\n` +
      `_Thank you for ordering with FreshCut Hub!_`;

    return `https://wa.me/${shopPhone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
        <div className="text-left">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order Status Tracking</span>
          <h1 className="text-2xl font-black text-white mt-1">Order ID: {order.orderNumber}</h1>
          <p className="text-xs text-slate-400 mt-1">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        {/* WhatsApp Link button */}
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl border border-emerald-500/20 flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-emerald-950/20"
        >
          <MessageSquare className="w-4 h-4 fill-white" /> Share Receipt on WhatsApp
        </a>
      </div>

      {/* Stepper progress bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="font-bold text-base text-slate-200 border-b border-slate-800 pb-3.5 mb-6">Delivery Progress</h3>
        
        {isCancelled ? (
          <div className="text-center py-6 border border-dashed border-rose-500/30 bg-rose-500/5 rounded-2xl">
            <h4 className="font-bold text-lg text-rose-500">Order Cancelled</h4>
            <p className="text-slate-500 text-xs mt-1">This order was cancelled by the administrator or customer.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 justify-between relative mt-4">
            
            {/* Visual connecting line for desktop */}
            <div className="hidden md:block absolute left-8 right-8 top-5 h-0.5 bg-slate-800 -z-10">
              <div 
                className="h-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2.5 text-left md:text-center md:flex-1">
                  
                  {/* Step bubble */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10 transition-all ${
                    isCompleted 
                      ? 'bg-rose-600 border-rose-500 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}>
                    {isCompleted && idx < currentStepIdx ? (
                      <CheckCircle2 className="w-5 h-5 fill-white text-rose-600" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step labels */}
                  <div className="flex flex-col gap-0.5">
                    <h4 className={`text-sm font-bold ${isCurrent ? 'text-rose-500' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 max-w-[150px]">{step.desc}</p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Order Items + Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Order Items */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h3 className="font-bold text-base text-slate-200 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-rose-500" /> Items Summary
          </h3>
          <div className="flex flex-col gap-4">
            {order.items.map((item) => {
              const unit = ['Chicken', 'Mutton', 'Fish'].includes(item.product?.category?.name || '') ? 'kg' : 'unit';
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="text-left">
                    <p className="font-bold text-slate-300">{item.product?.name || 'Deleted Product'}</p>
                    <span className="text-xs text-slate-500">{item.quantity} {unit} x ₹{item.unitPrice}</span>
                  </div>
                  <span className="font-bold text-slate-200">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}

            <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Delivery Fee ({order.distanceKm} km)</span>
                <span>₹{parseFloat(order.deliveryCharge).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Payment Method</span>
                <span className="font-semibold text-slate-200">
                  {order.paymentMethod === 'ONLINE' ? '💳 Online Payment' : '💵 Cash on Delivery'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Payment Status</span>
                <span>
                  {order.paymentStatus === 'PAID' ? (
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">PAID</span>
                  ) : (
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">PENDING (COD)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t border-slate-800/60 pt-2.5 mt-1">
                <span>{order.paymentStatus === 'PAID' ? 'Total Amount Paid' : 'Total Amount (Pay on Delivery)'}</span>
                <span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Delivery details */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="font-bold text-base text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <MapPin className="w-4.5 h-4.5 text-rose-500" /> Delivery Details
          </h3>

          <div className="flex flex-col gap-4 text-sm text-slate-300">
            <div className="flex gap-3 items-start">
              <MapPin className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="text-xs text-slate-500 font-semibold">Delivery Address</h4>
                <p className="mt-1 leading-relaxed">{order.address}</p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <Phone className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <div className="text-left">
                <h4 className="text-xs text-slate-500 font-semibold">Contact Phone</h4>
                <p className="mt-0.5">{order.phone}</p>
              </div>
            </div>

            {order.notes && (
              <div className="flex gap-3 items-start border-t border-slate-800/60 pt-4 mt-1">
                <Clock className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-xs text-slate-500 font-semibold">Notes from Customer</h4>
                  <p className="mt-1 text-slate-400 italic">"{order.notes}"</p>
                </div>
              </div>
            )}

            {/* Delivery Map */}
            {order.latitude && order.longitude && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800/60">
                <h4 className="text-xs text-slate-500 font-semibold mb-1">Delivery Location Map</h4>
                {googleMapsKey && mapsLoaded ? (
                  <div 
                    ref={mapRef} 
                    className="w-full h-44 rounded-xl border border-slate-800 overflow-hidden bg-slate-950"
                  />
                ) : (
                  /* Relative Simulated Map Fallback */
                  (() => {
                    const dx = order.longitude - shopCoordinates.lng;
                    const dy = order.latitude - shopCoordinates.lat;
                    const simX = 50 + (dx / 0.015) * 50;
                    const simY = 50 - (dy / 0.015) * 50;
                    const clampedX = Math.max(5, Math.min(95, simX));
                    const clampedY = Math.max(5, Math.min(95, simY));

                    return (
                      <div 
                        className="w-full h-44 rounded-xl border border-slate-800 bg-slate-950 relative overflow-hidden select-none flex items-center justify-center"
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
                          <span className="absolute bottom-4 bg-emerald-500 text-white font-extrabold text-[7px] px-1 rounded shadow whitespace-nowrap">You</span>
                        </div>
                      </div>
                    );
                  })()
                )}
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span>Coordinates: {order.latitude.toFixed(5)}, {order.longitude.toFixed(5)}</span>
                  <span>Distance: {order.distanceKm} km</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="text-center">
        <Link 
          to="/catalog" 
          className="text-xs font-semibold text-rose-500 hover:text-rose-400 border border-rose-500/10 hover:border-rose-500/30 bg-rose-500/5 px-6 py-3 rounded-xl transition-all inline-flex items-center gap-1.5"
        >
          Return to Catalog <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};

export default OrderTracking;
