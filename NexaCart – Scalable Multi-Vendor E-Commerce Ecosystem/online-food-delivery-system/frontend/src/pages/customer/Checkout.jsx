import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI, settingsAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  MapPin, Phone, User, Notebook, Landmark, Truck, ShoppingBag, ArrowLeft,
  Lock, CreditCard, ShieldCheck, CheckCircle2, X, RefreshCw
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [calculating, setCalculating] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null); // distanceKm, deliveryCharge, deliverable
  const [placingOrder, setPlacingOrder] = useState(false);

  // Online Payment States
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'ONLINE'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [onlinePayMethod, setOnlinePayMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const subtotal = getSubtotal();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate('/catalog');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [shopCoordinates, setShopCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });
  const [pinCoords, setPinCoords] = useState(null); // { lat, lng }

  // Simulated map drag states
  const [simCoords, setSimCoords] = useState({ x: 60, y: 40 }); // in percentages
  const [isDraggingSimPin, setIsDraggingSimPin] = useState(false);
  const simMapRef = useRef(null);

  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const customerMarkerRef = useRef(null);

  const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
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

  useEffect(() => {
    // Fetch public settings to get Google API key and shop coordinates
    settingsAPI.getPublic()
      .then(res => {
        if (res.data.googleMapsApiKey) {
          setGoogleMapsKey(res.data.googleMapsApiKey);
          loadGoogleMapsScript(res.data.googleMapsApiKey);
        }
        if (res.data.shopLatLng) {
          const parts = res.data.shopLatLng.split(',');
          const coords = {
            lat: parseFloat(parts[0]) || 12.9716,
            lng: parseFloat(parts[1]) || 77.5946
          };
          setShopCoordinates(coords);
          
          // Set initial pin coords slightly offset
          const initialPin = { lat: coords.lat + 0.005, lng: coords.lng + 0.005 };
          setPinCoords(initialPin);
          handleMapPinMoved(initialPin.lat, initialPin.lng);
        } else {
          const defaultCoords = { lat: 12.9716, lng: 77.5946 };
          setPinCoords({ lat: defaultCoords.lat + 0.005, lng: defaultCoords.lng + 0.005 });
          handleMapPinMoved(defaultCoords.lat + 0.005, defaultCoords.lng + 0.005);
        }
      })
      .catch(err => console.error("Error loading settings:", err));
  }, []);

  const loadGoogleMapsScript = (apiKey) => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => {
      console.warn("Failed to load Google Maps script. Falling back to simulated map.");
      setMapsLoaded(false);
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (mapsLoaded && mapRef.current && !googleMapInstance.current) {
      const mapOptions = {
        center: shopCoordinates,
        zoom: 14,
        styles: darkMapStyles,
        disableDefaultUI: false,
        zoomControl: true,
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      googleMapInstance.current = map;

      // 1. Add Shop Marker
      new window.google.maps.Marker({
        position: shopCoordinates,
        map: map,
        title: "FreshCut Shop",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        }
      });

      // 2. Add Draggable Customer Marker
      const initialCustomerPos = {
        lat: shopCoordinates.lat + 0.005,
        lng: shopCoordinates.lng + 0.005
      };

      const customerMarker = new window.google.maps.Marker({
        position: initialCustomerPos,
        map: map,
        draggable: true,
        title: "Your Delivery Location",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        }
      });
      customerMarkerRef.current = customerMarker;

      // 3. Listen to drag events
      customerMarker.addListener('dragend', () => {
        const position = customerMarker.getPosition();
        const lat = position.lat();
        const lng = position.lng();
        setPinCoords({ lat, lng });
        handleMapPinMoved(lat, lng);
      });

      // 4. Listen to map clicks
      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        customerMarker.setPosition(e.latLng);
        setPinCoords({ lat, lng });
        handleMapPinMoved(lat, lng);
      });
    }
  }, [mapsLoaded, shopCoordinates]);

  const handleMapPinMoved = async (lat, lng) => {
    setCalculating(true);
    try {
      const res = await orderAPI.calculateDelivery(null, lat, lng);
      setDeliveryInfo(res.data);
      setFormData(prev => ({ ...prev, address: res.data.formattedAddress }));
      if (res.data.deliverable) {
        toast.success(`Location updated! Distance: ${res.data.distanceKm} km.`);
      } else {
        toast.error("Exceeds our 10 km delivery radius.");
      }
    } catch (err) {
      console.error(err);
      setDeliveryInfo(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleSimMapInteraction = (e) => {
    if (!simMapRef.current) return;
    const rect = simMapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setSimCoords({ x: clampedX, y: clampedY });

    const dx = (clampedX - 50) / 1000;
    const dy = (50 - clampedY) / 1000;

    const targetLat = shopCoordinates.lat + dy;
    const targetLng = shopCoordinates.lng + dx;

    setPinCoords({ lat: targetLat, lng: targetLng });
    handleMapPinMoved(targetLat, targetLng);
  };

  const handleSimMouseMove = (e) => {
    if (isDraggingSimPin) {
      handleSimMapInteraction(e);
    }
  };

  const handleSimMouseUp = () => {
    setIsDraggingSimPin(false);
  };

  // Card formatting utilities
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length <= 19) {
      setCardData(prev => ({ ...prev, number: formattedValue }));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardData(prev => ({ ...prev, expiry: value }));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardData(prev => ({ ...prev, cvv: value }));
    }
  };

  const executeOrderPlacement = async (method, payStatus) => {
    setPlacingOrder(true);
    try {
      const orderPayload = {
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        paymentMethod: method,
        paymentStatus: payStatus,
        latitude: pinCoords?.lat,
        longitude: pinCoords?.lng,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const res = await orderAPI.place(orderPayload);
      toast.success("Order placed successfully!");
      clearCart();
      navigate(`/order-tracking/${res.data.orderNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setPlacingOrder(false);
      setShowPaymentModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error("Please fill out all required fields");
      return;
    }

    if (!deliveryInfo) {
      toast.error("Please calculate delivery fee before placing the order");
      return;
    }

    if (!deliveryInfo.deliverable) {
      toast.error("We cannot deliver to this address. Please choose a closer location.");
      return;
    }

    if (paymentMethod === 'ONLINE') {
      setShowPaymentModal(true);
    } else {
      executeOrderPlacement('COD', 'PENDING');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (onlinePayMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.error("Please enter a valid UPI ID (e.g. user@upi)");
        return;
      }
    } else if (onlinePayMethod === 'card') {
      if (cardData.number.replace(/\s/g, '').length < 16) {
        toast.error("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardData.expiry.includes('/') || cardData.expiry.length < 5) {
        toast.error("Please enter expiry date in MM/YY format");
        return;
      }
      if (cardData.cvv.length < 3) {
        toast.error("Please enter a 3-digit CVV");
        return;
      }
    } else if (onlinePayMethod === 'netbanking') {
      if (!selectedBank) {
        toast.error("Please select a bank");
        return;
      }
    }

    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        executeOrderPlacement('ONLINE', 'PAID');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 text-left animate-fadeIn">
      
      {/* Back button */}
      <div>
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Checkout</h1>
        <p className="text-slate-400 text-sm mt-1">Complete your delivery and contact details to finalize the order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Checkout Form (Left 2/3) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-rose-500" /> Delivery Address & Contact
            </h3>

            {/* Customer Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="customerName" className="text-xs font-semibold text-slate-400">Customer Name *</label>
              <div className="relative">
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-400">Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
                <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>

            {/* Interactive Map Section */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400">
                Pin Your Delivery Location on Map *
              </label>
              
              {googleMapsKey && mapsLoaded ? (
                /* Google Map Container */
                <div 
                  ref={mapRef} 
                  className="w-full h-72 rounded-2xl border border-slate-800 overflow-hidden shadow-inner bg-slate-950"
                />
              ) : (
                /* Simulated Map Fallback */
                <div 
                  ref={simMapRef}
                  onMouseDown={(e) => {
                    setIsDraggingSimPin(true);
                    handleSimMapInteraction(e);
                  }}
                  onMouseMove={handleSimMouseMove}
                  onMouseUp={handleSimMouseUp}
                  onMouseLeave={handleSimMouseUp}
                  className="w-full h-72 rounded-2xl border border-slate-800 bg-slate-950 relative overflow-hidden cursor-crosshair select-none flex items-center justify-center"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #1e1b4b 1px, transparent 1px), linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
                    backgroundSize: '24px 24px, 12px 12px, 12px 12px',
                    backgroundColor: '#020617'
                  }}
                >
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Range Rings around the shop */}
                  <div className="absolute w-24 h-24 border border-rose-500/10 rounded-full flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-rose-500/30 select-none mt-14">3km</span>
                  </div>
                  <div className="absolute w-48 h-48 border border-rose-500/10 rounded-full flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-rose-500/30 select-none mt-36">6km</span>
                  </div>
                  <div className="absolute w-72 h-72 border border-rose-500/10 rounded-full flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-rose-500/30 select-none mt-60">10km (Max)</span>
                  </div>

                  {/* shop indicator label */}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 font-medium">
                    Shop Coordinates: <span className="text-slate-200">{shopCoordinates.lat.toFixed(4)}, {shopCoordinates.lng.toFixed(4)}</span>
                  </div>

                  {/* simulated status label */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-rose-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    Simulated Testing Mode
                  </div>

                  {/* instructions overlay */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 font-medium max-w-[200px] text-right">
                    Drag green pin to set delivery address.
                  </div>

                  {/* Fixed Shop Location (Center) */}
                  <div 
                    className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center z-10"
                    style={{ left: '50%', top: '50%' }}
                  >
                    <div className="absolute w-12 h-12 rounded-full bg-red-500/20 animate-pulse pointer-events-none" />
                    <MapPin className="w-6 h-6 text-red-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.5)]" />
                    <span className="absolute bottom-6 bg-red-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">Shop</span>
                  </div>

                  {/* Draggable Customer Pin */}
                  <div 
                    className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                    style={{ left: `${simCoords.x}%`, top: `${simCoords.y}%` }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsDraggingSimPin(true);
                    }}
                  >
                    <div className="absolute w-12 h-12 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                    <MapPin className="w-6 h-6 text-emerald-500 drop-shadow-[0_2px_4px_rgba(16,185,129,0.5)]" />
                    <span className="absolute bottom-6 bg-emerald-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">Deliver Here</span>
                  </div>
                </div>
              )}

              {/* Live coordinates display and distance stats */}
              {pinCoords && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 text-left">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Coordinates: <strong>{pinCoords.lat.toFixed(6)}, {pinCoords.lng.toFixed(6)}</strong></span>
                  </div>
                  {deliveryInfo && (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Distance: <strong className="text-slate-200">{deliveryInfo.distanceKm} km</strong></span>
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        deliveryInfo.deliverable 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {deliveryInfo.deliverable ? 'Deliverable' : 'Too Far / Out of Bounds'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-xs font-semibold text-slate-400">Delivery Address *</label>
              <div className="relative">
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address (landmark, building, floor etc.)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                ></textarea>
                <MapPin className="absolute left-3.5 top-4 w-4.5 h-4.5 text-slate-500" />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                Note: Address text is pre-populated by dragging the pin, but you can append details (e.g. flat number, floor).
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-3.5 border-t border-slate-800/80 pt-6 mt-2">
              <div>
                <h4 className="font-bold text-base text-slate-200 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-rose-500" /> Select Payment Method
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Choose how you would like to pay for your fresh cuts</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COD Card */}
                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                    paymentMethod === 'COD' 
                      ? 'bg-rose-500/5 border-rose-500 shadow-md shadow-rose-950/10' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    paymentMethod === 'COD' ? 'border-rose-500' : 'border-slate-700'
                  }`}>
                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>}
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-bold text-sm text-slate-200">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-slate-400">Pay with cash or scan QR code on delivery</span>
                  </div>
                </div>

                {/* Online Pay Card */}
                <div 
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                    paymentMethod === 'ONLINE' 
                      ? 'bg-rose-500/5 border-rose-500 shadow-md shadow-rose-950/10' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    paymentMethod === 'ONLINE' ? 'border-rose-500' : 'border-slate-700'
                  }`}>
                    {paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>}
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-bold text-sm text-slate-200">Online Payment</span>
                    <span className="text-[10px] text-slate-400">UPI, Credit/Debit Card, or Netbanking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className="text-xs font-semibold text-slate-400">Delivery Notes (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g., Leave at the door, call before delivery"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
                <Notebook className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
              </div>
            </div>

          </div>
        </form>

        {/* Invoice Summary (Right 1/3) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6">
            <h3 className="font-bold text-lg text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" /> Order Receipt
            </h3>

            {/* Cart Items list preview */}
            <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-sm">
                  <div className="text-left">
                    <p className="font-bold text-slate-300 line-clamp-1">{item.product.name}</p>
                    <span className="text-xs text-slate-500">
                      {item.quantity} {['Chicken', 'Mutton', 'Fish'].includes(item.product.category?.name || '') ? 'kg' : 'units'} x ₹{item.product.price}
                    </span>
                  </div>
                  <span className="font-bold text-slate-200 shrink-0">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations details */}
            <div className="flex flex-col gap-3.5 border-t border-slate-800/80 pt-5">
              
              <div className="flex justify-between text-sm text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>

              {deliveryInfo ? (
                <>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-slate-500" />
                      Delivery Charge ({deliveryInfo.distanceKm} km)
                    </span>
                    <span className="font-semibold text-slate-200">₹{parseFloat(deliveryInfo.deliveryCharge).toFixed(2)}</span>
                  </div>

                  {!deliveryInfo.deliverable && (
                    <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl mt-1">
                      Undeliverable: This location exceeds our 10 km limit.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-500 text-center py-2 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  Address verify needed for delivery fee
                </div>
              )}

            </div>

            {/* Grand Total & Place Order Button */}
            <div className="border-t border-slate-800 pt-5 flex flex-col gap-4">
              <div className="flex justify-between text-lg font-black text-white">
                <span>Grand Total</span>
                <span>
                  ₹{(subtotal + (deliveryInfo ? parseFloat(deliveryInfo.deliveryCharge) : 0)).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={placingOrder || !deliveryInfo || !deliveryInfo.deliverable}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transition-all border border-rose-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {placingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 6. Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0e0a1f] border border-indigo-950/80 rounded-3xl w-full max-w-[550px] overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-[#130d2a] px-6 py-4.5 border-b border-indigo-950/60 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">NexaPay Secured Payment</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant / Cost Info */}
            <div className="px-6 py-5 bg-[#0a0716]/60 border-b border-indigo-950/40 flex justify-between items-center text-left">
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-200">FreshCut Hub Delivery</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Order ID: ORD-{(subtotal + (deliveryInfo ? parseFloat(deliveryInfo.deliveryCharge) : 0)).toFixed(0)}-SYS</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Amount to Pay</span>
                <span className="text-xl font-black text-white">₹{(subtotal + (deliveryInfo ? parseFloat(deliveryInfo.deliveryCharge) : 0)).toFixed(2)}</span>
              </div>
            </div>

            {/* Inner Content */}
            <div className="flex flex-1 min-h-[300px] text-left">
              
              {/* Sidebar Tabs */}
              <div className="w-[35%] bg-[#080514]/90 border-r border-indigo-950/60 flex flex-col">
                <button
                  type="button"
                  onClick={() => setOnlinePayMethod('upi')}
                  className={`px-4 py-4 text-xs font-bold text-left transition-colors flex items-center gap-2 cursor-pointer ${
                    onlinePayMethod === 'upi' 
                      ? 'bg-rose-500/5 text-rose-400 border-l-2 border-rose-500' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📱 UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setOnlinePayMethod('card')}
                  className={`px-4 py-4 text-xs font-bold text-left transition-colors flex items-center gap-2 cursor-pointer ${
                    onlinePayMethod === 'card' 
                      ? 'bg-rose-500/5 text-rose-400 border-l-2 border-rose-500' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💳 Card Payment
                </button>
                <button
                  type="button"
                  onClick={() => setOnlinePayMethod('netbanking')}
                  className={`px-4 py-4 text-xs font-bold text-left transition-colors flex items-center gap-2 cursor-pointer ${
                    onlinePayMethod === 'netbanking' 
                      ? 'bg-rose-500/5 text-rose-400 border-l-2 border-rose-500' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🏦 Net Banking
                </button>
              </div>

              {/* Tab Form Panel */}
              <div className="w-[65%] p-6 flex flex-col justify-between bg-[#0a0717]/40 relative">
                
                {/* Form fields */}
                <div className="flex flex-col gap-4 text-left">
                  {onlinePayMethod === 'upi' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enter UPI ID</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. username@okaxis"
                          className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70 placeholder-slate-650"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {['@okaxis', '@okicici', '@paytm', '@ybl'].map(suffix => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              const base = upiId.split('@')[0];
                              setUpiId((base || 'user') + suffix);
                            }}
                            className="bg-[#120d29] hover:bg-[#1a143b] border border-indigo-950/40 text-[9px] text-slate-400 hover:text-white px-2 py-1 rounded-md cursor-pointer"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {onlinePayMethod === 'card' && (
                    <div className="flex flex-col gap-3">
                      {/* Dynamic Card Display */}
                      <div className="w-full h-28 rounded-xl bg-gradient-to-br from-purple-900/50 to-indigo-950/80 border border-purple-500/20 shadow-md p-3.5 flex flex-col justify-between text-left select-none overflow-hidden relative">
                        <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full bg-pink-500/10 blur-xl pointer-events-none"></div>
                        <div className="flex justify-between items-start">
                          <CreditCard className="w-7 h-7 text-purple-300" />
                          <span className="text-[9px] text-slate-400 font-extrabold tracking-widest uppercase">NexaPay</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-mono text-slate-200 tracking-wider">
                            {cardData.number || '•••• •••• •••• ••••'}
                          </span>
                          <div className="flex justify-between items-center text-[8px] text-slate-400">
                            <span className="truncate max-w-[80px]">{cardData.name.toUpperCase() || 'CARDHOLDER NAME'}</span>
                            <span>{cardData.expiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Details Form */}
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Card Number</label>
                          <input
                            type="text"
                            required
                            placeholder="4000 1234 5678 9010"
                            value={cardData.number}
                            onChange={handleCardNumberChange}
                            className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70 placeholder-slate-650"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Expiry Date</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              value={cardData.expiry}
                              onChange={handleExpiryChange}
                              className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70 placeholder-slate-650 text-center"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">CVV</label>
                            <input
                              type="password"
                              required
                              placeholder="123"
                              value={cardData.cvv}
                              onChange={handleCvvChange}
                              className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70 placeholder-slate-650 text-center"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={cardData.name}
                            onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-950 border border-indigo-950/60 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500/70 placeholder-slate-650"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {onlinePayMethod === 'netbanking' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Bank</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'KOTAK Bank', 'PNB Bank'].map(bank => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                              selectedBank === bank 
                                ? 'bg-rose-500/5 border-rose-500 text-rose-400' 
                                : 'bg-slate-950 border-indigo-950/60 text-slate-450 hover:text-slate-200'
                            }`}
                          >
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 pt-4 border-t border-indigo-950/30 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handlePaymentSubmit}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-rose-950/20 transition-all border border-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Pay ₹{(subtotal + (deliveryInfo ? parseFloat(deliveryInfo.deliveryCharge) : 0)).toFixed(2)}
                  </button>
                </div>

                {/* Payment Processing Spinner Screen Overlay */}
                {paymentProcessing && (
                  <div className="absolute inset-0 bg-[#0e0a1f]/95 flex flex-col items-center justify-center gap-3.5 z-30 animate-fadeIn text-center p-6">
                    <RefreshCw className="w-10 h-10 text-rose-500 animate-spin" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">Processing Secure Payment</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Connecting to the secure banking servers. Please do not close this window or click back.</p>
                    </div>
                  </div>
                )}

                {/* Payment Success Screen Overlay */}
                {paymentSuccess && (
                  <div className="absolute inset-0 bg-[#0e0a1f]/95 flex flex-col items-center justify-center gap-3 z-30 animate-fadeIn text-center p-6">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-400">Payment Approved!</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Transaction Ref: TXN-{(Math.random() * 1000000).toFixed(0)}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Placing order on database...</p>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
