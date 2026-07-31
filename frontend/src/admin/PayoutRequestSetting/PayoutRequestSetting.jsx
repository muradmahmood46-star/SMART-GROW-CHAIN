/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';
import { updateWithdrawToggle, updateWithdrawDuration, updateWithdrawSchedule, getWithdrawSettings } from '../../services/admin/adminService';

export default function PayoutRequestSetting({ notify, loadData }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawSettings, setWithdrawSettings] = useState({ withdraw_enabled: true });
  const [withdrawHours, setWithdrawHours] = useState(1);
  const [schedOnTime, setSchedOnTime] = useState('');
  const [schedOnAmPm, setSchedOnAmPm] = useState('AM');
  const [schedOffTime, setSchedOffTime] = useState('');
  const [schedOffAmPm, setSchedOffAmPm] = useState('PM');
  const [payoutScreenshots, setPayoutScreenshots] = useState({});

  const pendingW = withdrawals.filter(w => w.status === 'pending').length;

  const fetchData = async () => {
    try {
      const wRes = await API.get('/admin/withdrawals');
      setWithdrawals(wRes.data);
      const sRes = await API.get('/admin/withdraw-settings');
      setWithdrawSettings(sRes.data);
      if (sRes.data.withdraw_schedule_time) {
        const [onPart, offPart] = sRes.data.withdraw_schedule_time.split('|');
        if (onPart) { setSchedOnTime(onPart.split(' ')[0]); setSchedOnAmPm(onPart.split(' ')[1]); }
        if (offPart) { setSchedOffTime(offPart.split(' ')[0]); setSchedOffAmPm(offPart.split(' ')[1]); }
      }
    } catch (e) {
      console.error(e);
      if (notify) notify('Error loading payout data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showWithdrawSettingsError = (err) => {
    if (notify) notify(err.response?.data?.detail || 'Settings error', 'error');
  };

  const approveW = async (id) => {
    try {
      await API.put(`/admin/withdrawals/${id}/approve`);
      fetchData();
      if (loadData) loadData();
      if (notify) notify('Withdrawal approved ✅');
    } catch (e) {
      if (notify) notify('Error approving', 'error');
    }
  };

  const rejectW = async (id) => {
    try {
      await API.put(`/admin/withdrawals/${id}/reject`);
      fetchData();
      if (loadData) loadData();
      if (notify) notify('Withdrawal rejected');
    } catch (e) {
      if (notify) notify('Error rejecting', 'error');
    }
  };

  const markSentW = async (id) => {
    const file = payoutScreenshots[id];
    if (!file) {
      if (notify) notify('Please upload payment screenshot first', 'error');
      return;
    }
    try {
      const form = new FormData();
      form.append('screenshot', file);
      await API.post(`/admin/withdrawals/${id}/mark-sent`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPayoutScreenshots(prev => { const n = {...prev}; delete n[id]; return n; });
      fetchData();
      if (loadData) loadData();
      if (notify) notify('Marked as sent ✅');
    } catch (e) {
      if (notify) notify('Error marking sent', 'error');
    }
  };

  

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">💸 Payout Request & Setting</h2>
        <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{pendingW} pending</span>
      </div>

      {/* Withdraw Toggle Controls */}
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'20px 24px',marginBottom:24}}>
        <h4 style={{color:'var(--yellow)',fontSize:14,fontWeight:700,marginBottom:16}}>⚙️ Withdraw Access Control</h4>
        
        {/* Current Status */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,padding:'12px 16px',background:withdrawSettings.withdraw_enabled?'#052e16':'#450a0a',border:`1px solid ${withdrawSettings.withdraw_enabled?'#166534':'#7f1d1d'}`,borderRadius:12}}>
          <div style={{width:12,height:12,borderRadius:'50%',background:withdrawSettings.withdraw_enabled?'#4ade80':'#ef4444',boxShadow:`0 0 8px ${withdrawSettings.withdraw_enabled?'#4ade80':'#ef4444'}`}}/>
          <span style={{color:withdrawSettings.withdraw_enabled?'#4ade80':'#fca5a5',fontWeight:700,fontSize:14}}>
            Withdraw is currently {withdrawSettings.withdraw_enabled?'OPEN':'CLOSED'}
          </span>
          {withdrawSettings.withdraw_until && (
            <span style={{color:'var(--dim)',fontSize:12,marginLeft:'auto'}}>
              Auto-closes: {new Date(withdrawSettings.withdraw_until).toLocaleString('en-PK',{timeZone:'Asia/Karachi'})}
            </span>
          )}
          {withdrawSettings.withdraw_schedule_time && (
            <span style={{color:'var(--accent)',fontSize:12,marginLeft:'auto'}}>
              Scheduled: {withdrawSettings.withdraw_schedule_time} PKT daily
            </span>
          )}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
          {/* A: Manual Toggle */}
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12,padding:'16px'}}>
            <p style={{color:'var(--text)',fontWeight:700,fontSize:13,margin:'0 0 4px'}}>A. Manual ON/OFF</p>
            <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 14px'}}>Instantly enable or disable withdraw for all users</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={async()=>{
                try {
                  await updateWithdrawToggle(true);
                  setWithdrawSettings(s=>({...s,withdraw_enabled:true,withdraw_until:''}));
                  if (notify) notify('Withdraw ENABLED ✅');
                } catch (error) { showWithdrawSettingsError(error); }
              }} style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)',opacity:withdrawSettings.withdraw_enabled?0.5:1}}>
                ✓ Turn ON
              </button>
              <button onClick={async()=>{
                try {
                  await updateWithdrawToggle(false);
                  setWithdrawSettings(s=>({...s,withdraw_enabled:false,withdraw_until:''}));
                  if (notify) notify('Withdraw DISABLED 🔒');
                } catch (error) { showWithdrawSettingsError(error); }
              }} style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)',opacity:!withdrawSettings.withdraw_enabled?0.5:1}}>
                ✕ Turn OFF
              </button>
            </div>
          </div>

          {/* B: Duration-Based */}
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12,padding:'16px'}}>
            <p style={{color:'var(--text)',fontWeight:700,fontSize:13,margin:'0 0 4px'}}>B. Auto-Enable by Duration</p>
            <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 14px'}}>Turn ON for custom hours, then auto-OFF</p>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input type="number" min="1" max="720" value={withdrawHours} onChange={e=>setWithdrawHours(parseInt(e.target.value)||1)}
                style={{flex:1,background:'var(--card)',border:'1px solid var(--border)',borderRadius:9,color:'var(--text)',padding:'9px 12px',fontFamily:'var(--font)',fontSize:14,fontWeight:700}}/>
              <span style={{color:'var(--dim)',fontSize:13,alignSelf:'center',whiteSpace:'nowrap'}}>hour(s)</span>
            </div>
            <div style={{display:'flex',gap:6,marginBottom:8}}>
              {[1,2,3,6,12].map(h=>(
                <button key={h} onClick={()=>setWithdrawHours(h)}
                  style={{flex:1,padding:'6px 2px',background:withdrawHours===h?'#1e3a6e':'var(--card)',color:withdrawHours===h?'var(--accent)':'var(--dim)',border:`1px solid ${withdrawHours===h?'#1e4080':'var(--border)'}`,borderRadius:7,cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'var(--font)'}}>
                  {h}h
                </button>
              ))}
            </div>
            <button onClick={async()=>{
              try {
                await updateWithdrawDuration(withdrawHours);
                const response = await getWithdrawSettings();
                setWithdrawSettings(response.data);
                if (notify) notify(`Withdraw ON for ${withdrawHours} hour(s) ⏱️`);
              } catch (error) { showWithdrawSettingsError(error); }
            }} style={{width:'100%',padding:'10px',background:'#1e3a6e',color:'var(--accent)',border:'1px solid #1e4080',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}}>
              ⏱️ Enable for {withdrawHours}h
            </button>
          </div>

          {/* C: Scheduled Time */}
          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12,padding:'16px'}}>
            <p style={{color:'var(--text)',fontWeight:700,fontSize:13,margin:'0 0 4px'}}>C. Schedule Daily Time (PKT)</p>
            <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 12px'}}>Set ON & OFF time — runs daily</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{color:'#4ade80',fontSize:12,fontWeight:700,minWidth:32}}>ON</span>
                <input type="time" value={schedOnTime} onChange={e=>setSchedOnTime(e.target.value)}
                  style={{flex:1,background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',padding:'8px 10px',fontFamily:'var(--font)',fontSize:13}}/>
                <select value={schedOnAmPm} onChange={e=>setSchedOnAmPm(e.target.value)}
                  style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',padding:'8px',fontFamily:'var(--font)',fontSize:13}}>
                  <option>AM</option><option>PM</option>
                </select>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{color:'#fca5a5',fontSize:12,fontWeight:700,minWidth:32}}>OFF</span>
                <input type="time" value={schedOffTime} onChange={e=>setSchedOffTime(e.target.value)}
                  style={{flex:1,background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',padding:'8px 10px',fontFamily:'var(--font)',fontSize:13}}/>
                <select value={schedOffAmPm} onChange={e=>setSchedOffAmPm(e.target.value)}
                  style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',padding:'8px',fontFamily:'var(--font)',fontSize:13}}>
                  <option>AM</option><option>PM</option>
                </select>
              </div>
              <button onClick={async()=>{
                if(!schedOnTime||!schedOffTime){ if (notify) notify('Please set both ON and OFF time','error'); return; }
                const val=`${schedOnTime} ${schedOnAmPm}|${schedOffTime} ${schedOffAmPm}`;
                try {
                  await updateWithdrawSchedule(val);
                  setWithdrawSettings(s=>({...s,withdraw_schedule_time:val}));
                  if (notify) notify('Schedule saved ✅');
                } catch (error) { showWithdrawSettingsError(error); }
              }} style={{padding:'10px',background:'#1e3a6e',color:'var(--accent)',border:'1px solid #1e4080',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}}>
                💾 Save Schedule
              </button>
              {withdrawSettings.withdraw_schedule_time && (
                <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:8,padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'var(--accent)',fontSize:12,fontWeight:700}}>
                    🟢 {withdrawSettings.withdraw_schedule_time.split('|')[0]||'—'} → 🔴 {withdrawSettings.withdraw_schedule_time.split('|')[1]||'—'}
                  </span>
                  <button onClick={async()=>{
                    try {
                      await updateWithdrawSchedule('');
                      setWithdrawSettings(s=>({...s,withdraw_schedule_time:''}));
                      setSchedOnTime(''); setSchedOffTime('');
                      if (notify) notify('Schedule cleared');
                    } catch (error) { showWithdrawSettingsError(error); }
                  }} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>✕ Clear</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payout Requests List */}
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {withdrawals.map(w=>{
          const isPending=w.status==='pending';
          const isApproved=w.status==='approved';
          const isSent=w.status==='sent';
          const isRejected=w.status==='rejected';
          const borderCol=isPending?'#f59e0b':isApproved||isSent?'#3cb559':isRejected?'#ef4444':'#334155';
          return (
            <div key={w.id} className="fade-in" style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
              {/* Header */}
              <div style={{background:isPending?'#451a0320':isApproved||isSent?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--purple),#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'#fff',flexShrink:0}}>
                    {w.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{w.username}</p>
                    <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(w.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span style={{background:isPending?'#451a03':isApproved?'#064e3b':isSent?'#1e3a6e':isRejected?'#450a0a':'#334155',color:isPending?'#f59e0b':isApproved?'#4ade80':isSent?'#38bdf8':'#fca5a5',padding:'3px 14px',borderRadius:20,fontSize:11,fontWeight:700}}>
                  {isSent?'✈️ SENT':w.status.toUpperCase()}
                </span>
              </div>

              <div style={{display:'flex',flexWrap:'wrap',gap:0}}>
                {/* Left: details */}
                <div style={{flex:'1 1 260px',padding:'16px 20px'}}>
                  {/* Withdraw Amount */}
                  <div style={{marginBottom:14}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>WITHDRAWAL AMOUNT</p>
                    <p style={{color:'var(--green)',fontSize:28,fontWeight:800,margin:0,fontFamily:'monospace'}}>Rs. {w.amount.toFixed(2)}</p>
                  </div>
                  {/* User balance */}
                  <div style={{background:'var(--bg)',borderRadius:9,padding:'8px 14px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>USER TOTAL BALANCE</p>
                      <p style={{color:'var(--yellow)',fontWeight:700,fontSize:15,margin:0}}>Rs. {(w.user_balance||0).toFixed(2)}</p>
                    </div>
                    <span className="sgc-badge" style={{background:'#1e3a6e',color:'var(--accent)',fontSize:10}}>{w.user_membership||'free'}</span>
                  </div>
                  {/* Method */}
                  <div style={{background:'var(--bg)',borderRadius:9,padding:'8px 14px',marginBottom:10}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>PAYMENT METHOD</p>
                    <p style={{color:'var(--accent)',fontWeight:700,fontSize:14,margin:0,textTransform:'capitalize'}}>{w.method}</p>
                  </div>
                  <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:9,padding:'10px 14px',marginBottom:14}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 4px',fontWeight:600,letterSpacing:.5}}>ACCOUNT NUMBER</p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                      <p style={{color:'#38bdf8',fontFamily:'monospace',fontSize:20,fontWeight:800,margin:0,letterSpacing:1}}>{w.wallet_address}</p>
                      <button onClick={()=>{navigator.clipboard.writeText(w.wallet_address);if (notify) notify('Copied! 📋');}} style={{background:'#1e4080',border:'1px solid #38bdf8',color:'#38bdf8',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)',whiteSpace:'nowrap',flexShrink:0}}>📋 Copy</button>
                    </div>
                  </div>
                  {/* Actions */}
                  {isApproved&&(
                    <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:9,padding:'12px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:8}}>
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setPayoutScreenshots(prev=>({...prev,[w.id]:e.target.files[0]}))}/>
                      <span style={{color:payoutScreenshots[w.id]?'var(--green)':'var(--dim)',fontSize:12,fontWeight:700}}>
                        {payoutScreenshots[w.id]?`Selected: ${payoutScreenshots[w.id].name}`:'Upload sent transaction screenshot'}
                      </span>
                    </label>
                  )}
                  {w.payout_screenshot_url&&(
                    <a href={w.payout_screenshot_url} target="_blank" rel="noreferrer" style={{display:'inline-block',marginBottom:8,color:'var(--accent)',fontSize:12,fontWeight:700,textDecoration:'none'}}>
                      View sent screenshot
                    </a>
                  )}
                  {isPending&&(
                    <div style={{display:'flex',gap:8}}>
                      <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>approveW(w.id)}>✓ Approve</button>
                      <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>rejectW(w.id)}>✗ Reject</button>
                    </div>
                  )}
                  {isApproved&&(
                    <button style={{width:'100%',padding:'10px',background:'#1e3a6e',color:'#38bdf8',border:'1px solid #1e4080',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>markSentW(w.id)}>✈️ Mark as Sent</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {withdrawals.length===0&&<div className="sgc-empty">No payout requests</div>}
      </div>
    </div>
  );
}