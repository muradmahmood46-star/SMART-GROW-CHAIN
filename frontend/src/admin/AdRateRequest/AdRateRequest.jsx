/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';
import { updateAdBudgetRate, updateMinCampaignUsers, updateFreePlanDays, approveAdRequest, rejectAdRequest } from '../../services/admin/adminService';

export default function AdRateRequest({ notify, loadData }) {
  const [adRequests, setAdRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newBudgetRate, setNewBudgetRate] = useState('');
  const [adBudgetRate, setAdBudgetRate] = useState(0);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [minCampaignUsers, setMinCampaignUsers] = useState(1);
  const [freePlanDays, setFreePlanDays] = useState(3);

  const pendingAdReqs = adRequests.filter(r => r.status === 'pending').length;

  const fetchData = async () => {
    try {
      const [reqRes, settingsRes] = await Promise.all([
        API.get('/admin/ad-requests'),
        API.get('/admin/settings')
      ]);
      setAdRequests(reqRes.data);
      if (settingsRes.data) {
        setAdBudgetRate(settingsRes.data.ad_budget_rate || 0);
        setNewBudgetRate(String(settingsRes.data.ad_budget_rate || 0));
        setWelcomeMsg(settingsRes.data.welcome_message || '');
        setMinCampaignUsers(settingsRes.data.min_campaign_users || 1);
        setFreePlanDays(settingsRes.data.free_plan_days || 3);
      }
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveAdRequest(id);
      fetchData();
      if (loadData) loadData();
      if (notify) notify('Ad request approved ✅');
    } catch (e) {
      if (notify) notify('Error approving request', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAdRequest(id);
      fetchData();
      if (loadData) loadData();
      if (notify) notify('Rejected & refunded');
    } catch (e) {
      if (notify) notify('Error rejecting request', 'error');
    }
  };

  

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">📢 Ad Requests</h2>
        <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{pendingAdReqs} pending</span>
      </div>

      {/* Budget Rate Setting */}
      <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
        <h4 style={{color:'var(--yellow)',fontSize:13,fontWeight:700,marginBottom:12}}>💰 Rate Per Member (Rs.)</h4>
        <div style={{display:'flex',gap:10,marginBottom:12}}>
          <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="0.1" step="0.1" value={newBudgetRate} onChange={e=>setNewBudgetRate(e.target.value)}/>
        </div>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{
          try {
            await updateAdBudgetRate(parseFloat(newBudgetRate), welcomeMsg);
            setAdBudgetRate(parseFloat(newBudgetRate));
            if(notify) notify('Settings updated ✅');
          } catch(e) {
            if(notify) notify('Error updating rate', 'error');
          }
        }}>Save</button>
        <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Current rate: <b style={{color:'var(--yellow)'}}>Rs. {adBudgetRate}/member</b></p>
      </div>

      {/* Min Campaign Users Setting */}
      <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
        <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:700,marginBottom:12}}>👥 Minimum Users Per Campaign</h4>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="1" max="10000" value={minCampaignUsers} onChange={e=>setMinCampaignUsers(parseInt(e.target.value))}/>
          <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{ 
            try {
              await updateMinCampaignUsers(minCampaignUsers); 
              if(notify) notify('Min users updated ✅'); 
            } catch(e) {
              if(notify) notify('Error updating', 'error');
            }
          }}>Save</button>
        </div>
        <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Advertisers must target at least <b style={{color:'var(--purple)'}}>{minCampaignUsers} users</b> per campaign.</p>
      </div>

      {/* Free Plan Days Setting */}
      <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
        <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:12}}>⏰ Free Plan Duration (Days)</h4>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="1" max="365" value={freePlanDays} onChange={e=>setFreePlanDays(parseInt(e.target.value))}/>
          <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{
            try {
              await updateFreePlanDays(freePlanDays);
              if(notify) notify('Free plan duration updated ✅');
            } catch(e) {
              if(notify) notify('Error updating', 'error');
            }
          }}>Save</button>
        </div>
        <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>After <b style={{color:'var(--yellow)'}}>{freePlanDays} days</b>, free users must buy a plan to continue.</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {adRequests.map(r=>{
          const isPending=r.status==='pending';
          const borderCol=isPending?'#f59e0b':r.status==='approved'?'#3cb559':'#ef4444';
          return (
            <div key={r.id} style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
              <div style={{background:isPending?'#451a0320':r.status==='approved'?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'var(--bg)',flexShrink:0}}>
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
              <div style={{padding:'16px 20px'}}>
                <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:'0 0 4px'}}>{r.title}</p>
                <p style={{color:'var(--accent)',fontSize:12,margin:'0 0 10px'}}>🔗 {r.url}</p>
                <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:12}}>
                  <span className="sgc-badge" style={{background:'#1e3a6e'}}>👥 {r.members_needed} members</span>
                  <span className="sgc-badge" style={{background:'#064e3b',color:'var(--green)'}}>Rs. {r.total_cost}</span>
                  <span className="sgc-badge" style={{background:'#2d1b69',color:'var(--purple)'}}>{r.payment_method}</span>
                </div>
                {r.screenshot_url&&(
                  <a href={r.screenshot_url} target="_blank" rel="noreferrer">
                    <img src={r.screenshot_url} alt="proof" style={{width:120,height:100,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)',marginBottom:12,display:'block'}}/>
                  </a>
                )}
                {isPending&&(
                  <div style={{display:'flex',gap:8}}>
                    <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>handleApprove(r.id)}>✓ Approve</button>
                    <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>handleReject(r.id)}>✗ Reject</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {adRequests.length===0&&<div className="sgc-empty">No ad requests yet</div>}
      </div>
    </div>
  );
}
