import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import Home from './pages/customer/Home';
import Catalog from './pages/customer/Catalog';
import ProductDetails from './pages/customer/ProductDetails';
import RestaurantDetails from './pages/customer/RestaurantDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminMerchants from './pages/admin/AdminMerchants';
import OrderManagement from './pages/admin/OrderManagement';
import SettingsManagement from './pages/admin/SettingsManagement';

// Merchant Pages
import MerchantLogin from './pages/merchant/MerchantLogin';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantProducts from './pages/merchant/MerchantProducts';

// Global stylesheet (Tailwind import)
import './App.css'; // Importing empty or basic layout styles

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#0f1115] text-[#f3f4f6]">
            {/* Header Navbar */}
            <Navbar />

            {/* Main viewports */}
            <main className="flex-grow">
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />

                {/* Admin Portals */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/products" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <ProductManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/categories" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <CategoryManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/restaurants" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminRestaurants />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/merchants" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminMerchants />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <OrderManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <SettingsManagement />
                    </ProtectedRoute>
                  } 
                />

                {/* Merchant Portals */}
                <Route path="/merchant/login" element={<MerchantLogin />} />
                
                <Route 
                  path="/merchant/dashboard" 
                  element={
                    <ProtectedRoute requireMerchant={true}>
                      <MerchantDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/merchant/products" 
                  element={
                    <ProtectedRoute requireMerchant={true}>
                      <MerchantProducts />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>

            {/* Footer widgets */}
            <Footer />
          </div>
          
          {/* Toast notifications container */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e293b',
                color: '#f3f4f6',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
              },
            }} 
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
