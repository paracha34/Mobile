import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { WhatsAppButton } from './components/common/WhatsAppButton';

// Public Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { OrderHistory } from './pages/OrderHistory';
import { Wishlist } from './pages/Wishlist';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';

/**
 * Public Layout Wrapper
 * Renders AnnouncementBar, Navbar, BottomNav (mobile), CartDrawer, WishlistDrawer, WhatsApp Floating Button, and Page Transitions
 */
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
      <WishlistDrawer />
      <WhatsAppButton />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <AuthProvider>
              <Routes>
                {/* Public Website Routes */}
                <Route
                  path="/"
                  element={
                    <PublicLayout>
                      <Home />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <PublicLayout>
                      <Products />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/products/:slug"
                  element={
                    <PublicLayout>
                      <ProductDetail />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <PublicLayout>
                      <Wishlist />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <PublicLayout>
                      <Checkout />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/order-success"
                  element={
                    <PublicLayout>
                      <OrderSuccess />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/order-history"
                  element={
                    <PublicLayout>
                      <OrderHistory />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PublicLayout>
                      <OrderHistory />
                    </PublicLayout>
                  }
                />

                {/* Admin Portal Authentication */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Protected Admin Console Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                </Route>

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
