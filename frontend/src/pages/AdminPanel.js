import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../panel.css';

const TABS = [
  { key:'dashboard',   icon:'📊', label:'Dashboard'      },
  { key:'users',       icon:'👥', label:'Users'           },
  { key:'ads',         icon:'📺', label:'Advertisements'  },
  { key:'create-ad',   icon:'➕', label:'Create Ad'       },
  { key:'withdrawals', icon:'💸', label:'Payout Request & Setting' },
  { key:'deposits',    icon:'📥', label:'Fund Requests'   },
  { key:'transfers',   icon:'🔄', label:'Fund Transfers'  },
  { key:'tickets',     icon:'🎫', label:'Support Tickets' },
  { key:'plans',       icon:'🏆', label:'Plans'           },
  { key:'referrals',   icon:'👥', label:'Referrals'       },
  { key:'ref-settings',icon:'⚙️', label:'Referral Commission'},
  { key:'ad-view-log', icon:'📌', label:'Ad View Log'     },
  { key:'ad-requests', icon:'💰', label:'Ad Rate & Request'  },
  { key:'kyc',         icon:'🪪', label:'KYC Requests'    },
  { key:'plan-purchases', icon:'🏆', label:'Plan Purchases'   },
  { key:'easypaisa',   icon:'📱', label:'Payment Options'  },
  { key:'emails',      icon:'📧', label:'Admin Emails'    },
  { key:'messages',    icon:'📣', label:'Admin Messages'  },
  { key:'advertiser-mgmt', icon:'📊', label:'Advertiser Mgmt' },
];

export default function AdminPanel() {
  const [stats, setStats]             = useState(null);
  const [users, setUsers]             = useState([]);
  const [ads, setAds]                 = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits]       = useState([]);
  const [transfers, setTransfers]     = useState([]);
  const [tickets, setTickets]         = useState([]);
  const [easypaisa, setEasypaisa]     = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [plans, setPlans]             = useState([]);
  const [tab, setTab]                 = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [newAd, setNewAd]             = useState({ title:'', url:'', description:'', earning_amount:1, timer_seconds:10, daily_limit:100 });
  const [newEP, setNewEP] = useState({ account_title:'', account_number:'', method_type:'easypaisa', deposit_message:'', bank_name:'' });
  const [editEP, setEditEP]           = useState(null);
  const [newEmail, setNewEmail]       = useState('');
  const [newPlan, setNewPlan]         = useState({ name:'', price:0, period_days:30, daily_ads:10, earning_per_click:0.001, referral_commission:0.05, referral_levels:'N/A', sort_order:0, min_withdrawal:0, max_withdrawal:0, required_referrals_per_level:3 });
  const [editPlan, setEditPlan]       = useState(null);
  const [referrals, setReferrals]     = useState([]);
  const [refSearch, setRefSearch]     = useState('');
  const [refSettings, setRefSettings] = useState({});
  const [adViewLog, setAdViewLog]     = useState([]);
  const [adLogSearch, setAdLogSearch] = useState('');
  const [editEmail, setEditEmail]     = useState(null);
  const [editEmailVal, setEditEmailVal] = useState('');
  const [adRequests, setAdRequests]   = useState([]);
  const [planPurchases, setPlanPurchases] = useState([]);
  const [kycRequests, setKycRequests]   = useState([]);
  const [freePlanDays, setFreePlanDays] = useState(7);
  const [transferMsg, setTransferMsg] = useState('');
  const [transferMsgInput, setTransferMsgInput] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifUserId, setNotifUserId] = useState('');
  const [notifSendEmail, setNotifSendEmail] = useState(false);
  const [adBudgetRate, setAdBudgetRate] = useState(1);
  const [minCampaignUsers, setMinCampaignUsers] = useState(50);
  const [newBudgetRate, setNewBudgetRate] = useState(1);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [registrationBonus, setRegistrationBonus] = useState(0);
  const [regBonusInput, setRegBonusInput] = useState(0);
  const [planLevels, setPlanLevels] = useState([{level:1,percent:10,details:'Share link to others'}]);
  const [withdrawalMsg, setWithdrawalMsg] = useState('');
  const [withdrawalMsgInput, setWithdrawalMsgInput] = useState('');
  const [advertiserMsg, setAdvertiserMsg] = useState('');
  const [advertiserMsgInput, setAdvertiserMsgInput] = useState('');
  const [adSectionMsg, setAdSectionMsg] = useState('');
  const [adSectionMsgInput, setAdSectionMsgInput] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [referralMsgInput, setReferralMsgInput] = useState('');
  const [dashboardMsg, setDashboardMsg] = useState('');
  const [dashboardMsgInput, setDashboardMsgInput] = useState('');
  const [msg, setMsg]                 = useState({ text:'', type:'' });
  const [balanceModal, setBalanceModal] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [payoutScreenshots, setPayoutScreenshots] = useState({});
  const [replyModal, setReplyModal]   = useState(null);
  const [replyText, setReplyText]     = useState('');
  // ── ADVERTISER MANAGEMENT STATE (new isolated module) ──
  const [advertiserList, setAdvertiserList] = useState([]);
  const [advertiserDetail, setAdvertiserDetail] = useState(null);
  const [advertiserLoading, setAdvertiserLoading] = useState(false);
  const [withdrawSettings, setWithdrawSettings] = useState({ withdraw_enabled: true, withdraw_until: '', withdraw_schedule_time: '' });
  const [withdrawHours, setWithdrawHours] = useState(1);
  const [schedOnTime, setSchedOnTime] = useState('');
  const [schedOnAmPm, setSchedOnAmPm] = useState('AM');
  const [schedOffTime, setSchedOffTime] = useState('');
  const [schedOffAmPm, setSchedOffAmPm] = useState('AM');
  const navigate = useNavigate();

  const notify = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };
  const showWithdrawSettingsError = (error) => {
    const status = error.response?.status;
    notify(
      status === 404
        ? 'Withdraw settings endpoint was not found. Restart/update the backend server, then try again.'
        : error.response?.data?.detail || 'Unable to update withdraw settings. Please try again.',
      'error'
    );
  };

  const loadAll = () => {
    API.get('/admin/stats').then(r=>setStats(r.data));
    API.get('/admin/users').then(r=>setUsers(r.data));
    API.get('/admin/ads').then(r=>setAds(r.data));
    API.get('/admin/withdraw-settings').then(r=>setWithdrawSettings(r.data)).catch(()=>{});
    API.get('/admin/withdrawals').then(r=>setWithdrawals(r.data));
    API.get('/admin/deposits').then(r=>setDeposits(r.data));
    API.get('/admin/fund-transfers').then(r=>setTransfers(r.data));
    API.get('/admin/tickets').then(r=>setTickets(r.data));
    API.get('/admin/easypaisa').then(r=>setEasypaisa(r.data));
    API.get('/admin/emails').then(r=>setAdminEmails(r.data));
    API.get('/admin/plans').then(r=>setPlans(r.data));
    API.get('/admin/referrals').then(r=>setReferrals(r.data));
    API.get('/admin/referral-settings').then(r=>setRefSettings(r.data));
    API.get('/admin/ad-view-log').then(r=>setAdViewLog(r.data));
    API.get('/admin/user-ad-requests').then(r=>setAdRequests(r.data)).catch(()=>{});
    API.get('/admin/plan-purchases').then(r=>setPlanPurchases(r.data)).catch(()=>{});
    API.get('/admin/kyc').then(r=>setKycRequests(r.data)).catch(()=>{});
    API.get('/admin/free-plan-days').then(r=>setFreePlanDays(r.data.days)).catch(()=>{});
    API.get('/admin/ad-budget-rate').then(r=>{ setAdBudgetRate(r.data.rate_pkr); setNewBudgetRate(r.data.rate_pkr); setWelcomeMsg(r.data.welcome_message||''); }).catch(()=>{});
    API.get('/admin/settings').then(r=>{ if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50); }).catch(()=>{});
    API.get('/admin/settings').then(r=>{ setWhatsappLink(r.data.whatsapp_link||''); setWhatsappInput(r.data.whatsapp_link||''); setTransferMsg(r.data.transfer_message||''); setTransferMsgInput(r.data.transfer_message||''); setReferralMsg(r.data.referral_message||''); setReferralMsgInput(r.data.referral_message||''); setDashboardMsg(r.data.dashboard_message||''); setDashboardMsgInput(r.data.dashboard_message||''); setWithdrawalMsg(r.data.withdrawal_message||''); setWithdrawalMsgInput(r.data.withdrawal_message||''); setAdvertiserMsg(r.data.advertiser_message||''); setAdvertiserMsgInput(r.data.advertiser_message||''); setAdSectionMsg(r.data.ad_section_message||''); setAdSectionMsgInput(r.data.ad_section_message||''); const rb=parseFloat(r.data.registration_bonus||0); setRegistrationBonus(rb); setRegBonusInput(rb); }).catch(()=>{});
  };

  useEffect(()=>{ loadAll(); },[]);

  const toggleUser     = async(id)=>{ await API.put(`/admin/users/${id}/toggle`); loadAll(); notify('User status updated'); };
  const toggleAd       = async(id)=>{ await API.put(`/admin/ads/${id}/toggle`); loadAll(); notify('Ad updated'); };
  const deleteAd       = async(id)=>{ if(!window.confirm('Delete ad?')) return; await API.delete(`/admin/ads/${id}`); loadAll(); notify('Ad deleted'); };
  const approveW       = async(id)=>{ await API.put(`/admin/withdrawals/${id}/approve`); loadAll(); notify('Payout approved ✅'); };
  const rejectW        = async(id)=>{ await API.put(`/admin/withdrawals/${id}/reject`); loadAll(); notify('Payout rejected'); };
  const markSentW      = async(id)=>{
    const file = payoutScreenshots[id];
    if(!file){ notify('Please upload transaction screenshot first','error'); return; }
    const fd = new FormData();
    fd.append('screenshot', file);
    await API.put(`/admin/withdrawals/${id}/sent`, fd, {headers:{'Content-Type':'multipart/form-data'}});
    setPayoutScreenshots(prev=>({...prev,[id]:null}));
    loadAll(); notify('Marked as Sent ✈️');
  };
  const confirmDeposit = async(id)=>{ await API.put(`/admin/deposits/${id}/confirm`); loadAll(); notify('Fund confirmed & credited ✅'); };
  const rejectDeposit  = async(id)=>{ await API.put(`/admin/deposits/${id}/reject`); loadAll(); notify('Fund rejected'); };
  const closeTicket    = async(id)=>{ await API.put(`/admin/tickets/${id}/close`); loadAll(); notify('Ticket closed'); };
  const toggleEP       = async(id)=>{ await API.put(`/admin/easypaisa/${id}/toggle`); loadAll(); notify('Updated'); };
  const deleteEP       = async(id)=>{ if(!window.confirm('Delete account?')) return; await API.delete(`/admin/easypaisa/${id}`); loadAll(); notify('Deleted'); };
  const deleteEmail    = async(id)=>{ await API.delete(`/admin/emails/${id}`); loadAll(); notify('Email deleted'); };

  const createAd = async(e)=>{
    e.preventDefault();
    await API.post('/admin/ads',{...newAd,earning_amount:parseFloat(newAd.earning_amount),timer_seconds:parseInt(newAd.timer_seconds),daily_limit:parseInt(newAd.daily_limit)});
    loadAll(); notify('Ad created! 🚀');
    setNewAd({title:'',url:'',description:'',earning_amount:1,timer_seconds:10,daily_limit:100});
  };

  const adjustBalance = async()=>{
    await API.put(`/admin/users/${balanceModal.id}/balance`,{amount:parseFloat(balanceAmount)});
    loadAll(); notify('Balance adjusted'); setBalanceModal(null); setBalanceAmount('');
  };

  const addEasypaisa = async(e)=>{
    e.preventDefault();
    if(editEP){ await API.put(`/admin/easypaisa/${editEP.id}`,newEP); notify('Account updated'); setEditEP(null); }
    else{ await API.post('/admin/easypaisa',newEP); notify('Account added ✅'); }
    loadAll(); setNewEP({account_title:'',account_number:'',method_type:'easypaisa',deposit_message:'',bank_name:''});
  };

  const addEmail = async(e)=>{
    e.preventDefault();
    try{ await API.post(`/admin/emails?email=${encodeURIComponent(newEmail)}`); loadAll(); notify('Email added'); setNewEmail(''); }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const sendReply = async()=>{
    try{ await API.put(`/admin/tickets/${replyModal.id}/reply`,{reply:replyText}); loadAll(); notify('Reply sent ✅'); setReplyModal(null); setReplyText(''); }
    catch(err){ notify('Error','error'); }
  };

  const savePlan = async(e)=>{
    e.preventDefault();
    try{
      // Build level_commissions JSON from planLevels
      const lvlMap = {};
      const detailMap = {};
      planLevels.forEach(l=>{
        lvlMap[String(l.level)] = parseFloat(l.percent)||0;
        detailMap[String(l.level)] = (l.details||'').trim().split(/\s+/).filter(Boolean).slice(0,20).join(' ');
      });
      const data={...newPlan,price:parseFloat(newPlan.price),period_days:parseInt(newPlan.period_days),daily_ads:parseInt(newPlan.daily_ads),earning_per_click:parseFloat(newPlan.earning_per_click),referral_commission:parseFloat(newPlan.referral_commission),sort_order:parseInt(newPlan.sort_order),min_withdrawal:parseFloat(newPlan.min_withdrawal)||0,max_withdrawal:parseFloat(newPlan.max_withdrawal)||0,required_referrals_per_level:parseInt(newPlan.required_referrals_per_level)||3,level_commissions:JSON.stringify(lvlMap),level_details:JSON.stringify(detailMap),referral_levels:`Up to ${planLevels.length} level`};
      if(editPlan){ await API.put(`/admin/plans/${editPlan.id}`,data); notify('Plan updated'); setEditPlan(null); }
      else{ await API.post('/admin/plans',data); notify('Plan created ✅'); }
      loadAll(); setNewPlan({name:'',price:0,period_days:30,daily_ads:10,earning_per_click:0.001,referral_commission:0.05,referral_levels:'N/A',sort_order:0,min_withdrawal:0,max_withdrawal:0,required_referrals_per_level:3}); setPlanLevels([{level:1,percent:10,details:'Share link to others'}]);
    } catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const deletePlan = async(id)=>{ if(!window.confirm('Delete plan?')) return; await API.delete(`/admin/plans/${id}`); loadAll(); notify('Plan deleted'); };

  const searchAdLog = async()=>{ const r=await API.get(`/admin/ad-view-log?search=${adLogSearch}`); setAdViewLog(r.data); };

  const searchReferrals = async()=>{ const r=await API.get(`/admin/referrals?search=${refSearch}`); setReferrals(r.data); };

  const toggleBonusType = async(type, val)=>{ await API.put(`/admin/referral-settings/toggle/${type}`,{is_active:val}); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify(val?'Enabled':'Disabled'); };
  const updateRefLevel  = async(id, patch)=>{ await API.put(`/admin/referral-settings/${id}`,patch); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify('Updated'); };
  const addRefLevel     = async(type)=>{ await API.post(`/admin/referral-settings/${type}/add-level`,{percent:0,details:'Share link to others'}); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify('Level added'); };
  const deleteRefLevel  = async(id)=>{ await API.delete(`/admin/referral-settings/${id}`); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify('Deleted'); };

  const saveEditEmail   = async()=>{ try{ await API.put(`/admin/emails/${editEmail.id}`,{email:editEmailVal}); loadAll(); notify('Email updated'); setEditEmail(null); } catch(err){ notify(err.response?.data?.detail||'Error','error'); } };

  const logout=()=>{ localStorage.clear(); navigate('/login'); };
  const backToLogin=()=>navigate('/login');

  const pendingW = withdrawals.filter(w=>w.status==='pending').length;
  const pendingD = deposits.filter(d=>d.status==='pending').length;
  const openT    = tickets.filter(t=>t.status==='open').length;
  const pendingAdReqs = adRequests.filter(r=>r.status==='pending').length;

  return (
    <div className="panel-wrap">
      <div className={`sgc-overlay ${sidebarOpen?'open':''}`} onClick={()=>{setSidebarOpen(false);}}/>

      {/* Balance Modal */}
      {balanceModal && (
        <div className="sgc-modal-overlay">
          <div className="sgc-modal">
            <h3 style={{color:'var(--text)',marginBottom:6,fontSize:16,fontWeight:700}}>Adjust Balance</h3>
            <p style={{color:'var(--dim)',fontSize:13,marginBottom:16}}>User: <b style={{color:'var(--accent)'}}>{balanceModal.username}</b><br/>Current: <b style={{color:'var(--green)'}}>Rs. {balanceModal.balance.toFixed(2)}</b></p>
            <input className="sgc-input" type="number" step="0.01" min="0" placeholder="Amount to deduct" value={balanceAmount} onChange={e=>setBalanceAmount(e.target.value)}/>
            <div style={{display:'flex',gap:10}}>
              <button className="sgc-btn-yellow" style={{flex:1,padding:11}} onClick={adjustBalance}>Deduct</button>
              <button className="sgc-btn-sm" style={{flex:1,background:'var(--border)',color:'var(--text)',padding:11,borderRadius:10}} onClick={()=>setBalanceModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="sgc-modal-overlay">
          <div className="sgc-modal" style={{width:460}}>
            <h3 style={{color:'var(--text)',marginBottom:6,fontSize:16,fontWeight:700}}>Reply to Ticket</h3>
            <p style={{color:'var(--accent)',fontSize:13,marginBottom:4,fontWeight:600}}>{replyModal.subject}</p>
            <p style={{color:'var(--dim)',fontSize:12,marginBottom:16}}>{replyModal.message}</p>
            <textarea className="sgc-input" rows={4} placeholder="Type your reply..." value={replyText} onChange={e=>setReplyText(e.target.value)} style={{resize:'vertical'}}/>
            <div style={{display:'flex',gap:10}}>
              <button className="sgc-btn-primary" style={{flex:1,padding:11}} onClick={sendReply}>Send Reply</button>
              <button className="sgc-btn-sm" style={{flex:1,background:'var(--border)',color:'var(--text)',padding:11,borderRadius:10}} onClick={()=>setReplyModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`sgc-sidebar ${sidebarOpen?'open':''}${sidebarCollapsed?' collapsed':''}`}>
        <div className="sgc-logo slide-l">
          <span className="sgc-logo-icon">🌱</span>
          <span className="sgc-logo-text" style={{color:'var(--yellow)'}}>Smart Grow Chain</span>
          <button className="sgc-sidebar-back-btn" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar">←</button>
        </div>
        <p className="sgc-logo-sub">Admin Control Panel</p>

        <div className="sgc-profile">
          <div className="sgc-avatar" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',fontSize:18}}>A</div>
          <div>
            <div className="sgc-uname">Administrator</div>
            <span className="sgc-plan" style={{color:'var(--yellow)',borderColor:'#451a03'}}>admin</span>
          </div>
        </div>

        <nav className="sgc-nav">
          {TABS.map(({key,icon,label})=>(
            <button key={key} className={`nav-btn ${tab===key?'active':''}`}
              style={tab===key?{}:{}}
              onClick={()=>{ setTab(key); if(window.innerWidth<=768){setSidebarCollapsed(true);setSidebarOpen(false);} if(key==='advertiser-mgmt'&&advertiserList.length===0){ setAdvertiserLoading(true); API.get('/admin/advertiser-management').then(r=>{ setAdvertiserList(r.data); setAdvertiserLoading(false); }).catch(()=>setAdvertiserLoading(false)); } }}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
              {key==='withdrawals' && pendingW>0 && <span className="nav-badge">{pendingW}</span>}
              {key==='deposits'    && pendingD>0 && <span className="nav-badge">{pendingD}</span>}
              {key==='tickets'     && openT>0    && <span className="nav-badge">{openT}</span>}
              {key==='ad-requests' && pendingAdReqs>0 && <span className="nav-badge">{pendingAdReqs}</span>}
              {key==='kyc' && kycRequests.filter(k=>k.status==='pending').length>0 && <span className="nav-badge">{kycRequests.filter(k=>k.status==='pending').length}</span>}
              {key==='plan-purchases' && planPurchases.filter(r=>r.status==='pending').length>0 && <span className="nav-badge">{planPurchases.filter(r=>r.status==='pending').length}</span>}
            </button>
          ))}
        </nav>
        <div style={{flex:1}}/>
        <button className="sgc-back-to-login" onClick={backToLogin}>← Back to Login</button>
        <button className="sgc-logout" onClick={logout}>🚪 Logout</button>
      </aside>

      {/* ── MAIN ── */}
      <div className={`panel-main${sidebarCollapsed?" sidebar-hidden":""}`}>
        <div className="sgc-topbar">
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <button className="hamburger" onClick={()=>{if(window.innerWidth<=768){setSidebarOpen(true);}setSidebarCollapsed(false);}}>☰</button>
            <button className="sgc-topbar-login-back" onClick={()=>{ if(tab!=="dashboard"){ setTab("dashboard"); } else { navigate("/login"); } }} aria-label="Go back" title="Go back">←</button>
          </div>
          <span className="sgc-topbar-title">🌱 SGC Admin</span>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div className="sgc-topbar-avatar">A</div>
          </div>
        </div>

        <div className="panel-body">
          {msg.text && <div className="sgc-toast" style={{background:msg.type==='error'?'var(--red)':'var(--green)',color:msg.type==='error'?'#fff':'var(--bg)'}}>{msg.text}</div>}

          <div className="fade-up" key={tab}>

            {/* ── DASHBOARD ── */}
            {tab==='dashboard' && stats && (
              <div>
                <h2 className="sgc-heading">📊 Dashboard</h2>
                <div className="sgc-stats">
                  {[
                    ['Total Users',    stats.total_users,                    'var(--accent)'],
                    ['Active Users',   stats.active_users,                   'var(--green)'],
                    ['Total Ads',      stats.total_ads,                      'var(--purple)'],
                    ['Today Clicks',   stats.today_clicks,                   'var(--yellow)'],
                    ['Today Earnings', `Rs. ${stats.today_earnings}`,        'var(--green)'],
                    ['Total Earnings', `Rs. ${stats.total_earnings}`,        'var(--yellow)'],
                    ['Pending Payout', stats.pending_withdrawals,            'var(--red)'],
                    ['Pending Funds',  deposits.filter(d=>d.status==='pending').length, 'var(--red)'],
                    ['Open Tickets',   openT,                                '#f472b6'],
                    ['Total Clicks',   stats.total_clicks,                   'var(--accent)'],
                  ].map(([l,v,c],i)=>(
                    <div key={i} className="sgc-stat-card">
                      <div className="sgc-stat-label">{l}</div>
                      <div className="sgc-stat-val" style={{color:c}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <h3 className="sgc-subheading" style={{marginBottom:12}}>Quick Actions</h3>
                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
                  {[['➕','Create Ad','create-ad'],['📥','Fund Requests','deposits'],['💸','Payout','withdrawals'],['🎫','Tickets','tickets'],['📱','Easypaisa','easypaisa']].map(([icon,label,key])=>(
                    <button key={key} onClick={()=>setTab(key)} style={{padding:'10px 18px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',cursor:'pointer',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6,transition:'all .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--yellow)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {/* 7-day chart */}
                <h3 className="sgc-subheading" style={{marginBottom:12}}>Last 7 Days Clicks</h3>
                <div className="sgc-chart">
                  {stats.daily_data.map((d,i)=>{
                    const max=Math.max(...stats.daily_data.map(x=>x.clicks),1);
                    const h=(d.clicks/max)*100;
                    return (
                      <div key={i} className="sgc-bar-wrap">
                        <span style={{color:'var(--muted)',fontSize:11}}>{d.clicks}</span>
                        <div className="sgc-bar" style={{height:`${h}%`,background:'linear-gradient(180deg,var(--yellow),#d97706)'}}/>
                        <span style={{color:'var(--dim)',fontSize:10}}>{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab==='users' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">👥 Users</h2>
                  <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{users.length} total</span>
                </div>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">Username</th><th className="sgc-th">Email</th>
                      <th className="sgc-th">Balance</th><th className="sgc-th">Earned</th>
                      <th className="sgc-th">Plan</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th>
                    </tr></thead>
                    <tbody>{users.map(u=>(
                      <tr key={u.id} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--text)',fontWeight:700}}>{u.username}</td>
                        <td className="sgc-td">{u.email}</td>
                        <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {u.balance.toFixed(2)}</td>
                        <td className="sgc-td">Rs. {u.total_earned.toFixed(2)}</td>
                        <td className="sgc-td"><span className="sgc-badge" style={{background:'#1e3a6e'}}>{u.membership}</span></td>
                        <td className="sgc-td"><span className="sgc-badge" style={{background:u.is_active?'#064e3b':'#450a0a'}}>{u.is_active?'Active':'Blocked'}</span></td>
                        <td className="sgc-td" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                          <button className="sgc-btn-sm" style={{background:'var(--border)',color:'var(--muted)'}} onClick={()=>toggleUser(u.id)}>{u.is_active?'Block':'Unblock'}</button>
                          <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>setBalanceModal(u)}>Balance</button>
                        </td>
                      </tr>
                    ))}
                    {users.length===0&&<tr><td colSpan={7} className="sgc-td" style={{textAlign:'center',padding:32}}>No users found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ADS ── */}
            {tab==='ads' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">📺 Advertisements</h2>
                  <button className="sgc-btn-sm" style={{background:'var(--yellow)',color:'var(--bg)',padding:'8px 16px',fontWeight:700}} onClick={()=>setTab('create-ad')}>+ Create Ad</button>
                </div>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">Title</th><th className="sgc-th">URL</th><th className="sgc-th">Earn/Click</th>
                      <th className="sgc-th">Timer</th><th className="sgc-th">Clicks</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th>
                    </tr></thead>
                    <tbody>{ads.map(a=>(
                      <tr key={a.id} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{a.title}</td>
                        <td className="sgc-td" style={{fontSize:11,color:'var(--dim)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.url}</td>
                        <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {a.earning_amount}</td>
                        <td className="sgc-td">{a.timer_seconds}s</td>
                        <td className="sgc-td">{a.total_clicks}</td>
                        <td className="sgc-td"><span className="sgc-badge" style={{background:a.is_active?'#064e3b':'#334155'}}>{a.is_active?'Active':'Paused'}</span></td>
                        <td className="sgc-td" style={{display:'flex',gap:6}}>
                          <button className="sgc-btn-sm" style={{background:'var(--border)',color:'var(--muted)'}} onClick={()=>toggleAd(a.id)}>{a.is_active?'Pause':'Activate'}</button>
                          <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteAd(a.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {ads.length===0&&<tr><td colSpan={7} className="sgc-td" style={{textAlign:'center',padding:32}}>No ads yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── CREATE AD ── */}
            {tab==='create-ad' && (
              <div>
                <h2 className="sgc-heading">➕ Create Ad</h2>
                <form onSubmit={createAd} className="sgc-form" style={{maxWidth:540}}>
                  <label className="sgc-label">Ad Title</label>
                  <input className="sgc-input" placeholder="e.g. Visit our website" value={newAd.title} onChange={e=>setNewAd({...newAd,title:e.target.value})} required/>
                  <label className="sgc-label">Ad URL</label>
                  <input className="sgc-input" placeholder="https://example.com" value={newAd.url} onChange={e=>setNewAd({...newAd,url:e.target.value})} required/>
                  <label className="sgc-label">Description (optional)</label>
                  <input className="sgc-input" placeholder="Short description" value={newAd.description} onChange={e=>setNewAd({...newAd,description:e.target.value})}/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                    <div>
                      <label className="sgc-label">Earning (Rs.)</label>
                      <input className="sgc-input" type="number" step="0.01" min="0.01" value={newAd.earning_amount} onChange={e=>setNewAd({...newAd,earning_amount:e.target.value})} required/>
                    </div>
                    <div>
                      <label className="sgc-label">Timer (sec)</label>
                      <input className="sgc-input" type="number" min="5" max="120" value={newAd.timer_seconds} onChange={e=>setNewAd({...newAd,timer_seconds:e.target.value})} required/>
                    </div>
                    <div>
                      <label className="sgc-label">Daily Limit</label>
                      <input className="sgc-input" type="number" min="1" value={newAd.daily_limit} onChange={e=>setNewAd({...newAd,daily_limit:e.target.value})} required/>
                    </div>
                  </div>
                  <button className="sgc-btn-yellow" type="submit">🚀 Create Ad</button>
                </form>
              </div>
            )}

            {/* ── PAYOUT REQUESTS ── */}
            {tab==='withdrawals' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">💸 Payout Request & Setting</h2>
                  <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{pendingW} pending</span>
                </div>

                {/* ── Withdraw Toggle Controls ── */}
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
                            await API.put('/admin/withdraw-settings/toggle',{enabled:true});
                            setWithdrawSettings(s=>({...s,withdraw_enabled:true,withdraw_until:''}));
                            notify('Withdraw ENABLED ✅');
                          } catch (error) { showWithdrawSettingsError(error); }
                        }} style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)',opacity:withdrawSettings.withdraw_enabled?0.5:1}}>
                          ✓ Turn ON
                        </button>
                        <button onClick={async()=>{
                          try {
                            await API.put('/admin/withdraw-settings/toggle',{enabled:false});
                            setWithdrawSettings(s=>({...s,withdraw_enabled:false,withdraw_until:''}));
                            notify('Withdraw DISABLED 🔒');
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
                          await API.put('/admin/withdraw-settings/duration',{hours:withdrawHours});
                          const response = await API.get('/admin/withdraw-settings');
                          setWithdrawSettings(response.data);
                          notify(`Withdraw ON for ${withdrawHours} hour(s) ⏱️`);
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
                          if(!schedOnTime||!schedOffTime){notify('Please set both ON and OFF time','error');return;}
                          const val=`${schedOnTime} ${schedOnAmPm}|${schedOffTime} ${schedOffAmPm}`;
                          try {
                            await API.put('/admin/withdraw-settings/schedule',{time_pkt:val});
                            setWithdrawSettings(s=>({...s,withdraw_schedule_time:val}));
                            notify('Schedule saved ✅');
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
                                await API.put('/admin/withdraw-settings/schedule',{time_pkt:''});
                                setWithdrawSettings(s=>({...s,withdraw_schedule_time:''}));
                                setSchedOnTime(''); setSchedOffTime('');
                                notify('Schedule cleared');
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
                                <button onClick={()=>{navigator.clipboard.writeText(w.wallet_address);notify('Copied! 📋');}} style={{background:'#1e4080',border:'1px solid #38bdf8',color:'#38bdf8',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)',whiteSpace:'nowrap',flexShrink:0}}>📋 Copy</button>
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
            )}

            {/* ── FUND REQUESTS ── */}
            {tab==='deposits' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">📥 Fund Requests</h2>
                  <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{pendingD} pending</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {deposits.map(d=>{
                    const isPending=d.status==='pending';
                    const isConfirmed=d.status==='confirmed';
                    const borderCol=isPending?'#f59e0b':isConfirmed?'#3cb559':'#ef4444';
                    return (
                      <div key={d.id} className="fade-in" style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
                        {/* Top bar */}
                        <div style={{background:isPending?'#451a0320':isConfirmed?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'var(--bg)',flexShrink:0}}>
                              {d.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{d.username}</p>
                              <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(d.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <span style={{background:isPending?'#451a03':isConfirmed?'#064e3b':'#450a0a',color:isPending?'#f59e0b':isConfirmed?'#4ade80':'#fca5a5',padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700}}>
                            {d.status.toUpperCase()}
                          </span>
                        </div>

                        <div style={{display:'flex',gap:0,flexWrap:'wrap'}}>
                          {/* Left: details */}
                          <div style={{flex:'1 1 260px',padding:'16px 20px'}}>
                            {/* Amount — big */}
                            <div style={{marginBottom:16}}>
                              <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 2px',fontWeight:600}}>AMOUNT RECEIVED</p>
                              <p style={{color:'#3cb559',fontSize:28,fontWeight:800,margin:0,fontFamily:'monospace'}}>Rs. {d.amount_pkr}</p>
                            </div>
                            {/* Sent by */}
                            <div style={{background:'var(--bg)',borderRadius:9,padding:'10px 14px',marginBottom:10}}>
                              <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 3px',fontWeight:600,letterSpacing:.5}}>SENT BY (ACCOUNT NAME)</p>
                              <p style={{color:'var(--accent)',fontWeight:700,fontSize:15,margin:0}}>{d.sender_name||'—'}</p>
                            </div>
                            {/* Phone */}
                            <div style={{background:'var(--bg)',borderRadius:9,padding:'10px 14px',marginBottom:10}}>
                              <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 3px',fontWeight:600,letterSpacing:.5}}>SENDER PHONE NUMBER</p>
                              <p style={{color:'var(--text)',fontWeight:600,fontSize:14,margin:0,fontFamily:'monospace'}}>{d.transaction_id||'—'}</p>
                            </div>
                            {/* Actions */}
                            {isPending&&(
                              <div style={{display:'flex',gap:8,marginTop:14}}>
                                <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>confirmDeposit(d.id)}>✓ Confirm & Credit</button>
                                <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>rejectDeposit(d.id)}>✗ Reject</button>
                              </div>
                            )}
                          </div>

                          {/* Right: screenshot */}
                          <div style={{flex:'0 0 200px',padding:'16px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderLeft:'1px solid var(--border)'}}>
                            <p style={{color:'var(--dim)',fontSize:10,fontWeight:600,letterSpacing:.5,marginBottom:8}}>PAYMENT SCREENSHOT</p>
                            {d.screenshot_url ? (
                              <a href={d.screenshot_url} target="_blank" rel="noreferrer">
                                <img src={d.screenshot_url} alt="screenshot"
                                  style={{width:160,height:160,objectFit:'cover',borderRadius:10,border:'2px solid var(--border)',display:'block',transition:'transform .2s'}}
                                  onMouseEnter={e=>e.target.style.transform='scale(1.04)'}
                                  onMouseLeave={e=>e.target.style.transform='scale(1)'}
                                />
                                <p style={{color:'var(--yellow)',fontSize:11,textAlign:'center',marginTop:6,fontWeight:600}}>🔍 Click to view full</p>
                              </a>
                            ) : (
                              <div style={{width:160,height:160,borderRadius:10,border:'2px dashed var(--border)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6}}>
                                <span style={{fontSize:28}}>📸</span>
                                <span style={{color:'var(--dim)',fontSize:11}}>No screenshot</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {deposits.length===0&&<div className="sgc-empty">No fund requests yet</div>}
                </div>
              </div>
            )}

            {/* ── FUND TRANSFERS ── */}
            {tab==='transfers' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">🔄 Fund Transfers</h2>
                  <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{transfers.length} total</span>
                </div>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">From</th><th className="sgc-th">To</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Date</th>
                    </tr></thead>
                    <tbody>{transfers.map(t=>(
                      <tr key={t.id} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--red)',fontWeight:600}}>{t.sender}</td>
                        <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>{t.receiver}</td>
                        <td className="sgc-td" style={{color:'var(--accent)',fontWeight:600}}>Rs. {t.amount?.toFixed(2)}</td>
                        <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note||'-'}</td>
                        <td className="sgc-td">{new Date(t.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {transfers.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No transfers yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── SUPPORT TICKETS ── */}
            {tab==='tickets' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">🎫 Support Tickets</h2>
                  <span style={{color:'#f472b6',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{openT} open</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {tickets.map((t,i)=>(
                    <div key={i} className="sgc-form fade-in">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,gap:12}}>
                        <div>
                          <span style={{color:'var(--accent)',fontSize:12,fontWeight:600}}>@{t.username}</span>
                          <h4 style={{color:'var(--text)',fontSize:14,fontWeight:700,margin:'4px 0'}}>{t.subject}</h4>
                          <p style={{color:'var(--dim)',fontSize:13}}>{t.message}</p>
                        </div>
                        <span className="sgc-badge" style={{background:t.status==='open'?'#451a03':t.status==='replied'?'#064e3b':'#334155',whiteSpace:'nowrap',flexShrink:0}}>{t.status}</span>
                      </div>
                      {t.reply&&(
                        <div style={{background:'var(--bg)',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',marginTop:8,marginBottom:8}}>
                          <p style={{color:'var(--yellow)',fontSize:11,fontWeight:700,marginBottom:4}}>Your Reply:</p>
                          <p style={{color:'var(--muted)',fontSize:13}}>{t.reply}</p>
                        </div>
                      )}
                      <div style={{display:'flex',gap:8,marginTop:10,alignItems:'center'}}>
                        <span style={{color:'var(--dim)',fontSize:11,flex:1}}>{new Date(t.created_at).toLocaleString()}</span>
                        {t.status!=='closed'&&<>
                          <button className="sgc-btn-sm" style={{background:'#1e3a6e',color:'var(--accent)'}} onClick={()=>{ setReplyModal(t); setReplyText(t.reply||''); }}>
                            {t.reply?'Edit Reply':'Reply'}
                          </button>
                          <button className="sgc-btn-sm" style={{background:'#334155',color:'var(--muted)'}} onClick={()=>closeTicket(t.id)}>Close</button>
                        </>}
                      </div>
                    </div>
                  ))}
                  {tickets.length===0&&<div className="sgc-empty">No support tickets yet</div>}
                </div>
              </div>
            )}

            {/* ── PLANS ── */}
            {tab==='plans' && (
              <div>
                <h2 className="sgc-heading">🏆 Membership Plans</h2>
                <form onSubmit={savePlan} className="sgc-form" style={{marginBottom:24,maxWidth:560}}>
                  <h4 style={{color:'var(--yellow)',marginBottom:16,fontSize:14,fontWeight:700}}>{editPlan?'✏️ Edit Plan':'➕ Create Plan'}</h4>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><label className="sgc-label">Plan Name</label><input className="sgc-input" placeholder="e.g. basic" value={newPlan.name} onChange={e=>setNewPlan({...newPlan,name:e.target.value})} required/></div>
                    <div><label className="sgc-label">Price (Rs.)</label><input className="sgc-input" type="number" min="0" step="0.01" value={newPlan.price} onChange={e=>setNewPlan({...newPlan,price:e.target.value})} required/></div>
                    <div><label className="sgc-label">Period (days)</label><input className="sgc-input" type="number" min="1" value={newPlan.period_days} onChange={e=>setNewPlan({...newPlan,period_days:e.target.value})} required/></div>
                    <div><label className="sgc-label">Daily Ads</label><input className="sgc-input" type="number" min="1" value={newPlan.daily_ads} onChange={e=>setNewPlan({...newPlan,daily_ads:e.target.value})} required/></div>
                    <div><label className="sgc-label">Earn/Click (Rs.)</label><input className="sgc-input" type="number" min="0" step="0.0001" value={newPlan.earning_per_click} onChange={e=>setNewPlan({...newPlan,earning_per_click:e.target.value})} required/></div>
                    <div><label className="sgc-label">Sort Order</label><input className="sgc-input" type="number" min="0" value={newPlan.sort_order} onChange={e=>setNewPlan({...newPlan,sort_order:e.target.value})}/></div>
                    <div><label className="sgc-label">Min Withdrawal (Rs.)</label><input className="sgc-input" type="number" min="0" step="1" placeholder="e.g. 500" value={newPlan.min_withdrawal} onChange={e=>setNewPlan({...newPlan,min_withdrawal:e.target.value})}/></div>
                    <div><label className="sgc-label">Max Withdrawal (Rs.)</label><input className="sgc-input" type="number" min="0" step="1" placeholder="0 = no limit" value={newPlan.max_withdrawal} onChange={e=>setNewPlan({...newPlan,max_withdrawal:e.target.value})}/></div>
                    <div><label className="sgc-label">Users for Next Level</label><input className="sgc-input" type="number" min="1" step="1" placeholder="e.g. 3" value={newPlan.required_referrals_per_level} onChange={e=>setNewPlan({...newPlan,required_referrals_per_level:e.target.value})}/></div>
                  </div>

                  {/* Referral Level Commissions */}
                  <div style={{marginTop:16,marginBottom:4}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <label className="sgc-label" style={{margin:0}}>💰 Referral Level Commissions (%)</label>
                      <button type="button" className="sgc-btn-sm" style={{background:'#1e3a6e',color:'var(--accent)',padding:'5px 14px'}} onClick={()=>setPlanLevels(prev=>[...prev,{level:prev.length+1,percent:0,details:'Share link to others'}])}>+ Add Level</button>
                    </div>
                    {planLevels.map((lvl,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                        <span style={{color:'var(--yellow)',fontWeight:700,fontSize:13,minWidth:60}}>Level {lvl.level}</span>
                        <input type="text" maxLength={160} placeholder="Level details e.g. Share link to others" value={lvl.details||''}
                          onChange={e=>setPlanLevels(prev=>prev.map((l,j)=>j===i?{...l,details:e.target.value.split(/\s+/).filter(Boolean).slice(0,20).join(' ')}:l))}
                          style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',padding:'7px 12px',flex:'1 1 220px',fontFamily:'var(--font)',fontSize:13}}/>
                        <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 10" value={lvl.percent}
                          onChange={e=>setPlanLevels(prev=>prev.map((l,j)=>j===i?{...l,percent:e.target.value}:l))}
                          style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',padding:'7px 12px',width:90,fontFamily:'var(--font)',fontSize:13}}/>
                        <span style={{color:'var(--dim)',fontSize:13}}>%</span>
                        {planLevels.length>1&&<button type="button" className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5',padding:'4px 10px'}} onClick={()=>setPlanLevels(prev=>prev.filter((_,j)=>j!==i).map((l,j)=>({...l,level:j+1})))}>✕</button>}
                      </div>
                    ))}
                    <p style={{color:'var(--dim)',fontSize:11,marginTop:4}}>Level 1 = direct referral, Level 2 = referral ka referral, etc.</p>
                  </div>

                  <div style={{display:'flex',gap:10,marginTop:12}}>
                    <button className="sgc-btn-yellow" type="submit" style={{flex:1}}>{editPlan?'Update Plan':'Create Plan'}</button>
                    {editPlan&&<button type="button" className="sgc-btn-sm" style={{padding:13,borderRadius:10,background:'var(--border)',color:'var(--text)'}} onClick={()=>{ setEditPlan(null); setNewPlan({name:'',price:0,period_days:30,daily_ads:10,earning_per_click:0.001,referral_commission:0.05,referral_levels:'N/A',sort_order:0,min_withdrawal:0,max_withdrawal:0,required_referrals_per_level:3}); setPlanLevels([{level:1,percent:10,details:'Share link to others'}]); }}>Cancel</button>}
                  </div>
                </form>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr><th className="sgc-th">Name</th><th className="sgc-th">Price</th><th className="sgc-th">Days</th><th className="sgc-th">Daily Ads</th><th className="sgc-th">Earn/Click</th><th className="sgc-th">Levels</th><th className="sgc-th">Next Level</th><th className="sgc-th">Min W/D</th><th className="sgc-th">Max W/D</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th></tr></thead>
                    <tbody>{plans.map(p=>{
                      let lvlMap = {};
                      try{ lvlMap = JSON.parse(p.level_commissions||'{}'); }catch{}
                      const lvlText = Object.keys(lvlMap).length>0 ? Object.entries(lvlMap).map(([k,v])=>`L${k}:${v}%`).join(', ') : `${(p.referral_commission*100).toFixed(0)}%`;
                      return (
                        <tr key={p.id} className="sgc-tr">
                          <td className="sgc-td" style={{color:'var(--text)',fontWeight:700,textTransform:'capitalize'}}>{p.name}</td>
                          <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {p.price}</td>
                          <td className="sgc-td">{p.period_days}d</td>
                          <td className="sgc-td">{p.daily_ads}</td>
                          <td className="sgc-td">Rs. {p.earning_per_click}</td>
                          <td className="sgc-td" style={{fontSize:11,color:'var(--accent)'}}>{lvlText}</td>
                          <td className="sgc-td" style={{color:'var(--purple)',fontSize:12}}>{p.required_referrals_per_level||3} users</td>
                          <td className="sgc-td" style={{color:'var(--yellow)',fontSize:12}}>Rs. {p.min_withdrawal||0}</td>
                          <td className="sgc-td" style={{color:'var(--red)',fontSize:12}}>{p.max_withdrawal>0?`Rs. ${p.max_withdrawal}`:'No limit'}</td>
                          <td className="sgc-td"><span className="sgc-badge" style={{background:p.is_active?'#064e3b':'#334155'}}>{p.is_active?'Active':'Off'}</span></td>
                          <td className="sgc-td" style={{display:'flex',gap:6}}>
                            <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>{
                              setEditPlan(p);
                              setNewPlan({name:p.name,price:p.price,period_days:p.period_days,daily_ads:p.daily_ads,earning_per_click:p.earning_per_click,referral_commission:p.referral_commission,referral_levels:p.referral_levels||'N/A',sort_order:p.sort_order||0,min_withdrawal:p.min_withdrawal||0,max_withdrawal:p.max_withdrawal||0,required_referrals_per_level:p.required_referrals_per_level||3});
                              try{
                                const lm=JSON.parse(p.level_commissions||'{}');
                                let dm={}; try{ dm=JSON.parse(p.level_details||'{}'); }catch{}
                                const lvls=Object.entries(lm).map(([k,v])=>({level:parseInt(k),percent:v,details:dm[k]||''}));
                                setPlanLevels(lvls.length>0?lvls:[{level:1,percent:(p.referral_commission*100)||10,details:'Share link to others'}]);
                              }catch{ setPlanLevels([{level:1,percent:(p.referral_commission*100)||10,details:'Share link to others'}]); }
                              window.scrollTo(0,0);
                            }}>Edit</button>
                            <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deletePlan(p.id)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                    {plans.length===0&&<tr><td colSpan={11} className="sgc-td" style={{textAlign:'center',padding:32}}>No plans yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── EASYPAISA ── */}
            {tab==='easypaisa' && (
              <div>
                <h2 className="sgc-heading">📱 Payment Accounts</h2>
                <form onSubmit={addEasypaisa} className="sgc-form" style={{marginBottom:24,maxWidth:480}}>
                  <h4 style={{color:'var(--yellow)',marginBottom:16,fontSize:14,fontWeight:700}}>{editEP?'✏️ Edit Account':'➕ Add Account'}</h4>
                  <label className="sgc-label">Payment Method</label>
                  <div style={{display:'flex',gap:10,marginBottom:16}}>
                    {['easypaisa','jazzcash','bank'].map(m=>{
                      const isEP=m==='easypaisa'; const isBank=m==='bank';
                      const col=isEP?'#3cb559':isBank?'#3b82f6':'#e8001e';
                      const bg=isEP?'#0a2010':isBank?'#0a1628':'#200008';
                      return (
                        <div key={m} onClick={()=>setNewEP({...newEP,method_type:m})}
                          style={{flex:1,padding:'12px 8px',borderRadius:10,border:`2px solid ${newEP.method_type===m?col:'var(--border)'}`,background:newEP.method_type===m?bg:'var(--bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
                          <span style={{fontSize:18}}>{isEP?'📱':isBank?'🏦':'💳'}</span>
                          <span style={{color:newEP.method_type===m?col:'var(--muted)',fontWeight:700,fontSize:12}}>{isEP?'Easypaisa':isBank?'Bank Transfer':'JazzCash'}</span>
                        </div>
                      );
                    })}
                  </div>
                  {newEP.method_type==='bank' && (
                    <>
                      <label className="sgc-label">Bank Name</label>
                      <input className="sgc-input" placeholder="e.g. MEEZAN, UBL, HBL" value={newEP.bank_name||''} onChange={e=>setNewEP({...newEP,bank_name:e.target.value})} required/>
                    </>
                  )}
                  <label className="sgc-label">Account Title (Name)</label>
                  <input className="sgc-input" placeholder="e.g. Farzana Bibi" value={newEP.account_title} onChange={e=>setNewEP({...newEP,account_title:e.target.value})} required/>
                  <label className="sgc-label">{newEP.method_type==='bank'?'Bank / IBAN Account Number':newEP.method_type==='easypaisa'?'Easypaisa Number':'JazzCash Number'}</label>
                  <input className="sgc-input" placeholder={newEP.method_type==='bank'?'e.g. PK36HABB0000123456789012':'03XX-XXXXXXX'} value={newEP.account_number} onChange={e=>setNewEP({...newEP,account_number:e.target.value})} required/>
                  <label className="sgc-label">Deposit Instructions <span style={{color:'var(--dim)',fontSize:11}}>(shown to user in deposit section)</span></label>
                  <textarea className="sgc-input" rows={3} placeholder="e.g. Send payment and submit the screenshot below. Make sure sender name matches." value={newEP.deposit_message} onChange={e=>setNewEP({...newEP,deposit_message:e.target.value})} style={{resize:'vertical',minHeight:80}}/>
                  <div style={{display:'flex',gap:10}}>
                    <button className="sgc-btn-yellow" type="submit" style={{flex:1}}>{editEP?'Update Account':'Add Account'}</button>
                    {editEP&&<button type="button" className="sgc-btn-sm" style={{padding:13,borderRadius:10,background:'var(--border)',color:'var(--text)'}} onClick={()=>{ setEditEP(null); setNewEP({account_title:'',account_number:'',method_type:'easypaisa',bank_name:''}); }}>Cancel</button>}
                  </div>
                </form>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">Method</th><th className="sgc-th">Title</th><th className="sgc-th">Number</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th>
                    </tr></thead>
                    <tbody>{easypaisa.map(a=>{
                      const isEP=(a.method_type||'easypaisa')==='easypaisa';
                      const isBank=a.method_type==='bank';
                      const col=isEP?'#3cb559':isBank?'#3b82f6':'#e8001e';
                      return (
                        <tr key={a.id} className="sgc-tr">
                          <td className="sgc-td"><span style={{background:isEP?'#0a2010':isBank?'#0a1628':'#200008',color:col,border:`1px solid ${col}`,padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{isEP?'📱 Easypaisa':isBank?'🏦 Bank Transfer':'💳 JazzCash'}</span></td>
                          <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{a.account_title}</td>
                          <td className="sgc-td" style={{fontFamily:'monospace',color:col,fontWeight:700,fontSize:15}}>{a.account_number}</td>
                          <td className="sgc-td"><span className="sgc-badge" style={{background:a.is_active?'#064e3b':'#334155'}}>{a.is_active?'Active':'Inactive'}</span></td>
                          <td className="sgc-td" style={{display:'flex',gap:6}}>
                            <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>{ setEditEP(a); setNewEP({account_title:a.account_title,account_number:a.account_number,method_type:a.method_type||'easypaisa',deposit_message:a.deposit_message||'',bank_name:a.bank_name||''}); window.scrollTo(0,0); }}>Edit</button>
                            <button className="sgc-btn-sm" style={{background:'var(--border)',color:'var(--muted)'}} onClick={()=>toggleEP(a.id)}>{a.is_active?'Disable':'Enable'}</button>
                            <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteEP(a.id)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                    {easypaisa.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No accounts added yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── AD VIEW LOG ── */}
            {tab==='ad-view-log' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">📌 Ad View Log</h2>
                  <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{adViewLog.length} records</span>
                </div>
                <div style={{display:'flex',gap:10,marginBottom:16}}>
                  <input className="sgc-input" style={{margin:0,flex:1}} placeholder="Search by username..." value={adLogSearch} onChange={e=>setAdLogSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchAdLog()}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'0 20px',whiteSpace:'nowrap'}} onClick={searchAdLog}>🔍 Search</button>
                  <button className="sgc-btn-sm" style={{padding:'0 14px',background:'var(--border)',color:'var(--muted)'}} onClick={()=>{ setAdLogSearch(''); loadAll(); }}>Reset</button>
                </div>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">SL</th>
                      <th className="sgc-th">User</th>
                      <th className="sgc-th">Advertisement Name</th>
                      <th className="sgc-th">Type</th>
                      <th className="sgc-th">Earned</th>
                      <th className="sgc-th">Date-Time</th>
                    </tr></thead>
                    <tbody>{adViewLog.map((l,i)=>(
                      <tr key={i} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--dim)',fontWeight:600}}>{i+1}</td>
                        <td className="sgc-td">
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'var(--bg)',flexShrink:0}}>
                              {l.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{color:'var(--text)',fontWeight:700,fontSize:13,margin:0}}>{l.username}</p>
                              <p style={{color:'var(--dim)',fontSize:11,margin:0}}>@{l.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{l.ad_title}</td>
                        <td className="sgc-td">
                          <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>🔗 URL/Link</span>
                        </td>
                        <td className="sgc-td" style={{color:'var(--green)',fontWeight:700}}>Rs. {l.amount?.toFixed(2)}</td>
                        <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(l.clicked_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {adViewLog.length===0&&<tr><td colSpan={6} className="sgc-td" style={{textAlign:'center',padding:32}}>No ad view logs yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── REFERRALS ── */}
            {tab==='referrals' && (
              <div>
                <h2 className="sgc-heading">👥 Referrals</h2>
                <div style={{display:'flex',gap:10,marginBottom:20}}>
                  <input className="sgc-input" style={{margin:0,flex:1}} placeholder="Search by username..." value={refSearch} onChange={e=>setRefSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchReferrals()}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'0 20px',whiteSpace:'nowrap'}} onClick={searchReferrals}>🔍 Search</button>
                  <button className="sgc-btn-sm" style={{padding:'0 14px',background:'var(--border)',color:'var(--muted)'}} onClick={()=>{ setRefSearch(''); loadAll(); }}>Reset</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {referrals.map((u,i)=>(
                    <div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8,marginBottom:u.referrals.length?12:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'var(--bg)',flexShrink:0}}>{u.username[0].toUpperCase()}</div>
                          <div>
                            <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{u.username}</p>
                            <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{u.email} &bull; <span style={{color:'var(--accent)',fontFamily:'monospace'}}>{u.referral_code}</span>{u.referred_by&&<span style={{color:'var(--purple)'}}> &bull; ref by @{u.referred_by}</span>}</p>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                          <span className="sgc-badge" style={{background:'#1e3a6e'}}>{u.membership}</span>
                          <span className="sgc-badge" style={{background:'#064e3b',color:'var(--green)'}}>Rs. {u.balance.toFixed(2)}</span>
                          <span className="sgc-badge" style={{background:'#2d1b69',color:'var(--purple)'}}>{u.total_referrals} refs</span>
                          <span className="sgc-badge" style={{background:'#1a2e1a',color:'#4ade80'}}>Commission: Rs. {u.referral_commission_earned.toFixed(2)}</span>
                        </div>
                      </div>
                      {u.referrals.length>0&&(
                        <div style={{borderTop:'1px solid var(--border)',paddingTop:10}}>
                          <p style={{color:'var(--dim)',fontSize:11,fontWeight:600,marginBottom:6}}>DIRECT REFERRALS ({u.referrals.length})</p>
                          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                            {u.referrals.map((r,j)=>(
                              <div key={j} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,padding:'4px 12px',fontSize:12}}>
                                <span style={{color:'var(--text)',fontWeight:600}}>@{r.username}</span>
                                <span className="sgc-badge" style={{background:'#1e3a6e',marginLeft:6,fontSize:10}}>{r.membership}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {referrals.length===0&&<div className="sgc-empty">No referral data found</div>}
                </div>
              </div>
            )}

            {/* ── REFERRAL COMMISSION SETTINGS ── */}
            {tab==='ref-settings' && (
              <div>
                <h2 className="sgc-heading">⚙️ Referral Commission Settings</h2>
                {[['plan_purchase','💳 Plan Purchase Bonus'],['vip_plan','👑 VIP Plan Purchase Bonus'],['deposit','💰 Add Fund Bonus'],['ad_view','📺 Advertisement View Bonus']].map(([type, label])=>{
                  const s = refSettings[type];
                  if(!s) return null;
                  return (
                    <div key={type} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px',marginBottom:16}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                        <div>
                          <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>{label}</p>
                          <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>To activate the commission, please switch on this button.</p>
                        </div>
                        <div onClick={()=>toggleBonusType(type,!s.is_active)} style={{width:48,height:26,borderRadius:13,background:s.is_active?'var(--green)':'var(--border)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
                          <div style={{position:'absolute',top:3,left:s.is_active?24:3,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
                        </div>
                      </div>
                      <div className="sgc-table-wrap">
                        <table className="sgc-table">
                          <thead><tr><th className="sgc-th">Level</th><th className="sgc-th">Level Details</th><th className="sgc-th">Bonus %</th><th className="sgc-th">Actions</th></tr></thead>
                          <tbody>
                            {s.levels.map((lvl,li)=>(
                              <tr key={lvl.id} className="sgc-tr">
                                <td className="sgc-td" style={{color:'var(--yellow)',fontWeight:700}}>LEVEL# {lvl.level}</td>
                                <td className="sgc-td">
                                  <input type="text" maxLength={160}
                                    defaultValue={lvl.details||''}
                                    placeholder="e.g. Share link to others"
                                    onBlur={e=>updateRefLevel(lvl.id, {details:e.target.value})}
                                    style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',padding:'4px 10px',width:220,fontFamily:'var(--font)',fontSize:13}}/>
                                </td>
                                <td className="sgc-td">
                                  <input type="number" min="0" max="100" step="0.1"
                                    defaultValue={lvl.percent}
                                    onBlur={e=>updateRefLevel(lvl.id, {percent:parseFloat(e.target.value)||0})}
                                    style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',padding:'4px 10px',width:80,fontFamily:'var(--font)',fontSize:13}}/>
                                  <span style={{color:'var(--dim)',marginLeft:6}}>%</span>
                                </td>
                                <td className="sgc-td">
                                  <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteRefLevel(lvl.id)}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button className="sgc-btn-sm" style={{marginTop:10,background:'#1e3a6e',color:'var(--accent)',padding:'6px 16px'}} onClick={()=>addRefLevel(type)}>+ Add Level</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── AD REQUESTS ── */}
            {tab==='ad-requests' && (
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
                    await API.put('/admin/ad-budget-rate',{rate_pkr:parseFloat(newBudgetRate),welcome_message:welcomeMsg});
                    setAdBudgetRate(parseFloat(newBudgetRate));
                    notify('Settings updated ✅');
                  }}>Save</button>
                  <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Current rate: <b style={{color:'var(--yellow)'}}>Rs. {adBudgetRate}/member</b></p>
                </div>

                {/* Min Campaign Users Setting */}
                <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
                  <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:700,marginBottom:12}}>👥 Minimum Users Per Campaign</h4>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="1" max="10000" value={minCampaignUsers} onChange={e=>setMinCampaignUsers(parseInt(e.target.value))}/>
                    <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{ await API.put('/admin/settings/min_campaign_users',{value:String(minCampaignUsers)}); notify('Min users updated ✅'); }}>Save</button>
                  </div>
                  <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Advertisers must target at least <b style={{color:'var(--purple)'}}>{minCampaignUsers} users</b> per campaign.</p>
                </div>

                {/* Free Plan Days Setting */}
                <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
                  <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:12}}>⏰ Free Plan Duration (Days)</h4>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="1" max="365" value={freePlanDays} onChange={e=>setFreePlanDays(parseInt(e.target.value))}/>
                    <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{
                      await API.put('/admin/free-plan-days',{days:freePlanDays});
                      notify('Free plan duration updated ✅');
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
                              <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={async()=>{ await API.put(`/admin/user-ad-requests/${r.id}/approve`,{admin_note:''}); loadAll(); notify('Ad request approved ✅'); }}>✓ Approve</button>
                              <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={async()=>{ await API.put(`/admin/user-ad-requests/${r.id}/reject`,{admin_note:''}); loadAll(); notify('Rejected & refunded'); }}>✗ Reject</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {adRequests.length===0&&<div className="sgc-empty">No ad requests yet</div>}
                </div>
              </div>
            )}

            {/* ── KYC REQUESTS ── */}
            {tab==='kyc' && (
              <div>
                <div className="sgc-page-header">
                  <h2 className="sgc-heading">🪪 KYC Requests</h2>
                  <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{kycRequests.filter(k=>k.status==='pending').length} pending</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {kycRequests.map(k=>{
                    const isPending=k.status==='pending';
                    const borderCol=isPending?'#f59e0b':k.status==='approved'?'#3cb559':'#ef4444';
                    return (
                      <div key={k.id} style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
                        <div style={{background:isPending?'#451a0320':k.status==='approved'?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'var(--bg)',flexShrink:0}}>{k.username?.[0]?.toUpperCase()}</div>
                            <div>
                              <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{k.username}</p>
                              <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(k.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <span style={{background:isPending?'#451a03':k.status==='approved'?'#064e3b':'#450a0a',color:isPending?'#f59e0b':k.status==='approved'?'#4ade80':'#fca5a5',padding:'3px 14px',borderRadius:20,fontSize:11,fontWeight:700}}>{k.status.toUpperCase()}</span>
                        </div>
                        <div style={{padding:'16px 20px',display:'flex',gap:20,flexWrap:'wrap'}}>
                          <div style={{flex:'1 1 200px'}}>
                            <div style={{background:'var(--bg)',borderRadius:8,padding:'8px 12px',marginBottom:8}}>
                              <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>FULL NAME</p>
                              <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>{k.full_name}</p>
                            </div>
                            <div style={{background:'var(--bg)',borderRadius:8,padding:'8px 12px',marginBottom:12}}>
                              <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>CNIC</p>
                              <p style={{color:'var(--accent)',fontFamily:'monospace',fontWeight:700,fontSize:14,margin:0}}>{k.cnic}</p>
                            </div>
                            {isPending&&(
                              <div style={{display:'flex',gap:8}}>
                                <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={async()=>{ await API.put(`/admin/kyc/${k.id}/approve`,{admin_note:''}); loadAll(); notify('KYC Approved ✅'); }}>✓ Approve</button>
                                <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={async()=>{ const note=prompt('Rejection reason (optional):',''); await API.put(`/admin/kyc/${k.id}/reject`,{admin_note:note||''}); loadAll(); notify('KYC Rejected'); }}>✗ Reject</button>
                              </div>
                            )}
                            {k.status==='rejected' && k.admin_note && <p style={{color:'var(--red)',fontSize:12,marginTop:8}}>Reason: {k.admin_note}</p>}
                          </div>
                          <div style={{flex:'1 1 300px',display:'flex',gap:12,flexWrap:'wrap'}}>
                            {k.front_photo_url&&(
                              <div style={{textAlign:'center'}}>
                                <p style={{color:'var(--dim)',fontSize:10,fontWeight:600,letterSpacing:.5,marginBottom:6}}>CNIC FRONT</p>
                                <a href={k.front_photo_url} target="_blank" rel="noreferrer">
                                  <img src={k.front_photo_url} alt="cnic" style={{width:150,height:110,objectFit:'cover',borderRadius:8,border:'2px solid var(--border)'}}/>
                                </a>
                              </div>
                            )}
                            {k.selfie_photo_url&&(
                              <div style={{textAlign:'center'}}>
                                <p style={{color:'var(--dim)',fontSize:10,fontWeight:600,letterSpacing:.5,marginBottom:6}}>SELFIE WITH CNIC</p>
                                <a href={k.selfie_photo_url} target="_blank" rel="noreferrer">
                                  <img src={k.selfie_photo_url} alt="selfie" style={{width:150,height:110,objectFit:'cover',borderRadius:8,border:'2px solid var(--border)'}}/>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {kycRequests.length===0&&<div className="sgc-empty">No KYC requests yet</div>}
                </div>
              </div>
            )}

            {/* ── PLAN PURCHASES ── */}
            {tab==='plan-purchases' && (
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
                      <div key={r.id} style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
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
                                  <button onClick={()=>{navigator.clipboard.writeText(r.sender_phone);notify('Copied! 📋');}} style={{background:'#1e4080',border:'1px solid #38bdf8',color:'#38bdf8',borderRadius:7,padding:'4px 10px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>Copy</button>
                                </div>
                              </div>
                            )}
                            {isPending&&(
                              <div style={{display:'flex',gap:8}}>
                                <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={async()=>{ await API.put(`/admin/plan-purchases/${r.id}/approve`,{admin_note:''}); loadAll(); notify('Plan activated ✅'); }}>✓ Approve</button>
                                <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={async()=>{ await API.put(`/admin/plan-purchases/${r.id}/reject`,{admin_note:''}); loadAll(); notify('Rejected & refunded'); }}>✗ Reject</button>
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
            )}

            {/* ── ADMIN MESSAGES ── */}
            {tab==='messages' && (
              <div>
                <h2 className="sgc-heading">📣 Notifications & Messages</h2>

                {/* WhatsApp */}
                <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
                  <h4 style={{color:'#25d366',fontSize:13,fontWeight:700,marginBottom:12}}>📱 WhatsApp Group Link</h4>
                  <input className="sgc-input" placeholder="https://chat.whatsapp.com/xxxxx" value={whatsappInput} onChange={e=>setWhatsappInput(e.target.value)}/>
                  <div style={{display:'flex',gap:10}}>
                    <button style={{flex:1,padding:'10px',background:'#25d366',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}} onClick={async()=>{ await API.put('/admin/settings/whatsapp_link',{value:whatsappInput}); setWhatsappLink(whatsappInput); notify('Saved ✅'); }}>Save</button>
                    {whatsappLink&&<button style={{flex:1,padding:'10px',background:'#450a0a',border:'none',borderRadius:10,color:'#fca5a5',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}} onClick={async()=>{ await API.put('/admin/settings/whatsapp_link',{value:''}); setWhatsappLink(''); setWhatsappInput(''); notify('Removed'); }}>Remove</button>}
                  </div>
                  {whatsappLink&&<p style={{color:'#25d366',fontSize:12,marginTop:8}}>Current: {whatsappLink}</p>}
                </div>

                {/* Bell Notification — quick link */}
                <div className="sgc-form" style={{display:'none'}}>
                  <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:8}}>🔔 Bell (In-App) Notifications</h4>
                  <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 12px'}}>In-app notifications sidhe user ke bell icon mein jaati hain.</p>
                  <button className="sgc-btn-primary" style={{width:'auto',padding:'10px 24px'}} onClick={()=>setTab('notify')}>→ Send Notification</button>
                </div>

                {/* Email Notification — quick link */}
                <div className="sgc-form" style={{display:'none'}}>
                  <h4 style={{color:'var(--green)',fontSize:13,fontWeight:700,marginBottom:8}}>📧 Email Notifications</h4>
                  <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 12px'}}>"Send Notification" tab mein Email checkbox enable karke email bhi bhej sakte hain.</p>
                  <button className="sgc-btn-primary" style={{width:'auto',padding:'10px 24px',background:'var(--green)',color:'var(--bg)'}} onClick={()=>setTab('notify')}>→ Send Email Notification</button>
                </div>

                {/* Send Funds Message */}
                <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
                  <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:4}}>💬 Send Funds Section Message</h4>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Send Funds form ke neeche show hoga</p>
                  <textarea className="sgc-input" rows={3} placeholder="e.g. Minimum transfer Rs. 50..." value={transferMsgInput} onChange={e=>setTransferMsgInput(e.target.value)} style={{resize:'vertical',minHeight:70}}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/transfer_message',{value:transferMsgInput}); setTransferMsg(transferMsgInput); notify('Saved ✅'); }}>Save</button>
                </div>

                {/* Referral Message */}
                <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
                  <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:700,marginBottom:4}}>👥 Referral Section Custom Message</h4>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Referral link ke sath user ko jo message show hoga</p>
                  <textarea className="sgc-input" rows={3} placeholder="e.g. Apne dosto ko refer karein aur har click par commission kamayein!" value={referralMsgInput} onChange={e=>setReferralMsgInput(e.target.value)} style={{resize:'vertical',minHeight:70}}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/referral_message',{value:referralMsgInput}); setReferralMsg(referralMsgInput); notify('Saved ✅'); }}>Save</button>
                  {referralMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {referralMsg.substring(0,80)}{referralMsg.length>80?'...':''}</p>}
                </div>

                {/* Dashboard Bottom Message */}
                <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
                  <h4 style={{color:'var(--yellow)',fontSize:13,fontWeight:700,marginBottom:4}}>📋 User Dashboard Bottom Message</h4>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>User dashboard ke end mein show hoga</p>
                  <textarea className="sgc-input" rows={4} placeholder="e.g. Roz ads dekhen aur zyada kamayen!" value={dashboardMsgInput} onChange={e=>setDashboardMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/dashboard_message',{value:dashboardMsgInput}); setDashboardMsg(dashboardMsgInput); notify('Saved ✅'); }}>Save</button>
                  {dashboardMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {dashboardMsg.substring(0,80)}{dashboardMsg.length>80?'...':''}</p>}
                </div>

                {/* Registration Bonus */}
                <div className="sgc-form" style={{maxWidth:480}}>
                  <h4 style={{color:'var(--green)',fontSize:13,fontWeight:700,marginBottom:4}}>🎁 Registration Bonus (Rs.)</h4>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Naye user register hone par yeh bonus milega. User plan buy karne ke baad hi withdraw kar sakta hai.</p>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="0" step="0.01" placeholder="e.g. 50" value={regBonusInput} onChange={e=>setRegBonusInput(e.target.value)}/>
                    <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{ await API.put('/admin/settings/registration_bonus',{value:String(regBonusInput)}); setRegistrationBonus(parseFloat(regBonusInput)); notify('Saved ✅'); }}>Save</button>
                  </div>
                  <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Current: <b style={{color:'var(--green)'}}>Rs. {registrationBonus}</b> per new registration</p>
                </div>

                {/* Withdrawal Page Message */}
                <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
                  <h4 style={{color:'var(--red)',fontSize:13,fontWeight:700,marginBottom:4}}>💸 Withdrawal Page Custom Message</h4>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Payout/Withdraw page par form ke neeche show hoga. Withdrawal timings, rules, ya koi notice likhein.</p>
                  <textarea className="sgc-input" rows={4} placeholder="e.g. Withdrawal requests process hone mein 24-48 hours lag sakte hain..." value={withdrawalMsgInput} onChange={e=>setWithdrawalMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/withdrawal_message',{value:withdrawalMsgInput}); setWithdrawalMsg(withdrawalMsgInput); notify('Saved ✅'); }}>Save</button>
                  {withdrawalMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {withdrawalMsg.substring(0,80)}{withdrawalMsg.length>80?'...':''}</p>}
                </div>

                {/* Advertiser Message */}
                <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
                  <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:4}}>📢 Advertiser Custom Message</h4>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Yeh message sirf advertisers ko "Advertise" section mein dikhega. Rules, guidelines, approval policy likhein.</p>
                  <textarea className="sgc-input" rows={8} placeholder="e.g. Apna ad submit karne se pehle in rules ko zaroor parhein..." value={advertiserMsgInput} onChange={e=>setAdvertiserMsgInput(e.target.value)} style={{resize:'vertical',minHeight:150}}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/advertiser_message',{value:advertiserMsgInput}); setAdvertiserMsg(advertiserMsgInput); notify('Saved ✅'); }}>Save</button>
                  {advertiserMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {advertiserMsg.substring(0,80)}{advertiserMsg.length>80?'...':''}</p>}
                </div>

                {/* Ad Section Message */}
                <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
                  <h4 style={{color:'#f59e0b',fontSize:13,fontWeight:700,marginBottom:4}}>📺 Advertisement Section Message</h4>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>User ke Advertisement tab mein ads se pehle ek notice box mein show hoga</p>
                  <textarea className="sgc-input" rows={4} placeholder="e.g. Roz ads dekhen aur zyada kamayen! Har ad ke baad earning turant credit hoti hai." value={adSectionMsgInput} onChange={e=>setAdSectionMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/ad_section_message',{value:adSectionMsgInput}); setAdSectionMsg(adSectionMsgInput); notify('Saved ✅'); }}>Save</button>
                  {adSectionMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {adSectionMsg.substring(0,80)}{adSectionMsg.length>80?'...':''}</p>}
                </div>
              </div>
            )}

            {/* ── SEND NOTIFICATION ── */}
            {tab==='messages' && (
              <div>
                <h2 className="sgc-heading">🔔 Send Notification</h2>
                <div id="send-notification" className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
                  <label className="sgc-label">Title</label>
                  <input className="sgc-input" placeholder="e.g. New Update!" value={notifTitle} onChange={e=>setNotifTitle(e.target.value)}/>
                  <label className="sgc-label">Message</label>
                  <textarea className="sgc-input" rows={4} placeholder="Write announcement..." value={notifMsg} onChange={e=>setNotifMsg(e.target.value)} style={{resize:'vertical',minHeight:100}}/>
                  <label className="sgc-label">Send To <span style={{color:'var(--dim)',fontSize:11}}>(empty = broadcast all)</span></label>
                  <select className="sgc-input" value={notifUserId} onChange={e=>setNotifUserId(e.target.value)}>
                    <option value="">📢 All Users</option>
                    {users.map(u=><option key={u.id} value={u.id}>@{u.username}</option>)}
                  </select>

                  {/* Notification Type */}
                  <label className="sgc-label" style={{marginTop:4}}>Notification Type</label>
                  <div style={{display:'flex',gap:10,marginBottom:16}}>
                    <div style={{flex:1,padding:'12px',borderRadius:10,border:'2px solid var(--accent)',background:'#0d1e38',display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:18}}>🔔</span>
                      <div>
                        <p style={{color:'var(--accent)',fontWeight:700,fontSize:13,margin:0}}>App Notification</p>
                        <p style={{color:'var(--dim)',fontSize:11,margin:0}}>Always sent (in-app)</p>
                      </div>
                      <div style={{marginLeft:'auto',width:16,height:16,borderRadius:'50%',background:'var(--green)',border:'2px solid var(--green)',flexShrink:0}}/>
                    </div>
                    <div onClick={()=>setNotifSendEmail(v=>!v)}
                      style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${notifSendEmail?'#25d366':'var(--border)'}`,background:notifSendEmail?'#071a0d':'var(--bg)',cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all .2s'}}>
                      <span style={{fontSize:18}}>📧</span>
                      <div>
                        <p style={{color:notifSendEmail?'#25d366':'var(--muted)',fontWeight:700,fontSize:13,margin:0}}>Email Notification</p>
                        <p style={{color:'var(--dim)',fontSize:11,margin:0}}>Send via Gmail</p>
                      </div>
                      <div style={{marginLeft:'auto',width:16,height:16,borderRadius:'50%',background:notifSendEmail?'#25d366':'var(--border)',border:`2px solid ${notifSendEmail?'#25d366':'var(--border)'}`,flexShrink:0}}/>
                    </div>
                  </div>

                  <button className="sgc-btn-primary" onClick={async()=>{
                    if(!notifTitle||!notifMsg){ notify('Title and message required','error'); return; }
                    const payload = {
                      title: notifTitle,
                      message: notifMsg,
                      user_id: notifUserId ? parseInt(notifUserId) : null,
                      send_email: notifSendEmail
                    };
                    await API.post('/admin/notifications/send', payload);
                    notify('Notification sent ✅');
                    setNotifTitle(''); setNotifMsg(''); setNotifUserId(''); setNotifSendEmail(false);
                  }}>Send Notification</button>
                </div>
              </div>
            )}

            {/* ── ADVERTISER MANAGEMENT (new isolated module) ── */}
            {tab==='advertiser-mgmt' && (
              <div>
                {advertiserDetail ? (
                  <div>
                    <button onClick={()=>setAdvertiserDetail(null)} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:13,fontWeight:600,marginBottom:16,fontFamily:'var(--font)',padding:0}}>← Back to Advertiser List</button>
                    <div style={{background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:14,padding:'20px 22px',marginBottom:20}}>
                      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16,flexWrap:'wrap'}}>
                        <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--yellow),#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:22,color:'var(--bg)',flexShrink:0}}>{advertiserDetail.username[0].toUpperCase()}</div>
                        <div>
                          <p style={{color:'var(--text)',fontWeight:800,fontSize:18,margin:0}}>@{advertiserDetail.username}</p>
                          <p style={{color:'var(--dim)',fontSize:12,margin:'2px 0 0'}}>{advertiserDetail.email} &bull; <span style={{color:'var(--accent)',textTransform:'capitalize'}}>{advertiserDetail.membership}</span> &bull; Joined {new Date(advertiserDetail.joined).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:10}}>
                        {[
                          ['Total Ads',advertiserDetail.total_ads,'var(--accent)'],
                          ['Total Clicks',advertiserDetail.total_clicks_received,'var(--green)'],
                          ['Actual Viewers',advertiserDetail.total_actual_viewers,'#38bdf8'],
                          ['Budget Spent',`Rs.${advertiserDetail.total_budget_spent}`,'var(--yellow)'],
                          ['Active',advertiserDetail.active_ads,'#4ade80'],
                          ['Completed',advertiserDetail.completed_ads,'var(--purple)'],
                          ['Pending',advertiserDetail.pending_ads,'#fbbf24'],
                        ].map(([l,v,c])=>(
                          <div key={l} style={{background:'rgba(0,0,0,.25)',borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                            <p style={{color:'var(--dim)',fontSize:10,fontWeight:700,margin:'0 0 4px',letterSpacing:.5}}>{l.toUpperCase()}</p>
                            <p style={{color:c,fontSize:18,fontWeight:800,margin:0}}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <h3 style={{color:'var(--text)',fontWeight:800,fontSize:15,marginBottom:14}}>📋 All Campaigns</h3>
                    <div style={{display:'flex',flexDirection:'column',gap:14}}>
                      {advertiserDetail.ads.map((ad)=>{
                        const isActive=ad.status==='approved'; const isDone=ad.status==='completed';
                        const isPending=ad.status==='pending'; const isRejected=ad.status==='rejected';
                        const accentCol=isActive?'#4ade80':isDone?'#38bdf8':isPending?'#fbbf24':'#f87171';
                        const borderCol=isActive?'#166534':isDone?'#1e4080':isPending?'#92400e':'#7f1d1d';
                        const bgCol=isActive?'#052e16':isDone?'#0c1e3e':isPending?'#1c1000':'#1c0a0a';
                        return (
                          <div key={ad.id} style={{background:bgCol,border:`1.5px solid ${borderCol}`,borderRadius:14,overflow:'hidden'}}>
                            <div style={{padding:'12px 16px',borderBottom:`1px solid ${borderCol}`,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                              <div style={{flex:1,minWidth:0}}>
                                <p style={{color:'var(--text)',fontWeight:800,fontSize:15,margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ad.title}</p>
                                <p style={{color:'var(--dim)',fontSize:11,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🔗 {ad.url}</p>
                              </div>
                              <span style={{background:isActive?'#064e3b':isDone?'#1e3a6e':isPending?'#451a03':'#450a0a',color:accentCol,padding:'3px 14px',borderRadius:20,fontSize:11,fontWeight:800,whiteSpace:'nowrap'}}>
                                {isActive?'✅ ACTIVE':isDone?'🏁 DONE':isPending?'⏳ PENDING':'REJECTED'}
                              </span>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:0,borderBottom:`1px solid ${borderCol}`}}>
                              {[
                                ['💰','Budget',`Rs.${ad.total_budget}`],
                                ['👥','Target',ad.members_needed],
                                ['✅','Reached',ad.members_reached],
                                ['👁️','Viewers',ad.actual_viewers],
                                ['⏳','Remaining',ad.remaining_clicks],
                                ['📊','Progress',`${ad.progress_pct}%`],
                              ].map(([icon,label,val],si,arr)=>(
                                <div key={label} style={{padding:'10px 8px',textAlign:'center',borderRight:si<arr.length-1?`1px solid ${borderCol}`:'none'}}>
                                  <p style={{fontSize:16,margin:'0 0 2px'}}>{icon}</p>
                                  <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600}}>{label}</p>
                                  <p style={{color:accentCol,fontSize:12,fontWeight:800,margin:0}}>{val}</p>
                                </div>
                              ))}
                            </div>
                            <div style={{padding:'10px 16px'}}>
                              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                                <span style={{color:'var(--dim)',fontSize:11,fontWeight:600}}>PROGRESS</span>
                                <span style={{color:accentCol,fontSize:11,fontWeight:800}}>{ad.members_reached}/{ad.members_needed}</span>
                              </div>
                              <div style={{height:8,background:'#0b1120',borderRadius:6,overflow:'hidden',border:'1px solid var(--border)'}}>
                                <div style={{width:`${ad.progress_pct}%`,height:'100%',background:`linear-gradient(90deg,${accentCol},${isDone?'#818cf8':isActive?'#86efac':'#fde68a'})`,borderRadius:6}}/>
                              </div>
                              <p style={{color:'var(--dim)',fontSize:10,margin:'6px 0 0'}}>Submitted: {new Date(ad.created_at).toLocaleString()}{ad.admin_note&&<span style={{color:'#fbbf24',marginLeft:8}}>Note: {ad.admin_note}</span>}</p>
                            </div>
                          </div>
                        );
                      })}
                      {advertiserDetail.ads.length===0&&<div className="sgc-empty">No campaigns found.</div>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="sgc-page-header">
                      <h2 className="sgc-heading">📊 Advertiser Management</h2>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{advertiserList.length} advertisers</span>
                        <button className="sgc-btn-sm" style={{background:'#1e3a6e',color:'var(--accent)',padding:'6px 14px'}} onClick={()=>{ setAdvertiserLoading(true); API.get('/admin/advertiser-management').then(r=>{ setAdvertiserList(r.data); setAdvertiserLoading(false); }).catch(()=>setAdvertiserLoading(false)); }}>🔄 Refresh</button>
                      </div>
                    </div>
                    {advertiserLoading && <div style={{textAlign:'center',padding:40,color:'var(--dim)',fontSize:14}}>⏳ Loading advertisers...</div>}
                    {!advertiserLoading && (
                      <>
                        <div className="sgc-stats" style={{marginBottom:24}}>
                          {[
                            ['Total Advertisers',advertiserList.length,'var(--accent)'],
                            ['Total Campaigns',advertiserList.reduce((s,a)=>s+a.total_ads,0),'var(--yellow)'],
                            ['Active Campaigns',advertiserList.reduce((s,a)=>s+a.active_ads,0),'var(--green)'],
                            ['Total Budget',`Rs.${advertiserList.reduce((s,a)=>s+a.total_budget_spent,0).toFixed(2)}`,'var(--purple)'],
                          ].map(([l,v,c])=>(
                            <div key={l} className="sgc-stat-card">
                              <div className="sgc-stat-label">{l}</div>
                              <div className="sgc-stat-val" style={{color:c}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:14}}>
                          {advertiserList.map((adv)=>(
                            <div key={adv.user_id} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',transition:'border-color .2s'}}
                              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--yellow)'}
                              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                              <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                                <div style={{display:'flex',alignItems:'center',gap:12}}>
                                  <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,var(--yellow),#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:18,color:'var(--bg)',flexShrink:0}}>{adv.username[0].toUpperCase()}</div>
                                  <div>
                                    <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>@{adv.username}</p>
                                    <p style={{color:'var(--dim)',fontSize:11,margin:'2px 0 0'}}>{adv.email} &bull; <span style={{color:'var(--accent)',textTransform:'capitalize'}}>{adv.membership}</span></p>
                                  </div>
                                </div>
                                <button onClick={async()=>{ setAdvertiserLoading(true); try{ const r=await API.get(`/admin/advertiser-management/${adv.user_id}`); setAdvertiserDetail(r.data); }catch{} setAdvertiserLoading(false); }}
                                  style={{padding:'8px 18px',background:'linear-gradient(135deg,var(--yellow),#d97706)',border:'none',borderRadius:9,color:'var(--bg)',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>
                                  View Details →
                                </button>
                              </div>
                              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:0}}>
                                {[
                                  ['📢','Total Ads',adv.total_ads,'var(--accent)'],
                                  ['✅','Clicks',adv.total_clicks_received,'var(--green)'],
                                  ['💰','Budget',`Rs.${adv.total_budget_spent}`,'var(--yellow)'],
                                  ['🟢','Active',adv.active_ads,'#4ade80'],
                                  ['🏁','Done',adv.completed_ads,'var(--purple)'],
                                ].map(([icon,label,val,col],si,arr)=>(
                                  <div key={label} style={{padding:'12px 8px',textAlign:'center',borderRight:si<arr.length-1?'1px solid var(--border)':'none'}}>
                                    <p style={{fontSize:18,margin:'0 0 2px'}}>{icon}</p>
                                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 3px',fontWeight:600}}>{label}</p>
                                    <p style={{color:col,fontSize:14,fontWeight:800,margin:0}}>{val}</p>
                                  </div>
                                ))}
                              </div>
                              {adv.ads.length>0&&(
                                <div style={{borderTop:'1px solid var(--border)',padding:'10px 18px'}}>
                                  <p style={{color:'var(--dim)',fontSize:10,fontWeight:700,letterSpacing:.5,margin:'0 0 8px'}}>CAMPAIGNS</p>
                                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                                    {adv.ads.slice(0,4).map(ad=>(
                                      <div key={ad.id} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,padding:'4px 12px',fontSize:11}}>
                                        <span style={{color:'var(--text)',fontWeight:600,marginRight:6}}>{ad.title?.substring(0,20)}{ad.title?.length>20?'...':''}</span>
                                        <span style={{background:ad.status==='approved'?'#064e3b':ad.status==='completed'?'#1e3a6e':ad.status==='pending'?'#451a03':'#450a0a',color:ad.status==='approved'?'#4ade80':ad.status==='completed'?'#38bdf8':ad.status==='pending'?'#fbbf24':'#fca5a5',padding:'1px 7px',borderRadius:20,fontSize:10,fontWeight:700}}>{ad.status}</span>
                                      </div>
                                    ))}
                                    {adv.ads.length>4&&<span style={{color:'var(--dim)',fontSize:11,padding:'4px 8px'}}>+{adv.ads.length-4} more</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {advertiserList.length===0&&<div className="sgc-empty">No advertisers found. Users who submit ad campaigns will appear here.</div>}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── ADMIN EMAILS ── */}
            {tab==='emails' && (
              <div>
                <h2 className="sgc-heading">📧 Admin Emails <span style={{fontSize:13,color:'var(--dim)',fontWeight:400}}>(max 5)</span></h2>

                {editEmail&&(
                  <div className="sgc-modal-overlay">
                    <div className="sgc-modal">
                      <h3 style={{color:'var(--text)',marginBottom:12,fontSize:15,fontWeight:700}}>✏️ Edit Email</h3>
                      <input className="sgc-input" type="email" value={editEmailVal} onChange={e=>setEditEmailVal(e.target.value)}/>
                      <div style={{display:'flex',gap:10}}>
                        <button className="sgc-btn-yellow" style={{flex:1,padding:11}} onClick={saveEditEmail}>Save</button>
                        <button className="sgc-btn-sm" style={{flex:1,background:'var(--border)',color:'var(--text)',padding:11,borderRadius:10}} onClick={()=>setEditEmail(null)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={addEmail} className="sgc-form" style={{marginBottom:24,maxWidth:480}}>
                  <label className="sgc-label">Add Admin Email</label>
                  <div style={{display:'flex',gap:10}}>
                    <input className="sgc-input" style={{margin:0,flex:1}} type="email" placeholder="admin@example.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required/>
                    <button className="sgc-btn-yellow" style={{width:'auto',padding:'0 20px',whiteSpace:'nowrap'}} type="submit">Add</button>
                  </div>
                </form>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">Email</th><th className="sgc-th">Type</th><th className="sgc-th">Added</th><th className="sgc-th">Actions</th>
                    </tr></thead>
                    <tbody>{adminEmails.map(e=>(
                      <tr key={e.id} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{e.email}</td>
                        <td className="sgc-td"><span className="sgc-badge" style={{background:e.is_primary?'#451a03':'var(--border)'}}>{e.is_primary?'⭐ Primary':'Secondary'}</span></td>
                        <td className="sgc-td">{new Date(e.created_at).toLocaleDateString()}</td>
                        <td className="sgc-td" style={{display:'flex',gap:6}}>
                          <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>{ setEditEmail(e); setEditEmailVal(e.email); }}>Edit</button>
                          <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteEmail(e.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
