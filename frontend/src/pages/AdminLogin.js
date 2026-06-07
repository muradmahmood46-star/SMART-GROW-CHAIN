import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      if (!res.data.is_admin) {
        setError('Access denied. Admin accounts only.');
        return;
      }
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('is_admin', res.data.is_admin);
      localStorage.setItem('username', res.data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <Link to="/" style={s.back}>← Back to Home</Link>
        <div style={s.icon}>⚙️</div>
        <h2 style={s.title}>Admin Login</h2>
        <p style={s.sub}>Access the admin control panel</p>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} placeholder="Admin Username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required />
          <input style={s.input} type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={s.btn} type="submit">Login to Admin Panel</button>
        </form>
        <div style={s.divider}></div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#475569' }}>
          Regular user? <Link to="/user/login" style={{ color: '#38bdf8' }}>Go to User Login</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' },
  card: { background: '#1e293b', padding: 40, borderRadius: 16, width: 380, color: '#fff', border: '1px solid #f59e0b33' },
  back: { color: '#64748b', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 20 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { textAlign: 'center', margin: '0 0 6px 0', color: '#f59e0b', fontSize: 22 },
  sub: { textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 24 },
  input: { width: '100%', padding: '11px 14px', marginBottom: 14, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box', fontSize: 14 },
  btn: { width: '100%', padding: 12, background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 },
  error: { color: '#f87171', marginBottom: 12, fontSize: 13, background: '#450a0a', padding: '8px 12px', borderRadius: 6 },
  divider: { borderTop: '1px solid #334155', margin: '16px 0' }
};
