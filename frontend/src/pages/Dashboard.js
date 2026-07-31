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
  const [kycData, setKycData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [freePlanExpired, setFreePlanExpired] = useState(false);
  const [freePlanDaysLeft, setFreePlanDaysLeft] = useState(null);
  const [adWelcomeMsg, setAdWelcomeMsg] = useState('');
  const [showAdWelcome, setShowAdWelcome] = useState(false);
  const [siteSettings, setSiteSettings] = useState({});
  const [referralMsg, setReferralMsg] = useState('');
  const [dashboardMsg, setDashboardMsg] = useState('');
  const [withdrawalMsg, setWithdrawalMsg] = useState('');
  const [advertiserMsg, setAdvertiserMsg] = useState('');
  const [adSectionMsg, setAdSectionMsg] = useState('');
  const [selectedRefLevel, setSelectedRefLevel] = useState(null);
  const [refLevelData, setRefLevelData] = useState({});
  const [refLevelLoading, setRefLevelLoading] = useState(false);
  const [tab, _setTab] = useState(() => { try { return sessionStorage.getItem('sgc_active_ad') ? 'ads' : 'dashboard'; } catch { return 'dashboard'; } });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [showAllTx, setShowAllTx] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [msg, setMsg] = useState({ text:'', type:'' });
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
    const t = setInterval(()=>{
      API.get('/user/profile').then(r=>setProfile(r.data)).catch(()=>{});
      API.get('/deposit/my-deposits').then(r=>setMyDeposits(r.data)).catch(()=>{});
    }, 15000);
    return ()=>clearInterval(t);
  },[]);

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
            {tab==='dashboard' && <DashboardHome profile={profile} earnings={earnings} referrals={referrals} refBonus={refBonus} availableAds={availableAds} todayEarned={todayEarned} freePlanExpired={freePlanExpired} freePlanDaysLeft={freePlanDaysLeft} siteSettings={siteSettings} dashboardMsg={dashboardMsg} transactions={transactions} showAllTx={showAllTx} setShowAllTx={setShowAllTx} setTab={setTab} notify={notify} />}
            {tab==='ads' && <Advertisement ads={ads} earnings={earnings} tab={tab} setTab={setTab} notify={notify} kycData={kycData} siteSettings={siteSettings} setAds={setAds} loadData={loadData} />}
            {tab==='fund-history' && <FundHistory myDeposits={myDeposits} transfers={transfers} />}
            {tab==='transfer' && <Deposit notify={notify} loadData={loadData} />}
            {tab==='payout' && <Payout siteSettings={siteSettings} kycData={kycData} profile={profile} withdrawals={withdrawals} withdrawalMsg={withdrawalMsg} notify={notify} loadData={loadData} />}
            {tab==='payout-hist' && <PayoutHistory withdrawals={withdrawals} />}
            {tab==='send-funds' && <SendFunds profile={profile} transfers={transfers} siteSettings={siteSettings} notify={notify} loadData={loadData} />}
            {tab==='plans' && <MembershipPlans profile={profile} notify={notify} setTab={setTab} loadData={loadData} />}
            {tab==='referral' && <MyReferral referrals={referrals} referralMsg={referralMsg} selectedRefLevel={selectedRefLevel} setSelectedRefLevel={setSelectedRefLevel} refLevelData={refLevelData} setRefLevelData={setRefLevelData} refLevelLoading={refLevelLoading} setRefLevelLoading={setRefLevelLoading} loadRefLevel={loadRefLevel} parseUTCDate={parseUTCDate} notify={notify} />}
            {tab==='transactions' && <AllTransaction transactions={transactions} />}
            {tab==='ref-bonus' && <ReferralBonus />}
            {tab==='create-ad' && <Advertise profile={profile} notify={notify} setTab={setTab} loadData={loadData} />}
            {tab==='support' && <SupportTicket tickets={tickets} notify={notify} loadData={loadData} />}
            {tab==='kyc' && <KYCVerification kycData={kycData} notify={notify} setTab={setTab} loadData={loadData} />}
            {tab==='2fa' && <TwoFactorSecurity profile={profile} notify={notify} loadData={loadData} />}
            {tab==='notifications' && <Notifications notifications={notifications} notify={notify} />}
          </div>
        </div>
      </div>
    </div>
  );
}