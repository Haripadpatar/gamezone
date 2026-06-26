import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from '../components/PublicLayout';
import DashboardLayout from '../components/DashboardLayout';

// Public Pages
import Home from '../../features/public/Home';
import ProductListing from '../../features/public/ProductListing';
import ProductDetails from '../../features/public/ProductDetails';
import CategoryListing from '../../features/public/CategoryListing';
import Login from '../../features/auth/Login';
import Register from '../../features/auth/Register';

// Customer Pages
import CustomerDashboard from '../../features/customer/CustomerDashboard';
import Profile from '../../features/customer/Profile';
import Cart from '../../features/customer/Cart';
import Wishlist from '../../features/customer/Wishlist';
import Checkout from '../../features/customer/Checkout';
import PaymentVerify from '../../features/customer/PaymentVerify';
import Orders from '../../features/customer/Orders';
import OrderDetails from '../../features/customer/OrderDetails';

// Vendor Pages
import VendorRegister from '../../features/vendor/VendorRegister';
import VendorDashboard from '../../features/vendor/VendorDashboard';
import ProductManagement from '../../features/vendor/ProductManagement';
import InventoryManagement from '../../features/vendor/InventoryManagement';
import VendorOrders from '../../features/vendor/VendorOrders';
import StoreSettings from '../../features/vendor/StoreSettings';
import VendorAnalytics from '../../features/vendor/VendorAnalytics';

// Admin Pages
import AdminDashboard from '../../features/admin/AdminDashboard';
import VendorApproval from '../../features/admin/VendorApproval';
import UserManagement from '../../features/admin/UserManagement';
import ProductModeration from '../../features/admin/ProductModeration';
import AdminAnalytics from '../../features/admin/AdminAnalytics';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes with Navbar & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/categories" element={<CategoryListing />} />

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_VENDOR', 'ROLE_ADMIN']} />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-verify" element={<PaymentVerify />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderNumber" element={<OrderDetails />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
        </Route>
      </Route>

      {/* Guest Only Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Vendor Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_VENDOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<ProductManagement />} />
          <Route path="/vendor/inventory" element={<InventoryManagement />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/settings" element={<StoreSettings />} />
          <Route path="/vendor/analytics" element={<VendorAnalytics />} />
        </Route>
      </Route>

      {/* Admin Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/vendors" element={<VendorApproval />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/products" element={<ProductModeration />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
