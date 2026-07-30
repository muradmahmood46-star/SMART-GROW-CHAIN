import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [step, setStep]         = useState('login'); // login | 2fa
  const [faCode, setFaCode]     = useState('');
  const [pendingData, setPendingData] = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  // ── Back button: ensure login can be reached from dashboard ──
  useEffect(()=>{
    // When login page loads, replace state so back goes to home, not dashboard
    if(window.history.state && window.history.state.fromDashboard) {
      window.history.replaceState({ fromDashboard: false }, '', window.location.href);
    }
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', form);
      if (res.data.requires_2fa) {
        setPendingData(res.data); setStep('2fa');
      } else {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('is_admin', String(res.data.is_admin));
        localStorage.setItem('username', res.data.username);
        navigate(res.data.is_admin ? '/admin' : '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally { setLoading(false); }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/verify-2fa', { temp_token: pendingData.temp_token, code: faCode });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('is_admin', res.data.is_admin);
      localStorage.setItem('username', res.data.username);
      navigate(res.data.is_admin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid 2FA code');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.back}>← Back to Home</Link>
        <div style={s.logo}>🌱</div>
        <h2 style={s.title}>Smart Grow Chain</h2>
        <p style={s.sub}>
          {step==='2fa' ? 'Enter 2FA code' : 'Login to your account'}
        </p>
        {error && <div style={s.error}>{error}</div>}

        {step==='login' && (
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Username</label>
            <input style={s.input} placeholder="Enter username" value={form.username}
              onChange={e=>setForm({...form,username:e.target.value})} required autoFocus/>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="Enter password" value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})} required/>
            <button style={{...s.btn,opacity:loading?0.7:1}} type="submit" disabled={loading}>
              {loading?'Logging in...':'Login'}
            </button>
          </form>
        )}

        {step==='2fa' && (
          <form onSubmit={handle2FA}>
            <p style={{color:'#94a3b8',fontSize:13,marginBottom:16}}>Open Google Authenticator and enter the 6-digit code.</p>
            <label style={s.label}>Authentication Code</label>
            <input style={{...s.input,letterSpacing:8,textAlign:'center',fontSize:22}}
              placeholder="000000" value={faCode} onChange={e=>setFaCode(e.target.value)}
              maxLength={6} required autoFocus/>
            <button style={{...s.btn,opacity:loading?0.7:1}} type="submit" disabled={loading}>
              {loading?'Verifying...':'Verify & Login'}
            </button>
            <button type="button" onClick={()=>{setStep('login');setFaCode('');setError('');}}
              style={{...s.btn,marginTop:8,background:'transparent',color:'#64748b',border:'1px solid #334155'}}>
              ← Back
            </button>
          </form>
        )}

        {step==='login' && (
          <p style={s.registerText}>No account? <Link to="/register" style={{color:'#38bdf8'}}>Register Free</Link></p>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' },
  card: { background: '#1e293b', padding: 40, borderRadius: 16, width: 380, color: '#fff', border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  back: { color: '#64748b', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 24 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { textAlign: 'center', margin: '0 0 6px 0', color: '#38bdf8', fontSize: 24, fontWeight: 800 },
  sub: { textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 28 },
  label: { color: '#94a3b8', fontSize: 13, display: 'block', marginBottom: 6 },
  input: { width: '100%', padding: '12px 14px', marginBottom: 16, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box', fontSize: 14 },
  btn: { width: '100%', padding: 13, background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 15, marginTop: 4 },
  error: { color: '#f87171', marginBottom: 16, fontSize: 13, background: '#450a0a', padding: '10px 14px', borderRadius: 8, border: '1px solid #7f1d1d' },
  registerText: { marginTop: 20, color: '#64748b', fontSize: 13, textAlign: 'center' }
};
