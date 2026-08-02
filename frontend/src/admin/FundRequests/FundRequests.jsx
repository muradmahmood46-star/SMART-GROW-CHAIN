/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function FundRequests({ notify, loadData }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minDeposit, setMinDeposit] = useState(100);
  const pendingD = deposits.filter(d => d.status === 'pending').length;

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API.defaults.baseURL}${url}`;
  };

  const fetchDeposits = async () => {
    try {
      const res = await API.get('/admin/deposits');
      setDeposits(res.data);
      const setRes = await API.get('/admin/settings');
      const minDepSetting = setRes.data.find(s => s.key === 'min_deposit');
      if (minDepSetting) setMinDeposit(parseInt(minDepSetting.value) || 100);
    } catch (err) {
      console.error(err);
      if (notify) notify('Failed to fetch deposits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const updateMinDeposit = async () => {
    try {
      await API.put('/admin/settings/min_deposit', { value: minDeposit.toString() });
      if (notify) notify('Minimum deposit updated ✅');
    } catch (e) {
      if (notify) notify('Error updating minimum deposit', 'error');
    }
  };

  const confirmDeposit = async (id) => {
    try {
      await API.put(`/admin/deposits/${id}/confirm`);
      fetchDeposits();
      if (loadData) loadData();
      if (notify) notify('Deposit confirmed ✅');
    } catch (e) {
      if (notify) notify('Error confirming deposit', 'error');
    }
  };

  const rejectDeposit = async (id) => {
    try {
      await API.put(`/admin/deposits/${id}/reject`);
      fetchDeposits();
      if (loadData) loadData();
      if (notify) notify('Deposit rejected');
    } catch (e) {
      if (notify) notify('Error rejecting deposit', 'error');
    }
  };

  if (loading) {
    return <div style={{padding: 20, color: 'var(--dim)'}}>Loading fund requests...</div>;
  }

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">📥 Fund Requests</h2>
        <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{pendingD} pending</span>
      </div>
      
      <div className="sgc-card" style={{marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap'}}>
        <div style={{flex: 1, minWidth: 200}}>
          <label className="sgc-label" style={{marginBottom:8, display:'block'}}>Minimum Deposit Amount (Rs.)</label>
          <input className="sgc-input" style={{margin:0}} type="number" value={minDeposit} onChange={e => setMinDeposit(e.target.value)} />
        </div>
        <button className="sgc-btn-primary" onClick={updateMinDeposit}>Update Limit</button>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {deposits.map(d=>{
          const isPending=d.status==='pending';
          const isConfirmed=d.status==='confirmed';
          const borderCol=isPending?'#f59e0b':isConfirmed?'#3cb559':'#ef4444';
          return (
            <div key={d.id} className="fade-in" style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
              {/* Top bar */}
              <div style={{background:isPending?'#451a0320':isConfirmed?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'var(--bg)',flexShrink:0}}>
                    {d.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{d.username}</p>
                    <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span style={{background:isPending?'#451a03':isConfirmed?'#064e3b':'#450a0a',color:isPending?'#f59e0b':isConfirmed?'#4ade80':'#fca5a5',padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700}}>
                  {d.status.toUpperCase()}
                </span>
              </div>

              <div style={{display:'flex',gap:0,flexWrap:'wrap'}}>
                {/* Left: details */}
                <div style={{flex:'1 1 260px',padding:'16px 20px'}}>
                  {/* Amount — big */}
                  <div style={{marginBottom:16}}>
                    <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 2px',fontWeight:600}}>AMOUNT RECEIVED</p>
                    <p style={{color:'#3cb559',fontSize:28,fontWeight:800,margin:0,fontFamily:'monospace'}}>Rs. {d.amount_pkr}</p>
                  </div>
                  {/* Sent by */}
                  <div style={{background:'var(--bg)',borderRadius:9,padding:'10px 14px',marginBottom:10}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 3px',fontWeight:600,letterSpacing:.5}}>SENT BY (ACCOUNT NAME)</p>
                    <p style={{color:'var(--accent)',fontWeight:700,fontSize:15,margin:0}}>{d.sender_name||'—'}</p>
                  </div>
                  {/* Phone & TRX ID */}
                  <div style={{background:'var(--bg)',borderRadius:9,padding:'10px 14px',marginBottom:10}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 3px',fontWeight:600,letterSpacing:.5}}>SENDER PHONE NUMBER</p>
                    <p style={{color:'var(--text)',fontWeight:600,fontSize:14,margin:'0 0 8px',fontFamily:'monospace'}}>{d.easypaisa_number||'—'}</p>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 3px',fontWeight:600,letterSpacing:.5}}>TRANSACTION ID (TRX ID)</p>
                    <p style={{color:'var(--yellow)',fontWeight:800,fontSize:14,margin:0,fontFamily:'monospace'}}>{d.transaction_id||'—'}</p>
                  </div>
                  {/* Actions */}
                  {isPending&&(
                    <div style={{display:'flex',gap:8,marginTop:14}}>
                      <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>confirmDeposit(d.id)}>✓ Confirm & Credit</button>
                      <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>rejectDeposit(d.id)}>✗ Reject</button>
                    </div>
                  )}
                </div>

                {/* Right: screenshot */}
                <div style={{flex:'0 0 200px',padding:'16px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderLeft:'1px solid var(--border)'}}>
                  <p style={{color:'var(--dim)',fontSize:10,fontWeight:600,letterSpacing:.5,marginBottom:8}}>PAYMENT SCREENSHOT</p>
                  {d.screenshot_url ? (
                    <a href={getImageUrl(d.screenshot_url)} target="_blank" rel="noreferrer">
                      <img src={getImageUrl(d.screenshot_url)} alt="screenshot"
                        style={{width:160,height:160,objectFit:'cover',borderRadius:10,border:'2px solid var(--border)',display:'block',transition:'transform .2s'}}
                        onMouseEnter={e=>e.target.style.transform='scale(1.04)'}
                        onMouseLeave={e=>e.target.style.transform='scale(1)'}
                      />
                      <p style={{color:'var(--yellow)',fontSize:11,textAlign:'center',marginTop:6,fontWeight:600}}>🔍 Click to view full</p>
                    </a>
                  ) : (
                    <div style={{width:160,height:160,borderRadius:10,border:'2px dashed var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6}}>
                      <span style={{fontSize:28}}>📸</span>
                      <span style={{color:'var(--dim)',fontSize:11}}>No screenshot</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {deposits.length===0&&<div className="sgc-empty">No fund requests yet</div>}
      </div>
    </div>
  );
}