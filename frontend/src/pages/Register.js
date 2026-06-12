import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const searchParams = new URLSearchParams(window.location.search);
  const [form, setForm] = useState({ username: '', email: '', password: '', referral_code: searchParams.get('ref') || '' });
  const [step, setStep] = useState('register'); // register | otp
  const [regToken, setRegToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  // countdown timer for resend
  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleResend = async () => {
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/register', form);
      if (res.data.requires_otp) {
        setRegToken(res.data.reg_token);
        setOtp('');
        setResendTimer(60);
        setMsg('New OTP sent!');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMsg('');
    try {
      await API.post('/auth/register', form);
      setMsg('Registered successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/register/verify-otp', { reg_token: regToken, otp });
      setMsg('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.back}>← Back to Home</Link>
        <div style={s.logo}>🌱</div>
        <h2 style={s.title}>Smart Grow Chain</h2>
        <p style={s.sub}>{step === 'otp' ? 'Verify your email' : 'Create your account'}</p>

        {error && <div style={s.error}>{error}</div>}
        {msg   && <div style={s.success}>{msg}</div>}

        {step === 'register' && (
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Username</label>
            <input style={s.input} placeholder="Enter username" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required autoFocus />
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="Enter email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="Create password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
            <label style={s.label}>Referral Code <span style={{color:'#475569',fontSize:11}}>(optional)</span></label>
            <input style={s.input} placeholder="Enter referral code" value={form.referral_code}
              onChange={e => setForm({ ...form, referral_code: e.target.value })} />
            <button style={{...s.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Register'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOTP}>
            <div style={{background:'#1e3a6e',border:'1px solid #38bdf8',borderRadius:10,padding:'12px 16px',marginBottom:20,textAlign:'center'}}>
              <p style={{color:'#94a3b8',fontSize:13,margin:'0 0 4px'}}>OTP sent to</p>
              <p style={{color:'#38bdf8',fontWeight:700,fontSize:14,margin:0}}>{maskedEmail}</p>
              <p style={{color:'#64748b',fontSize:11,margin:'6px 0 0'}}>Check inbox & spam folder. Valid for 10 minutes.</p>
            </div>
            <label style={s.label}>Verification Code</label>
            <input style={{...s.input, letterSpacing:10, textAlign:'center', fontSize:24, fontWeight:700}}
              placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)}
              maxLength={6} required autoFocus />
            <button style={{...s.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <button type="button" disabled={resendTimer>0 || loading} onClick={handleResend}
              style={{...s.btn, marginTop:8, background:'transparent', color: resendTimer>0 ? '#475569' : '#38bdf8', border:'1px solid #334155', fontSize:13}}>
              {resendTimer>0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
            <button type="button" onClick={() => { setStep('register'); setOtp(''); setError(''); setResendTimer(0); }}
              style={{...s.btn, marginTop:8, background:'transparent', color:'#64748b', border:'1px solid #334155', fontSize:13}}>
              Back
            </button>
          </form>
        )}

        <p style={s.loginText}>Already have account? <Link to="/login" style={{color:'#38bdf8'}}>Login</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:      { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0f172a' },
  card:      { background:'#1e293b', padding:40, borderRadius:16, width:380, color:'#fff', border:'1px solid #334155', boxShadow:'0 25px 50px rgba(0,0,0,0.5)' },
  back:      { color:'#64748b', textDecoration:'none', fontSize:13, display:'block', marginBottom:24 },
  logo:      { fontSize:48, textAlign:'center', marginBottom:8 },
  title:     { textAlign:'center', margin:'0 0 6px 0', color:'#38bdf8', fontSize:24, fontWeight:800 },
  sub:       { textAlign:'center', color:'#64748b', fontSize:13, marginBottom:28 },
  label:     { color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 },
  input:     { width:'100%', padding:'12px 14px', marginBottom:16, borderRadius:8, border:'1px solid #334155', background:'#0f172a', color:'#fff', boxSizing:'border-box', fontSize:14 },
  btn:       { width:'100%', padding:13, background:'#38bdf8', color:'#0f172a', border:'none', borderRadius:8, fontWeight:'bold', cursor:'pointer', fontSize:15, marginTop:4 },
  error:     { color:'#f87171', marginBottom:16, fontSize:13, background:'#450a0a', padding:'10px 14px', borderRadius:8, border:'1px solid #7f1d1d' },
  success:   { color:'#4ade80', marginBottom:16, fontSize:13, background:'#052e16', padding:'10px 14px', borderRadius:8, border:'1px solid #166534' },
  loginText: { marginTop:20, color:'#64748b', fontSize:13, textAlign:'center' },
};
