import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Payout({
  siteSettings,
  kycData,
  profile,
  withdrawals,
  withdrawalMsg,
  notify,
  loadData
}) {
  const [withdraw, setWithdraw] = useState({ amount:'', method:'easypaisa', wallet_address:'' });
  const [withdrawBankName, setWithdrawBankName] = useState('');
  const [withdrawBankHolder, setWithdrawBankHolder] = useState('');
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    API.get('/user/plans').then(res => setPlans(res.data)).catch(console.error);
  }, []);

  const handleWithdraw = async(e)=>{
    e.preventDefault();
    if (siteSettings.withdraw_enabled === 'false') {
      notify(siteSettings.withdraw_closed_message || 'Withdraw is currently closed.', 'error');
      return;
    }
    let walletAddr = withdraw.wallet_address;
    if(withdraw.method==='bank'){
      if(!withdrawBankName||!withdrawBankHolder||!withdraw.wallet_address){ notify('Please fill all bank fields','error'); return; }
      walletAddr = `${withdrawBankHolder}|${withdraw.wallet_address}|${withdrawBankName}`;
    }
    try{ 
      await API.post('/user/withdraw',{...withdraw,amount:parseFloat(withdraw.amount),wallet_address:walletAddr}); 
      notify('Payout request submitted!'); 
      if (loadData) loadData(); 
      setWithdraw({amount:'',method:'easypaisa',wallet_address:''}); 
      setWithdrawBankName(''); 
      setWithdrawBankHolder(''); 
    }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };
  const minW = plans.find(p=>p.name===profile.membership)?.min_withdrawal || 500;
  const maxW = plans.find(p=>p.name===profile.membership)?.max_withdrawal || 0;
  const totalPayout = withdrawals.filter(w=>w.status==='approved'||w.status==='sent').reduce((s,w)=>s+w.amount,0);
  const isKycVerified = profile?.kyc_status === 'approved' || kycData?.kyc_status === 'approved';

  return (
    <div>
      <h2 className="sgc-heading">💸 Payout</h2>
      {siteSettings.withdraw_enabled === 'false' && (
        <div style={{background:'#450a0a',border:'1px solid #ef4444',borderRadius:12,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:22}}>🔒</span>
          <div>
            <p style={{color:'#fca5a5',fontWeight:700,fontSize:14,margin:0}}>Withdraw Currently Closed</p>
            <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0',whiteSpace:'pre-wrap'}}>{siteSettings.withdraw_closed_message || 'Withdraw is temporarily disabled. Please check back later.'}</p>
          </div>
        </div>
      )}
      {siteSettings.withdraw_enabled !== 'false' && siteSettings.withdraw_until && (
        <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:16}}>⏱️</span>
          <p style={{color:'#4ade80',fontSize:13,margin:0,fontWeight:600}}>Withdraw open until: {new Date(siteSettings.withdraw_until).toLocaleString('en-PK',{timeZone:'Asia/Karachi'})}</p>
        </div>
      )}
      {!isKycVerified ? (
        <div style={{background:'#450a0a',border:'1px solid #ef4444',borderRadius:14,padding:'28px 24px',textAlign:'center',maxWidth:480}}>
          <div style={{fontSize:48,marginBottom:12}}>🚪</div>
          <h3 style={{color:'#fca5a5',fontSize:18,fontWeight:800,margin:'0 0 8px'}}>KYC Verification Required</h3>
          <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 20px'}}>Please complete your KYC verification before withdrawing funds.</p>
          <p style={{color:'var(--dim)',fontSize:12}}>Navigate to KYC tab to submit documents.</p>
          {kycData?.kyc_status==='pending' && <p style={{color:'#fbbf24',fontSize:12,marginTop:12}}>⏳ KYC is under review. Please wait for admin approval.</p>}
          {kycData?.kyc_status==='rejected' && <p style={{color:'#fca5a5',fontSize:12,marginTop:12}}>KYC was rejected. Please resubmit with correct documents.</p>}
        </div>
      ) : (() => {
        return (
          <>
            {/* Balance & Payout Summary */}
            <div className="sgc-stats" style={{maxWidth:480,marginBottom:24}}>
              <div className="sgc-stat-card">
                <div className="sgc-stat-label">Available Balance</div>
                <div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {profile.balance.toFixed(2)}</div>
              </div>
              <div className="sgc-stat-card">
                <div className="sgc-stat-label">Total Payout</div>
                <div className="sgc-stat-val" style={{color:'var(--accent)'}}>Rs. {totalPayout.toFixed(2)}</div>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="sgc-form" style={{maxWidth:480}}>
              <label className="sgc-label">Payment Method</label>
              <select className="sgc-input" value={withdraw.method} onChange={e=>{ setWithdraw({...withdraw,method:e.target.value,wallet_address:''}); setWithdrawBankName(''); setWithdrawBankHolder(''); }}>
                <option value="easypaisa">Easypaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="bank">Bank Transfer</option>
              </select>
              {(withdraw.method==='easypaisa'||withdraw.method==='jazzcash') && (
                <>
                  <label className="sgc-label">Full Name</label>
                  <input className="sgc-input" placeholder="Enter your full name" value={withdraw.wallet_address.includes('|') ? withdraw.wallet_address.split('|')[0] : ''}
                    onChange={e=>{ const parts=withdraw.wallet_address.split('|'); setWithdraw({...withdraw,wallet_address:`${e.target.value}|${parts[1]||''}`}); }}/>
                  <label className="sgc-label">Account Number</label>
                  <input className="sgc-input" placeholder="03XX-XXXXXXX"
                    value={withdraw.wallet_address.includes('|') ? withdraw.wallet_address.split('|')[1] : withdraw.wallet_address}
                    onChange={e=>{ if(withdraw.wallet_address.includes('|')){ const parts=withdraw.wallet_address.split('|'); setWithdraw({...withdraw,wallet_address:`${parts[0]}|${e.target.value}`}); } else { setWithdraw({...withdraw,wallet_address:e.target.value}); } }} required/>
                </>
              )}
              {withdraw.method==='bank' && (
                <>
                  <label className="sgc-label">Bank Name</label>
                  <input className="sgc-input" placeholder="e.g. HBL, UBL, Meezan Bank" value={withdrawBankName} onChange={e=>setWithdrawBankName(e.target.value)} required/>
                  <label className="sgc-label">Account Holder Name</label>
                  <input className="sgc-input" placeholder="Enter account holder name" value={withdrawBankHolder} onChange={e=>setWithdrawBankHolder(e.target.value)} required/>
                  <label className="sgc-label">Account Number / IBAN</label>
                  <input className="sgc-input" placeholder="e.g. PK36HABB0000123456789012" value={withdraw.wallet_address} onChange={e=>setWithdraw({...withdraw,wallet_address:e.target.value})} required/>
                </>
              )}
              <label className="sgc-label">Enter Amount (Rs.)</label>
              <input className="sgc-input" type="number" step="1" min={minW} placeholder={`Min Rs. ${minW}${maxW>0?` | Max Rs. ${maxW}`:''}`} value={withdraw.amount} onChange={e=>setWithdraw({...withdraw,amount:e.target.value})} required/>
              <div style={{display:'flex',gap:10,fontSize:12,color:'var(--dim)',marginBottom:8}}>
                <span>Min: <b style={{color:'var(--yellow)'}}>Rs. {minW}</b></span>
                {maxW>0&&<span>Max: <b style={{color:'var(--red)'}}>Rs. {maxW}</b></span>}
              </div>
              <button className="sgc-btn-primary" type="submit" 
                disabled={siteSettings.withdraw_enabled === 'false'} 
                style={{ opacity: siteSettings.withdraw_enabled === 'false' ? 0.5 : 1, cursor: siteSettings.withdraw_enabled === 'false' ? 'not-allowed' : 'pointer' }}>
                Submit Request
              </button>
            </form>

            {/* Withdrawal Custom Message Box */}
            {withdrawalMsg && (
              <div style={{maxWidth:480,marginTop:20,background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:14,padding:'16px 20px'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:20}}>📌</span>
                  <span style={{color:'var(--accent)',fontWeight:800,fontSize:13,letterSpacing:.3}}>WITHDRAWAL INFORMATION</span>
                </div>
                <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{withdrawalMsg}</p>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}