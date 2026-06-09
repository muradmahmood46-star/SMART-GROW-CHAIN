import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../panel.css';

const TABS = [
  { key:'dashboard',   icon:'📊', label:'Dashboard'      },
  { key:'users',       icon:'👥', label:'Users'           },
  { key:'ads',         icon:'📺', label:'Advertisements'  },
  { key:'create-ad',   icon:'➕', label:'Create Ad'       },
  { key:'withdrawals', icon:'💸', label:'Payout Requests' },
  { key:'deposits',    icon:'📥', label:'Fund Requests'   },
  { key:'transfers',   icon:'🔄', label:'Fund Transfers'  },
  { key:'tickets',     icon:'🎫', label:'Support Tickets' },
  { key:'plans',       icon:'🏆', label:'Plans'           },
  { key:'referrals',   icon:'👥', label:'Referrals'       },
  { key:'ref-settings',icon:'⚙️', label:'Referral Commission'},
  { key:'ad-view-log', icon:'📌', label:'Ad View Log'     },
  { key:'ad-requests', icon:'💰', label:'Ad Rate Setting'  },
  { key:'easypaisa',   icon:'📱', label:'Easypaisa'       },
  { key:'emails',      icon:'📧', label:'Admin Emails'    },
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
  const [newAd, setNewAd]             = useState({ title:'', url:'', description:'', earning_amount:1, timer_seconds:10, daily_limit:100 });
  const [newEP, setNewEP] = useState({ account_title:'', account_number:'', method_type:'easypaisa' });
  const [editEP, setEditEP]           = useState(null);
  const [newEmail, setNewEmail]       = useState('');
  const [newPlan, setNewPlan]         = useState({ name:'', price:0, period_days:30, daily_ads:10, earning_per_click:0.001, referral_commission:0.05, referral_levels:'N/A', sort_order:0 });
  const [editPlan, setEditPlan]       = useState(null);
  const [referrals, setReferrals]     = useState([]);
  const [refSearch, setRefSearch]     = useState('');
  const [refSettings, setRefSettings] = useState({});
  const [adViewLog, setAdViewLog]     = useState([]);
  const [adLogSearch, setAdLogSearch] = useState('');
  const [editEmail, setEditEmail]     = useState(null);
  const [editEmailVal, setEditEmailVal] = useState('');
  const [adRequests, setAdRequests]   = useState([]);
  const [adBudgetRate, setAdBudgetRate] = useState(1);
  const [newBudgetRate, setNewBudgetRate] = useState(1);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [msg, setMsg]                 = useState({ text:'', type:'' });
  const [balanceModal, setBalanceModal] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [replyModal, setReplyModal]   = useState(null);
  const [replyText, setReplyText]     = useState('');
  const navigate = useNavigate();

  const notify = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };

  const loadAll = () => {
    API.get('/admin/stats').then(r=>setStats(r.data));
    API.get('/admin/users').then(r=>setUsers(r.data));
    API.get('/admin/ads').then(r=>setAds(r.data));
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
    API.get('/admin/ad-budget-rate').then(r=>{ setAdBudgetRate(r.data.rate_pkr); setNewBudgetRate(r.data.rate_pkr); setWelcomeMsg(r.data.welcome_message||''); }).catch(()=>{});
  };

  useEffect(()=>{ loadAll(); },[]);

  const toggleUser     = async(id)=>{ await API.put(`/admin/users/${id}/toggle`); loadAll(); notify('User status updated'); };
  const toggleAd       = async(id)=>{ await API.put(`/admin/ads/${id}/toggle`); loadAll(); notify('Ad updated'); };
  const deleteAd       = async(id)=>{ if(!window.confirm('Delete ad?')) return; await API.delete(`/admin/ads/${id}`); loadAll(); notify('Ad deleted'); };
  const approveW       = async(id)=>{ await API.put(`/admin/withdrawals/${id}/approve`); loadAll(); notify('Payout approved ✅'); };
  const rejectW        = async(id)=>{ await API.put(`/admin/withdrawals/${id}/reject`); loadAll(); notify('Payout rejected'); };
  const markSentW      = async(id)=>{ await API.put(`/admin/withdrawals/${id}/sent`); loadAll(); notify('Marked as Sent ✈️'); };
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
    loadAll(); setNewEP({account_title:'',account_number:'',method_type:'easypaisa'});
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
      const data={...newPlan,price:parseFloat(newPlan.price),period_days:parseInt(newPlan.period_days),daily_ads:parseInt(newPlan.daily_ads),earning_per_click:parseFloat(newPlan.earning_per_click),referral_commission:parseFloat(newPlan.referral_commission),sort_order:parseInt(newPlan.sort_order)};
      if(editPlan){ await API.put(`/admin/plans/${editPlan.id}`,data); notify('Plan updated'); setEditPlan(null); }
      else{ await API.post('/admin/plans',data); notify('Plan created ✅'); }
      loadAll(); setNewPlan({name:'',price:0,period_days:30,daily_ads:10,earning_per_click:0.001,referral_commission:0.05,referral_levels:'N/A',sort_order:0});
    } catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const deletePlan = async(id)=>{ if(!window.confirm('Delete plan?')) return; await API.delete(`/admin/plans/${id}`); loadAll(); notify('Plan deleted'); };

  const searchAdLog = async()=>{ const r=await API.get(`/admin/ad-view-log?search=${adLogSearch}`); setAdViewLog(r.data); };

  const searchReferrals = async()=>{ const r=await API.get(`/admin/referrals?search=${refSearch}`); setReferrals(r.data); };

  const toggleBonusType = async(type, val)=>{ await API.put(`/admin/referral-settings/toggle/${type}`,{is_active:val}); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify(val?'Enabled':'Disabled'); };
  const updateRefLevel  = async(id, pct)=>{ await API.put(`/admin/referral-settings/${id}`,{percent:parseFloat(pct)}); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify('Updated'); };
  const addRefLevel     = async(type)=>{ await API.post(`/admin/referral-settings/${type}/add-level`,{percent:0}); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify('Level added'); };
  const deleteRefLevel  = async(id)=>{ await API.delete(`/admin/referral-settings/${id}`); API.get('/admin/referral-settings').then(r=>setRefSettings(r.data)); notify('Deleted'); };

  const saveEditEmail   = async()=>{ try{ await API.put(`/admin/emails/${editEmail.id}`,{email:editEmailVal}); loadAll(); notify('Email updated'); setEditEmail(null); } catch(err){ notify(err.response?.data?.detail||'Error','error'); } };

  const logout=()=>{ localStorage.clear(); navigate('/login'); };

  const pendingW = withdrawals.filter(w=>w.status==='pending').length;
  const pendingD = deposits.filter(d=>d.status==='pending').length;
  const openT    = tickets.filter(t=>t.status==='open').length;
  const pendingAdReqs = adRequests.filter(r=>r.status==='pending').length;

  return (
    <div className="panel-wrap">
      <div className={`sgc-overlay ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(false)}/>

      {/* Balance Modal */}
      {balanceModal && (
        <div className="sgc-modal-overlay">
          <div className="sgc-modal">
            <h3 style={{color:'var(--text)',marginBottom:6,fontSize:16,fontWeight:700}}>Adjust Balance</h3>
            <p style={{color:'var(--dim)',fontSize:13,marginBottom:16}}>User: <b style={{color:'var(--accent)'}}>{balanceModal.username}</b><br/>Current: <b style={{color:'var(--green)'}}>Rs. {balanceModal.balance.toFixed(2)}</b></p>
            <input className="sgc-input" type="number" step="0.01" placeholder="Amount (use - to deduct)" value={balanceAmount} onChange={e=>setBalanceAmount(e.target.value)}/>
            <div style={{display:'flex',gap:10}}>
              <button className="sgc-btn-yellow" style={{flex:1,padding:11}} onClick={adjustBalance}>Apply</button>
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
      <aside className={`sgc-sidebar ${sidebarOpen?'open':''}`}>
        <div className="sgc-logo slide-l">
          <span className="sgc-logo-icon">🌱</span>
          <span className="sgc-logo-text" style={{color:'var(--yellow)'}}>Smart Grow Chain</span>
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
              onClick={()=>{ setTab(key); setSidebarOpen(false); }}>
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
              {key==='withdrawals' && pendingW>0 && <span className="nav-badge">{pendingW}</span>}
              {key==='deposits'    && pendingD>0 && <span className="nav-badge">{pendingD}</span>}
              {key==='tickets'     && openT>0    && <span className="nav-badge">{openT}</span>}
              {key==='ad-requests' && pendingAdReqs>0 && <span className="nav-badge">{pendingAdReqs}</span>}
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
          <span style={{color:'var(--yellow)',fontWeight:800,fontSize:15}}>🌱 SGC Admin</span>
          <div className="sgc-avatar" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',width:36,height:36,fontSize:15,flexShrink:0}}>A</div>
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
                  <h2 className="sgc-heading">💸 Payout Requests</h2>
                  <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{pendingW} pending</span>
                </div>
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
                            {/* Account number — big + copy */}
                            <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:9,padding:'10px 14px',marginBottom:14}}>
                              <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 4px',fontWeight:600,letterSpacing:.5}}>ACCOUNT NUMBER</p>
                              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                                <p style={{color:'#38bdf8',fontFamily:'monospace',fontSize:20,fontWeight:800,margin:0,letterSpacing:1}}>{w.wallet_address}</p>
                                <button onClick={()=>{navigator.clipboard.writeText(w.wallet_address);notify('Copied! 📋');}} style={{background:'#1e4080',border:'1px solid #38bdf8',color:'#38bdf8',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)',whiteSpace:'nowrap',flexShrink:0}}>📋 Copy</button>
                              </div>
                            </div>
                            {/* Actions */}
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
                    <div><label className="sgc-label">Referral Commission</label><input className="sgc-input" type="number" min="0" step="0.01" max="1" placeholder="e.g. 0.10 for 10%" value={newPlan.referral_commission} onChange={e=>setNewPlan({...newPlan,referral_commission:e.target.value})} required/></div>
                    <div><label className="sgc-label">Referral Levels</label><input className="sgc-input" placeholder="e.g. N/A or Up to 2 level" value={newPlan.referral_levels} onChange={e=>setNewPlan({...newPlan,referral_levels:e.target.value})}/></div>
                    <div><label className="sgc-label">Sort Order</label><input className="sgc-input" type="number" min="0" value={newPlan.sort_order} onChange={e=>setNewPlan({...newPlan,sort_order:e.target.value})}/></div>
                  </div>
                  <div style={{display:'flex',gap:10,marginTop:4}}>
                    <button className="sgc-btn-yellow" type="submit" style={{flex:1}}>{editPlan?'Update Plan':'Create Plan'}</button>
                    {editPlan&&<button type="button" className="sgc-btn-sm" style={{padding:13,borderRadius:10,background:'var(--border)',color:'var(--text)'}} onClick={()=>{ setEditPlan(null); setNewPlan({name:'',price:0,period_days:30,daily_ads:10,earning_per_click:0.001,referral_commission:0.05,referral_levels:'N/A',sort_order:0}); }}>Cancel</button>}
                  </div>
                </form>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr><th className="sgc-th">Name</th><th className="sgc-th">Price</th><th className="sgc-th">Days</th><th className="sgc-th">Daily Ads</th><th className="sgc-th">Earn/Click</th><th className="sgc-th">Commission</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th></tr></thead>
                    <tbody>{plans.map(p=>(
                      <tr key={p.id} className="sgc-tr">
                        <td className="sgc-td" style={{color:'var(--text)',fontWeight:700,textTransform:'capitalize'}}>{p.name}</td>
                        <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {p.price}</td>
                        <td className="sgc-td">{p.period_days}d</td>
                        <td className="sgc-td">{p.daily_ads}</td>
                        <td className="sgc-td">Rs. {p.earning_per_click}</td>
                        <td className="sgc-td">{(p.referral_commission*100).toFixed(0)}%</td>
                        <td className="sgc-td"><span className="sgc-badge" style={{background:p.is_active?'#064e3b':'#334155'}}>{p.is_active?'Active':'Off'}</span></td>
                        <td className="sgc-td" style={{display:'flex',gap:6}}>
                          <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>{ setEditPlan(p); setNewPlan({name:p.name,price:p.price,period_days:p.period_days,daily_ads:p.daily_ads,earning_per_click:p.earning_per_click,referral_commission:p.referral_commission,referral_levels:p.referral_levels||'N/A',sort_order:p.sort_order||0}); window.scrollTo(0,0); }}>Edit</button>
                          <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deletePlan(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {plans.length===0&&<tr><td colSpan={8} className="sgc-td" style={{textAlign:'center',padding:32}}>No plans yet</td></tr>}
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
                    {['easypaisa','jazzcash'].map(m=>{
                      const isEP=m==='easypaisa'; const col=isEP?'#3cb559':'#e8001e';
                      return (
                        <div key={m} onClick={()=>setNewEP({...newEP,method_type:m})}
                          style={{flex:1,padding:'12px 8px',borderRadius:10,border:`2px solid ${newEP.method_type===m?col:'var(--border)'}`,background:newEP.method_type===m?(isEP?'#0a2010':'#200008'):'var(--bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
                          <span style={{fontSize:18}}>{isEP?'📱':'💳'}</span>
                          <span style={{color:newEP.method_type===m?col:'var(--muted)',fontWeight:700,fontSize:13}}>{isEP?'Easypaisa':'JazzCash'}</span>
                        </div>
                      );
                    })}
                  </div>
                  <label className="sgc-label">Account Title (Name)</label>
                  <input className="sgc-input" placeholder="e.g. Farzana Bibi" value={newEP.account_title} onChange={e=>setNewEP({...newEP,account_title:e.target.value})} required/>
                  <label className="sgc-label">{newEP.method_type==='easypaisa'?'Easypaisa':'JazzCash'} Number</label>
                  <input className="sgc-input" placeholder="03XX-XXXXXXX" value={newEP.account_number} onChange={e=>setNewEP({...newEP,account_number:e.target.value})} required/>
                  <div style={{display:'flex',gap:10}}>
                    <button className="sgc-btn-yellow" type="submit" style={{flex:1}}>{editEP?'Update Account':'Add Account'}</button>
                    {editEP&&<button type="button" className="sgc-btn-sm" style={{padding:13,borderRadius:10,background:'var(--border)',color:'var(--text)'}} onClick={()=>{ setEditEP(null); setNewEP({account_title:'',account_number:'',method_type:'easypaisa'}); }}>Cancel</button>}
                  </div>
                </form>
                <div className="sgc-table-wrap">
                  <table className="sgc-table">
                    <thead><tr>
                      <th className="sgc-th">Method</th><th className="sgc-th">Title</th><th className="sgc-th">Number</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th>
                    </tr></thead>
                    <tbody>{easypaisa.map(a=>{
                      const isEP=(a.method_type||'easypaisa')==='easypaisa';
                      const col=isEP?'#3cb559':'#e8001e';
                      return (
                        <tr key={a.id} className="sgc-tr">
                          <td className="sgc-td"><span style={{background:isEP?'#0a2010':'#200008',color:col,border:`1px solid ${col}`,padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{isEP?'📱 Easypaisa':'💳 JazzCash'}</span></td>
                          <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{a.account_title}</td>
                          <td className="sgc-td" style={{fontFamily:'monospace',color:col,fontWeight:700,fontSize:15}}>{a.account_number}</td>
                          <td className="sgc-td"><span className="sgc-badge" style={{background:a.is_active?'#064e3b':'#334155'}}>{a.is_active?'Active':'Inactive'}</span></td>
                          <td className="sgc-td" style={{display:'flex',gap:6}}>
                            <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>{ setEditEP(a); setNewEP({account_title:a.account_title,account_number:a.account_number,method_type:a.method_type||'easypaisa'}); window.scrollTo(0,0); }}>Edit</button>
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
                          <thead><tr><th className="sgc-th">Level</th><th className="sgc-th">Bonus %</th><th className="sgc-th">Actions</th></tr></thead>
                          <tbody>
                            {s.levels.map((lvl,li)=>(
                              <tr key={lvl.id} className="sgc-tr">
                                <td className="sgc-td" style={{color:'var(--yellow)',fontWeight:700}}>LEVEL# {lvl.level}</td>
                                <td className="sgc-td">
                                  <input type="number" min="0" max="100" step="0.1"
                                    defaultValue={lvl.percent}
                                    onBlur={e=>updateRefLevel(lvl.id, e.target.value)}
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
                  <label className="sgc-label">Welcome Message <span style={{color:'var(--dim)',fontSize:11}}>(max 20 words)</span></label>
                  <input className="sgc-input" placeholder="e.g. Reach thousands of real members instantly!" value={welcomeMsg}
                    onChange={e=>{ const words=e.target.value.trim().split(/\s+/).filter(Boolean); if(words.length<=20) setWelcomeMsg(e.target.value); }}/>
                  <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Words: {welcomeMsg.trim().split(/\s+/).filter(Boolean).length} / 20</p>
                  <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{
                    await API.put('/admin/ad-budget-rate',{rate_pkr:parseFloat(newBudgetRate),welcome_message:welcomeMsg});
                    setAdBudgetRate(parseFloat(newBudgetRate));
                    notify('Settings updated ✅');
                  }}>Save</button>
                  <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Current rate: <b style={{color:'var(--yellow)'}}>Rs. {adBudgetRate}/member</b></p>
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
