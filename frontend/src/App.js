import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  return localStorage.getItem('token') && localStorage.getItem('is_admin') === 'true'
    ? children : <Navigate to="/login" />;
}

function HomeRoute() {
  return <Landing />;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (e) => {
      const token = localStorage.getItem('token');
      const isAdmin = localStorage.getItem('is_admin') === 'true';
      const currentPath = location.pathname;

      // Dashboard/Admin par hai to logout karke login page par le jao
      if (currentPath === '/dashboard' || currentPath === '/admin') {
        e.preventDefault();
        if (token) {
          localStorage.clear();
        }
        navigate('/login', { replace: true });
        return false;
      }

      // Login page par hai to home page par le jao
      if (currentPath === '/login') {
        e.preventDefault();
        navigate('/', { replace: true });
        return false;
      }

      // Home/Register par hai to default behavior allow karo (exit)
      if (currentPath === '/' || currentPath === '/register') {
        return true;
      }
    };

    // Browser back button intercept
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      {/* Redirect old routes */}
      <Route path="/user/login" element={<Navigate to="/" />} />
      <Route path="/admin/login" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}