import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const searchParams = new URLSearchParams(window.location.search);
  const [form, setForm] = useState({ username: '', email: '', password: '', referral_code: searchParams.get('ref') || '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      setMsg('Registered successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        {msg && <p style={styles.success}>{msg}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required />
          <input style={styles.input} type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={styles.input} type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <input style={styles.input} placeholder="Referral Code (optional)" value={form.referral_code}
            onChange={e => setForm({ ...form, referral_code: e.target.value })} />
          <button style={styles.btn} type="submit">Register</button>
        </form>
        <p style={{ marginTop: 15 }}>Already have account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' },
  card: { background: '#1e293b', padding: 40, borderRadius: 12, width: 360, color: '#fff' },
  title: { textAlign: 'center', marginBottom: 24, color: '#38bdf8' },
  input: { width: '100%', padding: '10px 14px', marginBottom: 14, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' },
  btn: { width: '100%', padding: 12, background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' },
  error: { color: '#f87171', marginBottom: 10 },
  success: { color: '#4ade80', marginBottom: 10 }
};
