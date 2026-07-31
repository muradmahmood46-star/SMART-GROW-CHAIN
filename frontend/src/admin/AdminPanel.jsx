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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const setTab = useCallback((newTab) => {
    if (newTab === tab) return;
    if (newTab !== 'dashboard') {
      window.history.pushState({ sgcAdminTab: newTab }, '', window.location.href);
    }
    _setTab(newTab);
  }, [tab]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [newAd, setNewAd] = useState({ title:'', url:'', description:'', earning_amount:'', timer_seconds:30, daily_limit:100 });
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ name:'', price:'', description:'', duration_days:'', min_withdraw:'', earning_per_click:'', referral_levels:'' });
  const [editPlan, setEditPlan] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [refSearch, setRefSearch] = useState('');
  const [refSettings, setRefSettings] = useState({});
  const [adViewLog, setAdViewLog] = useState([]);
  const [adLogSearch, setAdLogSearch] = useState('');
  const [adRequests, setAdRequests] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [planPurchases, setPlanPurchases] = useState([]);
  const [easypaisa, setEasypaisa] = useState([]);
  const [newEP, setNewEP] = useState({ id:null, account_title:'', account_number:'', method_type:'easypaisa', deposit_message:'', bank_name:'' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [adminEmails, setAdminEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [editEmail, setEditEmail] = useState(null);
  const [editEmailVal, setEditEmailVal] = useState('');
  const [withdrawSettings, setWithdrawSettings] = useState({ withdraw_enabled:true });
  const [withdrawHours, setWithdrawHours] = useState(1);
  const [schedOnTime, setSchedOnTime] = useState('');
  const [schedOnAmPm, setSchedOnAmPm] = useState('AM');
  const [schedOffTime, setSchedOffTime] = useState('');
  const [schedOffAmPm, setSchedOffAmPm] = useState('PM');
  const [payoutScreenshots, setPayoutScreenshots] = useState({});
  const [pendingW, setPendingW] = useState(0);
  const [pendingD, setPendingD] = useState(0);
  const [openT, setOpenT] = useState(0);
  const [pendingAdReqs, setPendingAdReqs] = useState(0);
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState(true);
  const [showWithdrawSettingsError, setShowWithdrawSettingsError] = useState(false);
  const [advertiserList, setAdvertiserList] = useState([]);
  const [advertiserDetail, setAdvertiserDetail] = useState(null);
  const [advertiserLoading, setAdvertiserLoading] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceUser, setBalanceUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [adBudgetRate, setAdBudgetRate] = useState(0);
  const [newBudgetRate, setNewBudgetRate] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [minCampaignUsers, setMinCampaignUsers] = useState(1);
  const [freePlanDays, setFreePlanDays] = useState(3);
  const [regBonus, setRegistrationBonus] = useState(0);
  const [regBonusInput, setRegBonusInput] = useState('');
  const [withdrawalMsg, setWithdrawalMsg] = useState('');
  const [withdrawalMsgInput, setWithdrawalMsgInput] = useState('');
  const [advertiserMsg, setAdvertiserMsg] = useState('');
  const [advertiserMsgInput, setAdvertiserMsgInput] = useState('');
  const [adSectionMsg, setAdSectionMsg] = useState('');
  const [adSectionMsgInput, setAdSectionMsgInput] = useState('');
  const [dashboardMsg, setDashboardMsg] = useState('');
  const [dashboardMsgInput, setDashboardMsgInput] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [referralMsgInput, setReferralMsgInput] = useState('');
  const [transferMsg, setTransferMsg] = useState('');
  const [transferMsgInput, setTransferMsgInput] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');
  const [showEPError, setShowEPError] = useState(false);

  const notify = useCallback((msg, type='success') => {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;top:20px;right:20px;background:var(--card);color:var(--text);padding:10px 16px;border-radius:8px;border:1px solid var(--border);z-index:9999;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.3);';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [usersRes, adsRes, depositsRes, withdrawalsRes, ticketsRes, plansRes, referralsRes, refSettingsRes, settingsRes] = await Promise.all([
        API.get('/admin/users'), API.get('/admin/ads'), API.get('/admin/deposits'), API.get('/admin/withdrawals'),
        API.get('/admin/tickets'), API.get('/admin/plans'), API.get('/admin/referrals'), API.get('/admin/referral-settings'),
        API.get('/admin/settings'),
      ]);
      setUsers(usersRes.data); setAds(adsRes.data); setDeposits(depositsRes.data); setWithdrawals(withdrawalsRes.data);
      setTickets(ticketsRes.data); setPlans(plansRes.data); setReferrals(referralsRes.data); setRefSettings(refSettingsRes.data);
      if (settingsRes.data) {
        setAdBudgetRate(settingsRes.data.ad_budget_rate || 0);
        setWelcomeMsg(settingsRes.data.welcome_message || '');
        setMinCampaignUsers(settingsRes.data.min_campaign_users || 1);
        setFreePlanDays(settingsRes.data.free_plan_days || 3);
        setRegistrationBonus(settingsRes.data.registration_bonus || 0);
        setWithdrawalMsg(settingsRes.data.withdrawal_message || '');
        setAdvertiserMsg(settingsRes.data.advertiser_message || '');
        setAdSectionMsg(settingsRes.data.ad_section_message || '');
        setDashboardMsg(settingsRes.data.dashboard_message || '');
        setReferralMsg(settingsRes.data.referral_message || '');
        setTransferMsg(settingsRes.data.transfer_message || '');
        setWhatsappLink(settingsRes.data.whatsapp_link || '');
      }
      setPendingW(withdrawalsRes.data.filter(w=>w.status==='pending').length);
      setPendingD(depositsRes.data.filter(d=>d.status==='pending').length);
      setOpenT(ticketsRes.data.filter(t=>t.status==='open').length);
      setAdBudgetRate(prev => settingsRes.data?.ad_budget_rate ?? prev);
      setNewBudgetRate(String(settingsRes.data?.ad_budget_rate ?? adBudgetRate));
      setRegBonusInput(String(settingsRes.data?.registration_bonus ?? regBonus));
      setFreePlanDays(settingsRes.data?.free_plan_days ?? freePlanDays);
      setMinCampaignUsers(settingsRes.data?.min_campaign_users ?? minCampaignUsers);
      setWithdrawalMsgInput(settingsRes.data?.withdrawal_message ?? withdrawalMsg);
      setAdvertiserMsgInput(settingsRes.data?.advertiser_message ?? advertiserMsg);
      setAdSectionMsgInput(settingsRes.data?.ad_section_message ?? adSectionMsg);
      setDashboardMsgInput(settingsRes.data?.dashboard_message ?? dashboardMsg);
      setReferralMsgInput(settingsRes.data?.referral_message ?? referralMsg);
      setTransferMsgInput(settingsRes.data?.transfer_message ?? transferMsg);
      setWhatsappInput(settingsRes.data?.whatsapp_link ?? whatsappLink);
    } catch (e) { console.error(e); }
  }, [adBudgetRate, regBonus, freePlanDays, minCampaignUsers, withdrawalMsg, advertiserMsg, adSectionMsg, dashboardMsg, referralMsg, transferMsg, whatsappLink]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Centralized Back Navigation (Admin Panel) ──
  const { handleBack } = useBackNavigation({
    tab,
    setTab,
    sidebarOpen,
    setSidebarOpen,
    setSidebarCollapsed,
    navigate,
  });

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        if (active) setStats(res.data);
      } catch (e) { console.error(e); }
    };
    loadStats();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadRefSettings = async () => {
      try {
        const res = await API.get('/admin/referral-settings');
        if (active) setRefSettings(res.data);
      } catch (e) { console.error(e); }
    };
    loadRefSettings();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadAdLog = async () => {
      try {
        const res = await API.get('/admin/ad-view-log');
        if (active) setAdViewLog(res.data);
      } catch (e) { console.error(e); }
    };
    loadAdLog();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadRequests = async () => {
      try {
        const [reqRes, kycRes, ppRes] = await Promise.all([
          API.get('/admin/ad-requests'), API.get('/admin/kyc'), API.get('/admin/plan-purchases'),
        ]);
        if (active) {
          setAdRequests(reqRes.data); setKycRequests(kycRes.data); setPlanPurchases(ppRes.data);
          setPendingAdReqs(reqRes.data.filter(r=>r.status==='pending').length);
        }
      } catch (e) { console.error(e); }
    };
    loadRequests();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadEP = async () => {
      try {
        const res = await API.get('/admin/easypaisa');
        if (active) setEasypaisa(res.data);
      } catch (e) { console.error(e); }
    };
    loadEP();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadEmails = async () => {
      try {
        const res = await API.get('/admin/emails');
        if (active) setAdminEmails(res.data);
      } catch (e) { console.error(e); }
    };
    loadEmails();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadWithdrawSettings = async () => {
      try {
        const res = await API.get('/admin/withdraw-settings');
        if (active) {
          setWithdrawSettings(res.data);
          setWithdrawalsEnabled(res.data.withdraw_enabled);
        }
      } catch (e) { console.error(e); }
    };
    loadWithdrawSettings();
    return () => { active = false; };
  }, []);

  const loadAdvertisers = useCallback(async () => {
    try {
      const res = await API.get('/admin/advertiser-management');
      setAdvertiserList(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    let active = true;
    if (tab === 'advertiser-mgmt') {
      loadAdvertisers();
    }
    return () => { active = false; };
  }, [tab, loadAdvertisers]);

  const createAd = async (e) => {
    e.preventDefault();
    await API.post('/admin/ads', newAd);
    setNewAd({ title:'', url:'', description:'', earning_amount:'', timer_seconds:30, daily_limit:100 });
    loadAll();
    notify('Ad created ✅');
  };

  const toggleAd = async (id) => {
    await API.put(`/admin/ads/${id}/toggle`);
    loadAll();
  };

  const deleteAd = async (id) => {
    if (!window.confirm('Delete this ad?')) return;
    await API.delete(`/admin/ads/${id}`);
    loadAll();
    notify('Ad deleted');
  };

  const toggleUser = async (id) => {
    await API.put(`/admin/users/${id}/toggle`);
    loadAll();
  };

  const setBalanceModalFn = (u) => {
    setBalanceUser(u);
    setBalanceAmount('');
    setShowBalanceModal(true);
  };

  const confirmDeposit = async (id) => {
    await API.put(`/admin/deposits/${id}/confirm`);
    loadAll();
    notify('Deposit confirmed ✅');
  };

  const rejectDeposit = async (id) => {
    await API.put(`/admin/deposits/${id}/reject`);
    loadAll();
    notify('Deposit rejected');
  };

  const approveW = async (id) => {
    await API.put(`/admin/withdrawals/${id}/approve`);
    loadAll();
    notify('Withdrawal approved ✅');
  };

  const rejectW = async (id) => {
    await API.put(`/admin/withdrawals/${id}/reject`);
    loadAll();
    notify('Withdrawal rejected');
  };

  const markSentW = async (id) => {
    const file = payoutScreenshots[id];
    if (!file) { notify('Please upload payment screenshot first', 'error'); return; }
    const form = new FormData();
    form.append('screenshot', file);
    await API.post(`/admin/withdrawals/${id}/mark-sent`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    setPayoutScreenshots(prev => { const n = {...prev}; delete n[id]; return n; });
    loadAll();
    notify('Marked as sent ✅');
  };

  const replyTicket = async (id, msg) => {
    await API.post(`/admin/tickets/${id}/reply`, { message: msg });
    loadAll();
    notify('Reply sent ✅');
  };

  const closeTicket = async (id) => {
    await API.put(`/admin/tickets/${id}/close`);
    loadAll();
    notify('Ticket closed');
  };

  const addPlan = async (e) => {
    e.preventDefault();
    if (editPlan) {
      await API.put(`/admin/plans/${editPlan.id}`, newPlan);
      setEditPlan(null);
    } else {
      await API.post('/admin/plans', newPlan);
    }
    setNewPlan({ name:'', price:'', description:'', duration_days:'', min_withdraw:'', earning_per_click:'', referral_levels:'' });
    loadAll();
    notify(editPlan ? 'Plan updated ✅' : 'Plan added ✅');
  };

  const editPlanFn = (plan) => {
    setEditPlan(plan);
    setNewPlan({ name: plan.name, price: plan.price, description: plan.description, duration_days: plan.duration_days, min_withdraw: plan.min_withdraw, earning_per_click: plan.earning_per_click, referral_levels: plan.referral_levels });
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    await API.delete(`/admin/plans/${id}`);
    loadAll();
    notify('Plan deleted');
  };

  const searchReferrals = async () => {
    if (!refSearch.trim()) return;
    try {
      const res = await API.get(`/admin/referrals?search=${refSearch}`);
      setReferrals(res.data);
    } catch (e) { console.error(e); }
  };

  const toggleBonusType = async (type, val) => {
    await API.put(`/admin/referral-settings/${type}`, { is_active: val });
    setRefSettings(prev => ({ ...prev, [type]: { ...prev[type], is_active: val } }));
    notify('Commission settings updated ✅');
  };

  const addRefLevel = async (type) => {
    await API.post(`/admin/referral-settings/${type}/levels`, {});
    const res = await API.get('/admin/referral-settings');
    setRefSettings(res.data);
    notify('Level added ✅');
  };

  const updateRefLevel = async (id, data) => {
    await API.put(`/admin/referral-levels/${id}`, data);
    const res = await API.get('/admin/referral-settings');
    setRefSettings(res.data);
  };

  const deleteRefLevel = async (id) => {
    if (!window.confirm('Delete this level?')) return;
    await API.delete(`/admin/referral-levels/${id}`);
    const res = await API.get('/admin/referral-settings');
    setRefSettings(res.data);
    notify('Level deleted');
  };

  const searchAdLog = async () => {
    if (!adLogSearch.trim()) return;
    try {
      const res = await API.get(`/admin/ad-view-log?search=${adLogSearch}`);
      setAdViewLog(res.data);
    } catch (e) { console.error(e); }
  };

  const addEmail = async (e) => {
    e.preventDefault();
    await API.post('/admin/emails', { email: newEmail });
    setNewEmail('');
    loadEmails();
    notify('Email added ✅');
  };

  const loadEmails = async () => {
    try {
      const res = await API.get('/admin/emails');
      setAdminEmails(res.data);
    } catch (e) { console.error(e); }
  };

  const saveEditEmail = async () => {
    await API.put(`/admin/emails/${editEmail.id}`, { email: editEmailVal });
    setEditEmail(null);
    loadEmails();
    notify('Email updated ✅');
  };

  const deleteEmail = async (id) => {
    if (!window.confirm('Delete this email?')) return;
    await API.delete(`/admin/emails/${id}`);
    loadEmails();
    notify('Email deleted');
  };

  const toggleEP = async (id) => {
    try {
      await API.put(`/admin/easypaisa/${id}/toggle`);
      loadEP();
      notify('Payment method updated ✅');
    } catch (e) { setShowEPError(true); }
  };

  const loadEP = async () => {
    try {
      const res = await API.get('/admin/easypaisa');
      setEasypaisa(res.data);
      setShowEPError(false);
    } catch (e) { setShowEPError(true); }
  };

  const deleteEP = async (id) => {
    if (!window.confirm('Delete this payment method?')) return;
    await API.delete(`/admin/easypaisa/${id}`);
    loadEP();
    notify('Payment method deleted');
  };

  const addEP = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/easypaisa', newEP);
      setNewEP({ id:null, account_title:'', account_number:'', method_type:'easypaysa', deposit_message:'', bank_name:'' });
      setShowAddForm(false);
      loadEP();
      notify('Payment method added ✅');
    } catch (e) { setShowEPError(true); }
  };

  return (
    <div className="sgc-admin-wrap">
      <AdminSidebar
        tab={tab} setTab={setTab}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}
        pendingW={pendingW} pendingD={pendingD} openT={openT}
        pendingAdReqs={pendingAdReqs} kycRequests={kycRequests} planPurchases={planPurchases}
        advertiserList={advertiserList} advertiserLoading={advertiserLoading}
        onNavigate={(key) => { if (key === 'advertiser-mgmt') loadAdvertisers(); }}
      />
      <main className="sgc-main">
        <div className="sgc-admin-topbar" style={{display:'flex',alignItems:'center',gap:8,padding:'12px 16px',borderBottom:'1px solid var(--border)',marginBottom:8,flexShrink:0}}>
          <button className="sgc-topbar-login-back" onClick={handleBack} aria-label="Go back" title="Go back" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16,color:'var(--text)'}}>←</button>
          <span style={{color:'var(--text)',fontWeight:700,fontSize:14,fontFamily:'var(--font)'}}>Admin Panel</span>
        </div>
        {tab === 'dashboard'    && <AdminDashboard stats={stats} deposits={deposits} setTab={setTab} openT={openT} />}
        {tab === 'users'        && <Users users={users} toggleUser={toggleUser} setBalanceModal={setBalanceModalFn} />}
        {tab === 'ads'          && <Advertisements ads={ads} toggleAd={toggleAd} deleteAd={deleteAd} onCreateAd={()=>setTab('create-ad')} />}
        {tab === 'create-ad'    && <CreateAd newAd={newAd} setNewAd={setNewAd} createAd={createAd} />}
        {tab === 'withdrawals'  && <PayoutRequestSetting withdrawals={withdrawals} pendingW={pendingW} withdrawSettings={withdrawSettings} setWithdrawSettings={setWithdrawSettings} withdrawHours={withdrawHours} schedOnTime={schedOnTime} schedOnAmPm={schedOnAmPm} schedOffTime={schedOffTime} schedOffAmPm={schedOffAmPm} setWithdrawHours={setWithdrawHours} setSchedOnTime={setSchedOnTime} setSchedOnAmPm={setSchedOnAmPm} setSchedOffTime={setSchedOffTime} setSchedOffAmPm={setSchedOffAmPm} approveW={approveW} rejectW={rejectW} markSentW={markSentW} payoutScreenshots={payoutScreenshots} setPayoutScreenshots={setPayoutScreenshots} notify={notify} showWithdrawSettingsError={showWithdrawSettingsError} />}
        {tab === 'deposits'     && <FundRequests deposits={deposits} pendingD={pendingD} confirmDeposit={confirmDeposit} rejectDeposit={rejectDeposit} />}
        {tab === 'transfers'    && <FundTransfers transfers={transfers} />}
        {tab === 'tickets'      && <SupportTickets tickets={tickets} openT={openT} replyTicket={replyTicket} closeTicket={closeTicket} />}
        {tab === 'plans'        && <Plans plans={plans} newPlan={newPlan} setNewPlan={setNewPlan} addPlan={addPlan} editPlan={editPlanFn} deletePlan={deletePlan} />}
        {tab === 'referrals'    && <Referrals referrals={referrals} refSearch={refSearch} setRefSearch={setRefSearch} searchReferrals={searchReferrals} loadAll={loadAll} />}
        {tab === 'ref-settings' && <ReferralCommission refSettings={refSettings} toggleBonusType={toggleBonusType} addRefLevel={addRefLevel} updateRefLevel={updateRefLevel} deleteRefLevel={deleteRefLevel} />}
        {tab === 'ad-view-log'  && <AdViewLog adViewLog={adViewLog} adLogSearch={adLogSearch} setAdLogSearch={setAdLogSearch} searchAdLog={searchAdLog} />}
        {tab === 'ad-requests'  && <AdRateRequest adRequests={adRequests} pendingAdReqs={pendingAdReqs} newBudgetRate={newBudgetRate} setNewBudgetRate={setNewBudgetRate} adBudgetRate={adBudgetRate} setAdBudgetRate={setAdBudgetRate} welcomeMsg={welcomeMsg} setWelcomeMsg={setWelcomeMsg} minCampaignUsers={minCampaignUsers} setMinCampaignUsers={setMinCampaignUsers} freePlanDays={freePlanDays} setFreePlanDays={setFreePlanDays} searchAdLog={searchAdLog} loadAll={loadAll} notify={notify} />}
        {tab === 'kyc'          && <KYCRequests kycRequests={kycRequests} notify={notify} />}
        {tab === 'plan-purchases' && <PlanPurchases planPurchases={planPurchases} notify={notify} />}
        {tab === 'easypaisa'    && <PaymentOptions easypaisa={easypaisa} newEP={newEP} setNewEP={setNewEP} toggleEP={toggleEP} deleteEP={deleteEP} showAddForm={showAddForm} setShowAddForm={setShowAddForm} addEP={addEP} showError={showEPError} />}
        {tab === 'emails'       && <AdminEmails adminEmails={adminEmails} newEmail={newEmail} setNewEmail={setNewEmail} addEmail={addEmail} editEmail={editEmail} setEditEmail={setEditEmail} editEmailVal={editEmailVal} setEditEmailVal={setEditEmailVal} saveEditEmail={saveEditEmail} deleteEmail={deleteEmail} />}
        {tab === 'messages'     && <AdminMessages whatsappLink={whatsappLink} whatsappInput={whatsappInput} setWhatsappInput={setWhatsappInput} setWhatsappLink={setWhatsappLink} transferMsg={transferMsg} transferMsgInput={transferMsgInput} setTransferMsgInput={setTransferMsgInput} setTransferMsg={setTransferMsg} referralMsg={referralMsg} referralMsgInput={referralMsgInput} setReferralMsgInput={setReferralMsgInput} setReferralMsg={setReferralMsg} dashboardMsg={dashboardMsg} dashboardMsgInput={dashboardMsgInput} setDashboardMsgInput={setDashboardMsgInput} setDashboardMsg={setDashboardMsg} regBonus={regBonus} registrationBonus={regBonus} regBonusInput={regBonusInput} setRegBonusInput={setRegBonusInput} setRegistrationBonus={setRegistrationBonus} withdrawalMsg={withdrawalMsg} withdrawalMsgInput={withdrawalMsgInput} setWithdrawalMsgInput={setWithdrawalMsgInput} setWithdrawalMsg={setWithdrawalMsg} advertiserMsg={advertiserMsg} advertiserMsgInput={advertiserMsgInput} setAdvertiserMsgInput={setAdvertiserMsgInput} setAdvertiserMsg={setAdvertiserMsg} adSectionMsg={adSectionMsg} adSectionMsgInput={adSectionMsgInput} setAdSectionMsgInput={setAdSectionMsgInput} setAdSectionMsg={setAdSectionMsg} setTab={setTab} notify={notify} />}
        {tab === 'advertiser-mgmt' && <AdvertiserManagement advertiserDetail={advertiserDetail} setAdvertiserDetail={setAdvertiserDetail} advertiserList={advertiserList} setAdvertiserList={setAdvertiserList} advertiserLoading={advertiserLoading} setAdvertiserLoading={setAdvertiserLoading} notify={notify} />}
      </main>

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="sgc-modal-overlay" onClick={()=>setShowBalanceModal(false)}>
          <div className="sgc-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:420,width:'90%'}}>
            <h3 style={{color:'var(--text)',marginBottom:12,fontSize:15,fontWeight:700}}>Update Balance</h3>
            <p style={{color:'var(--dim)',fontSize:12,marginBottom:12}}>User: <b>{balanceUser?.username}</b></p>
            <input className="sgc-input" type="number" step="0.01" placeholder="Enter new balance" value={balanceAmount} onChange={e=>setBalanceAmount(e.target.value)} autoFocus/>
            <div style={{display:'flex',gap:10,marginTop:12}}>
              <button className="sgc-btn-yellow" style={{flex:1}} onClick={async()=>{
                await API.put(`/admin/users/${balanceUser.id}/balance`, { balance: parseFloat(balanceAmount) });
                setShowBalanceModal(false); loadAll(); notify('Balance updated ✅');
              }}>Update</button>
              <button className="sgc-btn-sm" style={{flex:1,background:'var(--border)',color:'var(--text)',padding:11,borderRadius:10}} onClick={()=>setShowBalanceModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
