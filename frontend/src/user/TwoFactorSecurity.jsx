import React, { useState } from 'react';
import API from '../api';

export default function TwoFactorSecurity({ profile, notify, loadData }) {
  const [twoFA, setTwoFA] = useState(null);
  const [faCode, setFaCode] = useState('');

  const setup2FA = async()=>{
    const r = await API.get('/user/2fa/setup');
    setTwoFA(r.data);
  };

  const enable2FA = async()=>{
    try{ 
      await API.post('/user/2fa/enable',{secret:twoFA.secret,code:faCode}); 
      notify('2FA Enabled! ✅'); 
      if(loadData) loadData(); 
      setTwoFA(null); 
      setFaCode(''); 
    }
    catch(err){ notify(err.response?.data?.detail||'Invalid code','error'); }
  };

  const disable2FA = async()=>{
    try{ 
      await API.post('/user/2fa/disable'); 
      notify('2FA Disabled'); 
      if(loadData) loadData(); 
    }
    catch(err){ notify('Error','error'); }
  };

  return (
    <div>
      <h2 className="sgc-heading">🔐 2FA Security</h2>
      <div className="sgc-form" style={{maxWidth:480}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,padding:16,background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
          <span style={{fontSize:32}}>{profile.two_fa_enabled?'✅':'⚠️'}</span>
          <div>
            <p style={{color:'var(--text)',fontWeight:700,fontSize:14}}>Two-Factor Authentication</p>
            <p style={{color:profile.two_fa_enabled?'var(--green)':'var(--dim)',fontSize:13}}>{profile.two_fa_enabled?'Enabled — Your account is protected':'Disabled — Enable for extra security'}</p>
          </div>
        </div>

        {!profile.two_fa_enabled && !twoFA && (
          <button className="sgc-btn-primary" onClick={setup2FA}>Setup 2FA with Google Authenticator</button>
        )}

        {twoFA && !profile.two_fa_enabled && (
          <div>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:12}}>1. Install <b style={{color:'var(--text)'}}>Google Authenticator</b> on your phone</p>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:12}}>2. Scan this QR code:</p>
            <img src={twoFA.qr_code} alt="QR Code" style={{width:180,height:180,borderRadius:10,border:'2px solid var(--border)',display:'block',marginBottom:16}}/>
            <p style={{color:'var(--dim)',fontSize:12,marginBottom:4}}>Or enter secret manually: <span style={{color:'var(--accent)',fontFamily:'monospace'}}>{twoFA.secret}</span></p>
            <label className="sgc-label" style={{marginTop:16}}>3. Enter 6-digit code from app</label>
            <input className="sgc-input" placeholder="000000" value={faCode} onChange={e=>setFaCode(e.target.value)} maxLength={6} style={{letterSpacing:6,textAlign:'center',fontSize:20}}/>
            <button className="sgc-btn-primary" onClick={enable2FA}>Enable 2FA</button>
          </div>
        )}

        {profile.two_fa_enabled && (
          <div>
            <p style={{color:'var(--dim)',fontSize:13,marginBottom:16}}>2FA is currently active. Your account requires a verification code on every login.</p>
            <button onClick={disable2FA} style={{width:'100%',padding:13,background:'transparent',color:'var(--red)',border:'1px solid #7f1d1d',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'var(--font)'}}>Disable 2FA</button>
          </div>
        )}
      </div>
    </div>
  );
}