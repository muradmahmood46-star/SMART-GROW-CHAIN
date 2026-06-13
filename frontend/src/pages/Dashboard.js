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
  { key:'notifications',icon:'🔔', label:'Notifications'   },
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
  const [notifications, setNotifications] = useState([]);
  const [kycFront, setKycFront]       = useState(null);
  const [kycSelfie, setKycSelfie]     = useState(null);
  const [freePlanExpired, setFreePlanExpired] = useState(false);
  const [freePlanDaysLeft, setFreePlanDaysLeft] = useState(null);
  const [adWelcomeMsg, setAdWelcomeMsg] = useState('');
  const [showAdWelcome, setShowAdWelcome] = useState(false);
  const [campaignViewers, setCampaignViewers] = useState({});
  const [siteSettings, setSiteSettings] = useState({});
  const [referralMsg, setReferralMsg] = useState('');
  const [dashboardMsg, setDashboardMsg] = useState('');
  const [withdrawalMsg, setWithdrawalMsg] = useState('');
  const [advertiserMsg, setAdvertiserMsg] = useState('');
  const [selectedRefLevel, setSelectedRefLevel] = useState(null);
  const [refLevelData, setRefLevelData] = useState({});
  const [refLevelLoading, setRefLevelLoading] = useState(false);
  const [adForm, setAdForm]           = useState({ title:'', url:'', members_needed:'' });
  const [adPayMethod, setAdPayMethod] = useState('wallet');
  const [adScreenshot, setAdScreenshot] = useState(null);
  const [myAdRequests, setMyAdRequests] = useState([]);
  const [minCampaignUsers, setMinCampaignUsers] = useState(50);
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

  const [deposit, setDeposit]           = useState({ amount_pkr:'', easypaisa_account_id:'', sender_name:'', transaction_id:'', screenshot_note:'', bank_name:'', bank_account_holder:'', bank_account_number:'' });
  const [screenshot, setScreenshot]     = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [withdraw, setWithdraw]       = useState({ amount:'', method:'easypaisa', wallet_address:'' });
  const [withdrawBankName, setWithdrawBankName] = useState('');
  const [withdrawBankHolder, setWithdrawBankHolder] = useState('');
  const [transfer, setTransfer]       = useState({ receiver_username:'', amount:'', note:'' });
  const [ticket, setTicket]           = useState({ subject:'', message:'' });
  const [faCode, setFaCode]           = useState('');
  const [showAllTx, setShowAllTx] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [planTick, setPlanTick] = useState(0);
  const [msg, setMsg]                 = useState({ text:'', type:'' });
  const navigate = useNavigate();

  const notify = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };

  const loadData = useCallback(() => {
    API.get('/user/profile').then(r=>setProfile(r.data));
    API.get('/user/ads').then(r=>setAds(r.data));
    API.get('/user/earnings').then(r=>setEarnings(r.data));
    API.get('/user/withdrawals').then(r=>setWithdrawals(r.data));
    API.get('/user/referrals').then(r=>{ setReferrals(r.data); setReferralMsg(r.data.referral_message||''); });
    API.get('/user/referral-bonus').then(r=>setRefBonus(r.data));
    API.get('/deposit/easypaisa-accounts').then(r=>setEpAccounts(r.data));
    API.get('/deposit/my-deposits').then(r=>setMyDeposits(r.data));
    API.get('/user/transfers').then(r=>setTransfers(r.data));
    API.get('/user/transactions').then(r=>setTransactions(r.data));
    API.get('/user/tickets').then(r=>setTickets(r.data));
    API.get('/user/plans').then(r=>setPlans(r.data));
    API.get('/user/ad-request/rate').then(r=>{ setAdRate(r.data.rate_pkr); setAdWelcomeMsg(r.data.welcome_message||''); }).catch(()=>{});
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
    API.get('/user/settings').then(r=>{ setSiteSettings(r.data); setReferralMsg(r.data.referral_message||''); setDashboardMsg(r.data.dashboard_message||''); setWithdrawalMsg(r.data.withdrawal_message||''); setAdvertiserMsg(r.data.advertiser_message||''); if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50); }).catch(()=>{});
    API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
    API.get('/user/kyc/status').then(r=>{ setKycData(r.data); setFreePlanExpired(r.data.free_plan_expired); setFreePlanDaysLeft(r.data.free_plan_days_left); }).catch(()=>{});
    API.get('/user/notifications').then(r=>setNotifications(r.data)).catch(()=>{});
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);

  // ── Show free plan activation reminder once per session ──

  // ── Plan countdown ticker ──
  useEffect(()=>{
    const t = setInterval(()=>setPlanTick(x=>x+1), 1000);
    return ()=>clearInterval(t);
  },[]);

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
    let walletAddr = withdraw.wallet_address;
    if(withdraw.method==='bank'){
      if(!withdrawBankName||!withdrawBankHolder||!withdraw.wallet_address){ notify('Please fill all bank fields','error'); return; }
      walletAddr = `${withdrawBankHolder}|${withdraw.wallet_address}|${withdrawBankName}`;
    }
    try{ await API.post('/user/withdraw',{...withdraw,amount:parseFloat(withdraw.amount),wallet_address:walletAddr}); notify('Payout request submitted!'); loadData(); setWithdraw({amount:'',method:'easypaisa',wallet_address:''}); setWithdrawBankName(''); setWithdrawBankHolder(''); }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const handleDeposit = async(e)=>{
    e.preventDefault();
    if(selectedMethod==='bank'){
      if(!deposit.bank_name||!deposit.bank_account_holder||!deposit.bank_account_number){ notify('Please fill all bank fields','error'); return; }
      if(!screenshot){ notify('Please upload payment screenshot','error'); return; }
      const bankAccount = epAccounts.find(a=>a.method_type==='bank');
      if(!bankAccount){ notify('No bank account available','error'); return; }
      try{
        const fd = new FormData();
        fd.append('amount_pkr', parseFloat(deposit.amount_pkr));
        fd.append('easypaisa_account_id', bankAccount.id);
        fd.append('sender_name', deposit.bank_account_holder);
        fd.append('transaction_id', `BANK|${deposit.bank_name}|${deposit.bank_account_number}`);
        fd.append('screenshot_note', deposit.screenshot_note||'');
        fd.append('screenshot', screenshot);
        await API.post('/deposit/request', fd, { headers:{'Content-Type':'multipart/form-data'} });
        notify('Fund request submitted! Admin will verify shortly.');
        loadData();
        setDeposit({amount_pkr:'',easypaisa_account_id:'',sender_name:'',transaction_id:'',screenshot_note:'',bank_name:'',bank_account_holder:'',bank_account_number:''});
        setScreenshot(null);
      }
      catch(err){ notify(err.response?.data?.detail||'Error','error'); }
      return;
    }
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
      setDeposit({amount_pkr:'',easypaisa_account_id:'',sender_name:'',transaction_id:'',screenshot_note:'',bank_name:'',bank_account_holder:'',bank_account_number:''});
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

  const loadRefLevel = async (lvl) => {
    setSelectedRefLevel(lvl);
    if (refLevelData[lvl] !== undefined) return; // cached
    setRefLevelLoading(true);
    try {
      const r = await API.get(`/user/referrals/level/${lvl}`);
      setRefLevelData(prev => ({ ...prev, [lvl]: r.data }));
    } catch { }
    setRefLevelLoading(false);
  };

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
      <div className={`sgc-overlay ${sidebarOpen?'open':''}`} onClick={()=>{setSidebarOpen(false);setShowNotifDropdown(false);}}/>

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
              {key==='notifications' && notifications.filter(n=>!n.is_read).length>0 && <span className="nav-badge">{notifications.filter(n=>!n.is_read).length}</span>}
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
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{position:'relative'}}>
              <button onClick={()=>setShowNotifDropdown(v=>!v)}
                style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,position:'relative'}}>
                🔔
                {notifications.filter(n=>!n.is_read).length>0 && (
                  <span style={{position:'absolute',top:-4,right:-4,background:'#ef4444',color:'#fff',borderRadius:'50%',width:16,height:16,fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {notifications.filter(n=>!n.is_read).length}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <div style={{position:'absolute',right:0,top:44,width:280,background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.5)',zIndex:999,overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'var(--text)',fontWeight:700,fontSize:13}}>Notifications</span>
                    <button onClick={()=>{setShowNotifDropdown(false);setTab('notifications');}} style={{background:'none',border:'none',color:'var(--accent)',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}}>See all</button>
                  </div>
                  {notifications.length===0 && <p style={{color:'var(--dim)',fontSize:13,textAlign:'center',padding:16,margin:0}}>No notifications</p>}
                  {notifications.slice(0,3).map((n,i)=>(
                    <div key={i} style={{padding:'10px 14px',borderBottom:i<2?'1px solid var(--border)':'none',background:n.is_read?'transparent':'#0d1e38'}}>
                      <p style={{color:n.is_read?'var(--muted)':'var(--text)',fontWeight:600,fontSize:13,margin:'0 0 2px'}}>{n.title}</p>
                      <p style={{color:'var(--dim)',fontSize:12,margin:0}}>{n.message?.substring(0,55)}{n.message?.length>55?'...':''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="sgc-avatar" style={{background:'linear-gradient(135deg,#0d9488,#0891b2)',width:36,height:36,fontSize:15,flexShrink:0}}>
              {profile.username[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div className="panel-body">
          {msg.text && <div className="sgc-toast" style={{background:msg.type==='error'?'var(--red)':msg.type==='info'?'#1e3a6e':'var(--green)',color:msg.type==='error'?'#fff':msg.type==='info'?'var(--accent)':'var(--bg)',border:msg.type==='info'?'1px solid var(--accent)':'none'}}>{msg.text}</div>}

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
              <span style={{fontSize:20}}></span>
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
              <span style={{fontSize:20}}></span>
              <p style={{color:'#fbbf24',fontSize:13,margin:0,fontWeight:600}}>Free plan expires in <b>{freePlanDaysLeft} day(s)</b>. Upgrade to keep earning!</p>
              <button onClick={()=>setTab('plans')} style={{marginLeft:'auto',background:'var(--yellow)',color:'var(--bg)',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>Upgrade</button>
            </div>
          )}

          {/* ── ADVERTISE WELCOME MODAL ── */}
          {showAdWelcome && advertiserMsg && (
            <div className="sgc-modal-overlay" onClick={()=>setShowAdWelcome(false)}>
              <div className="sgc-modal" style={{textAlign:'left',maxWidth:500,maxHeight:'80vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
                <div style={{textAlign:'center',marginBottom:16}}>
                  <div style={{fontSize:40,marginBottom:8}}>📢</div>
                  <h3 style={{color:'var(--accent)',fontSize:17,fontWeight:800,margin:0}}>Advertiser Guidelines</h3>
                </div>
                <div style={{background:'var(--bg)',borderRadius:10,padding:'14px 16px',marginBottom:16,maxHeight:360,overflowY:'auto'}}>
                  <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{advertiserMsg}</p>
                </div>
                <button className="sgc-btn-primary" style={{width:'100%'}} onClick={()=>setShowAdWelcome(false)}>I Understand → Get Started</button>
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
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h2 className="sgc-heading" style={{margin:0}}>Dashboard</h2>
                </div>
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

                {/* Dashboard Bottom Custom Message */}
                {dashboardMsg&&(
                  <div style={{background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:16,padding:'16px 20px',marginTop:16}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <span style={{fontSize:20}}>📋</span>
                      <span style={{color:'var(--accent)',fontWeight:800,fontSize:14,letterSpacing:.3}}>IMPORTANT NOTICE</span>
                    </div>
                    <p style={{color:'var(--muted)',fontSize:14,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{dashboardMsg}</p>
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
                    <div key={ad.id} className="sgc-ad-card" style={{opacity:ad.already_clicked?0.55:1,animationDelay:`${i*.05}s`,border:ad.is_sponsored?'2px solid #f59e0b':'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                        <div style={{flex:1,marginRight:8}}>
                          {ad.is_sponsored && <span style={{background:'#451a03',color:'#f59e0b',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,display:'inline-block',marginBottom:4}}>⭐ SPONSORED</span>}
                          <h4 style={{color:'var(--text)',fontSize:14,fontWeight:700,margin:0}}>{ad.title}</h4>
                        </div>
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
                            <span style={{fontSize:22}}>{isPending?'⏳':isConfirmed?'✅':''}</span>
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
                    {kycData?.kyc_status==='rejected' && <p style={{color:'#fca5a5',fontSize:12,marginTop:12}}>KYC was rejected. Please resubmit with correct documents.</p>}
                  </div>
                ) : (() => {
                  const curPlan = plans.find(p=>p.name===profile.membership);
                  const minW = curPlan?.min_withdrawal || 500;
                  const maxW = curPlan?.max_withdrawal || 0;
                  const totalPayout = withdrawals.filter(w=>w.status==='approved'||w.status==='sent').reduce((s,w)=>s+w.amount,0);
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
                        <button className="sgc-btn-primary" type="submit">Submit Request</button>
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
                {siteSettings.transfer_message && (
                  <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'12px 16px',marginBottom:24,display:'flex',gap:8,alignItems:'flex-start'}}>
                    <span style={{fontSize:16,flexShrink:0}}>💬</span>
                    <p style={{color:'#94a3b8',fontSize:13,margin:0,lineHeight:1.6}}>{siteSettings.transfer_message}</p>
                  </div>
                )}
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
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginBottom:28}}>
                    {epAccounts.map(a=>{
                      const isEP=(a.method_type||'easypaisa')==='easypaisa';
                      const isBank=a.method_type==='bank';
                      const col=isEP?'#22c55e':isBank?'#3b82f6':'#ef4444';
                      const bg=isEP?'linear-gradient(135deg,#dcfce7,#86efac)':isBank?'linear-gradient(135deg,#dbeafe,#60a5fa)':'linear-gradient(135deg,#fee2e2,#f87171)';
                      const methodLabel=isEP?'EASYPAISA':isBank?'BANK TRANSFER':'JAZZCASH';
                      return (
                        <div key={a.id} style={{background:bg,border:`2px solid ${col}`,borderRadius:16,padding:'20px 22px',minHeight:210,boxShadow:`0 10px 24px ${col}26`,color:'#0f172a'}}>
                          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                            <div style={{width:46,height:46,borderRadius:12,background:'#0f172a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,flexShrink:0}}>
                              {isEP?'EP':isBank?'BK':'JC'}
                            </div>
                            <div>
                              <p style={{color:'#0f172a',fontSize:12,fontWeight:900,margin:'0 0 3px',letterSpacing:.6}}>{methodLabel}</p>
                              <p style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)',fontWeight:900,fontSize:18,margin:0}}>{a.account_title}</p>
                            </div>
                          </div>
                          <div style={{background:'rgba(15,23,42,.9)',borderRadius:12,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                            <div>
                              <p style={{color:'#cbd5e1',fontSize:10,margin:'0 0 3px',fontWeight:700}}>Account Number</p>
                              <p style={{color:'#facc15',fontFamily:'monospace',fontSize:17,fontWeight:900,letterSpacing:1,margin:0,wordBreak:'break-all'}}>{a.account_number}</p>
                            </div>
                            <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Number copied! 📋');}} style={{background:'#facc15',border:'none',color:'#111827',borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:12,fontWeight:900,fontFamily:'var(--font)'}}>Copy</button>
                          </div>
                          {isBank&&(
                            <div style={{marginTop:10,color:'#0f172a',fontSize:13,lineHeight:1.7,fontWeight:700}}>
                              <div>Bank: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.bank_name||'Bank Transfer'}</b></div>
                              <div>Account title: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.account_title}</b></div>
                            </div>
                          )}
                          {a.deposit_message && (
                            <div style={{marginTop:12,background:'rgba(255,255,255,.72)',border:'1px solid rgba(15,23,42,.15)',borderRadius:10,padding:'10px 12px',display:'flex',gap:8,alignItems:'flex-start'}}>
                              <span style={{fontSize:15,flexShrink:0}}>💬</span>
                              <p style={{color:'#0f172a',fontSize:12,margin:0,lineHeight:1.6,whiteSpace:'pre-wrap',fontWeight:700}}>{a.deposit_message}</p>
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
                    <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>PAYMENT METHOD</p>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:14,marginBottom:22,maxWidth:760}}>
                      {['easypaisa','jazzcash'].map(m=>{
                        const isEP=m==='easypaisa'; const col=isEP?'#3cb559':'#e8001e';
                        const hasAccs=epAccounts.some(a=>(a.method_type||'easypaisa')===m);
                        return (
                          <div key={m} onClick={()=>hasAccs&&setSelectedMethod(m)}
                            style={{minHeight:92,padding:'18px 14px',borderRadius:16,border:`2px solid ${selectedMethod===m?col:'var(--border)'}`,background:selectedMethod===m?(isEP?'#dcfce7':'#fee2e2'):'var(--card)',cursor:hasAccs?'pointer':'not-allowed',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:selectedMethod===m?`0 8px 22px ${col}33`:'none',opacity:hasAccs?1:.55}}>
                            <span style={{fontSize:18,fontWeight:900,color:selectedMethod===m?'#0f172a':'var(--muted)'}}>{isEP?'EP':'JC'}</span>
                            <span style={{color:selectedMethod===m?'#0f172a':'var(--muted)',fontWeight:900,fontSize:15}}>{isEP?'Easypaisa':'JazzCash'}</span>
                            {!hasAccs&&<span style={{color:'var(--dim)',fontSize:10,fontWeight:700}}>Not available</span>}
                          </div>
                        );
                      })}
                      <div onClick={()=>epAccounts.some(a=>a.method_type==='bank')&&setSelectedMethod('bank')}
                        style={{minHeight:92,padding:'18px 14px',borderRadius:16,border:`2px solid ${selectedMethod==='bank'?'#3b82f6':'var(--border)'}`,background:selectedMethod==='bank'?'#dbeafe':'var(--card)',cursor:epAccounts.some(a=>a.method_type==='bank')?'pointer':'not-allowed',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:selectedMethod==='bank'?'0 8px 22px #3b82f633':'none',opacity:epAccounts.some(a=>a.method_type==='bank')?1:.55}}>
                        <span style={{fontSize:18,fontWeight:900,color:selectedMethod==='bank'?'#0f172a':'var(--muted)'}}>BK</span>
                        <span style={{color:selectedMethod==='bank'?'#0f172a':'var(--muted)',fontWeight:900,fontSize:15}}>Bank Transfer</span>
                        {!epAccounts.some(a=>a.method_type==='bank')&&<span style={{color:'var(--dim)',fontSize:10,fontWeight:700}}>Not available</span>}
                      </div>
                    </div>

                    {/* ── Submit Form ── */}
                    {(()=>{
                      if(selectedMethod==='bank'){
                        return (
                          <form onSubmit={handleDeposit} className="sgc-form" style={{background:'#0a1628',border:'1px solid #1e4080',maxWidth:520}}>
                            <label className="sgc-label">Amount Sent (Rs.)</label>
                            <input className="sgc-input" type="number" min="100" placeholder="Min Rs. 100" value={deposit.amount_pkr} onChange={e=>setDeposit({...deposit,amount_pkr:e.target.value})} required/>
                            <label className="sgc-label">Bank Name</label>
                            <input className="sgc-input" placeholder="e.g. HBL, UBL, Meezan Bank" value={deposit.bank_name} onChange={e=>setDeposit({...deposit,bank_name:e.target.value})} required/>
                            <label className="sgc-label">Account Holder Name</label>
                            <input className="sgc-input" placeholder="e.g. Ali Hassan" value={deposit.bank_account_holder} onChange={e=>setDeposit({...deposit,bank_account_holder:e.target.value})} required/>
                            <label className="sgc-label">Account Number / IBAN</label>
                            <input className="sgc-input" placeholder="e.g. PK36HABB0000123456789012" value={deposit.bank_account_number} onChange={e=>setDeposit({...deposit,bank_account_number:e.target.value})} required/>
                            <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                            <div style={{marginBottom:16}}>
                              <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'20px',textAlign:'center',cursor:'pointer',background:'var(--bg)',transition:'border-color .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
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
                            <button className="sgc-btn-primary" type="submit" style={{background:'linear-gradient(135deg,#3b82f6,#1d4ed8)'}}>📤 Submit Deposit Request</button>
                          </form>
                        );
                      }
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

                {/* Current Plan Info Card */}
                {(()=>{
                  const expiryDate = profile.free_plan_expires_at
                    ? new Date(profile.free_plan_expires_at)
                    : profile.plan_expires_at
                    ? new Date(profile.plan_expires_at)
                    : null;
                  const now = new Date();
                  void planTick; // trigger re-render every second
                  const isExpired = expiryDate && expiryDate < now;
                  const diffMs = expiryDate && !isExpired ? expiryDate - now : 0;
                  const totalSecs = Math.floor(diffMs/1000);
                  const dd = Math.floor(totalSecs/86400);
                  const hh = Math.floor((totalSecs%86400)/3600);
                  const mm = Math.floor((totalSecs%3600)/60);
                  const ss = totalSecs%60;
                  return (
                    <div style={{background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:14,padding:'18px 20px',marginBottom:16,maxWidth:480}}>
                      <p style={{color:'var(--muted)',fontSize:11,fontWeight:700,letterSpacing:1,margin:'0 0 10px'}}>CURRENT PLAN</p>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:expiryDate?14:0}}>
                        <div>
                          <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:0,textTransform:'capitalize'}}>🏆 {profile.membership}</p>
                          {expiryDate && (
                            <p style={{color:isExpired?'var(--red)':'var(--green)',fontSize:12,margin:'4px 0 0',fontWeight:600}}>
                              {isExpired?'Expired on':'Expires'}: <b>{expiryDate.toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</b>
                            </p>
                          )}
                          {!expiryDate && <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>No expiry set</p>}
                        </div>
                        <span style={{background:isExpired?'#450a0a':profile.membership==='free'&&!expiryDate?'#334155':'#064e3b',color:isExpired?'#fca5a5':profile.membership==='free'&&!expiryDate?'var(--muted)':'#4ade80',padding:'4px 16px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'uppercase'}}>
                          {isExpired?'EXPIRED':profile.membership==='free'&&!expiryDate?'FREE':'ACTIVE'}
                        </span>
                      </div>
                      {expiryDate && !isExpired && (
                        <div style={{background:'rgba(0,0,0,.25)',borderRadius:10,padding:'12px 14px'}}>
                          <p style={{color:'var(--dim)',fontSize:10,fontWeight:700,letterSpacing:1,margin:'0 0 8px'}}>⏱ EXPIRES IN</p>
                          <div style={{display:'flex',gap:8}}>
                            {[[dd,'Days'],[hh,'Hours'],[mm,'Mins'],[ss,'Secs']].map(([val,label])=>(
                              <div key={label} style={{flex:1,background:'rgba(255,255,255,.08)',borderRadius:8,padding:'8px 4px',textAlign:'center'}}>
                                <p style={{color:'#fff',fontSize:20,fontWeight:900,margin:0,fontFamily:'monospace'}}>{String(val).padStart(2,'0')}</p>
                                <p style={{color:'var(--dim)',fontSize:10,margin:'2px 0 0',fontWeight:600}}>{label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {isExpired && (
                        <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:10,padding:'10px 14px',marginTop:10}}>
                          <p style={{color:'#fca5a5',fontSize:13,margin:0,fontWeight:600}}>⚠️ Your plan has expired. Please purchase a new plan to continue earning.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Upsell message */}
                <div style={{background:'linear-gradient(135deg,#451a03,#92400e20)',border:'1px solid #92400e',borderRadius:10,padding:'10px 16px',marginBottom:24,maxWidth:480,display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:20}}>🚀</span>
                  <p style={{color:'#fbbf24',fontSize:13,fontWeight:600,margin:0}}>Buy a bigger plan and earn more profit!</p>
                </div>

                {/* Plan cards */}
                {!selectedPlan && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16,marginBottom:28}}>
                    {plans.map((p,i)=>{
                      const isCurrent=profile.membership===p.name;
                      const colors=['var(--dim)','var(--accent)','var(--yellow)','var(--purple)'];
                      const col=colors[i]||'var(--accent)';
                      let lvlMap={};
                      let detailMap={};
                      try{ lvlMap=JSON.parse(p.level_commissions||'{}'); }catch{}
                      try{ detailMap=JSON.parse(p.level_details||'{}'); }catch{}
                      const refDisplay = Object.keys(lvlMap).length>0
                        ? Object.entries(lvlMap).map(([k,v])=>`L${k}:${v}%`).join(', ')
                        : `${(p.referral_commission*100).toFixed(0)}%`;
                      const levelDetails = Object.entries(detailMap).filter(([,v])=>v).map(([k,v])=>`L${k}: ${v}`).join(' | ');
                      return (
                        <div key={p.id} style={{background:'var(--card)',border:`2px solid ${isCurrent?col:'var(--border)'}`,borderRadius:16,padding:24,position:'relative',transition:'transform .2s'}}>
                          {isCurrent&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:col,color:'var(--bg)',padding:'2px 14px',borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{String.fromCharCode(10003)} Current Plan</div>}
                          <h3 style={{color:col,textTransform:'capitalize',marginBottom:4,fontSize:17}}>{p.name}</h3>
                          <p style={{color:'var(--text)',fontSize:26,fontWeight:800,marginBottom:16}}>Rs. {p.price}<span style={{fontSize:13,color:'var(--dim)',fontWeight:400}}>/{p.period_days}d</span></p>
                          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                            {[
                              ['📺',`${p.daily_ads} ads/day`],
                              ['💰',`Rs. ${p.earning_per_click} per click`],
                              ['👥',`${refDisplay} referral commission`],
                              ['🔗',`${p.referral_levels||'N/A'} referral levels`],
                              ['⬇️',`Min Withdraw: Rs. ${p.min_withdrawal||0}`],
                              ['⬆️',`Max Withdraw: ${p.max_withdrawal>0?`Rs. ${p.max_withdrawal}`:'No limit'}`],
                              ['i',levelDetails || `Send link to ${p.required_referrals_per_level||3} users for next level`],
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
                            <button onClick={()=>{ setSelectedPlan(p); setPlanPayMethod('wallet'); }}
                              style={{width:'100%',padding:'10px',background:'var(--border)',color:'var(--muted)',border:'1px solid var(--border)',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}}>
                              Activate Free Plan
                            </button>
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

                    {/* Method selector — only for paid plans */}
                    {selectedPlan.price > 0 && (
                      <>
                        <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>PAYMENT METHOD</p>
                        <div style={{display:'flex',gap:10,marginBottom:20}}>
                          {[['wallet','💳 Wallet'],['easypaisa','📱 Easypaisa']].map(([val,label])=>(
                            <div key={val} onClick={()=>setPlanPayMethod(val)}
                              style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${planPayMethod===val?'var(--accent)':'var(--border)'}`,background:planPayMethod===val?'#0d1e38':'var(--bg)',cursor:'pointer',textAlign:'center',color:planPayMethod===val?'var(--accent)':'var(--muted)',fontWeight:700,fontSize:13,transition:'all .2s'}}>
                              {label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Free plan — just confirm */}
                    {selectedPlan.price === 0 && (
                      <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                        <p style={{color:'#4ade80',fontSize:13,fontWeight:600,margin:0}}>✓ This is a free plan. Click below to activate it.</p>
                      </div>
                    )}

                    {/* Wallet */}
                    {selectedPlan.price > 0 && planPayMethod==='wallet' && (
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
                    {selectedPlan.price > 0 && planPayMethod==='easypaisa' && (
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
                        if(selectedPlan.price > 0 && planPayMethod==='wallet' && profile.balance < selectedPlan.price){
                          notify('Insufficient balance','error'); return;
                        }
                        if(selectedPlan.price > 0 && planPayMethod==='easypaisa' && !planScreenshot){
                          notify('Please upload payment screenshot','error'); return;
                        }
                        const fd=new FormData();
                        fd.append('plan_id', selectedPlan.id);
                        fd.append('payment_method', selectedPlan.price===0 ? 'wallet' : planPayMethod);
                        fd.append('sender_name', planSenderName);
                        fd.append('sender_phone', planSenderPhone);
                        if(selectedPlan.price > 0 && planPayMethod==='easypaisa' && planScreenshot) fd.append('screenshot', planScreenshot);
                        await API.post('/user/plan/purchase', fd, {headers:{'Content-Type':'multipart/form-data'}});
                        notify(selectedPlan.price===0 ? 'Free plan activated! ✅' : 'Plan purchase request submitted! Admin will activate shortly. ✅');
                        setSelectedPlan(null);
                        API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data));
                        API.get('/user/profile').then(r=>setProfile(r.data));
                      }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
                    }}>{selectedPlan.price===0 ? '✔ Activate Free Plan' : '📤 Submit Purchase Request'}</button>
                  </div>
                )}

                {/* My purchase history */}
                {myPlanPurchases.length>0 && (
                  <div style={{marginTop:28}}>
                    <h3 className="sgc-subheading" style={{marginBottom:12}}>📋 My Plan Purchase History</h3>
                    <div className="sgc-table-wrap">
                      <table className="sgc-table">
                        <thead><tr><th className="sgc-th">Plan</th><th className="sgc-th">Price</th><th className="sgc-th">Method</th><th className="sgc-th">Status</th><th className="sgc-th">Expiry</th><th className="sgc-th">Date</th></tr></thead>
                        <tbody>{myPlanPurchases.map((r,i)=>(
                          <tr key={i} className="sgc-tr">
                            <td className="sgc-td" style={{color:'var(--yellow)',fontWeight:700,textTransform:'capitalize'}}>{r.plan_name}</td>
                            <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {r.plan_price}</td>
                            <td className="sgc-td">{r.payment_method}</td>
                            <td className="sgc-td"><span className="sgc-badge" style={{background:r.status==='approved'?'#064e3b':r.status==='rejected'?'#450a0a':'#451a03',color:r.status==='approved'?'#4ade80':r.status==='rejected'?'#fca5a5':'#fbbf24'}}>{r.status}</span></td>
                            <td className="sgc-td" style={{fontSize:12}}>
                              {r.expires_at ? (
                                <span style={{color:new Date(r.expires_at)<new Date()?'var(--red)':'var(--green)',fontWeight:600}}>
                                  {new Date(r.expires_at)<new Date()?'❌ ':'✅ '}
                                  {new Date(r.expires_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}
                                </span>
                              ) : r.status==='pending' ? <span style={{color:'var(--dim)'}}>—</span> : <span style={{color:'var(--dim)'}}>—</span>}
                            </td>
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

                {/* Stats */}
                <div className="sgc-stats" style={{marginBottom:24}}>
                  {[
                    ['Total Referrals', referrals.total_referrals, 'var(--accent)'],
                    ['Active Referrals', referrals.active_referrals||0, 'var(--green)'],
                    ['Commission Earned', `Rs. ${referrals.total_commission.toFixed(2)}`, 'var(--yellow)'],
                    ['Current Level', `Level ${referrals.current_level||1}`, 'var(--purple)'],
                  ].map(([l,v,col],i)=>(
                    <div key={i} className="sgc-stat-card">
                      <div className="sgc-stat-label">{l}</div>
                      <div className="sgc-stat-val" style={{color:col}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Referral Link */}
                <div className="sgc-form" style={{marginBottom:24}}>
                  <p className="sgc-subheading" style={{marginBottom:10}}>🔗 Your Referral Link</p>
                  <div style={{display:'flex',gap:10}}>
                    <input className="sgc-input" style={{margin:0,flex:1,fontSize:12}} value={referrals.referral_link} readOnly/>
                    <button className="sgc-btn-primary" style={{width:'auto',padding:'0 18px',whiteSpace:'nowrap'}}
                      onClick={()=>{ navigator.clipboard.writeText(referrals.referral_link); notify('Link copied! 📋'); }}>Copy</button>
                  </div>
                  {referralMsg ? (
                    <div style={{marginTop:12,background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'12px 16px',display:'flex',gap:8,alignItems:'flex-start'}}>
                      <span style={{fontSize:16,flexShrink:0}}>💬</span>
                      <p style={{color:'#166534',fontSize:13,margin:0,lineHeight:1.7,whiteSpace:'pre-wrap',fontWeight:500}}>{referralMsg}</p>
                    </div>
                  ) : (
                    <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Earn commission from every ad click your referrals make</p>
                  )}
                  <div style={{marginTop:10,background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'10px 14px'}}>
                    <p style={{color:'var(--accent)',fontSize:13,margin:0,fontWeight:700}}>
                      {referrals.next_level_message || `Send link to ${referrals.referrals_to_next_level||referrals.required_referrals_per_level||3} users to gain next level`}
                    </p>
                    <p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>
                      Current Level {referrals.current_level||1} - {referrals.total_referrals||0}/{referrals.required_referrals_per_level||3} referrals toward next level
                    </p>
                  </div>
                </div>

                {/* Level Cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
                  {[
                    {lvl:1,label:'Level 1',desc:'Direct Referrals',color:'var(--accent)',bg:'#0d1e38',border:'#1e4080'},
                    {lvl:2,label:'Level 2',desc:"Referral's Referrals",color:'var(--yellow)',bg:'#1c1000',border:'#92400e'},
                    {lvl:3,label:'Level 3',desc:'3rd Tier Network',color:'var(--purple)',bg:'#1a0a2e',border:'#4c1d95'},
                  ].map(({lvl,label,desc,color,bg,border})=>(
                    <div key={lvl} onClick={()=>loadRefLevel(lvl)}
                      style={{background:selectedRefLevel===lvl?bg:'var(--card)',border:`2px solid ${selectedRefLevel===lvl?border:'var(--border)'}`,borderRadius:14,padding:'16px 12px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}>
                      <div style={{fontSize:26,marginBottom:6,fontWeight:900,color,fontFamily:'monospace'}}>L{lvl}</div>
                      <p style={{color:selectedRefLevel===lvl?color:'var(--text)',fontWeight:700,fontSize:13,margin:'0 0 3px'}}>{label}</p>
                      <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{desc}</p>
                      {refLevelData[lvl]!==undefined && (
                        <div style={{marginTop:8,background:'rgba(255,255,255,.05)',borderRadius:8,padding:'4px 8px'}}>
                          <span style={{color,fontSize:12,fontWeight:700}}>{refLevelData[lvl].total} members</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Level Member List */}
                {selectedRefLevel && (
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                      <h3 className="sgc-subheading" style={{margin:0}}>
                        📋 Level {selectedRefLevel} Members
                        {refLevelData[selectedRefLevel] && (
                          <span style={{color:'var(--dim)',fontWeight:400,fontSize:12,marginLeft:8}}>
                            ({refLevelData[selectedRefLevel].total} total)
                          </span>
                        )}
                      </h3>
                      <button onClick={()=>setSelectedRefLevel(null)}
                        style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--dim)',fontSize:12,padding:'4px 12px',cursor:'pointer',fontFamily:'var(--font)'}}>
                        ✕ Close
                      </button>
                    </div>

                    {refLevelLoading ? (
                      <div style={{textAlign:'center',padding:32,color:'var(--dim)',fontSize:13}}>⏳ Loading...</div>
                    ) : refLevelData[selectedRefLevel]?.members?.length > 0 ? (
                      <div style={{display:'flex',flexDirection:'column',gap:10}}>
                        {refLevelData[selectedRefLevel].members.map((r,i)=>{
                          const kycColor = r.kyc_status==='approved'?'#4ade80':r.kyc_status==='pending'?'#fbbf24':'var(--dim)';
                          const kycBg   = r.kyc_status==='approved'?'#064e3b':r.kyc_status==='pending'?'#451a03':'#334155';
                          const kycLabel = r.kyc_status==='approved'?'✅ Verified':r.kyc_status==='pending'?'⏳ Pending':'❌ Not Verified';
                          const expiry = r.plan_expires_at ? new Date(r.plan_expires_at) : null;
                          return (
                            <div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px',display:'flex',flexWrap:'wrap',gap:12,alignItems:'center'}}>
                              {/* Avatar + Username */}
                              <div style={{display:'flex',alignItems:'center',gap:10,flex:'1 1 140px',minWidth:0}}>
                                <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'#fff',flexShrink:0}}>
                                  {r.username[0].toUpperCase()}
                                </div>
                                <div style={{minWidth:0}}>
                                  <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>@{r.username}</p>
                                  <p style={{color:'var(--dim)',fontSize:11,margin:'2px 0 0'}}>{new Date(r.joined).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</p>
                                </div>
                              </div>
                              {/* KYC */}
                              <span style={{background:kycBg,color:kycColor,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0}}>{kycLabel}</span>
                              {/* Plan */}
                              <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'capitalize',flexShrink:0}}>
                                🏆 {r.membership}
                              </span>
                              {/* Plan Status */}
                              <span style={{background:r.plan_active?'#064e3b':'#450a0a',color:r.plan_active?'#4ade80':'#fca5a5',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0}}>
                                {r.plan_active?'🟢 Active':'🔴 Expired'}
                              </span>
                              {/* Expiry */}
                              <span style={{color:expiry&&expiry<new Date()?'var(--red)':'var(--dim)',fontSize:11,flexShrink:0}}>
                                {expiry ? `Exp: ${expiry.toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}` : 'No expiry'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="sgc-empty">No Level {selectedRefLevel} referrals yet.</div>
                    )}
                  </div>
                )}

                {/* Level 1 History Table (existing, shown when no level selected) */}
                {!selectedRefLevel && (
                  <>
                    <h3 className="sgc-subheading" style={{marginBottom:12}}>📋 Referral History <span style={{color:'var(--dim)',fontWeight:400,fontSize:12}}>({referrals.referrals.length} total)</span></h3>
                    {referrals.referrals.length>0 ? (
                      <div className="sgc-table-wrap">
                        <table className="sgc-table">
                          <thead><tr>
                            <th className="sgc-th">Username</th>
                            <th className="sgc-th">KYC</th>
                            <th className="sgc-th">Plan</th>
                            <th className="sgc-th">Plan Status</th>
                            <th className="sgc-th">Joined</th>
                          </tr></thead>
                          <tbody>{referrals.referrals.map((r,i)=>(
                            <tr key={i} className="sgc-tr">
                              <td className="sgc-td">
                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                  <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'#fff',flexShrink:0}}>
                                    {r.username[0].toUpperCase()}
                                  </div>
                                  <span style={{color:'var(--text)',fontWeight:600,fontSize:13}}>@{r.username}</span>
                                </div>
                              </td>
                              <td className="sgc-td">
                                <span style={{background:r.kyc_status==='approved'?'#064e3b':r.kyc_status==='pending'?'#451a03':'#334155',color:r.kyc_status==='approved'?'#4ade80':r.kyc_status==='pending'?'#fbbf24':'var(--dim)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                                  {r.kyc_status==='approved'?'✅ Verified':r.kyc_status==='pending'?'⏳ Pending':'❌ Not Verified'}
                                </span>
                              </td>
                              <td className="sgc-td">
                                <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'capitalize'}}>
                                  {r.membership}
                                </span>
                              </td>
                              <td className="sgc-td">
                                <span style={{background:r.plan_active?'#064e3b':'#450a0a',color:r.plan_active?'#4ade80':'#fca5a5',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                                  {r.plan_active?'🟢 Active':'🔴 Expired'}
                                </span>
                              </td>
                              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(r.joined).toLocaleDateString()}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="sgc-empty">No referrals yet. Share your link!</div>
                    )}
                  </>
                )}
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
            {tab==='ref-bonus' && (
              <div>
                <h2 className="sgc-heading">🎁 Referral Bonus</h2>
                <div style={{textAlign:'center',padding:'48px 24px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,maxWidth:480}}>
                  <div style={{fontSize:52,marginBottom:16}}>🚀</div>
                  <h3 style={{color:'var(--yellow)',fontSize:20,fontWeight:800,margin:'0 0 12px'}}>Coming Soon</h3>
                  <p style={{color:'var(--dim)',fontSize:14,lineHeight:1.7,margin:0}}>Referral Bonus feature is coming soon. Stay tuned!</p>
                </div>
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
                        if(parseInt(adForm.members_needed) < minCampaignUsers){ notify('Minimum '+minCampaignUsers+' users required per campaign','error'); return; }
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
                          {epAccounts.filter(a=>a.method_type==='bank').length===0&&(
                            <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:14,marginBottom:16}}>
                              <p style={{color:'var(--red)',fontSize:13,margin:0}}>⚠️ No Bank account available. Use wallet or contact support.</p>
                            </div>
                          )}
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
                                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                          <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,textTransform:'capitalize'}}>{v.membership||'free'}</span>
                                          {v.plan_expires_at&&<span style={{color:new Date(v.plan_expires_at)<new Date()?'var(--red)':'var(--green)',fontSize:10}}>{new Date(v.plan_expires_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Reactivate Button */}
                              <button disabled={!canReactivate} onClick={async()=>{
                                  if(!canReactivate){
                                    notify(r.reactivate_message || 'Campaign can be reactivated after it is completed or rejected.','error');
                                    return;
                                  }
                                  try{
                                    await API.post(`/user/ad-request/reactivate/${r.id}`);
                                    notify('Campaign reactivated! 🚀');
                                    API.get('/user/ad-request/my-requests').then(res=>setMyAdRequests(res.data));
                                    API.get('/user/profile').then(res=>setProfile(res.data));
                                  }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
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
                    {kycData?.kyc_status==='approved'?'✅':kycData?.kyc_status==='pending'?'⏳':kycData?.kyc_status==='rejected'?'':'🚪'}
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
                    if(!kycForm.cnic.trim()){ notify('CNIC number is required','error'); return; }
                    if(!kycFront){ notify('CNIC front photo is required','error'); return; }
                    if(!kycSelfie){ notify('Selfie with CNIC is required','error'); return; }
                    try{
                      const fd=new FormData();
                      fd.append('full_name', `${kycForm.first_name.trim()} ${kycForm.last_name.trim()}`);
                      fd.append('phone', kycForm.phone.trim());
                      fd.append('cnic', kycForm.cnic.trim());
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
                    <label className="sgc-label">CNIC Number <span style={{color:'var(--red)'}}>*</span></label>
                    <input className="sgc-input" placeholder="XXXXX-XXXXXXX-X" value={kycForm.cnic} onChange={e=>setKycForm({...kycForm,cnic:e.target.value})} required/>
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

            {/* ── NOTIFICATIONS ── */}
            {tab==='notifications' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">🔔 Notifications</h2>
                  {notifications.filter(n=>!n.is_read).length>0 && (
                    <button onClick={async()=>{ await API.post('/user/notifications/read-all'); setNotifications(p=>p.map(x=>({...x,is_read:true}))); }}
                      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--accent)',fontSize:12,fontWeight:600,padding:'6px 14px',cursor:'pointer',fontFamily:'var(--font)'}}>
                      ✓ Mark all read
                    </button>
                  )}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {notifications.map((n,i)=>(
                    <div key={i} onClick={async()=>{ if(!n.is_read){ await API.post(`/user/notifications/${n.id}/read`); setNotifications(p=>p.map(x=>x.id===n.id?{...x,is_read:true}:x)); } }}
                      style={{background:n.is_read?'var(--card)':'#0d1e38',border:`1px solid ${n.is_read?'var(--border)':'#1e4080'}`,borderRadius:12,padding:'14px 18px',cursor:'pointer'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                        <div style={{flex:1}}>
                          <p style={{color:n.is_read?'var(--muted)':'var(--text)',fontWeight:700,fontSize:14,margin:'0 0 4px'}}>
                            {!n.is_read&&<span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'var(--accent)',marginRight:8,verticalAlign:'middle'}}/>}
                            {n.title}
                          </p>
                          <p style={{color:'var(--dim)',fontSize:13,margin:0,lineHeight:1.6}}>{n.message}</p>
                        </div>
                        <span style={{color:'var(--dim)',fontSize:11,whiteSpace:'nowrap',flexShrink:0}}>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {notifications.length===0&&<div className="sgc-empty">🔔 No notifications yet</div>}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
