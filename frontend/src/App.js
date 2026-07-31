import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './admin/AdminPanel';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  return localStorage.getItem('token') && localStorage.getItem('is_admin') === 'true'
    ? children : <Navigate to="/login" replace />;
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
