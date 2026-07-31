import React, { useState, useEffect } from 'react';
import API from '../../api';
import { approvePlanPurchase, rejectPlanPurchase } from '../../services/admin/adminService';

export default function PlanPurchases({ notify, loadData }) {
  const [planPurchases, setPlanPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      const res = await API.get('/admin/plan-purchases');
      setPlanPurchases(res.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch plan purchases', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approvePlanPurchase(id);
      fetchPurchases();
      if (loadData) loadData();
      if (notify) notify('Plan activated ✅');
    } catch (e) {
      if (notify) notify('Error activating plan', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectPlanPurchase(id);
      fetchPurchases();
      if (loadData) loadData();
      if (notify) notify('Rejected & refunded');
    } catch (e) {
      if (notify) notify('Error rejecting plan', 'error');
    }
  };

  if (loading) return <div style={{padding:20, color:'var(--dim)'}}>Loading plan purchases...</div>;

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">🏆 Plan Purchases</h2>
        <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{planPurchases.filter(r=>r.status==='pending').length} pending</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {planPurchases.map(r=>{
          const isPending=r.status==='pending';
          const borderCol=isPending?'#f59e0b':r.status==='approved'?'#3cb559':'#ef4444';
          return (
            <div key={r.id} className="fade-in" style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
              <div style={{background:isPending?'#451a0320':r.status==='approved'?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--yellow),#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'var(--bg)',flexShrink:0}}>
                    {r.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{r.username}</p>
                    <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span style={{background:isPending?'#451a03':r.status==='approved'?'#064e3b':'#450a0a',color:isPending?'#f59e0b':r.status==='approved'?'#4ade80':'#fca5a5',padding:'3px 14px',borderRadius:20,fontSize:11,fontWeight:700}}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <div style={{padding:'16px 20px',display:'flex',gap:20,flexWrap:'wrap'}}>
                <div style={{flex:'1 1 220px'}}>
                  <p style={{color:'var(--yellow)',fontWeight:800,fontSize:18,margin:'0 0 8px',textTransform:'capitalize'}}>🏆 {r.plan_name} Plan</p>
                  <p style={{color:'var(--green)',fontWeight:800,fontSize:22,margin:'0 0 12px',fontFamily:'monospace'}}>Rs. {r.plan_price}</p>
                  <div style={{background:'var(--bg)',borderRadius:8,padding:'8px 12px',marginBottom:8}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>PAYMENT METHOD</p>
                    <p style={{color:'var(--accent)',fontWeight:700,fontSize:13,margin:0,textTransform:'capitalize'}}>{r.payment_method}</p>
                  </div>
                  {r.sender_name&&(
                    <div style={{background:'var(--bg)',borderRadius:8,padding:'8px 12px',marginBottom:8}}>
                      <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>SENDER NAME</p>
                      <p style={{color:'var(--text)',fontWeight:600,fontSize:13,margin:0}}>{r.sender_name}</p>
                    </div>
                  )}
                  {r.sender_phone&&(
                    <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:8,padding:'8px 14px',marginBottom:12}}>
                      <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>SENDER PHONE</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                        <p style={{color:'#38bdf8',fontFamily:'monospace',fontSize:16,fontWeight:800,margin:0}}>{r.sender_phone}</p>
                        <button onClick={()=>{navigator.clipboard.writeText(r.sender_phone);if(notify) notify('Copied! 📋');}} style={{background:'#1e4080',border:'1px solid #38bdf8',color:'#38bdf8',borderRadius:7,padding:'4px 10px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>Copy</button>
                      </div>
                    </div>
                  )}
                  {isPending&&(
                    <div style={{display:'flex',gap:8}}>
                      <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>handleApprove(r.id)}>✓ Approve</button>
                      <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>handleReject(r.id)}>✗ Reject</button>
                    </div>
                  )}
                </div>
                {r.screenshot_url&&(
                  <div style={{flex:'0 0 160px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start'}}>
                    <p style={{color:'var(--dim)',fontSize:10,fontWeight:600,letterSpacing:.5,marginBottom:8}}>PAYMENT SCREENSHOT</p>
                    <a href={r.screenshot_url} target="_blank" rel="noreferrer">
                      <img src={r.screenshot_url} alt="proof" style={{width:150,height:130,objectFit:'cover',borderRadius:10,border:'2px solid var(--border)'}}/>
                      <p style={{color:'var(--yellow)',fontSize:11,textAlign:'center',marginTop:6,fontWeight:600}}>🔍 Click to view</p>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {planPurchases.length===0&&<div className="sgc-empty">No plan purchase requests yet</div>}
      </div>
    </div>
  );
}