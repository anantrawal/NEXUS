import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import CartDrawer from './components/cart/CartDrawer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { fetchCart } from './store/slices/cartSlice';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated, dispatch]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/products"       element={<ProductsPage />} />
        <Route path="/products/:id"   element={<ProductDetailPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/cart"           element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout"       element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders"         element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id"     element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
