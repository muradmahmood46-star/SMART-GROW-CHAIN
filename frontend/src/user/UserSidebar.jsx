import React from 'react';

const TABS = [
  { key:'dashboard',    icon:'🏠', label:'Dashboard'       },
  { key:'ads',          icon:'📺', label:'Advertisement'   },
  { key:'fund-history', icon:'📂', label:'Fund History'    },
  { key:'transfer',     icon:'📲', label:'Deposit'         },
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

export default function UserSidebar({ profile, tab, setTab, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, notifications, tickets, kycData, ads, logout }) {
  const availableAds = ads.filter(a=>!a.already_clicked).length;

  return (
    <aside className={`sgc-sidebar ${sidebarOpen?'open':''}${sidebarCollapsed?' collapsed':''}`}>
      <div className="sgc-logo slide-l">
        <button className="sgc-sidebar-back-btn" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">←</button>
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

      <nav className="sgc-nav">
        {TABS.map(({key,icon,label})=>(
          <button key={key} className={`nav-btn ${tab===key?'active':''}`}
            onClick={()=>{ setTab(key); if(window.innerWidth<=768){setSidebarCollapsed(true);setSidebarOpen(false);} }}>
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
  );
}