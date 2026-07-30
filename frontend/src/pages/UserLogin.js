import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function UserLogin() {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [step, setStep]         = useState('login'); // login | otp
  const [otpCode, setOtpCode]   = useState('');
  const [pendingData, setPendingData] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', form);
      if (res.data.is_admin) { setError('Use Admin Login for admin access'); return; }
      if (res.data.requires_otp) {
        setPendingData(res.data); setMaskedEmail(res.data.masked_email); setStep('otp');
      } else {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('is_admin', res.data.is_admin);
        localStorage.setItem('username', res.data.username);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/verify-otp', { temp_token: pendingData.temp_token, otp: otpCode });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('is_admin', res.data.is_admin);
      localStorage.setItem('username', res.data.username);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP code');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <Link to="/" style={s.back}>← Back to Home</Link>
        <div style={s.icon}>👤</div>
        <h2 style={s.title}>User Login</h2>
        <p style={s.sub}>{step==='otp' ? 'Check your email for OTP' : 'Access your earning dashboard'}</p>
        {error && <p style={s.error}>{error}</p>}

        {step==='login' && (
          <form onSubmit={handleSubmit}>
            <input style={s.input} placeholder="Username" value={form.username}
              onChange={e=>setForm({...form,username:e.target.value})} required/>
            <input style={s.input} type="password" placeholder="Password" value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})} required/>
            <button style={s.btn} type="submit" disabled={loading}>{loading?'Sending OTP...':'Login'}</button>
          </form>
        )}

        {step==='otp' && (
          <form onSubmit={handleOTP}>
            <div style={{background:'#1e293b',border:'1px solid #38bdf8',borderRadius:10,padding:'12px 16px',marginBottom:16,textAlign:'center'}}>
              <p style={{color:'#94a3b8',fontSize:13,margin:'0 0 4px'}}>📧 Code sent to</p>
              <p style={{color:'#38bdf8',fontWeight:700,fontSize:14,margin:0}}>{maskedEmail}</p>
              <p style={{color:'#64748b',fontSize:11,margin:'6px 0 0'}}>Valid for 10 minutes</p>
            </div>
            <input style={{...s.input,letterSpacing:10,textAlign:'center',fontSize:22,fontWeight:700}}
              placeholder="000000" value={otpCode} onChange={e=>setOtpCode(e.target.value)}
              maxLength={6} required autoFocus/>
            <button style={s.btn} type="submit" disabled={loading}>{loading?'Verifying...':'Verify & Login'}</button>
            <button type="button" onClick={()=>{setStep('login');setOtpCode('');setError('');}}
              style={{...s.btn,marginTop:8,background:'transparent',color:'#64748b',border:'1px solid #334155'}}>← Back</button>
          </form>
        )}

        {step==='login' && (
          <>
            <p style={{marginTop:16,color:'#64748b',fontSize:13,textAlign:'center'}}>No account? <Link to="/register" style={{color:'#38bdf8'}}>Register Free</Link></p>
            <div style={s.divider}/>
            <p style={{textAlign:'center',fontSize:12,color:'#475569'}}>Admin? <Link to="/admin/login" style={{color:'#f59e0b'}}>Go to Admin Login</Link></p>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' },
  card: { background: '#1e293b', padding: 40, borderRadius: 16, width: 380, color: '#fff', border: '1px solid #334155' },
  back: { color: '#64748b', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 20 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { textAlign: 'center', margin: '0 0 6px 0', color: '#38bdf8', fontSize: 22 },
  sub: { textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 24 },
  input: { width: '100%', padding: '11px 14px', marginBottom: 14, borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box', fontSize: 14 },
  btn: { width: '100%', padding: 12, background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: 14 },
  error: { color: '#f87171', marginBottom: 12, fontSize: 13, background: '#450a0a', padding: '8px 12px', borderRadius: 6 },
  divider: { borderTop: '1px solid #334155', margin: '16px 0' }
};
