import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../panel.css';

const TABS = [
  { key:'dashboard',    icon:'🏠', label:'Dashboard'       },
  { key:'ads',          icon:'📺', label:'Advertisement'   },
  { key:'transfer',     icon:'📲', label:'Deposit'         },
  { key:'fund-history', icon:'📂', label:'Fund History'    },
  { key:'payout',       icon:'💸', label:'Payout'          },
  { key:'payout-hist',  icon:'📋', label:'Payout History'  },
  { key:'send-funds',   icon:'🔄', label:'Send Funds'      },
  { key:'plans',        icon:'🏆', label:'Membership Plans' },
  { key:'referral',     icon:'👥', label:'My Referral'     },
  { key:'transactions', icon:'📊', label:'All Transaction' },
  { key:'ref-bonus',    icon:'🎁', label:'Referral Bonus'  },
  { key:'create-ad',   icon:'📢', label:'Advertise'       },
  { key:'support',      icon:'🎫', label:'Support Ticket'  },
  { key:'kyc',          icon:'🪪', label:'KYC Verification'},
  { key:'2fa',          icon:'🔐', label:'2FA Security'    },
];

export default function Dashboard() {
  const [profile, setProfile]         = useState(null);
  const [ads, setAds]                 = useState([]);
  const [earnings, setEarnings]       = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [referrals, setReferrals]     = useState(null);
  const [refBonus, setRefBonus]       = useState(null);
  const [epAccounts, setEpAccounts]   = useState([]);
  const [myDeposits, setMyDeposits]   = useState([]);
  const [transfers, setTransfers]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tickets, setTickets]         = useState([]);
  const [plans, setPlans]             = useState([]);
  const [twoFA, setTwoFA]             = useState(null);
  const [adRate, setAdRate]           = useState(1);
  const [kycData, setKycData]         = useState(null);
  const [kycForm, setKycForm]         = useState({ first_name:'', last_name:'', phone:'', cnic:'' });
  const [kycFront, setKycFront]       = useState(null);
  const [kycSelfie, setKycSelfie]     = useState(null);
  const [freePlanExpired, setFreePlanExpired] = useState(false);
  const [freePlanDaysLeft, setFreePlanDaysLeft] = useState(null);
  const [adWelcomeMsg, setAdWelcomeMsg] = useState('');
  const [showAdWelcome, setShowAdWelcome] = useState(false);
  const [campaignViewers, setCampaignViewers] = useState({});
  const [siteSettings, setSiteSettings] = useState({});
  const [adForm, setAdForm]           = useState({ title:'', url:'', members_needed:'' });
  const [adPayMethod, setAdPayMethod] = useState('wallet');
  const [adScreenshot, setAdScreenshot] = useState(null);
  const [myAdRequests, setMyAdRequests] = useState([]);
  const [planPayMethod, setPlanPayMethod] = useState('wallet');
  const [planScreenshot, setPlanScreenshot] = useState(null);
  const [planSenderName, setPlanSenderName] = useState('');
  const [planSenderPhone, setPlanSenderPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [myPlanPurchases, setMyPlanPurchases] = useState([]);
  const [tab, setTab]                 = useState('dashboard');
  const [activeAd, setActiveAd]       = useState(null);
  const [countdown, setCountdown]     = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [deposit, setDeposit]           = useState({ amount_pkr:'', easypaisa_account_id:'', sender_name:'', transaction_id:'', screenshot_note:'' });
  const [screenshot, setScreenshot]     = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [withdraw, setWithdraw]       = useState({ amount:'', method:'easypaisa', wallet_address:'' });
  const [transfer, setTransfer]       = useState({ receiver_username:'', amount:'', note:'' });
  const [ticket, setTicket]           = useState({ subject:'', message:'' });
  const [faCode, setFaCode]           = useState('');
  const [showAllTx, setShowAllTx] = useState(false);
  const [msg, setMsg]                 = useState({ text:'', type:'' });
  const navigate = useNavigate();

  const notify = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };

  const loadData = useCallback(() => {
    API.get('/user/profile').then(r=>setProfile(r.data));
    API.get('/user/ads').then(r=>setAds(r.data));
    API.get('/user/earnings').then(r=>setEarnings(r.data));
    API.get('/user/withdrawals').then(r=>setWithdrawals(r.data));
    API.get('/user/referrals').then(r=>setReferrals(r.data));
    API.get('/user/referral-bonus').then(r=>setRefBonus(r.data));
    API.get('/deposit/easypaisa-accounts').then(r=>setEpAccounts(r.data));
    API.get('/deposit/my-deposits').then(r=>setMyDeposits(r.data));
    API.get('/user/transfers').then(r=>setTransfers(r.data));
    API.get('/user/transactions').then(r=>setTransactions(r.data));
    API.get('/user/tickets').then(r=>setTickets(r.data));
    API.get('/user/plans').then(r=>setPlans(r.data));
    API.get('/user/ad-request/rate').then(r=>{ setAdRate(r.data.rate_pkr); setAdWelcomeMsg(r.data.welcome_message||''); }).catch(()=>{});
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
    API.get('/user/settings').then(r=>setSiteSettings(r.data)).catch(()=>{});
    API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
    API.get('/user/kyc/status').then(r=>{ setKycData(r.data); setFreePlanExpired(r.data.free_plan_expired); setFreePlanDaysLeft(r.data.free_plan_days_left); }).catch(()=>{});
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);

  // ── Auto-refresh balance & deposits every 15s ──
  useEffect(()=>{
    const t = setInterval(()=>{
      API.get('/user/profile').then(r=>setProfile(r.data)).catch(()=>{});
      API.get('/deposit/my-deposits').then(r=>setMyDeposits(r.data)).catch(()=>{});
    }, 15000);
    return ()=>clearInterval(t);
  },[]);

  // ── Ad Timer ──
  const startAd = async (ad) => {
    if (ad.already_clicked || activeAd) return;
    try {
      await API.post(`/user/click/start/${ad.id}`);
      setActiveAd(ad); setCountdown(ad.timer_seconds);
      window.open(ad.url,'_blank');
    } catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  useEffect(()=>{
    if (!activeAd) return;
    if (countdown>0){ const t=setTimeout(()=>setCountdown(c=>c-1),1000); return ()=>clearTimeout(t); }
    API.post(`/user/click/complete/${activeAd.id}`)
      .then(r=>{
        notify(`+Rs. ${r.data.amount.toFixed(2)} earned! 🎉`);
        setProfile(p=>({...p,balance:r.data.new_balance}));
        setAds(prev=>prev.map(a=>a.id===activeAd.id?{...a,already_clicked:true}:a));
        setActiveAd(null);
        API.get('/user/earnings').then(r=>setEarnings(r.data));
        API.get('/user/transactions').then(r=>setTransactions(r.data));
      })
      .catch(err=>{ notify(err.response?.data?.detail||'Error','error'); setActiveAd(null); });
  },[countdown,activeAd]);

  // ── Handlers ──
  const handleWithdraw = async(e)=>{
    e.preventDefault();
    try{ await API.post('/user/withdraw',{...withdraw,amount:parseFloat(withdraw.amount)}); notify('Payout request submitted!'); loadData(); setWithdraw({amount:'',method:'easypaisa',wallet_address:''}); }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const handleDeposit = async(e)=>{
    e.preventDefault();
    const acc_id = deposit.easypaisa_account_id || (epAccounts[0]?.id);
    if (!acc_id){ notify('No payment account available','error'); return; }
    if (!screenshot){ notify('Please upload payment screenshot','error'); return; }
    try{
      const fd = new FormData();
      fd.append('amount_pkr', parseFloat(deposit.amount_pkr));
      fd.append('easypaisa_account_id', parseInt(acc_id));
      fd.append('sender_name', deposit.sender_name);
      fd.append('transaction_id', deposit.transaction_id);
      fd.append('screenshot_note', deposit.screenshot_note||'');
      fd.append('screenshot', screenshot);
      await API.post('/deposit/request', fd, { headers:{'Content-Type':'multipart/form-data'} });
      notify('Fund request submitted! Admin will verify shortly.');
      loadData();
      setDeposit({amount_pkr:'',easypaisa_account_id:'',sender_name:'',transaction_id:'',screenshot_note:''});
      setScreenshot(null);
    }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const handleTransfer = async(e)=>{
    e.preventDefault();
    try{ await API.post('/user/transfer',{...transfer,amount:parseFloat(transfer.amount)}); notify('Fund transferred successfully!'); loadData(); setTransfer({receiver_username:'',amount:'',note:''}); }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const handleTicket = async(e)=>{
    e.preventDefault();
    try{ await API.post('/user/tickets',ticket); notify('Ticket submitted!'); loadData(); setTicket({subject:'',message:''}); }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const setup2FA = async()=>{
    const r = await API.get('/user/2fa/setup');
    setTwoFA(r.data);
  };

  const enable2FA = async()=>{
    try{ await API.post('/user/2fa/enable',{secret:twoFA.secret,code:faCode}); notify('2FA Enabled! ✅'); loadData(); setTwoFA(null); setFaCode(''); }
    catch(err){ notify(err.response?.data?.detail||'Invalid code','error'); }
  };

  const disable2FA = async()=>{
    try{ await API.post('/user/2fa/disable'); notify('2FA Disabled'); loadData(); }
    catch(err){ notify('Error','error'); }
  };

  const logout=()=>{ localStorage.clear(); navigate('/login'); };

  if (!profile) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',gap:16}}>
      <div className="spinner"/>
      <p style={{color:'var(--dim)',fontSize:14}}>Loading Smart Grow Chain...</p>
    </div>
  );

  const availableAds = ads.filter(a=>!a.already_clicked).length;
  const timerPct = activeAd?((activeAd.timer_seconds-countdown)/activeAd.timer_seconds)*100:0;
  const todayEarned = earnings.filter(e=>{ const d=new Date(e.clicked_at); const t=new Date(); return d.toDateString()===t.toDateString(); }).reduce((s,e)=>s+e.amount,0);

  return (
    <div className="panel-wrap">
      <div className={`sgc-overlay ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(false)}/>

      {/* ── SIDEBAR ── */}
      <aside className={`sgc-sidebar ${sidebarOpen?'open':''}`}>
        <div className="sgc-logo slide-l">
          <span className="sgc-logo-icon">🌱</span>
          <span className="sgc-logo-text" style={{color:'var(--accent)'}}>Smart Grow Chain</span>
        </div>
        <p className="sgc-logo-sub">Earn money by viewing ads</p>

        <div className="sgc-profile">
          <div className="sgc-avatar" style={{background:'linear-gradient(135deg,#0d9488,#0891b2)'}}>
            {profile.username[0].toUpperCase()}
          </div>
          <div style={{minWidth:0}}>
            <div className="sgc-uname">{profile.username}</div>
            <span className="sgc-plan">{profile.membership}</span>
          </div>
        </div>

        <div className="sgc-balance breathe">
          <div className="sgc-bal-label">💳 Total Balance</div>
          <div className="sgc-bal-amount">Rs. {profile.balance.toFixed(2)}</div>
          <div className="sgc-bal-earned">Total Earned: Rs. {profile.total_earned.toFixed(2)}</div>
          {myDeposits.some(d=>d.status==='pending') && (
            <div style={{marginTop:8,background:'#451a03',border:'1px solid #92400e',borderRadius:7,padding:'5px 10px',display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:13}}>⏳</span>
              <span style={{color:'#fbbf24',fontSize:11,fontWeight:600}}>Deposit awaiting admin approval</span>
            </div>
          )}
          {siteSettings.whatsapp_link && (
            <a href={siteSettings.whatsapp_link} target="_blank" rel="noreferrer"
              style={{marginTop:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#25d366',borderRadius:10,padding:'9px 12px',textDecoration:'none',fontWeight:700,fontSize:13,color:'#fff',boxShadow:'0 2px 10px rgba(37,211,102,.35)'}}>
              <span style={{fontSize:18}}>💬</span> Join WhatsApp Group
            </a>
          )}
        </div>

        <nav className="sgc-nav">
          {TABS.map(({key,icon,label})=>(
            <button key={key} className={`nav-btn ${tab===key?'active':''}`}
              onClick={()=>{ setTab(key); setSidebarOpen(false); if(key==='create-ad'){ setShowAdWelcome(true); } }}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
              {key==='ads' && availableAds>0 && <span className="nav-badge">{availableAds}</span>}
              {key==='support' && tickets.filter(t=>t.status==='replied').length>0 && <span className="nav-badge">{tickets.filter(t=>t.status==='replied').length}</span>}
              {key==='kyc' && kycData?.kyc_status==='none' && <span className="nav-badge" style={{background:'var(--red)'}}>!</span>}
              {key==='kyc' && kycData?.kyc_status==='rejected' && <span className="nav-badge" style={{background:'var(--red)'}}>!</span>}
            </button>
          ))}
        </nav>
        <div style={{flex:1}}/>
        <button className="sgc-logout" onClick={logout}>🚪 Logout</button>
      </aside>

      {/* ── MAIN ── */}
      <div className="panel-main">
        <div className="sgc-topbar">
          <button className="hamburger" onClick={()=>setSidebarOpen(true)}>☰</button>
          <span style={{color:'#fff',fontWeight:800,fontSize:15}}>🌱 Smart Grow Chain</span>
          <div className="sgc-avatar" style={{background:'linear-gradient(135deg,#0d9488,#0891b2)',width:36,height:36,fontSize:15,flexShrink:0}}>
            {profile.username[0].toUpperCase()}
          </div>
        </div>

        <div className="panel-body">
          {msg.text && <div className="sgc-toast" style={{background:msg.type==='error'?'var(--red)':'var(--green)',color:msg.type==='error'?'#fff':'var(--bg)'}}>{msg.text}</div>}

          {/* Free plan expiry warning */}
          {freePlanExpired && profile?.membership==='free' && (
            <div style={{background:'#450a0a',border:'1px solid #ef4444',borderRadius:12,padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:24}}>⚠️</span>
              <div style={{flex:1}}>
                <p style={{color:'#fca5a5',fontWeight:700,fontSize:14,margin:0}}>Free Plan Expired!</p>
                <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Your free plan has expired. Please purchase a plan to continue earning.</p>
              </div>
              <button onClick={()=>setTab('plans')} style={{background:'var(--yellow)',color:'var(--bg)',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>Buy Plan</button>
            </div>
          )}
          {!freePlanExpired && freePlanDaysLeft!==null && freePlanDaysLeft<=3 && profile?.membership==='free' && (
            <div style={{background:'#451a03',border:'1px solid #f59e0b',borderRadius:12,padding:'12px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>⏰</span>
              <p style={{color:'#fbbf24',fontSize:13,margin:0,fontWeight:600}}>Free plan expires in <b>{freePlanDaysLeft} day(s)</b>. Upgrade to keep earning!</p>
              <button onClick={()=>setTab('plans')} style={{marginLeft:'auto',background:'var(--yellow)',color:'var(--bg)',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>Upgrade</button>
            </div>
          )}

          {/* Free plan expiry warning */}
          {freePlanExpired && profile?.membership==='free' && (
            <div style={{background:'#450a0a',border:'1px solid #ef4444',borderRadius:12,padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:24}}>⚠️</span>
              <div style={{flex:1}}>
                <p style={{color:'#fca5a5',fontWeight:700,fontSize:14,margin:0}}>Free Plan Expired!</p>
                <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Your free plan has expired. Please purchase a plan to continue earning.</p>
              </div>
              <button onClick={()=>setTab('plans')} style={{background:'var(--yellow)',color:'var(--bg)',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>Buy Plan</button>
            </div>
          )}
          {!freePlanExpired && freePlanDaysLeft!==null && freePlanDaysLeft<=3 && profile?.membership==='free' && (
            <div style={{background:'#451a03',border:'1px solid #f59e0b',borderRadius:12,padding:'12px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>⏰</span>
              <p style={{color:'#fbbf24',fontSize:13,margin:0,fontWeight:600}}>Free plan expires in <b>{freePlanDaysLeft} day(s)</b>. Upgrade to keep earning!</p>
              <button onClick={()=>setTab('plans')} style={{marginLeft:'auto',background:'var(--yellow)',color:'var(--bg)',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>Upgrade</button>
            </div>
          )}

          {/* ── ADVERTISE WELCOME MODAL ── */}
          {showAdWelcome && adWelcomeMsg && (
            <div className="sgc-modal-overlay" onClick={()=>setShowAdWelcome(false)}>
              <div className="sgc-modal" style={{textAlign:'center',maxWidth:340}} onClick={e=>e.stopPropagation()}>
                <div style={{fontSize:40,marginBottom:12}}>📢</div>
                <h3 style={{color:'var(--accent)',fontSize:17,fontWeight:800,marginBottom:12}}>Advertise Your Link</h3>
                <p style={{color:'var(--muted)',fontSize:14,lineHeight:1.7,marginBottom:20}}>{adWelcomeMsg}</p>
                <button className="sgc-btn-primary" onClick={()=>setShowAdWelcome(false)}>Get Started →</button>
              </div>
            </div>
          )}

          {activeAd && (
            <div className="sgc-timer-wrap">
              <div>
                <p style={{fontWeight:700,color:'var(--accent)',marginBottom:6}}>⏳ Watching: {activeAd.title}</p>
                <div style={{width:200,height:5,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:`${timerPct}%`,height:'100%',background:'linear-gradient(90deg,var(--accent),var(--green))',borderRadius:4,transition:'width 1s linear'}}/>
                </div>
              </div>
              <div className="sgc-timer-circle">{countdown}s</div>
            </div>
          )}

          <div className="fade-up" key={tab}>

            {/* ── DASHBOARD ── */}
            {tab==='dashboard' && (
              <div>
                <h2 className="sgc-heading">🏠 Dashboard</h2>
                <div className="sgc-stats">
                  {[
                    ['Total Balance',`Rs. ${profile.balance.toFixed(2)}`,'#0d9488'],
                    ['Total Earned',`Rs. ${profile.total_earned.toFixed(2)}`,'#0891b2'],
                    ['Today Earned',`Rs. ${todayEarned.toFixed(2)}`,'#d97706'],
                    ['Ads Available',availableAds,'#7c3aed'],
                    ['Total Clicks',earnings.filter(e=>e.type==='click').length,'#0891b2'],
                    ['Referrals',referrals?.total_referrals||0,'#059669'],
                    ['Referral Bonus',`Rs. ${(refBonus?.total_bonus||0).toFixed(2)}`,'#db2777'],
                    ['Membership',profile.membership.toUpperCase(),'#d97706'],
                  ].map(([l,v,c],i)=>(
                    <div key={i} className="sgc-stat-card">
                      <div className="sgc-stat-label">{l}</div>
                      <div className="sgc-stat-val" style={{color:c}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <h3 className="sgc-subheading" style={{marginBottom:12}}>Quick Actions</h3>

                {/* ── Advertise Big Button ── */}
                <button onClick={()=>{ setTab('create-ad'); setShowAdWelcome(true); }}
                  style={{width:'100%',padding:'18px 20px',marginBottom:12,background:'linear-gradient(135deg,#f97316,#ea580c,#dc2626)',border:'none',borderRadius:16,color:'#fff',cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',gap:14,boxShadow:'0 4px 20px rgba(249,115,22,.4)',transition:'transform .2s,box-shadow .2s',animation:'fadeUp .3s ease both'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow='0 8px 28px rgba(249,115,22,.5)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 20px rgba(249,115,22,.4)';}}>
                  <div style={{width:48,height:48,borderRadius:12,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>📢</div>
                  <div style={{textAlign:'left'}}>
                    <p style={{margin:0,fontSize:16,fontWeight:800,letterSpacing:.3}}>Advertise Your Link</p>
                    <p style={{margin:0,fontSize:12,opacity:.85,marginTop:2}}>Reach thousands of real members · Rs. {adRate}/member</p>
                  </div>
                  <span style={{marginLeft:'auto',fontSize:22,opacity:.8}}>→</span>
                </button>

                {/* ── Other Actions ── */}
                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
                  {[['📺','View Ads','ads'],['📲','Deposit','transfer'],['💸','Payout','payout'],['🎫','Support','support']].map(([icon,label,key])=>(
                    <button key={key} onClick={()=>setTab(key)} style={{padding:'10px 18px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',cursor:'pointer',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6,transition:'all .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                      {icon} {label}
                    </button>
                  ))}
                  {siteSettings.whatsapp_link && (
                    <a href={siteSettings.whatsapp_link} target="_blank" rel="noreferrer"
                      style={{padding:'10px 18px',background:'#25d366',border:'1px solid #25d366',borderRadius:10,color:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6,textDecoration:'none'}}>
                      💬 WhatsApp Group
                    </a>
                  )}
                </div>

                {/* Recent Transactions */}
                <h3 className="sgc-subheading" style={{marginBottom:12}}>Recent Transactions</h3>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr><th className="sgc-th">Type</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Date</th></tr></thead>
                    <tbody>{(showAllTx?transactions:transactions.slice(0,3)).map((t,i)=>(
                      <tr key={i} className="sgc-tr">
                        <td className="sgc-td"><span className="sgc-badge" style={{background:t.direction==='credit'?'#064e3b':'#450a0a'}}>{t.type}</span></td>
                        <td className="sgc-td" style={{color:t.direction==='credit'?'var(--green)':'var(--red)',fontWeight:600}}>{t.direction==='credit'?'+':'-'}Rs. {t.amount?.toFixed(2)}</td>
                        <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note}</td>
                        <td className="sgc-td">{new Date(t.date).toLocaleString()}</td>
                      </tr>
                    ))}
                    {transactions.length===0&&<tr><td colSpan={4} className="sgc-td" style={{textAlign:'center',padding:24}}>No transactions yet</td></tr>}
                    </tbody>
                  </table>
                </div>
                {transactions.length>3&&(
                  <button onClick={()=>setShowAllTx(s=>!s)} style={{width:'100%',marginTop:8,padding:'10px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--accent)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}}>
                    {showAllTx?'▲ Show Less':'▼ Show More ('+( transactions.length-3)+' more)'}
                  </button>
                )}

                {/* ── Admin Message Box ── */}
                {adWelcomeMsg&&(
                  <div style={{background:'linear-gradient(135deg,#fff7ed,#ffedd5)',border:'1px solid #fed7aa',borderRadius:16,padding:'16px 20px',marginTop:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <span style={{fontSize:20}}>📣</span>
                      <span style={{color:'#ea580c',fontWeight:800,fontSize:14,letterSpacing:.3}}>MESSAGE FROM ADMIN</span>
                    </div>
                    <p style={{color:'#7c2d12',fontSize:14,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{adWelcomeMsg}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── ADVERTISEMENT ── */}
            {tab==='ads' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">📺 Advertisement</h2>
                  <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{availableAds} available today</span>
                </div>
                <div className="sgc-ads-grid">
                  {ads.map((ad,i)=>(
                    <div key={ad.id} className="sgc-ad-card" style={{opacity:ad.already_clicked?0.55:1,animationDelay:`${i*.05}s`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                        <h4 style={{color:'var(--text)',fontSize:14,fontWeight:700,flex:1,marginRight:8}}>{ad.title}</h4>
                        <span className="sgc-earn">Rs. {ad.earning_amount}</span>
                      </div>
                      {ad.description&&<p style={{color:'var(--dim)',fontSize:12,marginBottom:10}}>{ad.description}</p>}
                      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
                        <span className="sgc-ad-meta">⏱ {ad.timer_seconds}s</span>
                        <span className="sgc-ad-meta">👆 {ad.total_clicks} clicks</span>
                      </div>
                      <button className="sgc-click-btn"
                        style={{background:ad.already_clicked?'var(--card)':'linear-gradient(135deg,var(--accent),var(--accent2))',color:ad.already_clicked?'var(--dim)':'var(--bg)',cursor:(ad.already_clicked||!!activeAd)?'not-allowed':'pointer'}}
                        onClick={()=>startAd(ad)} disabled={ad.already_clicked||!!activeAd}>
                        {ad.already_clicked?'✓ Clicked Today':activeAd?'⏳ Watching...':'▶ Click & Earn'}
                      </button>
                    </div>
                  ))}
                  {ads.length===0&&<div className="sgc-empty">No ads available right now.<br/>Check back later!</div>}
                </div>
              </div>
            )}

            {/* ── FUND HISTORY ── */}
            {tab==='fund-history' && (
              <div>
                <h2 className="sgc-heading">📂 Fund History</h2>
                <div className="sgc-stats" style={{marginBottom:24}}>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Total Confirmed</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {myDeposits.filter(d=>d.status==='confirmed').reduce((s,d)=>s+d.amount_pkr,0).toFixed(2)}</div></div>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Pending</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>{myDeposits.filter(d=>d.status==='pending').length}</div></div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {myDeposits.map((d,i)=>{
                    const isPending=d.status==='pending';
                    const isConfirmed=d.status==='confirmed';
                    return (
                      <div key={i} style={{background:'var(--card)',border:`1.5px solid ${isPending?'#92400e':isConfirmed?'#166534':'#7f1d1d'}`,borderRadius:12,padding:'14px 18px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isPending?10:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <span style={{fontSize:22}}>{isPending?'⏳':isConfirmed?'✅':'❌'}</span>
                            <div>
                              <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>Rs. {d.amount_pkr}</p>
                              <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(d.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <span style={{background:isPending?'#451a03':isConfirmed?'#064e3b':'#450a0a',color:isPending?'#fbbf24':isConfirmed?'#4ade80':'#fca5a5',padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700}}>
                            {d.status.toUpperCase()}
                          </span>
                        </div>
                        {isPending && (
                          <div style={{background:'#451a0330',border:'1px solid #92400e',borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
                            <span style={{fontSize:14}}>🔔</span>
                            <p style={{color:'#fbbf24',fontSize:12,margin:0,fontWeight:600}}>Your balance will be updated once admin verifies and approves this deposit.</p>
                          </div>
                        )}
                        {isConfirmed && (
                          <p style={{color:'var(--green)',fontSize:12,margin:'6px 0 0',fontWeight:600}}>✔ Balance has been credited to your account.</p>
                        )}
                        {d.status==='rejected' && (
                          <p style={{color:'var(--red)',fontSize:12,margin:'6px 0 0',fontWeight:600}}>✕ This deposit was rejected by admin.</p>
                        )}
                      </div>
                    );
                  })}
                  {myDeposits.length===0&&<div className="sgc-empty">No deposit history yet.</div>}
                </div>
              </div>
            )}

            {/* ── PAYOUT ── */}
            {tab==='payout' && (
              <div>
                <h2 className="sgc-heading">💸 Payout</h2>
                {kycData?.kyc_status !== 'approved' ? (
                  <div style={{background:'#450a0a',border:'1px solid #ef4444',borderRadius:14,padding:'28px 24px',textAlign:'center',maxWidth:480}}>
                    <div style={{fontSize:48,marginBottom:12}}>🚪</div>
                    <h3 style={{color:'#fca5a5',fontSize:18,fontWeight:800,margin:'0 0 8px'}}>KYC Verification Required</h3>
                    <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 20px'}}>Please complete your KYC verification before withdrawing funds.</p>
                    <button onClick={()=>setTab('kyc')} style={{background:'var(--yellow)',color:'var(--bg)',border:'none',borderRadius:10,padding:'12px 28px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)'}}>🪪 Complete KYC Now</button>
                    {kycData?.kyc_status==='pending' && <p style={{color:'#fbbf24',fontSize:12,marginTop:12}}>⏳ KYC is under review. Please wait for admin approval.</p>}
                    {kycData?.kyc_status==='rejected' && <p style={{color:'#fca5a5',fontSize:12,marginTop:12}}>❌ KYC was rejected. Please resubmit with correct documents.</p>}
                  </div>
                ) : (
                  <>
                    <div className="sgc-stats" style={{maxWidth:420,marginBottom:24}}>
                      <div className="sgc-stat-card"><div className="sgc-stat-label">Available Balance</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {profile.balance.toFixed(2)}</div></div>
                      <div className="sgc-stat-card"><div className="sgc-stat-label">Min Payout</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>Rs. 500</div></div>
                    </div>
                    <form onSubmit={handleWithdraw} className="sgc-form">
                      <label className="sgc-label">Amount (Rs.)</label>
                      <input className="sgc-input" type="number" step="1" min="500" placeholder="Min Rs. 500" value={withdraw.amount} onChange={e=>setWithdraw({...withdraw,amount:e.target.value})} required/>
                      <label className="sgc-label">Payment Method</label>
                      <select className="sgc-input" value={withdraw.method} onChange={e=>setWithdraw({...withdraw,method:e.target.value})}>
                        <option value="easypaisa">Easypaisa</option>
                        <option value="jazzcash">JazzCash</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                      <label className="sgc-label">Account Number</label>
                      <input className="sgc-input" placeholder="Enter your account number" value={withdraw.wallet_address} onChange={e=>setWithdraw({...withdraw,wallet_address:e.target.value})} required/>
                      <button className="sgc-btn-primary" type="submit">Submit Payout Request</button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ── PAYOUT HISTORY ── */}
            {tab==='payout-hist' && (
              <div>
                <h2 className="sgc-heading">📋 Payout History</h2>
                <div className="sgc-stats" style={{marginBottom:24}}>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Total Paid Out</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {withdrawals.filter(w=>w.status==='approved').reduce((s,w)=>s+w.amount,0).toFixed(2)}</div></div>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Pending</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>{withdrawals.filter(w=>w.status==='pending').length}</div></div>
                </div>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr><th className="sgc-th">Amount</th><th className="sgc-th">Method</th><th className="sgc-th">Account</th><th className="sgc-th">Status</th><th className="sgc-th">Date</th></tr></thead>
                    <tbody>{withdrawals.map((w,i)=>(
                      <tr key={i} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--red)',fontWeight:600}}>-Rs. {w.amount.toFixed(2)}</td>
                        <td className="sgc-td">{w.method}</td>
                        <td className="sgc-td" style={{fontSize:11,color:'var(--dim)'}}>{w.wallet_address?.substring(0,18)}...</td>
                        <td className="sgc-td"><span className="sgc-badge" style={{background:w.status==='approved'||w.status==='sent'?'#064e3b':w.status==='rejected'?'#450a0a':'#451a03'}}>{w.status==='sent'?'✈️ sent':w.status}</span></td>
                        <td className="sgc-td">{new Date(w.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {withdrawals.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No payout history</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── SEND FUNDS ── */}
            {tab==='send-funds' && (
              <div>
                <h2 className="sgc-heading">🔄 Send Funds</h2>
                <div className="sgc-stats" style={{maxWidth:420,marginBottom:24}}>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Available Balance</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {profile.balance.toFixed(2)}</div></div>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Min Transfer</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>Rs. 50</div></div>
                </div>
                <form onSubmit={handleTransfer} className="sgc-form" style={{marginBottom:24}}>
                  <label className="sgc-label">Receiver Username</label>
                  <input className="sgc-input" placeholder="Enter username" value={transfer.receiver_username} onChange={e=>setTransfer({...transfer,receiver_username:e.target.value})} required/>
                  <label className="sgc-label">Amount (Rs.)</label>
                  <input className="sgc-input" type="number" step="1" min="50" placeholder="Min Rs. 50" value={transfer.amount} onChange={e=>setTransfer({...transfer,amount:e.target.value})} required/>
                  <label className="sgc-label">Note (optional)</label>
                  <input className="sgc-input" placeholder="Add a note" value={transfer.note} onChange={e=>setTransfer({...transfer,note:e.target.value})}/>
                  <button className="sgc-btn-primary" type="submit">🔄 Send Funds</button>
                </form>
                <h3 className="sgc-subheading">Transfer History</h3>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr><th className="sgc-th">Direction</th><th className="sgc-th">User</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Date</th></tr></thead>
                    <tbody>{transfers.map((t,i)=>(
                      <tr key={i} className="sgc-tr">
                        <td className="sgc-td"><span className="sgc-badge" style={{background:t.direction==='received'?'#064e3b':'#450a0a'}}>{t.direction==='received'?'↓ Received':'↑ Sent'}</span></td>
                        <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{t.direction==='received'?t.from:t.to}</td>
                        <td className="sgc-td" style={{color:t.direction==='received'?'var(--green)':'var(--red)',fontWeight:600}}>{t.direction==='received'?'+':'-'}Rs. {t.amount?.toFixed(2)}</td>
                        <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note||'-'}</td>
                        <td className="sgc-td">{new Date(t.date).toLocaleString()}</td>
                      </tr>
                    ))}
                    {transfers.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No transfers yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DEPOSIT ── */}
            {tab==='transfer' && (
              <div>
                <h2 className="sgc-heading">📲 Deposit</h2>

                {/* ── Our Accounts ── */}
                <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>OUR ACCOUNTS</p>
                {epAccounts.length>0 ? (
                  <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:28}}>
                    {epAccounts.map(a=>{
                      const isEP=(a.method_type||'easypaisa')==='easypaisa';
                      const col=isEP?'#3cb559':'#e8001e';
                      const bg=isEP?'#071a0d':'#1a0004';
                      return (
                        <div key={a.id} style={{background:bg,border:`1.5px solid ${col}40`,borderRadius:14,padding:'16px 20px',minWidth:240,flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                            <div style={{width:40,height:40,borderRadius:10,background:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                              {isEP?'📱':'💳'}
                            </div>
                            <div>
                              <p style={{color:col,fontSize:11,fontWeight:700,margin:0,letterSpacing:.5}}>{isEP?'EASYPAISA':'JAZZCASH'}</p>
                              <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>{a.account_title}</p>
                            </div>
                          </div>
                          <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div>
                              <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Account Number</p>
                              <p style={{color:col,fontFamily:'monospace',fontSize:16,fontWeight:800,letterSpacing:1,margin:0}}>{a.account_number}</p>
                            </div>
                            <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Number copied! 📋');}} style={{background:col+'22',border:`1px solid ${col}`,color:col,borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>Copy</button>
                          </div>
                          {a.deposit_message && (
                            <div style={{marginTop:10,background:'#0d1e38',border:'1px solid #1e4080',borderRadius:8,padding:'10px 14px',display:'flex',gap:8,alignItems:'flex-start'}}>
                              <span style={{fontSize:15,flexShrink:0}}>💬</span>
                              <p style={{color:'#94a3b8',fontSize:12,margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{a.deposit_message}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:16,marginBottom:28}}>
                    <p style={{color:'var(--red)',fontSize:13,margin:0}}>⚠️ No payment accounts available. Contact support.</p>
                  </div>
                )}

                {/* ── Method Selector ── */}
                {epAccounts.length>0&&(
                  <>
                    <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>SELECT METHOD & SUBMIT</p>
                    <div style={{display:'flex',gap:10,marginBottom:20,maxWidth:520}}>
                      {['easypaisa','jazzcash'].map(m=>{
                        const isEP=m==='easypaisa'; const col=isEP?'#3cb559':'#e8001e';
                        const hasAccs=epAccounts.some(a=>(a.method_type||'easypaisa')===m);
                        if(!hasAccs) return null;
                        return (
                          <div key={m} onClick={()=>setSelectedMethod(m)}
                            style={{flex:1,padding:'12px 10px',borderRadius:12,border:`2px solid ${selectedMethod===m?col:'var(--border)'}`,background:selectedMethod===m?(isEP?'#0a2010':'#200008'):'var(--bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
                            <span style={{fontSize:18}}>{isEP?'📱':'💳'}</span>
                            <span style={{color:selectedMethod===m?col:'var(--muted)',fontWeight:700,fontSize:13}}>{isEP?'Easypaisa':'JazzCash'}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Submit Form ── */}
                    {(()=>{
                      const col=selectedMethod==='easypaisa'?'#3cb559':'#e8001e';
                      const filtered=epAccounts.filter(a=>(a.method_type||'easypaisa')===selectedMethod);
                      if(!filtered.length) return <p style={{color:'var(--dim)',fontSize:13}}>No {selectedMethod} account available.</p>;
                      return (
                        <form onSubmit={handleDeposit} className="sgc-form" style={{background:'#0d1e38',border:'1px solid #1e4080',maxWidth:520}}>
                          <label className="sgc-label">Amount Sent (Rs.)</label>
                          <input className="sgc-input" type="number" min="100" placeholder="Min Rs. 100" value={deposit.amount_pkr} onChange={e=>setDeposit({...deposit,amount_pkr:e.target.value,easypaisa_account_id:filtered[0].id})} required/>
                          <label className="sgc-label">Send By (Your Account Name)</label>
                          <input className="sgc-input" placeholder="e.g. Ali Hassan" value={deposit.sender_name} onChange={e=>setDeposit({...deposit,sender_name:e.target.value})} required/>
                          <label className="sgc-label">Your {selectedMethod==='easypaisa'?'Easypaisa':'JazzCash'} Number</label>
                          <input className="sgc-input" type="tel" placeholder="03XX-XXXXXXX" value={deposit.transaction_id} onChange={e=>setDeposit({...deposit,transaction_id:e.target.value})} required/>
                          <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                          <div style={{marginBottom:16}}>
                            <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'20px',textAlign:'center',cursor:'pointer',background:'var(--bg)',transition:'border-color .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor=col} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                              <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setScreenshot(e.target.files[0])}/>
                              {screenshot?(
                                <div><img src={URL.createObjectURL(screenshot)} alt="preview" style={{maxHeight:120,borderRadius:8,marginBottom:6}}/><p style={{color:'var(--green)',fontSize:12,margin:0}}>✓ {screenshot.name}</p></div>
                              ):(
                                <div><p style={{fontSize:28,margin:'0 0 6px'}}>📸</p><p style={{color:'var(--dim)',fontSize:13,margin:0}}>Click to upload screenshot</p><p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>JPG, PNG supported</p></div>
                              )}
                            </label>
                          </div>
                          <label className="sgc-label">Note (optional)</label>
                          <input className="sgc-input" placeholder="Any note for admin" value={deposit.screenshot_note} onChange={e=>setDeposit({...deposit,screenshot_note:e.target.value})}/>
                          <button className="sgc-btn-primary" type="submit" style={{background:`linear-gradient(135deg,${col},${selectedMethod==='easypaisa'?'#2a8c42':'#b5001a'})`}}>
                            📤 Submit Deposit Request
                          </button>
                        </form>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* ── MEMBERSHIP PLANS ── */}
            {tab==='plans' && (
              <div>
                <h2 className="sgc-heading">🏆 Membership Plans</h2>
                <p style={{color:'var(--dim)',fontSize:13,marginBottom:20}}>Current Plan: <span style={{color:'var(--yellow)',fontWeight:700,textTransform:'capitalize'}}>{profile.membership}</span></p>

                {/* Plan cards */}
                {!selectedPlan && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16,marginBottom:28}}>
                    {plans.map((p,i)=>{
                      const isCurrent=profile.membership===p.name;
                      const colors=['var(--dim)','var(--accent)','var(--yellow)','var(--purple)'];
                      const col=colors[i]||'var(--accent)';
                      return (
                        <div key={p.id} style={{background:'var(--card)',border:`2px solid ${isCurrent?col:'var(--border)'}`,borderRadius:16,padding:24,position:'relative',transition:'transform .2s'}}>
                          {isCurrent&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:col,color:'var(--bg)',padding:'2px 14px',borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>✓ Current Plan</div>}
                          <h3 style={{color:col,textTransform:'capitalize',marginBottom:4,fontSize:17}}>{p.name}</h3>
                          <p style={{color:'var(--text)',fontSize:26,fontWeight:800,marginBottom:16}}>Rs. {p.price}<span style={{fontSize:13,color:'var(--dim)',fontWeight:400}}>/{p.period_days}d</span></p>
                          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                            {[
                              ['📺',`${p.daily_ads} ads/day`],
                              ['💰',`Rs. ${p.earning_per_click} per click`],
                              ['👥',`${(p.referral_commission*100).toFixed(0)}% referral commission`],
                              ['🔗',`${p.referral_levels||'N/A'} referral levels`],
                            ].map(([icon,text])=>(
                              <div key={text} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted)'}}>
                                <span>{icon}</span><span>{text}</span>
                              </div>
                            ))}
                          </div>
                          {!isCurrent && p.price>0 && (
                            <button onClick={()=>{ setSelectedPlan(p); setPlanPayMethod('wallet'); setPlanScreenshot(null); setPlanSenderName(''); setPlanSenderPhone(''); }}
                              style={{width:'100%',padding:'10px',background:col,color:'var(--bg)',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}}>
                              Upgrade to {p.name}
                            </button>
                          )}
                          {!isCurrent && p.price===0 && (
                            <div style={{padding:'8px',background:'var(--bg)',borderRadius:10,textAlign:'center',color:'var(--dim)',fontSize:12}}>Free Plan</div>
                          )}
                        </div>
                      );
                    })}
                    {plans.length===0&&<div className="sgc-empty">No plans available.</div>}
                  </div>
                )}

                {/* Payment form */}
                {selectedPlan && (
                  <div style={{maxWidth:520}}>
                    <button onClick={()=>setSelectedPlan(null)} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:13,fontWeight:600,marginBottom:16,fontFamily:'var(--font)',padding:0}}>← Back to Plans</button>
                    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px',marginBottom:20}}>
                      <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px',fontWeight:600}}>SELECTED PLAN</p>
                      <p style={{color:'var(--yellow)',fontSize:20,fontWeight:800,margin:0,textTransform:'capitalize'}}>{selectedPlan.name} — Rs. {selectedPlan.price}</p>
                    </div>

                    {/* Method selector */}
                    <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>SELECT PAYMENT METHOD</p>
                    <div style={{display:'flex',gap:10,marginBottom:20}}>
                      {[['wallet','💳 Wallet'],['easypaisa','📱 Easypaisa']].map(([val,label])=>(
                        <div key={val} onClick={()=>setPlanPayMethod(val)}
                          style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${planPayMethod===val?'var(--accent)':'var(--border)'}`,background:planPayMethod===val?'#0d1e38':'var(--bg)',cursor:'pointer',textAlign:'center',color:planPayMethod===val?'var(--accent)':'var(--muted)',fontWeight:700,fontSize:13,transition:'all .2s'}}>
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Wallet */}
                    {planPayMethod==='wallet' && (
                      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px',marginBottom:16}}>
                        <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 8px',fontWeight:600}}>WALLET BALANCE</p>
                        <p style={{color:profile.balance>=selectedPlan.price?'var(--green)':'var(--red)',fontSize:22,fontWeight:800,margin:'0 0 4px'}}>Rs. {profile.balance.toFixed(2)}</p>
                        {profile.balance < selectedPlan.price
                          ? <p style={{color:'var(--red)',fontSize:12,margin:0}}>⚠️ Insufficient balance. Need Rs. {(selectedPlan.price - profile.balance).toFixed(2)} more. Please deposit first.</p>
                          : <p style={{color:'var(--green)',fontSize:12,margin:0}}>✓ Sufficient balance. Rs. {selectedPlan.price} will be deducted.</p>
                        }
                      </div>
                    )}

                    {/* Easypaisa */}
                    {planPayMethod==='easypaisa' && (
                      <>
                        {epAccounts.filter(a=>(a.method_type||'easypaisa')==='easypaisa').slice(0,1).map(a=>(
                          <div key={a.id} style={{background:'#071a0d',border:'1.5px solid #3cb55940',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                            <p style={{color:'#3cb559',fontSize:11,fontWeight:700,margin:'0 0 10px',letterSpacing:.5}}>📱 SEND PAYMENT TO THIS ACCOUNT</p>
                            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                              <div style={{width:36,height:36,borderRadius:8,background:'#3cb559',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📱</div>
                              <div>
                                <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>{a.account_title}</p>
                                <p style={{color:'var(--dim)',fontSize:11,margin:0}}>Account Name</p>
                              </div>
                            </div>
                            <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                              <div>
                                <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Account Number</p>
                                <p style={{color:'#3cb559',fontFamily:'monospace',fontSize:16,fontWeight:800,letterSpacing:1,margin:0}}>{a.account_number}</p>
                              </div>
                              <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'#3cb55922',border:'1px solid #3cb559',color:'#3cb559',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>Copy</button>
                            </div>
                            <p style={{color:'var(--yellow)',fontSize:13,fontWeight:700,margin:0}}>Send exactly: Rs. {selectedPlan.price}</p>
                          </div>
                        ))}
                        {epAccounts.filter(a=>(a.method_type||'easypaisa')==='easypaisa').length===0&&(
                          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:14,marginBottom:16}}>
                            <p style={{color:'var(--red)',fontSize:13,margin:0}}>⚠️ No Easypaisa account available. Use wallet or contact support.</p>
                          </div>
                        )}
                        <label className="sgc-label">Your Name (Account Holder)</label>
                        <input className="sgc-input" placeholder="e.g. Ali Hassan" value={planSenderName} onChange={e=>setPlanSenderName(e.target.value)}/>
                        <label className="sgc-label">Your Easypaisa Number</label>
                        <input className="sgc-input" type="tel" placeholder="03XX-XXXXXXX" value={planSenderPhone} onChange={e=>setPlanSenderPhone(e.target.value)}/>
                        <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                        <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setPlanScreenshot(e.target.files[0])}/>
                          {planScreenshot?<p style={{color:'var(--green)',margin:0}}>✓ {planScreenshot.name}</p>:<p style={{color:'var(--dim)',margin:0}}>📸 Click to upload screenshot</p>}
                        </label>
                      </>
                    )}

                    <button className="sgc-btn-primary" onClick={async()=>{
                      try{
                        if(planPayMethod==='wallet' && profile.balance < selectedPlan.price){
                          notify('Insufficient balance','error'); return;
                        }
                        if(planPayMethod==='easypaisa' && !planScreenshot){
                          notify('Please upload payment screenshot','error'); return;
                        }
                        const fd=new FormData();
                        fd.append('plan_id', selectedPlan.id);
                        fd.append('payment_method', planPayMethod);
                        fd.append('sender_name', planSenderName);
                        fd.append('sender_phone', planSenderPhone);
                        if(planPayMethod==='easypaisa' && planScreenshot) fd.append('screenshot', planScreenshot);
                        await API.post('/user/plan/purchase', fd, {headers:{'Content-Type':'multipart/form-data'}});
                        notify('Plan purchase request submitted! Admin will activate shortly. ✅');
                        setSelectedPlan(null);
                        API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data));
                        API.get('/user/profile').then(r=>setProfile(r.data));
                      }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
                    }}>📤 Submit Purchase Request</button>
                  </div>
                )}

                {/* My purchase history */}
                {myPlanPurchases.length>0 && (
                  <div style={{marginTop:28}}>
                    <h3 className="sgc-subheading" style={{marginBottom:12}}>📋 My Plan Purchase History</h3>
                    <div className="sgc-table-wrap">
                      <table className="sgc-table">
                        <thead><tr><th className="sgc-th">Plan</th><th className="sgc-th">Price</th><th className="sgc-th">Method</th><th className="sgc-th">Status</th><th className="sgc-th">Date</th></tr></thead>
                        <tbody>{myPlanPurchases.map((r,i)=>(
                          <tr key={i} className="sgc-tr">
                            <td className="sgc-td" style={{color:'var(--yellow)',fontWeight:700,textTransform:'capitalize'}}>{r.plan_name}</td>
                            <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {r.plan_price}</td>
                            <td className="sgc-td">{r.payment_method}</td>
                            <td className="sgc-td"><span className="sgc-badge" style={{background:r.status==='approved'?'#064e3b':r.status==='rejected'?'#450a0a':'#451a03',color:r.status==='approved'?'#4ade80':r.status==='rejected'?'#fca5a5':'#fbbf24'}}>{r.status}</span></td>
                            <td className="sgc-td">{new Date(r.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MY REFERRAL ── */}
            {tab==='referral' && referrals && (
              <div>
                <h2 className="sgc-heading">👥 My Referral</h2>
                <div className="sgc-stats" style={{marginBottom:24}}>
                  {[['Total Referrals',referrals.total_referrals,'var(--accent)'],
                    ['Commission Earned',`Rs. ${referrals.total_commission.toFixed(2)}`,'var(--green)'],
                    ['Commission Rate','10%','var(--purple)']
                  ].map(([l,v,c],i)=>(
                    <div key={i} className="sgc-stat-card">
                      <div className="sgc-stat-label">{l}</div>
                      <div className="sgc-stat-val" style={{color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="sgc-form" style={{marginBottom:24}}>
                  <p className="sgc-subheading" style={{marginBottom:10}}>🔗 Your Referral Link</p>
                  <div style={{display:'flex',gap:10}}>
                    <input className="sgc-input" style={{margin:0,flex:1,fontSize:12}} value={referrals.referral_link} readOnly/>
                    <button className="sgc-btn-primary" style={{width:'auto',padding:'0 18px',whiteSpace:'nowrap'}}
                      onClick={()=>{ navigator.clipboard.writeText(referrals.referral_link); notify('Link copied! 📋'); }}>Copy</button>
                  </div>
                  <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Earn 10% commission from every ad click your referrals make</p>
                </div>
                {referrals.referrals.length>0&&(
                  <div className="sgc-table-wrap">
                    <table className="sgc-table">
                      <thead><tr><th className="sgc-th">Username</th><th className="sgc-th">Joined</th></tr></thead>
                      <tbody>{referrals.referrals.map((r,i)=>(
                        <tr key={i} className="sgc-tr">
                          <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{r.username}</td>
                          <td className="sgc-td">{new Date(r.joined).toLocaleDateString()}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
                {referrals.referrals.length===0&&<div className="sgc-empty">No referrals yet. Share your link!</div>}
              </div>
            )}

            {/* ── ALL TRANSACTION ── */}
            {tab==='transactions' && (
              <div>
                <h2 className="sgc-heading">📊 All Transactions</h2>
                <div className="sgc-stats" style={{marginBottom:24}}>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Total Credits</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {transactions.filter(t=>t.direction==='credit').reduce((s,t)=>s+(t.amount||0),0).toFixed(2)}</div></div>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Total Debits</div><div className="sgc-stat-val" style={{color:'var(--red)'}}>Rs. {transactions.filter(t=>t.direction==='debit').reduce((s,t)=>s+(t.amount||0),0).toFixed(2)}</div></div>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Total Entries</div><div className="sgc-stat-val" style={{color:'var(--accent)'}}>{transactions.length}</div></div>
                </div>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr><th className="sgc-th">Type</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Status</th><th className="sgc-th">Date</th></tr></thead>
                    <tbody>{transactions.map((t,i)=>(
                      <tr key={i} className="sgc-tr">
                        <td className="sgc-td"><span className="sgc-badge" style={{background:t.direction==='credit'?'#064e3b':'#450a0a'}}>{t.type}</span></td>
                        <td className="sgc-td" style={{color:t.direction==='credit'?'var(--green)':'var(--red)',fontWeight:600}}>{t.direction==='credit'?'+':'-'}Rs. {t.amount?.toFixed(2)}</td>
                        <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note}</td>
                        <td className="sgc-td">{t.status?<span className="sgc-badge" style={{background:t.status==='approved'||t.status==='confirmed'?'#064e3b':t.status==='rejected'?'#450a0a':'#451a03'}}>{t.status}</span>:'-'}</td>
                        <td className="sgc-td">{new Date(t.date).toLocaleString()}</td>
                      </tr>
                    ))}
                    {transactions.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No transactions yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── REFERRAL BONUS ── */}
            {tab==='ref-bonus' && refBonus && (
              <div>
                <h2 className="sgc-heading">🎁 Referral Bonus</h2>
                {kycData?.kyc_status !== 'approved' ? (
                  <div style={{background:'#1e3a6e',border:'1px solid var(--accent)',borderRadius:14,padding:'28px 24px',textAlign:'center',maxWidth:480}}>
                    <div style={{fontSize:48,marginBottom:12}}>🔒</div>
                    <h3 style={{color:'var(--accent)',fontSize:18,fontWeight:800,margin:'0 0 8px'}}>KYC Required for Bonus</h3>
                    <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 20px'}}>Complete KYC verification to unlock referral bonuses.</p>
                    <button onClick={()=>setTab('kyc')} style={{background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:10,padding:'12px 28px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)'}}>🪪 Complete KYC</button>
                  </div>
                ) : (
                  <>
                    <div className="sgc-stats" style={{marginBottom:24}}>
                      <div className="sgc-stat-card"><div className="sgc-stat-label">Total Bonus</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {refBonus.total_bonus.toFixed(2)}</div></div>
                      <div className="sgc-stat-card"><div className="sgc-stat-label">Total Entries</div><div className="sgc-stat-val" style={{color:'var(--accent)'}}>{refBonus.count}</div></div>
                      <div className="sgc-stat-card"><div className="sgc-stat-label">Rate Per Click</div><div className="sgc-stat-val" style={{color:'var(--purple)'}}>10%</div></div>
                    </div>
                    <div className="sgc-table-wrap">
                      <table className="sgc-table">
                        <thead><tr><th className="sgc-th">Amount</th><th className="sgc-th">Ad ID</th><th className="sgc-th">Date</th></tr></thead>
                        <tbody>{refBonus.bonuses.map((b,i)=>(
                          <tr key={i} className="sgc-tr">
                            <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>+Rs. {b.amount.toFixed(2)}</td>
                            <td className="sgc-td">#{b.ad_id}</td>
                            <td className="sgc-td">{new Date(b.date).toLocaleString()}</td>
                          </tr>
                        ))}
                        {refBonus.bonuses.length===0&&<tr><td colSpan={3} className="sgc-td" style={{textAlign:'center',padding:32}}>No referral bonus yet</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── AD VIEW LOG ── */}
            {tab==='ad-view-log' && (
              <div>
                <h2 className="sgc-heading">📌 Ad View Log</h2>
                <div className="sgc-stats" style={{marginBottom:24}}>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Total Views</div><div className="sgc-stat-val" style={{color:'var(--accent)'}}>{earnings.filter(e=>e.type==='click').length}</div></div>
                  <div className="sgc-stat-card"><div className="sgc-stat-label">Total Earned</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {earnings.filter(e=>e.type==='click').reduce((s,e)=>s+e.amount,0).toFixed(2)}</div></div>
                </div>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">SL</th>
                      <th className="sgc-th">Advertisement</th>
                      <th className="sgc-th">Type</th>
                      <th className="sgc-th">Earned</th>
                      <th className="sgc-th">Date-Time</th>
                    </tr></thead>
                    <tbody>{earnings.filter(e=>e.type==='click').map((e,i)=>(
                      <tr key={i} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--dim)',fontWeight:600}}>{i+1}</td>
                        <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>Ad #{e.ad_id}</td>
                        <td className="sgc-td"><span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>🔗 URL/Link</span></td>
                        <td className="sgc-td" style={{color:'var(--green)',fontWeight:700}}>Rs. {e.amount?.toFixed(2)}</td>
                        <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(e.clicked_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {earnings.filter(e=>e.type==='click').length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No ad views yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── CREATE AD ── */}
            {tab==='create-ad' && (
              <div>
                <h2 className="sgc-heading">📢 Advertise Your Link</h2>

                <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-start'}}>

                  {/* ── LEFT: Form ── */}
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
                        fd.append('members_needed', parseInt(adForm.members_needed));
                        fd.append('payment_method', adPayMethod);
                        if(adPayMethod==='easypaisa' && adScreenshot) fd.append('screenshot', adScreenshot);
                        await API.post('/user/ad-request/submit', fd, {headers:{'Content-Type':'multipart/form-data'}});
                        notify('Ad request submitted! ✅');
                        setAdForm({title:'',url:'',members_needed:''});
                        setAdScreenshot(null);
                        API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data));
                        API.get('/user/profile').then(r=>setProfile(r.data));
                      } catch(err){ notify(err.response?.data?.detail||'Error','error'); }
                    }}>
                      <label className="sgc-label">Ad Title</label>
                      <input className="sgc-input" placeholder="e.g. Visit my YouTube channel" value={adForm.title} onChange={e=>setAdForm({...adForm,title:e.target.value})} required/>
                      <label className="sgc-label">Ad Link (URL)</label>
                      <input className="sgc-input" placeholder="https://yourlink.com" value={adForm.url} onChange={e=>setAdForm({...adForm,url:e.target.value})} required/>
                      <label className="sgc-label">Members Needed</label>
                      <input className="sgc-input" type="number" min="1" placeholder="e.g. 100" value={adForm.members_needed} onChange={e=>setAdForm({...adForm,members_needed:e.target.value})} required/>
                      {adForm.members_needed>0 && (
                        <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
                          <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>Total Cost</p>
                          <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:0}}>Rs. {(adForm.members_needed * adRate).toFixed(2)}</p>
                          <p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>{adForm.members_needed} members × Rs. {adRate}/member</p>
                        </div>
                      )}
                      <label className="sgc-label">Payment Method</label>
                      <div style={{display:'flex',gap:10,marginBottom:16}}>
                        {[['wallet','💳 Wallet'],['easypaisa','📱 Easypaisa']].map(([val,label])=>(
                          <div key={val} onClick={()=>setAdPayMethod(val)}
                            style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${adPayMethod===val?'var(--accent)':'var(--border)'}`,background:adPayMethod===val?'#0d1e38':'var(--bg)',cursor:'pointer',textAlign:'center',color:adPayMethod===val?'var(--accent)':'var(--muted)',fontWeight:700,fontSize:13,transition:'all .2s'}}>
                            {label}
                          </div>
                        ))}
                      </div>
                      {adPayMethod==='easypaisa' && (
                        <>
                          {epAccounts.filter(a=>(a.method_type||'easypaisa')==='easypaisa').slice(0,1).map(a=>(
                            <div key={a.id} style={{background:'#071a0d',border:'1.5px solid #3cb55940',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                              <p style={{color:'#3cb559',fontSize:11,fontWeight:700,margin:'0 0 10px',letterSpacing:.5}}>📱 SEND TO THIS EASYPAISA ACCOUNT</p>
                              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                                <div style={{width:36,height:36,borderRadius:8,background:'#3cb559',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📱</div>
                                <div>
                                  <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>{a.account_title}</p>
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
                      <button className="sgc-btn-primary" type="submit">📢 Submit Ad Request</button>
                    </form>
                  </div>

                  {/* ── RIGHT: My Campaigns ── */}
                  <div style={{flex:'1 1 300px',minWidth:0}}>
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
                        const accentCol = isApproved?'#4ade80':isCompleted?'#38bdf8':isRejected?'#f87171':'#fbbf24';
                        const borderCol = isApproved?'#166534':isCompleted?'#1e4080':isRejected?'#7f1d1d':'#92400e';
                        const bgCol    = isApproved?'#052e16':isCompleted?'#0c1e3e':isRejected?'#1c0a0a':'#1c1000';
                        return (
                          <div key={i} style={{background:bgCol,border:`1.5px solid ${borderCol}`,borderRadius:16,overflow:'hidden',animation:'fadeUp .3s ease both'}}>
                            {/* Header */}
                            <div style={{padding:'14px 16px',borderBottom:`1px solid ${borderCol}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                              <div style={{flex:1,minWidth:0}}>
                                <p style={{color:'var(--text)',fontWeight:800,fontSize:15,margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.title}</p>
                                <p style={{color:'var(--dim)',fontSize:11,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🔗 {r.url}</p>
                              </div>
                              <span style={{background:isApproved?'#064e3b':isCompleted?'#1e3a6e':isRejected?'#450a0a':'#451a03',color:accentCol,padding:'4px 14px',borderRadius:20,fontSize:12,fontWeight:800,flexShrink:0,whiteSpace:'nowrap'}}>
                                {isApproved?'✅ ACTIVE':isCompleted?'🏁 DONE':isRejected?'❌ REJECTED':'⏳ PENDING'}
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
                              <div style={{height:10,background:'#0b1120',borderRadius:6,overflow:'hidden',border:'1px solid var(--border)'}}>
                                <div style={{width:`${pct}%`,height:'100%',background:`linear-gradient(90deg,${accentCol},${isCompleted?'#818cf8':isApproved?'#86efac':'#fde68a'})`,borderRadius:6,transition:'width .6s ease',boxShadow:`0 0 8px ${accentCol}66`}}/>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:10}}>
                              {/* Viewers Button */}
                              {(isApproved||isCompleted) && (
                                <button onClick={async()=>{
                                  if(campaignViewers[r.id]!==undefined){ setCampaignViewers(p=>({...p,[r.id]:undefined})); return; }
                                  try{
                                    const res=await API.get(`/admin/campaign-viewers/${r.id}`,{headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}});
                                    setCampaignViewers(p=>({...p,[r.id]:res.data}));
                                  }catch{ notify('Could not load viewers','error'); }
                                }} style={{width:'100%',padding:'12px',background:campaignViewers[r.id]!==undefined?'#1e3a6e':'#0f2a4a',border:`1.5px solid #38bdf8`,borderRadius:10,color:'#38bdf8',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
                                  <span style={{fontSize:18}}>👥</span>
                                  {campaignViewers[r.id]!==undefined?'Hide Viewers':'View Who Watched My Ad'}
                                  {campaignViewers[r.id]&&<span style={{background:'#38bdf8',color:'#0b1120',borderRadius:20,padding:'1px 8px',fontSize:11,fontWeight:800}}>{campaignViewers[r.id].length}</span>}
                                </button>
                              )}

                              {/* Viewers List */}
                              {campaignViewers[r.id]!==undefined && (
                                <div style={{background:'#0b1120',borderRadius:10,border:'1px solid var(--border)',overflow:'hidden'}}>
                                  <div style={{padding:'8px 12px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:6}}>
                                    <span style={{fontSize:14}}>👁️</span>
                                    <span style={{color:'var(--muted)',fontSize:12,fontWeight:700}}>VIEWERS ({campaignViewers[r.id].length})</span>
                                  </div>
                                  <div style={{maxHeight:180,overflowY:'auto'}}>
                                    {campaignViewers[r.id].length===0&&(
                                      <p style={{color:'var(--dim)',fontSize:12,textAlign:'center',padding:'16px',margin:0}}>No viewers yet — campaign may be pending approval.</p>
                                    )}
                                    {campaignViewers[r.id].map((v,vi)=>(
                                      <div key={vi} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:vi<campaignViewers[r.id].length-1?'1px solid var(--border)':'none'}}>
                                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                                          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--bg)',flexShrink:0}}>{v.username[0].toUpperCase()}</div>
                                          <span style={{color:'var(--text)',fontSize:13,fontWeight:600}}>@{v.username}</span>
                                        </div>
                                        <span style={{color:'var(--dim)',fontSize:11}}>{new Date(v.viewed_at).toLocaleDateString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Reactivate Button */}
                              {(isRejected||isCompleted) && (
                                <button onClick={async()=>{
                                  try{
                                    await API.post(`/user/ad-request/reactivate/${r.id}`);
                                    notify('Campaign reactivated! 🚀');
                                    API.get('/user/ad-request/my-requests').then(res=>setMyAdRequests(res.data));
                                    API.get('/user/profile').then(res=>setProfile(res.data));
                                  }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
                                }} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
                                  <span style={{fontSize:18}}>🔄</span> Reactivate Campaign
                                </button>
                              )}

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
            )}

            {/* ── SUPPORT TICKET ── */}
            {tab==='support' && (
              <div>
                <h2 className="sgc-heading">🎫 Support Ticket</h2>
                <form onSubmit={handleTicket} className="sgc-form" style={{marginBottom:24}}>
                  <label className="sgc-label">Subject</label>
                  <input className="sgc-input" placeholder="Enter ticket subject" value={ticket.subject} onChange={e=>setTicket({...ticket,subject:e.target.value})} required/>
                  <label className="sgc-label">Message</label>
                  <textarea className="sgc-input" rows={4} placeholder="Describe your issue..." value={ticket.message} onChange={e=>setTicket({...ticket,message:e.target.value})} required style={{resize:'vertical',minHeight:100}}/>
                  <button className="sgc-btn-primary" type="submit">Submit Ticket</button>
                </form>
                <h3 className="sgc-subheading">My Tickets</h3>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {tickets.map((t,i)=>(
                    <div key={i} className="sgc-form fade-in">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <span style={{color:'var(--text)',fontWeight:700,fontSize:14}}>{t.subject}</span>
                        <span className="sgc-badge" style={{background:t.status==='open'?'#451a03':t.status==='replied'?'#064e3b':'#1e293b'}}>{t.status}</span>
                      </div>
                      <p style={{color:'var(--dim)',fontSize:13,marginBottom:t.reply?10:0}}>{t.message}</p>
                      {t.reply&&(
                        <div style={{background:'var(--bg)',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',marginTop:8}}>
                          <p style={{color:'var(--yellow)',fontSize:11,fontWeight:700,marginBottom:4}}>Admin Reply:</p>
                          <p style={{color:'var(--muted)',fontSize:13}}>{t.reply}</p>
                        </div>
                      )}
                      <p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                  {tickets.length===0&&<div className="sgc-empty">No tickets submitted yet.</div>}
                </div>
              </div>
            )}

            {/* ── KYC VERIFICATION ── */}
            {tab==='kyc' && (
              <div>
                <h2 className="sgc-heading">🪪 KYC Verification</h2>
                {/* Status badge */}
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24,padding:'14px 18px',background:'var(--card)',borderRadius:12,border:'1px solid var(--border)',maxWidth:480}}>
                  <span style={{fontSize:32}}>
                    {kycData?.kyc_status==='approved'?'✅':kycData?.kyc_status==='pending'?'⏳':kycData?.kyc_status==='rejected'?'❌':'🚪'}
                  </span>
                  <div>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>KYC Status</p>
                    <p style={{color:kycData?.kyc_status==='approved'?'var(--green)':kycData?.kyc_status==='pending'?'var(--yellow)':kycData?.kyc_status==='rejected'?'var(--red)':'var(--dim)',fontSize:13,margin:'2px 0 0',fontWeight:600,textTransform:'capitalize'}}>
                      {kycData?.kyc_status==='none'?'Not Submitted':kycData?.kyc_status}
                    </p>
                    {kycData?.kyc?.admin_note && <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Note: {kycData.kyc.admin_note}</p>}
                  </div>
                </div>

                {kycData?.kyc_status==='approved' ? (
                  <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'20px 24px',maxWidth:480}}>
                    <p style={{color:'#4ade80',fontWeight:700,fontSize:15,margin:'0 0 8px'}}>✅ KYC Verified Successfully</p>
                    <p style={{color:'var(--dim)',fontSize:13,margin:0}}>Your identity has been verified. You can now withdraw funds and access all bonuses.</p>
                    {kycData.kyc && (
                      <div style={{marginTop:14,borderTop:'1px solid var(--border)',paddingTop:14}}>
                        <p style={{color:'var(--muted)',fontSize:12,margin:'0 0 4px'}}>Name: <b style={{color:'var(--text)'}}>{kycData.kyc.full_name}</b></p>
                        <p style={{color:'var(--muted)',fontSize:12,margin:0}}>CNIC: <b style={{color:'var(--text)'}}>{kycData.kyc.cnic}</b></p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form className="sgc-form" style={{maxWidth:480}} onSubmit={async(e)=>{
                    e.preventDefault();
                    if(!kycForm.first_name.trim()){ notify('First name is required','error'); return; }
                    if(!kycForm.last_name.trim()){ notify('Last name is required','error'); return; }
                    if(!kycForm.phone.trim()){ notify('Phone number is required','error'); return; }
                    if(!kycFront){ notify('CNIC front photo is required','error'); return; }
                    if(!kycSelfie){ notify('Selfie with CNIC is required','error'); return; }
                    try{
                      const fd=new FormData();
                      fd.append('full_name', `${kycForm.first_name.trim()} ${kycForm.last_name.trim()}`);
                      fd.append('cnic', kycForm.phone.trim());
                      fd.append('front_photo', kycFront);
                      fd.append('selfie_photo', kycSelfie);
                      await API.post('/user/kyc/submit', fd, {headers:{'Content-Type':'multipart/form-data'}});
                      notify('KYC submitted! Admin will verify shortly. ✅');
                      API.get('/user/kyc/status').then(r=>{ setKycData(r.data); setFreePlanExpired(r.data.free_plan_expired); setFreePlanDaysLeft(r.data.free_plan_days_left); });
                      API.get('/user/profile').then(r=>setProfile(r.data));
                    }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
                  }}>
                    <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
                      <p style={{color:'var(--accent)',fontSize:13,fontWeight:700,margin:'0 0 6px'}}>📋 KYC Requirements</p>
                      <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>• First & Last name required</p>
                      <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>• Valid phone number required</p>
                      <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>• Valid CNIC front photo</p>
                      <p style={{color:'var(--dim)',fontSize:12,margin:0}}>• Selfie holding your CNIC</p>
                    </div>
                    <label className="sgc-label">First Name <span style={{color:'var(--red)'}}>*</span></label>
                    <input className="sgc-input" placeholder="e.g. Muhammad" value={kycForm.first_name} onChange={e=>setKycForm({...kycForm,first_name:e.target.value})} required/>
                    <label className="sgc-label">Last Name <span style={{color:'var(--red)'}}>*</span></label>
                    <input className="sgc-input" placeholder="e.g. Ali" value={kycForm.last_name} onChange={e=>setKycForm({...kycForm,last_name:e.target.value})} required/>
                    <label className="sgc-label">Phone Number <span style={{color:'var(--red)'}}>*</span></label>
                    <input className="sgc-input" type="tel" placeholder="03XX-XXXXXXX" value={kycForm.phone} onChange={e=>setKycForm({...kycForm,phone:e.target.value})} required/>
                    <label className="sgc-label">CNIC Front Photo <span style={{color:'var(--red)'}}>*</span></label>
                    <label style={{display:'block',border:`2px dashed ${kycFront?'var(--green)':'var(--border)'}`,borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setKycFront(e.target.files[0])}/>
                      {kycFront?<p style={{color:'var(--green)',margin:0}}>✓ {kycFront.name}</p>:<p style={{color:'var(--dim)',margin:0}}>📷 Upload CNIC Front <span style={{color:'var(--red)'}}>*</span></p>}
                    </label>
                    <label className="sgc-label">Selfie with CNIC <span style={{color:'var(--red)'}}>*</span></label>
                    <label style={{display:'block',border:`2px dashed ${kycSelfie?'var(--green)':'var(--border)'}`,borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setKycSelfie(e.target.files[0])}/>
                      {kycSelfie?<p style={{color:'var(--green)',margin:0}}>✓ {kycSelfie.name}</p>:<p style={{color:'var(--dim)',margin:0}}>🤳 Upload Selfie with CNIC <span style={{color:'var(--red)'}}>*</span></p>}
                    </label>
                    {kycData?.kyc_status==='pending' ? (
                      <div style={{background:'#451a03',border:'1px solid #f59e0b',borderRadius:10,padding:'12px 16px',textAlign:'center'}}>
                        <p style={{color:'#fbbf24',fontSize:13,margin:0,fontWeight:600}}>⏳ KYC is under review. Please wait for admin approval.</p>
                      </div>
                    ) : (
                      <button className="sgc-btn-primary" type="submit">🚀 Submit KYC</button>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* ── 2FA SECURITY ── */}
            {tab==='2fa' && (
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
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
