/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Advertise({
  profile,
  notify,
  setTab,
  setSelectedPlan,
  loadData,
  advertiserMsg: initialAdvertiserMsg
}) {
  const [adRate, setAdRate] = useState(1);
  const [minCampaignUsers, setMinCampaignUsers] = useState(50);
  const [adForm, setAdForm] = useState({ title:'', url:'', members_needed:'', sender_name:'', transaction_id:'' });
  const [adPayMethod, setAdPayMethod] = useState('wallet');
  const [adScreenshot, setAdScreenshot] = useState(null);
  const [myAdRequests, setMyAdRequests] = useState([]);
  const [campaignViewers, setCampaignViewers] = useState({});
  const [epAccounts, setEpAccounts] = useState([]);
  const [advertiserMsg, setAdvertiserMsg] = useState(initialAdvertiserMsg || '');
  const [hasAcceptedMsg, setHasAcceptedMsg] = useState(false);

  useEffect(() => {
    API.get('/user/ad-request/rate').then(r=>{ setAdRate(r.data.rate_pkr); }).catch(()=>{});
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
    API.get('/user/settings').then(r=>{
      if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50);
      if(r.data.advertiser_message) setAdvertiserMsg(r.data.advertiser_message);
    }).catch(()=>{});
    API.get('/deposit/easypaisa-accounts').then(r=>setEpAccounts(r.data)).catch(()=>{});
  }, []);

  const fetchRequests = () => {
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
  };

  const totalCost = (parseInt(adForm.members_needed)||0) * adRate;

  return (
    <div>
      {!hasAcceptedMsg && advertiserMsg && (
        <div className="sgc-modal-overlay" style={{display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.78)',backdropFilter:'blur(5px)'}}>
          <div className="sgc-modal fade-up" style={{textAlign:'left',maxWidth:540,width:'92%',maxHeight:'85vh',display:'flex',flexDirection:'column',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:'28px 24px',boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}}>
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:44,marginBottom:8}}>📢</div>
              <h3 style={{color:'var(--accent)',fontSize:20,fontWeight:800,margin:'0 0 6px'}}>Advertiser Guidelines & Rules</h3>
              <p style={{color:'var(--dim)',fontSize:12,margin:0,fontWeight:600}}>Please read the instructions carefully before creating your advertisement campaign.</p>
            </div>
            <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px',marginBottom:22,overflowY:'auto',maxHeight:320,lineHeight:1.8}}>
              <p style={{color:'var(--text)',fontSize:13,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',fontWeight:600}}>{advertiserMsg}</p>
            </div>
            <button className="sgc-btn-primary" style={{width:'100%',padding:'14px',fontSize:15,fontWeight:800,borderRadius:12,cursor:'pointer'}} onClick={()=>setHasAcceptedMsg(true)}>
              Continue to Advertise →
            </button>
          </div>
        </div>
      )}

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
                    <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 4px'}}>Send Rs. {totalCost} to this account:</p>
                    <p style={{color:'var(--yellow)',fontWeight:800,fontSize:16,margin:'0 0 2px'}}>{a.account_title}</p>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <p style={{color:'var(--text)',fontFamily:'monospace',fontSize:18,fontWeight:900,margin:0}}>{a.account_number}</p>
                      <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--yellow)',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'var(--font)'}}>Copy</button>
                    </div>
                  </div>
                ))}
                <label className="sgc-label">Sender Name</label>
                <input className="sgc-input" placeholder="Name on Easypaisa/JazzCash account" value={adForm.sender_name} onChange={e=>setAdForm({...adForm,sender_name:e.target.value})} required/>
                <label className="sgc-label">Transaction ID (TRX ID)</label>
                <input className="sgc-input" placeholder="e.g. 23849102391" value={adForm.transaction_id} onChange={e=>setAdForm({...adForm,transaction_id:e.target.value})} required/>
                <label className="sgc-label">Payment Screenshot</label>
                <input type="file" accept="image/*" onChange={e=>setAdScreenshot(e.target.files[0])} style={{marginBottom:16}}/>
              </>
            )}

            <button type="submit" className="sgc-btn-primary" style={{width:'100%',marginTop:8}}>
              🚀 Submit Ad Request (Rs. {totalCost.toFixed(2)})
            </button>
          </form>
        </div>

        {/* RIGHT: My Campaign Status */}
        <div style={{flex:'1 1 340px',minWidth:0}}>
          <h3 style={{color:'var(--accent)',fontSize:16,fontWeight:800,margin:'0 0 16px'}}>📊 My Ad Campaigns</h3>
          {myAdRequests.length===0 ? (
            <div className="sgc-empty">No ad campaigns submitted yet</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {myAdRequests.map(req => {
                const statusCol = req.status==='approved'?'#4ade80':req.status==='rejected'?'#fca5a5':'#f59e0b';
                const statusBg  = req.status==='approved'?'#064e3b':req.status==='rejected'?'#450a0a':'#451a03';
                const pct = req.members_needed>0 ? Math.round((req.views_count/req.members_needed)*100) : 0;
                const isViewersOpen = Boolean(campaignViewers[req.id]);

                const toggleViewers = async (reqId) => {
                  if (isViewersOpen) {
                    setCampaignViewers(prev => ({ ...prev, [reqId]: null }));
                  } else {
                    try {
                      const r = await API.get(`/user/ad-request/${reqId}/viewers`);
                      setCampaignViewers(prev => ({ ...prev, [reqId]: r.data }));
                    } catch (e) {
                      notify('Failed to load viewers list', 'error');
                    }
                  }
                };

                return (
                  <div key={req.id} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,marginBottom:8}}>
                      <h4 style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0,wordBreak:'break-all'}}>{req.title}</h4>
                      <span style={{background:statusBg,color:statusCol,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:800,flexShrink:0,textTransform:'uppercase'}}>
                        {req.status}
                      </span>
                    </div>

                    <a href={req.url} target="_blank" rel="noreferrer" style={{color:'var(--yellow)',fontSize:12,wordBreak:'break-all',display:'inline-block',marginBottom:12}}>
                      🔗 {req.url}
                    </a>

                    <div style={{background:'var(--bg)',borderRadius:10,padding:'10px 14px',marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
                        <span style={{color:'var(--dim)'}}>Views Completed:</span>
                        <span style={{color:'var(--green)',fontWeight:800}}>{req.views_count} / {req.members_needed}</span>
                      </div>
                      <div style={{width:'100%',height:8,background:'var(--card)',borderRadius:4,overflow:'hidden'}}>
                        <div style={{width:`${Math.min(100,pct)}%`,height:'100%',background:'linear-gradient(90deg,var(--green),var(--accent))',borderRadius:4,transition:'width .4s ease'}}/>
                      </div>
                    </div>

                    {req.status === 'approved' && (
                      <div style={{marginTop:10}}>
                        <button
                          type="button"
                          onClick={() => toggleViewers(req.id)}
                          style={{background:'#0d1e38',border:'1px solid #1e4080',color:'#38bdf8',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',width:'100%',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                          👥 View Campaign Viewers ({req.views_count}) {isViewersOpen ? '▲' : '▼'}
                        </button>

                        {isViewersOpen && (
                          <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 14px',marginTop:10,maxHeight:220,overflowY:'auto'}}>
                            <p style={{color:'var(--dim)',fontSize:11,fontWeight:700,margin:'0 0 8px',letterSpacing:.5}}>USERS WHO VIEWED YOUR AD:</p>
                            {campaignViewers[req.id] && campaignViewers[req.id].length > 0 ? (
                              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                {campaignViewers[req.id].map((v, i) => (
                                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,borderBottom:'1px solid var(--border)',paddingBottom:4}}>
                                    <span style={{color:'var(--text)',fontWeight:600}}>@{v.username}</span>
                                    <span style={{color:'var(--dim)',fontSize:10}}>{new Date(v.viewed_at).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{color:'var(--dim)',fontSize:12,margin:0}}>No viewers recorded yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {req.admin_note && (
                      <p style={{color:'var(--red)',fontSize:11,margin:'8px 0 0',fontStyle:'italic'}}>
                        Note: {req.admin_note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}