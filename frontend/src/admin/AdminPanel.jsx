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
    <div className="panel-wrap">
      <div className={`sgc-overlay ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(false)}/>

      <AdminSidebar
        tab={tab}
        setTab={setTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className={`panel-main${sidebarCollapsed?" sidebar-hidden":""}`}>
        <div className="sgc-topbar">
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <button className="hamburger" onClick={()=>{if(window.innerWidth<=768){setSidebarOpen(true);}setSidebarCollapsed(false);}}>☰</button>
            <button className="sgc-topbar-login-back" onClick={handleBack} aria-label="Go back" title="Go back">←</button>
          </div>
          <span className="sgc-topbar-title">🌱 Smart Grow Chain</span>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div className="sgc-topbar-avatar" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>A</div>
          </div>
        </div>

        <div className="panel-body">
          <div className="fade-in" style={{width:'100%'}}>
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
        </div>
      </div>
    </div>
  );
}
