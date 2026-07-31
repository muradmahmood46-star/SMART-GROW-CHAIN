import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './admin/AdminPanel';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  if (!token) return <Navigate to="/" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function HomeRoute() {
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        {/* Redirect old routes */}
        <Route path="/user/login" element={<Navigate to="/" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
