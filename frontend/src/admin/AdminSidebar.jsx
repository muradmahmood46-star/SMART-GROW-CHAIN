import React, { useState, useEffect } from 'react';
import API from '../api';

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
  tab, setTab, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed
}) {
  const [counts, setCounts] = useState({ pendingW:0, pendingD:0, openT:0, pendingAdReqs:0, pendingKyc:0, pendingPlanPurchases:0 });

  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      try {
        const [w, d, t, a, k, p] = await Promise.all([
          API.get('/admin/withdrawals').catch(()=>({data:[]})),
          API.get('/admin/deposits').catch(()=>({data:[]})),
          API.get('/admin/tickets').catch(()=>({data:[]})),
          API.get('/admin/ad-requests').catch(()=>({data:[]})),
          API.get('/admin/kyc').catch(()=>({data:[]})),
          API.get('/admin/plan-purchases').catch(()=>({data:[]})),
        ]);
        if (active) {
          const lastViewedStr = localStorage.getItem('admin_plan_purchases_viewed_at');
          const lastViewed = lastViewedStr ? new Date(lastViewedStr) : new Date(0);

          const unreadPurchases = (p.data||[]).filter(x => {
            const created = new Date(x.created_at);
            return created > lastViewed;
          }).length;

          setCounts({
            pendingW: (w.data||[]).filter(x=>x.status==='pending').length,
            pendingD: (d.data||[]).filter(x=>x.status==='pending').length,
            openT: (t.data||[]).filter(x=>x.status==='open').length,
            pendingAdReqs: (a.data||[]).filter(x=>x.status==='pending').length,
            pendingKyc: (k.data||[]).filter(x=>x.status==='pending').length,
            pendingPlanPurchases: tab === 'plan-purchases' ? 0 : unreadPurchases,
          });
        }
      } catch (e) {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [tab]);

  useEffect(() => {
    if (tab === 'plan-purchases') {
      localStorage.setItem('admin_plan_purchases_viewed_at', new Date().toISOString());
      setCounts(prev => ({ ...prev, pendingPlanPurchases: 0 }));
    }
  }, [tab]);

  const handleTab = (key) => {
    setTab(key);
    if (key === 'plan-purchases') {
      localStorage.setItem('admin_plan_purchases_viewed_at', new Date().toISOString());
      setCounts(prev => ({ ...prev, pendingPlanPurchases: 0 }));
    }
    if(window.innerWidth<=768){setSidebarCollapsed(true);setSidebarOpen(false);}
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
            {key==='withdrawals' && counts.pendingW>0 && <span className="nav-badge">{counts.pendingW}</span>}
            {key==='deposits'    && counts.pendingD>0 && <span className="nav-badge">{counts.pendingD}</span>}
            {key==='tickets'     && counts.openT>0    && <span className="nav-badge">{counts.openT}</span>}
            {key==='ad-requests' && counts.pendingAdReqs>0 && <span className="nav-badge">{counts.pendingAdReqs}</span>}
            {key==='kyc' && counts.pendingKyc>0 && <span className="nav-badge">{counts.pendingKyc}</span>}
            {key==='plan-purchases' && counts.pendingPlanPurchases>0 && <span className="nav-badge">{counts.pendingPlanPurchases}</span>}
          </button>
        ))}
      </nav>
      <div style={{flex:1}}/>
      <button className="sgc-back-to-login" onClick={()=>window.location.href='/login'}>← Back to Login</button>
      <button className="sgc-logout" onClick={()=>{localStorage.clear();window.location.href='/login';}}>🚪 Logout</button>
    </aside>
  );
}