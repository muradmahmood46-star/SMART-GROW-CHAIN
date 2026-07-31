import React from 'react';

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

export default function AdminSidebar({ 
  tab, setTab, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed,
  pendingW, pendingD, openT, pendingAdReqs, kycRequests, planPurchases,
  advertiserList, advertiserLoading, onNavigate
}) {
  const handleTab = (key) => {
    setTab(key);
    if(window.innerWidth<=768){setSidebarCollapsed(true);setSidebarOpen(false);}
    if(key==='advertiser-mgmt' && onNavigate) onNavigate(key);
  };

  return (
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
            onClick={()=>handleTab(key)}>
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
      <button className="sgc-back-to-login" onClick={()=>window.location.href='/login'}>← Back to Login</button>
      <button className="sgc-logout" onClick={()=>{localStorage.clear();window.location.href='/login';}}>🚪 Logout</button>
    </aside>
  );
}