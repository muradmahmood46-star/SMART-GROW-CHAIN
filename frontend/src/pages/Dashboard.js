import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import useBackNavigation from '../services/hooks/useBackNavigation';
import { parseUTCDate } from '../utils/dateUtils';
import HeroSlider from '../user/HeroSlider';
import UserSidebar from '../user/UserSidebar';
import DashboardHome from '../user/DashboardHome';
import Advertisement from '../user/Advertisement';
import FundHistory from '../user/FundHistory';
import Deposit from '../user/Deposit';
import Payout from '../user/Payout';
import PayoutHistory from '../user/PayoutHistory';
import SendFunds from '../user/SendFunds';
import MembershipPlans from '../user/MembershipPlans';
import MyReferral from '../user/MyReferral';
import AllTransaction from '../user/AllTransaction';
import ReferralBonus from '../user/ReferralBonus';
import Advertise from '../user/Advertise';
import SupportTicket from '../user/SupportTicket';
import KYCVerification from '../user/KYCVerification';
import TwoFactorSecurity from '../user/TwoFactorSecurity';
import Notifications from '../user/Notifications';
import '../panel.css';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [ads, setAds] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [referrals, setReferrals] = useState(null);
  const [refBonus, setRefBonus] = useState(null);
  const [epAccounts, setEpAccounts] = useState([]);
  const [myDeposits, setMyDeposits] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [plans, setPlans] = useState([]);
  const [twoFA, setTwoFA] = useState(null);
  const [adRate, setAdRate] = useState(1);
  const [kycData, setKycData] = useState(null);
  const [kycForm, setKycForm] = useState({ first_name:'', last_name:'', phone:'', cnic:'' });
  const [notifications, setNotifications] = useState([]);
  const [kycFront, setKycFront] = useState(null);
  const [kycSelfie, setKycSelfie] = useState(null);
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
  const [adSectionMsg, setAdSectionMsg] = useState('');
  const [selectedRefLevel, setSelectedRefLevel] = useState(null);
  const [refLevelData, setRefLevelData] = useState({});
  const [refLevelLoading, setRefLevelLoading] = useState(false);
  const [adForm, setAdForm] = useState({ title:'', url:'', members_needed:'', sender_name:'', transaction_id:'' });
  const [adPayMethod, setAdPayMethod] = useState('wallet');
  const [adScreenshot, setAdScreenshot] = useState(null);
  const [myAdRequests, setMyAdRequests] = useState([]);
  const [minCampaignUsers, setMinCampaignUsers] = useState(50);
  const [planPayMethod, setPlanPayMethod] = useState('wallet');
  const [planScreenshot, setPlanScreenshot] = useState(null);
  const [planSenderName, setPlanSenderName] = useState('');
  const [planSenderPhone, setPlanSenderPhone] = useState('');
  const [planTransactionId, setPlanTransactionId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [myPlanPurchases, setMyPlanPurchases] = useState([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [tab, _setTab] = useState(() => { try { return sessionStorage.getItem('sgc_active_ad') ? 'ads' : 'dashboard'; } catch { return 'dashboard'; } });
  const [activeAd, setActiveAd] = useState(() => { try { return JSON.parse(sessionStorage.getItem('sgc_active_ad')); } catch { return null; } });
  const [countdown, setCountdown] = useState(() => parseInt(sessionStorage.getItem('sgc_ad_countdown')) || 0);
  const [isWatching, setIsWatching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [deposit, setDeposit] = useState({ amount_pkr:'', easypaisa_account_id:'', sender_name:'', trx_id:'', transaction_id:'', screenshot_note:'', bank_name:'', bank_account_holder:'', bank_account_number:'' });
  const [screenshot, setScreenshot] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [withdraw, setWithdraw] = useState({ amount:'', method:'easypaisa', wallet_address:'' });
  const [withdrawBankName, setWithdrawBankName] = useState('');
  const [withdrawBankHolder, setWithdrawBankHolder] = useState('');
  const [transfer, setTransfer] = useState({ receiver_username:'', amount:'', note:'' });
  const [ticket, setTicket] = useState({ subject:'', message:'' });
  const [faCode, setFaCode] = useState('');
  const [showAllTx, setShowAllTx] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [planTick, setPlanTick] = useState(0);
  const [msg, setMsg] = useState({ text:'', type:'' });
  const [adPlanRequired, setAdPlanRequired] = useState(false);
  const [planDepMethod, setPlanDepMethod] = useState('wallet');
  const [planDepScreenshot, setPlanDepScreenshot] = useState(null);
  const [planDepDeposit, setPlanDepDeposit] = useState({ amount_pkr:'', sender_name:'', trx_id:'', transaction_id:'', screenshot_note:'' });
  const [adDepMethod, setAdDepMethod] = useState('wallet');
  const [adDepScreenshot, setAdDepScreenshot] = useState(null);
  const [adDepDeposit, setAdDepDeposit] = useState({ amount_pkr:'', sender_name:'', trx_id:'', transaction_id:'', screenshot_note:'' });
  const navigate = useNavigate();

  const setTab = useCallback((newTab) => {
    if (newTab === tab) return;
    if (newTab !== 'dashboard') {
      window.history.pushState({ sgcTab: newTab }, '', window.location.href);
    }
    _setTab(newTab);
  }, [tab]);

  const notify = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };

  const loadData = useCallback(() => {
    API.get('/user/profile').then(r=>setProfile(r.data));
    API.get('/user/ads').then(r=>{
      if(r.data && r.data.plan_required !== undefined){
        setAdPlanRequired(r.data.plan_required);
        setAds(r.data.ads||[]);
      } else {
        setAds(Array.isArray(r.data)?r.data:[]);
      }
    });
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
    API.get('/user/settings').then(r=>{ setSiteSettings(r.data); setReferralMsg(r.data.referral_message||''); setDashboardMsg(r.data.dashboard_message||''); setWithdrawalMsg(r.data.withdrawal_message||''); setAdvertiserMsg(r.data.advertiser_message||''); setAdSectionMsg(r.data.ad_section_message||''); if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50); }).catch(()=>{});
    API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
    API.get('/user/kyc/status').then(r=>{ setKycData(r.data); setFreePlanExpired(r.data.free_plan_expired); setFreePlanDaysLeft(r.data.free_plan_days_left); }).catch(()=>{});
    API.get('/user/notifications').then(r=>setNotifications(r.data)).catch(()=>{});
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);

  useEffect(()=>{
    const t = setInterval(()=>setPlanTick(x=>x+1), 1000);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const t = setInterval(()=>{
      API.get('/user/profile').then(r=>setProfile(r.data)).catch(()=>{});
      API.get('/deposit/my-deposits').then(r=>setMyDeposits(r.data)).catch(()=>{});
    }, 15000);
    return ()=>clearInterval(t);
  },[]);

  const handleReturnToSite = useCallback(() => {
    const hiddenAt = parseInt(sessionStorage.getItem('sgc_hidden_at'));
    if (hiddenAt) {
      const elapsed = (Date.now() - hiddenAt) / 1000;
      if (elapsed > 0) {
        setCountdown(prev => {
          const newC = Math.max(0, prev - elapsed);
          sessionStorage.setItem('sgc_ad_countdown', Math.ceil(newC));
          return Math.ceil(newC);
        });
      }
      sessionStorage.removeItem('sgc_hidden_at');
    }
    setIsWatching(false);
  }, []);

  useEffect(()=>{
    handleReturnToSite();
    const onVis = () => { if (!document.hidden) { handleReturnToSite(); } };
    const onFocus = () => { handleReturnToSite(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  },[handleReturnToSite]);

  useEffect(() => {
    let t;
    if (isWatching && activeAd) {
      t = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 0) return 0;
          const newC = prev - 1;
          sessionStorage.setItem('sgc_ad_countdown', newC);
          return newC;
        });
        sessionStorage.setItem('sgc_hidden_at', Date.now());
      }, 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [isWatching, activeAd]);

  const startAd = async (ad) => {
    if (ad.already_clicked) return;
    if (activeAd && activeAd.id !== ad.id) {
      notify("You are already watching an ad. Please complete it first.", "error");
      return;
    }
    try {
      if (!activeAd || activeAd.id !== ad.id) {
        await API.post(`/user/click/start/${ad.id}`);
        setActiveAd(ad);
        setCountdown(ad.timer_seconds);
        sessionStorage.setItem('sgc_active_ad', JSON.stringify(ad));
        sessionStorage.setItem('sgc_ad_countdown', ad.timer_seconds);
      }
      setIsWatching(true);
      sessionStorage.setItem('sgc_hidden_at', Date.now());
      window.location.href = ad.url;
    } catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  useEffect(()=>{
    if (!activeAd) return;
    if (countdown <= 0){
      API.post(`/user/click/complete/${activeAd.id}`)
        .then(r=>{
          notify(`+Rs. ${r.data.amount.toFixed(2)} earned! 🎉`);
          setProfile(p=>({...p,balance:r.data.new_balance}));
          setAds(prev=>prev.map(a=>a.id===activeAd.id?{...a,already_clicked:true}:a));
          setActiveAd(null);
          setIsWatching(false);
          sessionStorage.removeItem('sgc_active_ad');
          sessionStorage.removeItem('sgc_ad_countdown');
          sessionStorage.removeItem('sgc_hidden_at');
          API.get('/user/earnings').then(r=>setEarnings(r.data));
          API.get('/user/transactions').then(r=>setTransactions(r.data));
        })
        .catch(err=>{ notify(err.response?.data?.detail||'Error','error'); setActiveAd(null); setIsWatching(false); sessionStorage.removeItem('sgc_active_ad'); sessionStorage.removeItem('sgc_hidden_at'); });
    }
  },[countdown,activeAd]);

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
      fd.append('transaction_id', deposit.trx_id || deposit.transaction_id);
      fd.append('screenshot_note', deposit.screenshot_note||'');
      fd.append('screenshot', screenshot);
      await API.post('/deposit/request', fd, { headers:{'Content-Type':'multipart/form-data'} });
      notify('Fund request submitted! Admin will verify shortly.');
      loadData();
      setDeposit({amount_pkr:'',easypaisa_account_id:'',sender_name:'',trx_id:'',transaction_id:'',screenshot_note:'',bank_name:'',bank_account_holder:'',bank_account_number:''});
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

  const logout=()=>{ localStorage.clear(); window.location.href = '/login'; };

  // ── Centralized Back Navigation (User Panel) ──
  const { handleBack } = useBackNavigation({
    tab,
    setTab,
    sidebarOpen,
    setSidebarOpen,
    setSidebarCollapsed,
    navigate,
  });

  const loadRefLevel = async (lvl) => {
    setSelectedRefLevel(lvl);
    if (refLevelData[lvl] !== undefined) return;
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
  const totalCost = (parseInt(adForm.members_needed)||0) * adRate;
  const timerPct = activeAd?((activeAd.timer_seconds-countdown)/activeAd.timer_seconds)*100:0;
  const todayEarned = earnings.filter(e=>{ const d=new Date(e.clicked_at); const t=new Date(); return d.toDateString()===t.toDateString(); }).reduce((s,e)=>s+e.amount,0);

  return (
    <div className="panel-wrap sgc-user-dashboard">
      <div className={`sgc-overlay ${sidebarOpen?'open':''}`} onClick={()=>{setSidebarOpen(false);setShowNotifDropdown(false);}}/>

      <UserSidebar
        profile={profile}
        tab={tab}
        setTab={setTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        notifications={notifications}
        tickets={tickets}
        kycData={kycData}
        ads={ads}
        logout={logout}
      />

      <div className={`panel-main${sidebarCollapsed?" sidebar-hidden":""}`}>
        <div className="sgc-topbar">
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <button className="hamburger" onClick={()=>{if(window.innerWidth<=768){setSidebarOpen(true);}setSidebarCollapsed(false);}}>☰</button>
            <button className="sgc-topbar-login-back" onClick={handleBack} aria-label="Go back" title="Go back">←</button>
          </div>
          <span className="sgc-topbar-title">🌱 Smart Grow Chain</span>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div className="sgc-topbar-avatar">{profile.username[0].toUpperCase()}</div>
            <div style={{position:'relative'}}>
              <button className={`sgc-notification-bell ${notifications.filter(n=>!n.is_read).length>0?'has-unread':''}`} onClick={()=>setShowNotifDropdown(v=>!v)} aria-label="Open notifications"
                style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,position:'relative'}}>
                🔔
                {notifications.filter(n=>!n.is_read).length>0 && (
                  <span className="sgc-notification-count">
                    {notifications.filter(n=>!n.is_read).length}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="sgc-notification-dropdown">
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
          </div>
        </div>

        <div className="panel-body">
          {msg.text && <div className="sgc-toast" style={{background:msg.type==='error'?'var(--red)':msg.type==='info'?'#1e3a6e':'var(--green)',color:msg.type==='error'?'#fff':msg.type==='info'?'var(--accent)':'var(--bg)',border:msg.type==='info'?'1px solid var(--accent)':'none'}}>{msg.text}</div>}

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

          <div className="fade-up" key={tab}>
            {tab==='dashboard' && <DashboardHome profile={profile} earnings={earnings} referrals={referrals} refBonus={refBonus} availableAds={availableAds} todayEarned={todayEarned} freePlanExpired={freePlanExpired} freePlanDaysLeft={freePlanDaysLeft} siteSettings={siteSettings} dashboardMsg={dashboardMsg} adRate={adRate} transactions={transactions} showAllTx={showAllTx} setShowAllTx={setShowAllTx} setTab={setTab} notify={notify} />}
            {tab==='ads' && <Advertisement ads={ads} earnings={earnings} activeAd={activeAd} countdown={countdown} isWatching={isWatching} tab={tab} setTab={setTab} notify={notify} startAd={startAd} kycData={kycData} siteSettings={siteSettings} adPlanRequired={adPlanRequired} setAds={setAds} setEarnings={setEarnings} setTransactions={setTransactions} setActiveAd={setActiveAd} setIsWatching={setIsWatching} setReferralMsg={setReferralMsg} setDashboardMsg={setDashboardMsg} setWithdrawalMsg={setWithdrawalMsg} setAdvertiserMsg={setAdvertiserMsg} setAdSectionMsg={setAdSectionMsg} setMinCampaignUsers={setMinCampaignUsers} loadData={loadData} />}
            {tab==='fund-history' && <FundHistory myDeposits={myDeposits} transfers={transfers} />}
            {tab==='transfer' && <Deposit epAccounts={epAccounts} selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod} deposit={deposit} setDeposit={setDeposit} screenshot={screenshot} setScreenshot={setScreenshot} handleDeposit={handleDeposit} notify={notify} />}
            {tab==='payout' && <Payout siteSettings={siteSettings} kycData={kycData} plans={plans} profile={profile} withdrawals={withdrawals} withdraw={withdraw} setWithdraw={setWithdraw} withdrawBankName={withdrawBankName} setWithdrawBankName={setWithdrawBankName} withdrawBankHolder={withdrawBankHolder} setWithdrawBankHolder={setWithdrawBankHolder} handleWithdraw={handleWithdraw} withdrawalMsg={withdrawalMsg} />}
            {tab==='payout-hist' && <PayoutHistory withdrawals={withdrawals} />}
            {tab==='send-funds' && <SendFunds profile={profile} transfers={transfers} transfer={transfer} setTransfer={setTransfer} handleTransfer={handleTransfer} siteSettings={siteSettings} />}
            {tab==='plans' && <MembershipPlans profile={profile} plans={plans} selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} planPayMethod={planPayMethod} setPlanPayMethod={setPlanPayMethod} planScreenshot={planScreenshot} setPlanScreenshot={setPlanScreenshot} planSenderName={planSenderName} setPlanSenderName={setPlanSenderName} planSenderPhone={planSenderPhone} setPlanSenderPhone={setPlanSenderPhone} planTransactionId={planTransactionId} setPlanTransactionId={setPlanTransactionId} isPurchasing={isPurchasing} setIsPurchasing={setIsPurchasing} myPlanPurchases={myPlanPurchases} parseUTCDate={parseUTCDate} planTick={planTick} notify={notify} setTab={setTab} adRate={adRate} epAccounts={epAccounts} minCampaignUsers={minCampaignUsers} />}
            {tab==='referral' && <MyReferral referrals={referrals} referralMsg={referralMsg} selectedRefLevel={selectedRefLevel} setSelectedRefLevel={setSelectedRefLevel} refLevelData={refLevelData} setRefLevelData={setRefLevelData} refLevelLoading={refLevelLoading} setRefLevelLoading={setRefLevelLoading} loadRefLevel={loadRefLevel} parseUTCDate={parseUTCDate} notify={notify} />}
            {tab==='transactions' && <AllTransaction transactions={transactions} />}
            {tab==='ref-bonus' && <ReferralBonus />}
            {tab==='create-ad' && <Advertise profile={profile} adRate={adRate} minCampaignUsers={minCampaignUsers} adForm={adForm} setAdForm={setAdForm} adPayMethod={adPayMethod} setAdPayMethod={setAdPayMethod} adScreenshot={adScreenshot} setAdScreenshot={setAdScreenshot} epAccounts={epAccounts} myAdRequests={myAdRequests} campaignViewers={campaignViewers} setCampaignViewers={setCampaignViewers} notify={notify} setTab={setTab} setSelectedPlan={setSelectedPlan} />}
            {tab==='support' && <SupportTicket tickets={tickets} ticket={ticket} setTicket={setTicket} handleTicket={handleTicket} />}
            {tab==='kyc' && <KYCVerification kycData={kycData} kycForm={kycForm} setKycForm={setKycForm} kycFront={kycFront} setKycFront={setKycFront} kycSelfie={kycSelfie} setKycSelfie={setKycSelfie} notify={notify} setTab={setTab} />}
            {tab==='2fa' && <TwoFactorSecurity profile={profile} twoFA={twoFA} setup2FA={setup2FA} enable2FA={enable2FA} disable2FA={disable2FA} faCode={faCode} setFaCode={setFaCode} />}
            {tab==='notifications' && <Notifications notifications={notifications} notify={notify} />}
          </div>
        </div>
      </div>
    </div>
  );
}