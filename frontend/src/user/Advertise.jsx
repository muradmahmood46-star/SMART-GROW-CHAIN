import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Advertise({
  profile,
  notify,
  setTab,
  setSelectedPlan,
  loadData
}) {
  const [adRate, setAdRate] = useState(1);
  const [minCampaignUsers, setMinCampaignUsers] = useState(50);
  const [adForm, setAdForm] = useState({ title:'', url:'', members_needed:'', sender_name:'', transaction_id:'' });
  const [adPayMethod, setAdPayMethod] = useState('wallet');
  const [adScreenshot, setAdScreenshot] = useState(null);
  const [myAdRequests, setMyAdRequests] = useState([]);
  const [campaignViewers, setCampaignViewers] = useState({});
  const [epAccounts, setEpAccounts] = useState([]);

  useEffect(() => {
    API.get('/user/ad-request/rate').then(r=>{ setAdRate(r.data.rate_pkr); }).catch(()=>{});
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
    API.get('/user/settings').then(r=>{ if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50); }).catch(()=>{});
    API.get('/deposit/easypaisa-accounts').then(r=>setEpAccounts(r.data)).catch(()=>{});
  }, []);

  const fetchRequests = () => {
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
  };

  const totalCost = (parseInt(adForm.members_needed)||0) * adRate;

  return (
    <div>
      <h2 className="sgc-heading">📢 Advertise Your Link</h2>

      <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-start'}}>

        {/* LEFT: Form */}
        <div style={{flex:'1 1 320px',minWidth:0}}>
          <div className="sgc-stats" style={{maxWidth:420,marginBottom:24}}>
            <div className="sgc-stat-card"><div className="sgc-stat-label">Rate Per Member</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>Rs. {adRate}</div></div>
            <div className="sgc-stat-card"><div className="sgc-stat-label">Your Balance</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {profile.balance.toFixed(2)}</div></div>
          </div>

          <form className="sgc-form" style={{maxWidth:520}} onSubmit={async(e)=>{
            e.preventDefault();
            try{
              const fd = new FormData();
              fd.append('title', adForm.title);
              fd.append('url', adForm.url);
              if(parseInt(adForm.members_needed) < minCampaignUsers){ notify('Minimum '+minCampaignUsers+' users required per campaign','error'); return; }
              fd.append('members_needed', parseInt(adForm.members_needed));
              fd.append('payment_method', adPayMethod);
              fd.append('sender_name', adForm.sender_name||'');
              fd.append('transaction_id', adForm.transaction_id||'');
              if(adPayMethod==='easypaisa' && adScreenshot) fd.append('screenshot', adScreenshot);
              await API.post('/user/ad-request', fd, { headers:{'Content-Type':'multipart/form-data'} });
              notify('Ad request submitted! ✅');
              fetchRequests();
              if (loadData) loadData();
              setAdForm({title:'',url:'',members_needed:'',sender_name:'',transaction_id:''});
              setAdScreenshot(null);
            } catch(err){ notify(err.response?.data?.detail||'Error','error'); }
          }}>
            <label className="sgc-label">Ad Title</label>
            <input className="sgc-input" placeholder="e.g. Visit my YouTube channel" value={adForm.title} onChange={e=>setAdForm({...adForm,title:e.target.value})} required/>
            <label className="sgc-label">Ad Link (URL)</label>
            <input className="sgc-input" placeholder="https://yourlink.com" value={adForm.url} onChange={e=>setAdForm({...adForm,url:e.target.value})} required/>
            <label className="sgc-label">Members Needed</label>
            <input className="sgc-input" type="number" min="1" placeholder={`Min ${minCampaignUsers} users`} value={adForm.members_needed} onChange={e=>setAdForm({...adForm,members_needed:e.target.value})} required/>
            {adForm.members_needed>0 && (
              <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
                <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>Total Cost</p>
                <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:0}}>Rs. {(adForm.members_needed * adRate).toFixed(2)}</p>
                <p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>{adForm.members_needed} members × Rs. {adRate}/member</p>
              </div>
            )}
            <label className="sgc-label">Payment Method</label>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              {[['wallet','💳 Wallet'],['easypaisa','📱 Easypaisa'],['jazzcash','💳 JazzCash'],['bank','🏦 Bank Transfer']].map(([val,label])=>(
                <div key={val} onClick={()=>setAdPayMethod(val)}
                  style={{flex:1,padding:'10px 6px',borderRadius:10,border:`2px solid ${adPayMethod===val?'var(--accent)':'var(--border)'}`,background:adPayMethod===val?'#0d1e38':'var(--bg)',cursor:'pointer',textAlign:'center',color:adPayMethod===val?'var(--accent)':'var(--muted)',fontWeight:700,fontSize:12,transition:'all .2s'}}>
                  {label}
                </div>
              ))}
            </div>
            {adPayMethod==='wallet' && profile.balance < totalCost && (
              <div style={{background:'#451a03',border:'1.5px solid #f59e0b',borderRadius:12,padding:'18px 20px',marginBottom:16}}>
                <p style={{color:'#fbbf24',fontSize:14,fontWeight:700,margin:'0 0 10px'}}>⚠️ Insufficient Wallet Balance</p>
                <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 14px'}}>You need Rs. {(totalCost - profile.balance).toFixed(2)} more to advertise.</p>
                <button type="button" onClick={()=>setTab('transfer')} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'var(--bg)',border:'none',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)'}}>💳 Go to Deposit Section</button>
              </div>
            )}

            {(adPayMethod==='easypaisa'||adPayMethod==='jazzcash') && (
              <>
                {epAccounts.filter(a=>a.method_type===adPayMethod).slice(0,1).map(a=>(
                  <div key={a.id} style={{background:'#071a0d',border:'1.5px solid #3cb55940',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                    <p style={{color:'#3cb559',fontSize:11,fontWeight:700,margin:'0 0 10px',letterSpacing:.5}}>{adPayMethod==='jazzcash'?'💳':'📱'} SEND TO THIS {adPayMethod.toUpperCase()} ACCOUNT</p>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:8,background:'#3cb559',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📱</div>
                      <div>
                        <p style={{color:'#fff',fontWeight:800,fontSize:14,margin:0,textShadow:'0 1px 2px rgba(0,0,0,.5)'}}>{a.account_title}</p>
                        <p style={{color:'var(--dim)',fontSize:11,margin:0}}>Account Name</p>
                      </div>
                    </div>
                    <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Account Number</p>
                        <p style={{color:'#3cb559',fontFamily:'monospace',fontSize:16,fontWeight:800,letterSpacing:1,margin:0}}>{a.account_number}</p>
                      </div>
                      <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Number copied! 📋');}} style={{background:'#3cb55922',border:'1px solid #3cb559',color:'#3cb559',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>Copy</button>
                    </div>
                  </div>
                ))}
                <label className="sgc-label">Payment Screenshot</label>
                <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setAdScreenshot(e.target.files[0])}/>
                  {adScreenshot?<p style={{color:'var(--green)',margin:0}}>✓ {adScreenshot.name}</p>:<p style={{color:'var(--dim)',margin:0}}>📸 Click to upload screenshot</p>}
                </label>
              </>
            )}
            {adPayMethod==='bank' && (
              <>
                {epAccounts.filter(a=>a.method_type==='bank').slice(0,1).map(a=>(
                  <div key={a.id} style={{background:'#0a1628',border:'1.5px solid #3b82f640',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                    <p style={{color:'#3b82f6',fontSize:11,fontWeight:700,margin:'0 0 10px',letterSpacing:.5}}>🏦 SEND TO THIS BANK ACCOUNT</p>
                    <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',marginBottom:8}}>
                      <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Bank Name</p>
                      <p style={{color:'#3b82f6',fontWeight:700,fontSize:14,margin:0}}>{a.bank_name||a.account_title}</p>
                    </div>
                    <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',marginBottom:8}}>
                      <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Account Title (Name)</p>
                      <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>{a.account_title}</p>
                    </div>
                    <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Bank / IBAN Account Number</p>
                        <p style={{color:'#3b82f6',fontFamily:'monospace',fontSize:15,fontWeight:800,letterSpacing:1,margin:0}}>{a.account_number}</p>
                      </div>
                      <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'#3b82f622',border:'1px solid #3b82f6',color:'#3b82f6',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>Copy</button>
                    </div>
                  </div>
                ))}
                <label className="sgc-label">Payment Screenshot</label>
                <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setAdScreenshot(e.target.files[0])}/>
                  {adScreenshot?<p style={{color:'var(--green)',margin:0}}>✓ {adScreenshot.name}</p>:<p style={{color:'var(--dim)',margin:0}}>📸 Click to upload screenshot</p>}
                </label>
              </>
            )}
            {adPayMethod!=='wallet' && (
              <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:14,marginBottom:16}}>
                <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,margin:'0 0 10px'}}>PAYMENT DETAILS</p>
                <label className="sgc-label">Amount Sent</label>
                <input className="sgc-input" value={adForm.members_needed ? `Rs. ${(adForm.members_needed*adRate).toFixed(2)}` : ''} readOnly/>
                <label className="sgc-label">Send By (your name)</label>
                <input className="sgc-input" value={adForm.sender_name||''} onChange={e=>setAdForm({...adForm,sender_name:e.target.value})} required/>
                <label className="sgc-label">Transaction ID / Sender Number</label>
                <input className="sgc-input" value={adForm.transaction_id||''} onChange={e=>setAdForm({...adForm,transaction_id:e.target.value})} required/>
              </div>
            )}
            <button className="sgc-btn-primary" type="submit" disabled={adPayMethod==='wallet' && profile.balance < totalCost} style={{opacity:adPayMethod==='wallet' && profile.balance < totalCost?0.5:1}}>📢 Submit Ad Request</button>
          </form>
        </div>

        {/* RIGHT: My Campaigns */}
        <div style={{flex:'1 1 380px',minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h3 style={{color:'var(--text)',fontWeight:800,fontSize:16,margin:0}}>📁 My Campaigns</h3>
            <span style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--dim)',padding:'3px 12px',borderRadius:20,fontSize:12}}>{myAdRequests.length} total</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {myAdRequests.map((r,i)=>{
              const reached = r.members_reached||0;
              const pct = r.members_needed>0?Math.min((reached/r.members_needed)*100,100):0;
              const isApproved=r.status==='approved';
              const isCompleted=r.status==='completed';
              const isRejected=r.status==='rejected';
              const isPending=r.status==='pending';
              const canReactivate = r.can_reactivate ?? (isRejected||isCompleted);
              const accentCol = isApproved?'#4ade80':isCompleted?'#38bdf8':isRejected?'#f87171':'#fbbf24';
              const borderCol = isApproved?'#22c55e50':isCompleted?'#1e4080':isRejected?'#7f1d1d':'#92400e';
              const bgCol    = isApproved?'#0d3d20':isCompleted?'#0c1e3e':isRejected?'#1c0a0a':'#1c1000';
              return (
                <div key={i} style={{background:bgCol,border:`1.5px solid ${borderCol}`,borderRadius:16,overflow:'hidden',animation:'fadeUp .3s ease both'}}>
                  {/* Header */}
                  <div style={{padding:'14px 16px',borderBottom:`1px solid ${borderCol}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{color:'var(--text)',fontWeight:800,fontSize:15,margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.title}</p>
                      <p style={{color:'var(--dim)',fontSize:11,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🔗 {r.url}</p>
                    </div>
                    <span style={{background:isApproved?'#064e3b':isCompleted?'#1e3a6e':isRejected?'#450a0a':'#451a03',color:accentCol,padding:'4px 14px',borderRadius:20,fontSize:12,fontWeight:800,flexShrink:0,whiteSpace:'nowrap'}}>
                      {isApproved?'✅ ACTIVE':isCompleted?'🏁 DONE':isRejected?'❌ REJECTED':'⏳ Processing'}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0,borderBottom:`1px solid ${borderCol}`}}>
                    {[
                      ['👥','Members',`${reached}/${r.members_needed}`],
                      ['💰','Cost',`Rs.${r.total_cost}`],
                      ['📊','Progress',`${pct.toFixed(0)}%`],
                    ].map(([icon,label,val],si)=>(
                      <div key={si} style={{padding:'12px 10px',textAlign:'center',borderRight:si<2?`1px solid ${borderCol}`:'none'}}>
                        <p style={{fontSize:18,margin:'0 0 2px'}}>{icon}</p>
                        <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600}}>{label}</p>
                        <p style={{color:accentCol,fontSize:13,fontWeight:800,margin:0}}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div style={{padding:'12px 16px',borderBottom:`1px solid ${borderCol}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{color:'var(--dim)',fontSize:11,fontWeight:600}}>CAMPAIGN PROGRESS</span>
                      <span style={{color:accentCol,fontSize:11,fontWeight:800}}>{reached} of {r.members_needed} reached</span>
                    </div>
                    <div style={{height:16,background:'#0b1120',borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:`linear-gradient(90deg,${accentCol},${isCompleted?'#818cf8':isApproved?'#86efac':'#fde68a'})`,borderRadius:8,transition:'width .6s ease',boxShadow:`0 0 12px ${accentCol}99`}}/>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:10}}>
                    {/* Viewers Button */}
                    {(isApproved||isCompleted) && (
                      <button onClick={async()=>{
                        if(campaignViewers[r.id]!==undefined){ setCampaignViewers(p=>({...p,[r.id]:undefined})); return; }
                        try{
                          const res=await fetch(`/api/user/ad-request/viewers/${r.id}`, { headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`} });
                          const data = await res.json();
                          setCampaignViewers(p=>({...p,[r.id]:data}));
                        }catch{ notify('Could not load viewers','error'); }
                      }} style={{width:'100%',padding:'12px',background:campaignViewers[r.id]!==undefined?'#1e3a6e':'#0f2a4a',border:`1.5px solid #38bdf8`,borderRadius:10,color:'#38bdf8',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
                        <span style={{fontSize:18}}>👥</span>
                        {campaignViewers[r.id]!==undefined?'Hide Viewers':'View Who Watched My Ad'}
                        {campaignViewers[r.id]&&<span style={{background:'#38bdf8',color:'#0b1120',borderRadius:20,padding:'1px 8px',fontSize:11,fontWeight:800}}>{campaignViewers[r.id].length}</span>}
                      </button>
                    )}

                    {/* Reactivate Button */}
                    <button disabled={!canReactivate} onClick={async()=>{
                        if(!canReactivate){ notify(r.reactivate_message || 'Campaign can be reactivated after it is completed or rejected.','error'); return; }
                        notify('Campaign reactivated! 🚀');
                      }} style={{width:'100%',padding:'13px',background:canReactivate?'linear-gradient(135deg,#7c3aed,#6d28d9)':'#1f2937',border:`1px solid ${canReactivate?'transparent':'var(--border)'}`,borderRadius:10,color:canReactivate?'#fff':'var(--dim)',fontWeight:700,fontSize:14,cursor:canReactivate?'pointer':'not-allowed',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:canReactivate?'0 2px 12px rgba(124,58,237,.35)':'none',opacity:canReactivate?1:.8}}>
                      <span style={{fontSize:18}}>🔄</span> {canReactivate?'Reactivate Campaign':'Reactivate after completion'}
                    </button>

                    {r.admin_note&&(
                      <div style={{background:'#1c1500',border:'1px solid #92400e',borderRadius:8,padding:'8px 12px',display:'flex',gap:8,alignItems:'flex-start'}}>
                        <span style={{fontSize:14,flexShrink:0}}>💬</span>
                        <p style={{color:'#fbbf24',fontSize:12,margin:0,fontWeight:600}}>Admin: {r.admin_note}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {myAdRequests.length===0&&(
              <div style={{background:'var(--card)',border:'1px dashed var(--border)',borderRadius:16,padding:'36px 20px',textAlign:'center'}}>
                <p style={{fontSize:36,margin:'0 0 10px'}}>📢</p>
                <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:'0 0 6px'}}>No Campaigns Yet</p>
                <p style={{color:'var(--dim)',fontSize:13,margin:0}}>Create your first campaign using the form on the left!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}