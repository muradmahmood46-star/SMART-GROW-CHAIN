import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useBackNavigation from '../services/hooks/useBackNavigation';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './Dashboard/AdminDashboard';
import Users from './Users/Users';
import Advertisements from './Advertisements/Advertisements';
import CreateAd from './CreateAd/CreateAd';
import PayoutRequestSetting from './PayoutRequestSetting/PayoutRequestSetting';
import FundRequests from './FundRequests/FundRequests';
import FundTransfers from './FundTransfers/FundTransfers';
import SupportTickets from './SupportTickets/SupportTickets';
import Plans from './Plans/Plans';
import Referrals from './Referrals/Referrals';
import ReferralCommission from './ReferralCommission/ReferralCommission';
import AdViewLog from './AdViewLog/AdViewLog';
import AdRateRequest from './AdRateRequest/AdRateRequest';
import KYCRequests from './KYCRequests/KYCRequests';
import PlanPurchases from './PlanPurchases/PlanPurchases';
import PaymentOptions from './PaymentOptions/PaymentOptions';
import AdminEmails from './AdminEmails/AdminEmails';
import AdminMessages from './AdminMessages/AdminMessages';
import AdvertiserManagement from './AdvertiserManagement/AdvertiserManagement';
import API from '../api';

export default function AdminPanel() {
  const [tab, _setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const setTab = useCallback((newTab) => {
    if (newTab === tab) return;
    if (newTab !== 'dashboard') {
      window.history.pushState({ sgcAdminTab: newTab }, '', window.location.href);
    }
    _setTab(newTab);
  }, [tab]);

  const notify = useCallback((msg, type='success') => {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;top:20px;right:20px;background:var(--card);color:var(--text);padding:10px 16px;border-radius:8px;border:1px solid var(--border);z-index:9999;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.3);';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }, []);

  // ── Centralized Back Navigation (Admin Panel) ──
  const { handleBack } = useBackNavigation({
    tab,
    setTab,
    sidebarOpen,
    setSidebarOpen,
    setSidebarCollapsed,
    navigate,
  });

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--font)'}}>
      <AdminSidebar
        tab={tab}
        setTab={setTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main style={{flex:1,marginLeft:sidebarCollapsed?80:260,transition:'margin-left .3s cubic-bezier(0.4, 0, 0.2, 1)',padding:'30px 40px',minWidth:0}}>
        <div style={{display:sidebarCollapsed?'flex':'none',alignItems:'center',gap:16,marginBottom:24}}>
          <button className="sgc-btn-sm" style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',width:40,height:40,padding:0,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:10}} onClick={()=>setSidebarOpen(true)}>☰</button>
          <h2 style={{color:'var(--text)',fontSize:20,fontWeight:800,margin:0}}>Admin Panel</h2>
        </div>

        <div className="fade-in" style={{maxWidth:1100,margin:'0 auto'}}>
          {tab === 'dashboard'    && <AdminDashboard setTab={setTab} notify={notify} />}
          {tab === 'users'        && <Users notify={notify} />}
          {tab === 'ads'          && <Advertisements setTab={setTab} notify={notify} />}
          {tab === 'create-ad'    && <CreateAd notify={notify} setTab={setTab} />}
          {tab === 'withdrawals'  && <PayoutRequestSetting notify={notify} />}
          {tab === 'deposits'     && <FundRequests notify={notify} />}
          {tab === 'transfers'    && <FundTransfers notify={notify} />}
          {tab === 'tickets'      && <SupportTickets notify={notify} />}
          {tab === 'plans'        && <Plans notify={notify} />}
          {tab === 'referrals'    && <Referrals notify={notify} />}
          {tab === 'ref-settings' && <ReferralCommission notify={notify} />}
          {tab === 'ad-view-log'  && <AdViewLog notify={notify} />}
          {tab === 'ad-requests'  && <AdRateRequest notify={notify} />}
          {tab === 'kyc'          && <KYCRequests notify={notify} />}
          {tab === 'plan-purchases' && <PlanPurchases notify={notify} />}
          {tab === 'easypaisa'    && <PaymentOptions notify={notify} />}
          {tab === 'emails'       && <AdminEmails notify={notify} />}
          {tab === 'messages'     && <AdminMessages setTab={setTab} notify={notify} />}
          {tab === 'advertiser-mgmt' && <AdvertiserManagement notify={notify} />}
        </div>
      </main>
    </div>
  );
}
