import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { ShoppingCart, ArrowLeft, ShieldCheck, Heart, Info, Plus, Minus } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1.0);
  const [mainImgSrc, setMainImgSrc] = useState("");
  const [stage, setStage] = useState(1); // 1: local, 2: db, 3: placeholder

  useEffect(() => {
    if (product) {
      const cleanName = product.name?.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      const localPath = `/products/${cleanName}.jpg`;
      setStage(1);
      setMainImgSrc(localPath);
    }
  }, [product, activeImageIndex]);

  useEffect(() => {
    setLoading(true);
    productAPI.getById(id)
      .then((res) => {
        setProduct(res.data);
        // Set default quantity: 0.5 for meat categories, 1 for others
        const categoryName = res.data.category?.name || '';
        if (['Chicken', 'Mutton', 'Fish'].includes(categoryName)) {
          setQuantity(0.5);
        } else {
          setQuantity(1.0);
        }
      })
      .catch((err) => {
        console.error('Error loading product details:', err);
        toast.error('Product not found');
        navigate('/catalog');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!product) return null;

  const categoryName = product.category?.name || '';
  const isWeighted = ['Chicken', 'Mutton', 'Fish'].includes(categoryName);
  const unit = isWeighted ? 'kg' : 'unit';
  const incrementStep = isWeighted ? 0.5 : 1.0;

  const handleIncrement = () => {
    if (quantity + incrementStep > product.stock) {
      toast.error(`Cannot exceed available stock of ${product.stock} ${unit}`);
      return;
    }
    setQuantity((prev) => prev + incrementStep);
  };

  const handleDecrement = () => {
    const minVal = isWeighted ? 0.5 : 1.0;
    if (quantity - incrementStep >= minVal) {
      setQuantity((prev) => prev - incrementStep);
    }
  };

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error(`Insufficient stock! Only ${product.stock} ${unit} available.`);
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} ${unit} of ${product.name} added to cart!`);
  };


  const handleMainImgError = () => {
    if (stage === 1) {
      setStage(2);
      const dbUrl = product.images && product.images.length > activeImageIndex
        ? product.images[activeImageIndex].imageUrl
        : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
      setMainImgSrc(dbUrl);
    } else if (stage === 2) {
      setStage(3);
      setMainImgSrc("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80");
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.imageUrl)
    : ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 text-left">
      
      {/* Back link */}
      <div>
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Product Info Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          
          {/* Main Display image */}
          <div className="aspect-square bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative">
            <img 
              src={mainImgSrc} 
              alt={product.name} 
              onError={handleMainImgError}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {product.stock === 0 && (
              <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                Sold Out
              </span>
            )}
          </div>

          {/* Thumbnail list (Only show if multiple images) */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                    activeImageIndex === idx ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category?.name || 'Fresh Meat'}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                product.stock > 0 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {product.stock > 0 ? `In Stock: ${product.stock} ${unit}` : 'Out of Stock'}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{product.name}</h1>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">₹{product.price}</span>
              <span className="text-slate-400 text-sm">/ {unit}</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Interactive controls */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 mt-4">
            
            {/* Quantity Selector */}
            <div className="flex flex-col gap-1.5 items-start">
              <span className="text-xs text-slate-500 font-semibold">Select Quantity</span>
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button 
                  onClick={handleDecrement}
                  disabled={product.stock === 0}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-white px-3 min-w-[50px] text-center">
                  {quantity} {unit}
                </span>
                <button 
                  onClick={handleIncrement}
                  disabled={product.stock === 0}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total calculation & Add Button */}
            <div className="flex flex-col gap-1 items-end w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold">Subtotal</span>
              <span className="text-xl font-black text-white">₹{Math.round(product.price * quantity * 100) / 100}</span>
            </div>

          </div>

          {/* Action button */}
          <div>
            {product.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transition-all border border-rose-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            ) : (
              <div className="w-full text-center py-4 bg-rose-950/20 border border-rose-900/30 text-rose-500 font-bold rounded-xl text-sm tracking-wide">
                Out Of Stock
              </div>
            )}
          </div>

          {/* Quality badge list */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800/60 p-3.5 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-200">100% Halal</h4>
                <p className="text-[10px] text-slate-500">Processed fresh daily</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-800/60 p-3.5 rounded-xl">
              <Info className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-200">Chilled Transit</h4>
                <p className="text-[10px] text-slate-500">Under 4°C cooling bag</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
