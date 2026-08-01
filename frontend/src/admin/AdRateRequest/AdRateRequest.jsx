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
  const [adminNotes, setAdminNotes] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const pendingAdReqs = adRequests.filter(r => r.status === 'pending').length;

  const fetchData = async () => {
    try {
      const [reqRes, settingsRes] = await Promise.all([
        API.get('/admin/user-ad-requests'),
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
      const note = adminNotes[id] || '';
      await approveAdRequest(id, note);
      fetchData();
      if (loadData) loadData();
      if (notify) notify('Ad request approved & campaign activated live! ✅');
    } catch (e) {
      if (notify) notify('Error approving request', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const note = adminNotes[id] || '';
      await rejectAdRequest(id, note);
      fetchData();
      if (loadData) loadData();
      if (notify) notify('Ad request rejected ❌');
    } catch (e) {
      if (notify) notify('Error rejecting request', 'error');
    }
  };

  return (
    <div>
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="sgc-modal-overlay" style={{display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(5px)'}} onClick={()=>setPreviewImage(null)}>
          <div className="sgc-modal fade-up" style={{maxWidth:600,width:'92%',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:20,textAlign:'center'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h4 style={{color:'var(--accent)',margin:0,fontSize:16,fontWeight:800}}>📸 Payment Screenshot Proof</h4>
              <button onClick={()=>setPreviewImage(null)} style={{background:'transparent',border:'none',color:'var(--dim)',fontSize:22,cursor:'pointer'}}>✕</button>
            </div>
            <img src={previewImage} alt="Payment Proof" style={{maxWidth:'100%',maxHeight:'70vh',borderRadius:12,border:'1px solid var(--border)'}}/>
            <a href={previewImage} target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:12,color:'var(--yellow)',fontSize:13,fontWeight:700}}>🔗 Open Full Image in New Tab</a>
          </div>
        </div>
      )}

      <div className="sgc-page-header">
        <h2 className="sgc-heading">📢 Ad Rate & Campaign Requests</h2>
        <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{pendingAdReqs} pending requests</span>
      </div>

      <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:28}}>
        {/* Budget Rate Setting */}
        <div className="sgc-form" style={{flex:'1 1 300px',margin:0}}>
          <h4 style={{color:'var(--yellow)',fontSize:13,fontWeight:800,marginBottom:12}}>💰 Rate Per Member (Rs.)</h4>
          <div style={{display:'flex',gap:10,marginBottom:12}}>
            <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="0.1" step="0.1" value={newBudgetRate} onChange={e=>setNewBudgetRate(e.target.value)}/>
            <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{
              try {
                await updateAdBudgetRate(parseFloat(newBudgetRate), welcomeMsg);
                setAdBudgetRate(parseFloat(newBudgetRate));
                if(notify) notify('Settings updated ✅');
              } catch(e) {
                if(notify) notify('Error updating rate', 'error');
              }
            }}>Save</button>
          </div>
          <p style={{color:'var(--dim)',fontSize:12,margin:0}}>Current rate: <b style={{color:'var(--yellow)'}}>Rs. {adBudgetRate}/member</b></p>
        </div>

        {/* Min Campaign Users Setting */}
        <div className="sgc-form" style={{flex:'1 1 300px',margin:0}}>
          <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:800,marginBottom:12}}>👥 Minimum Users Per Campaign</h4>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
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
          <p style={{color:'var(--dim)',fontSize:12,margin:0}}>Min limit: <b style={{color:'var(--purple)'}}>{minCampaignUsers} users</b></p>
        </div>
      </div>

      <h3 style={{color:'var(--text)',fontSize:16,fontWeight:800,marginBottom:16}}>📋 User Campaign Requests</h3>

      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {adRequests.map(r=>{
          const isPending = r.status === 'pending';
          const isApproved = r.status === 'approved';
          const borderCol = isPending ? '#f59e0b' : isApproved ? '#10b981' : '#ef4444';
          const bgCol = isPending ? '#451a0320' : isApproved ? '#064e3b20' : '#450a0a20';

          return (
            <div key={r.id} style={{background:'var(--card)',border:`1.5px solid ${borderCol}60`,borderRadius:16,overflow:'hidden',boxShadow:'0 4px 18px rgba(0,0,0,0.3)'}}>
              
              {/* Header Bar */}
              <div style={{background:bgCol,padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}40`,flexWrap:'wrap',gap:10}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15,color:'var(--bg)',flexShrink:0}}>
                    {r.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{color:'var(--text)',fontWeight:800,fontSize:15}}>@{r.username}</span>
                      <span style={{color:'var(--dim)',fontSize:12}}>({r.email || 'No Email'})</span>
                    </div>
                    <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <span style={{background:isPending?'#451a03':isApproved?'#064e3b':'#450a0a',color:isPending?'#f59e0b':isApproved?'#4ade80':'#fca5a5',padding:'4px 14px',borderRadius:20,fontSize:11,fontWeight:900,letterSpacing:.5,border:`1px solid ${borderCol}60`}}>
                  {r.status.toUpperCase()}
                </span>
              </div>

              {/* Body */}
              <div style={{padding:'18px 22px'}}>
                <h4 style={{color:'var(--text)',fontWeight:800,fontSize:16,margin:'0 0 4px'}}>{r.title}</h4>
                <a href={r.url} target="_blank" rel="noreferrer" style={{color:'var(--yellow)',fontSize:13,wordBreak:'break-all',display:'inline-block',marginBottom:14,fontWeight:600}}>
                  🔗 {r.url}
                </a>

                {/* Info Badges */}
                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
                  <span style={{background:'#0c2847',color:'#38bdf8',border:'1px solid #0284c7',padding:'4px 12px',borderRadius:8,fontSize:12,fontWeight:700}}>
                    👥 {r.members_needed} Users Targeted
                  </span>
                  <span style={{background:'#052e16',color:'#4ade80',border:'1px solid #166534',padding:'4px 12px',borderRadius:8,fontSize:12,fontWeight:800}}>
                    💰 Total Cost: Rs. {r.total_cost}
                  </span>
                  <span style={{background:'#2d1b69',color:'#c084fc',border:'1px solid #7e22ce',padding:'4px 12px',borderRadius:8,fontSize:12,fontWeight:700,textTransform:'uppercase'}}>
                    💳 Method: {r.payment_method}
                  </span>
                </div>

                {/* Payment Proof Details */}
                <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',marginBottom:16}}>
                  <p style={{color:'var(--accent)',fontSize:12,fontWeight:800,margin:'0 0 8px',letterSpacing:.5}}>💳 PAYMENT PROOF DETAILS:</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:10,fontSize:13}}>
                    <div>
                      <span style={{color:'var(--dim)',fontWeight:600}}>Sender Name: </span>
                      <strong style={{color:'var(--text)'}}>{r.sender_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{color:'var(--dim)',fontWeight:600}}>Transaction Details / TRX ID: </span>
                      <strong style={{color:'var(--yellow)',fontFamily:'monospace'}}>{r.transaction_id || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Screenshot Thumbnail */}
                  {r.screenshot_url && (
                    <div style={{marginTop:12,borderTop:'1px solid var(--border)',paddingTop:10}}>
                      <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 6px',fontWeight:700}}>Payment Screenshot:</p>
                      <img
                        src={r.screenshot_url}
                        alt="Payment Proof"
                        onClick={()=>setPreviewImage(r.screenshot_url)}
                        style={{width:140,height:100,objectFit:'cover',borderRadius:10,border:'2px solid var(--border)',cursor:'pointer',transition:'transform .2s'}}
                      />
                    </div>
                  )}
                </div>

                {/* Admin Note Input */}
                {isPending && (
                  <div style={{marginBottom:14}}>
                    <label className="sgc-label" style={{fontSize:12}}>Admin Note (optional)</label>
                    <input
                      className="sgc-input"
                      style={{margin:0,fontSize:13}}
                      placeholder="e.g. Approved and activated / Invalid TRX ID"
                      value={adminNotes[r.id] || ''}
                      onChange={e => setAdminNotes({ ...adminNotes, [r.id]: e.target.value })}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {isPending && (
                  <div style={{display:'flex',gap:12}}>
                    <button
                      type="button"
                      style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:900,fontSize:14,fontFamily:'var(--font)',boxShadow:'0 4px 14px rgba(16,185,129,0.3)'}}
                      onClick={()=>handleApprove(r.id)}>
                      ✓ Approve & Activate Ad
                    </button>
                    <button
                      type="button"
                      style={{flex:1,padding:'12px',background:'linear-gradient(135deg,#dc2626,#ef4444)',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:900,fontSize:14,fontFamily:'var(--font)',boxShadow:'0 4px 14px rgba(239,68,68,0.3)'}}
                      onClick={()=>handleReject(r.id)}>
                      ✗ Reject Request
                    </button>
                  </div>
                )}

                {r.admin_note && (
                  <p style={{color:'var(--dim)',fontSize:12,margin:'10px 0 0',fontStyle:'italic'}}>
                    Admin Note: <span style={{color:'var(--text)'}}>{r.admin_note}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {adRequests.length===0 && <div className="sgc-empty">No ad requests submitted yet</div>}
      </div>
    </div>
  );
}
