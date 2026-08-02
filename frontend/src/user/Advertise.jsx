import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../api';

export default function Advertise({
  profile,
  notify,
  setTab,
  setSelectedPlan,
  loadData,
  advertiserMsg: initialAdvertiserMsg
}) {
  const [adRate, setAdRate] = useState(1);
  const [minCampaignUsers, setMinCampaignUsers] = useState(50);
  const [adForm, setAdForm] = useState({ title:'', url:'', members_needed:'', sender_name:'', transaction_id:'' });
  const [adSenderPhone, setAdSenderPhone] = useState('');
  const [adBankName, setAdBankName] = useState('');
  const [adAccountHolder, setAdAccountHolder] = useState('');
  const [adAccountNumber, setAdAccountNumber] = useState('');
  const [adNote, setAdNote] = useState('');
  const [adPayMethod, setAdPayMethod] = useState('wallet');
  const [adScreenshot, setAdScreenshot] = useState(null);
  const [myAdRequests, setMyAdRequests] = useState([]);
  const [campaignViewers, setCampaignViewers] = useState({});
  const [viewerLimits, setViewerLimits] = useState({});
  const [epAccounts, setEpAccounts] = useState([]);
  const [advertiserMsg, setAdvertiserMsg] = useState(initialAdvertiserMsg || '');
  const [hasAcceptedMsg, setHasAcceptedMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reactivate Payment Modal State
  const [reactivateModalReq, setReactivateModalReq] = useState(null);
  const [reactivatePayMethod, setReactivatePayMethod] = useState('easypaisa');
  const [reactivateSenderName, setReactivateSenderName] = useState('');
  const [reactivateSenderPhone, setReactivateSenderPhone] = useState('');
  const [reactivateTrxId, setReactivateTrxId] = useState('');
  const [reactivateBankName, setReactivateBankName] = useState('');
  const [reactivateAccountHolder, setReactivateAccountHolder] = useState('');
  const [reactivateAccountNumber, setReactivateAccountNumber] = useState('');
  const [reactivateNote, setReactivateNote] = useState('');
  const [reactivateScreenshot, setReactivateScreenshot] = useState(null);
  const [isReactivating, setIsReactivating] = useState(false);

  useEffect(() => {
    API.get('/user/ad-request/rate').then(r=>{ setAdRate(r.data.rate_pkr); }).catch(()=>{});
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
    API.get('/user/settings').then(r=>{
      if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50);
      if(r.data.advertiser_message) setAdvertiserMsg(r.data.advertiser_message);
    }).catch(()=>{});
    API.get('/deposit/easypaisa-accounts').then(r=>setEpAccounts(r.data)).catch(()=>{});

    // Trap back button on mobile to open sidebar instead of leaving app
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      setTab('dashboard');
      window.dispatchEvent(new Event('openSidebar'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchRequests = () => {
    API.get('/user/ad-request/my-requests').then(r=>setMyAdRequests(r.data)).catch(()=>{});
  };

  const totalCost = (parseInt(adForm.members_needed)||0) * adRate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const membersCount = parseInt(adForm.members_needed) || 0;
    if (membersCount < minCampaignUsers) {
      notify(`Minimum ${minCampaignUsers} users required per campaign`, 'error');
      return;
    }

    if (adPayMethod === 'wallet' && profile.balance < totalCost) {
      notify(`Insufficient wallet balance. Required: Rs. ${totalCost.toFixed(2)}`, 'error');
      return;
    }

    if (adPayMethod !== 'wallet' && !adScreenshot) {
      notify('Please upload payment screenshot', 'error');
      return;
    }

    if (adPayMethod === 'bank' && (!adBankName || !adAccountHolder || !adAccountNumber)) {
      notify('Please fill all bank account details', 'error');
      return;
    }

    if ((adPayMethod === 'easypaisa' || adPayMethod === 'jazzcash') && (!adForm.sender_name || !adSenderPhone || !adForm.transaction_id)) {
      notify('Please fill sender name, account number and transaction ID', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', adForm.title.trim());
      fd.append('url', adForm.url.trim());
      fd.append('members_needed', membersCount);
      fd.append('payment_method', adPayMethod);

      if (adPayMethod === 'bank') {
        fd.append('sender_name', adAccountHolder.trim());
        fd.append('transaction_id', `BANK|${adBankName.trim()}|${adAccountNumber.trim()}${adNote ? '|Note:' + adNote.trim() : ''}`);
      } else if (adPayMethod === 'easypaisa' || adPayMethod === 'jazzcash') {
        fd.append('sender_name', adForm.sender_name.trim());
        fd.append('transaction_id', `${adForm.transaction_id.trim()}|Acc:${adSenderPhone.trim()}`);
      } else {
        fd.append('sender_name', adForm.sender_name || profile.username);
        fd.append('transaction_id', adForm.transaction_id || 'WALLETPAY');
      }

      if (adScreenshot) {
        fd.append('screenshot', adScreenshot);
      }

      const res = await API.post('/user/ad-request', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      if (adPayMethod === 'wallet') {
        notify('Ad request approved & campaign is live now! 🚀');
      } else {
        notify(res.data.message || 'Ad request submitted! Admin will verify shortly. ✅');
      }

      fetchRequests();
      if (loadData) loadData();

      // Reset Form
      setAdForm({ title: '', url: '', members_needed: '', sender_name: '', transaction_id: '' });
      setAdSenderPhone('');
      setAdBankName('');
      setAdAccountHolder('');
      setAdAccountNumber('');
      setAdNote('');
      setAdScreenshot(null);
    } catch (err) {
      notify(err.response?.data?.detail || 'Error submitting request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Smart Reactivation Logic
  const handleReactivateClick = async (req) => {
    // Case 1: Wallet Balance is Sufficient -> Deduct automatically, reactivate instantly, NO MODAL!
    if (profile.balance >= req.total_cost) {
      try {
        const fd = new FormData();
        fd.append('payment_method', 'wallet');
        const r = await API.post(`/user/ad-request/reactivate/${req.id}`, fd);
        notify(r.data.message || 'Campaign reactivated & live now! 🚀');
        fetchRequests();
        if (loadData) loadData();
      } catch (err) {
        notify(err.response?.data?.detail || 'Failed to reactivate campaign', 'error');
      }
    } else {
      // Case 2: Insufficient Wallet Balance -> Show Payment Options Modal (Easypaisa/JazzCash/Bank)
      setReactivateModalReq(req);
      setReactivatePayMethod('easypaisa');
      setReactivateSenderName('');
      setReactivateSenderPhone('');
      setReactivateTrxId('');
      setReactivateBankName('');
      setReactivateAccountHolder('');
      setReactivateAccountNumber('');
      setReactivateNote('');
      setReactivateScreenshot(null);
    }
  };

  const handleReactivateSubmit = async (e) => {
    e.preventDefault();
    if (!reactivateModalReq || isReactivating) return;

    if (!reactivateScreenshot) {
      notify('Please upload payment screenshot', 'error');
      return;
    }

    if (reactivatePayMethod === 'bank' && (!reactivateBankName || !reactivateAccountHolder || !reactivateAccountNumber)) {
      notify('Please fill all bank account details', 'error');
      return;
    }

    if ((reactivatePayMethod === 'easypaisa' || reactivatePayMethod === 'jazzcash') && (!reactivateSenderName || !reactivateSenderPhone || !reactivateTrxId)) {
      notify('Please fill sender name, account number and transaction ID', 'error');
      return;
    }

    setIsReactivating(true);
    try {
      const fd = new FormData();
      fd.append('payment_method', reactivatePayMethod);

      if (reactivatePayMethod === 'bank') {
        fd.append('sender_name', reactivateAccountHolder.trim());
        fd.append('transaction_id', `BANK|${reactivateBankName.trim()}|${reactivateAccountNumber.trim()}${reactivateNote ? '|Note:' + reactivateNote.trim() : ''}`);
      } else {
        fd.append('sender_name', reactivateSenderName.trim());
        fd.append('transaction_id', `${reactivateTrxId.trim()}|Acc:${reactivateSenderPhone.trim()}`);
      }

      if (reactivateScreenshot) {
        fd.append('screenshot', reactivateScreenshot);
      }

      const res = await API.post(`/user/ad-request/reactivate/${reactivateModalReq.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify(res.data.message || 'Reactivation request submitted! Admin will verify shortly. ⌛');
      
      setReactivateModalReq(null);
      fetchRequests();
      if (loadData) loadData();
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed to submit reactivation request', 'error');
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <div>
      {/* Guidelines Modal */}
      {!hasAcceptedMsg && advertiserMsg && createPortal(
        <div className="sgc-modal-overlay" style={{zIndex:9999,position:'fixed',inset:0,background:'rgba(0,0,0,0.78)',backdropFilter:'blur(5px)'}}>
          <div className="sgc-modal" style={{position:'fixed',top:'40%',left:'50%',transform:'translate(-50%, -50%)',animation:'none',margin:0,textAlign:'left',maxWidth:540,width:'92%',maxHeight:'85dvh',display:'flex',flexDirection:'column',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:'28px 24px',boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}}>
            <button onClick={() => { setTab('dashboard'); window.dispatchEvent(new Event('openSidebar')); }} style={{position:'absolute',top:16,right:16,background:'transparent',border:'none',color:'var(--dim)',fontSize:22,cursor:'pointer',fontWeight:800}}>✕</button>
            <div style={{textAlign:'center',marginBottom:16,marginTop:8}}>
              <div style={{fontSize:44,marginBottom:8}}>📢</div>
              <h3 style={{color:'var(--accent)',fontSize:20,fontWeight:800,margin:'0 0 6px'}}>Advertiser Guidelines & Rules</h3>
              <p style={{color:'var(--dim)',fontSize:12,margin:0,fontWeight:600}}>Please read the instructions carefully before creating your advertisement campaign.</p>
            </div>
            <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px',marginBottom:22,overflowY:'auto',maxHeight:320,lineHeight:1.8}}>
              <p style={{color:'var(--text)',fontSize:13,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',fontWeight:600}}>{advertiserMsg}</p>
            </div>
            <button className="sgc-btn-primary" style={{width:'100%',padding:'14px',fontSize:15,fontWeight:800,borderRadius:12,cursor:'pointer'}} onClick={()=>setHasAcceptedMsg(true)}>
              Continue to Advertise →
            </button>
          </div>
        </div>
      , document.body)}

      {/* REACTIVATE PAYMENT MODAL (Only opens when wallet balance is insufficient) */}
      {reactivateModalReq && createPortal(
        <div className="sgc-modal-overlay" style={{zIndex:9999,position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(6px)'}}>
          <div className="sgc-modal" style={{position:'fixed',top:'35%',left:'50%',transform:'translate(-50%, -50%)',animation:'none',margin:0,textAlign:'left',maxWidth:540,width:'92%',maxHeight:'90dvh',overflowY:'auto',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:'28px 24px',boxShadow:'0 20px 50px rgba(0,0,0,0.6)'}}>
            
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{color:'var(--accent)',fontSize:18,fontWeight:800,margin:0}}>🔄 Reactivate Campaign</h3>
              <button onClick={()=>setReactivateModalReq(null)} style={{background:'transparent',border:'none',color:'var(--dim)',fontSize:22,cursor:'pointer',fontWeight:800}}>✕</button>
            </div>

            <p style={{color:'var(--text)',fontSize:14,fontWeight:700,margin:'0 0 6px'}}>{reactivateModalReq.title}</p>
            
            <div style={{background:'#451a03',border:'1px solid #f59e0b',borderRadius:12,padding:'12px 16px',marginBottom:18}}>
              <p style={{color:'#fbbf24',fontSize:13,fontWeight:700,margin:'0 0 4px'}}>⚠️ Insufficient Wallet Balance</p>
              <p style={{color:'var(--dim)',fontSize:12,margin:0}}>
                Your balance (Rs. {profile.balance.toFixed(2)}) is less than campaign cost (Rs. {reactivateModalReq.total_cost.toFixed(2)}). Please select a manual payment method below to submit your reactivation request to Admin:
              </p>
            </div>

            <form onSubmit={handleReactivateSubmit}>
              <label className="sgc-label">Select Payment Method</label>
              <div style={{display:'flex',gap:8,marginBottom:18}}>
                {[['easypaisa','📱 Easypaisa'],['jazzcash','💳 JazzCash'],['bank','🏦 Bank Transfer']].map(([val,label])=>(
                  <div key={val} onClick={()=>setReactivatePayMethod(val)}
                    style={{flex:1,padding:'10px 4px',borderRadius:10,border:`2px solid ${reactivatePayMethod===val?'var(--accent)':'var(--border)'}`,background:reactivatePayMethod===val?'#0d1e38':'var(--bg)',cursor:'pointer',textAlign:'center',color:reactivatePayMethod===val?'var(--accent)':'var(--muted)',fontWeight:700,fontSize:12,transition:'all .2s'}}>
                    {label}
                  </div>
                ))}
              </div>

              {(reactivatePayMethod === 'easypaisa' || reactivatePayMethod === 'jazzcash') && (
                <>
                  {epAccounts.filter(a => a.method_type === reactivatePayMethod).slice(0, 1).map(a => (
                    <div key={a.id} style={{background:'#071a0d',border:'1.5px solid #3cb55940',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                      <p style={{color:'#cbd5e1',fontSize:11,margin:'0 0 4px'}}>Send Rs. {reactivateModalReq.total_cost.toFixed(2)} to this account:</p>
                      <p style={{color:'var(--yellow)',fontWeight:800,fontSize:16,margin:'0 0 2px'}}>{a.account_title}</p>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <p style={{color:'#ffffff',fontFamily:'monospace',fontSize:18,fontWeight:900,margin:0}}>{a.account_number}</p>
                        <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--yellow)',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'var(--font)'}}>Copy</button>
                      </div>
                    </div>
                  ))}

                  <label className="sgc-label">Sender Name</label>
                  <input className="sgc-input" placeholder="Name on Easypaisa/JazzCash account" value={reactivateSenderName} onChange={e=>setReactivateSenderName(e.target.value)} required/>

                  <label className="sgc-label">Sender Account Number / Phone</label>
                  <input className="sgc-input" placeholder="Phone or account number used to send" value={reactivateSenderPhone} onChange={e=>setReactivateSenderPhone(e.target.value)} required/>

                  <label className="sgc-label">Transaction ID (TRX ID)</label>
                  <input className="sgc-input" placeholder="e.g. 23849102391" value={reactivateTrxId} onChange={e=>setReactivateTrxId(e.target.value)} required/>

                  <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                  <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:12,padding:'18px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setReactivateScreenshot(e.target.files[0])}/>
                    {reactivateScreenshot ? (
                      <p style={{color:'var(--green)',fontWeight:700,margin:0}}>✓ {reactivateScreenshot.name}</p>
                    ) : (
                      <>
                        <div style={{fontSize:28,marginBottom:4}}>📸</div>
                        <p style={{color:'var(--text)',fontSize:13,fontWeight:700,margin:'0 0 2px'}}>Click to upload screenshot</p>
                        <p style={{color:'var(--dim)',fontSize:11,margin:0}}>JPG, PNG supported</p>
                      </>
                    )}
                  </label>
                </>
              )}

              {reactivatePayMethod === 'bank' && (
                <>
                  {epAccounts.filter(a => a.method_type === 'bank').slice(0, 1).map(a => (
                    <div key={a.id} style={{background:'#0c192e',border:'1.5px solid #3b82f640',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                      <p style={{color:'#cbd5e1',fontSize:11,margin:'0 0 4px'}}>Bank Details to Send Money:</p>
                      <p style={{color:'var(--yellow)',fontWeight:800,fontSize:16,margin:'0 0 2px'}}>{a.bank_name || 'Bank Transfer'}</p>
                      <p style={{color:'#ffffff',fontWeight:700,fontSize:14,margin:'0 0 4px'}}>{a.account_title}</p>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <p style={{color:'#ffffff',fontFamily:'monospace',fontSize:17,fontWeight:900,margin:0}}>{a.account_number}</p>
                        <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--yellow)',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'var(--font)'}}>Copy</button>
                      </div>
                    </div>
                  ))}

                  <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',marginBottom:16}}>
                    <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px',fontWeight:700,letterSpacing:.5}}>Amount Sent (Rs.)</p>
                    <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:'0 0 4px'}}>Rs. {reactivateModalReq.total_cost.toFixed(2)}</p>
                    <p style={{color:'var(--muted)',fontSize:11,margin:0,fontWeight:600}}>Min Rs. 100</p>
                  </div>

                  <label className="sgc-label">Bank Name</label>
                  <input className="sgc-input" placeholder="e.g. HBL, UBL, Meezan Bank" value={reactivateBankName} onChange={e=>setReactivateBankName(e.target.value)} required/>

                  <label className="sgc-label">Account Holder Name</label>
                  <input className="sgc-input" placeholder="e.g. Ali Hassan" value={reactivateAccountHolder} onChange={e=>setReactivateAccountHolder(e.target.value)} required/>

                  <label className="sgc-label">Account Number / IBAN</label>
                  <input className="sgc-input" placeholder="e.g. PK36HABB0000123456789012" value={reactivateAccountNumber} onChange={e=>setReactivateAccountNumber(e.target.value)} required/>

                  <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                  <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:12,padding:'18px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setReactivateScreenshot(e.target.files[0])}/>
                    {reactivateScreenshot ? (
                      <p style={{color:'var(--green)',fontWeight:700,margin:0}}>✓ {reactivateScreenshot.name}</p>
                    ) : (
                      <>
                        <div style={{fontSize:28,marginBottom:4}}>📸</div>
                        <p style={{color:'var(--text)',fontSize:13,fontWeight:700,margin:'0 0 2px'}}>Click to upload screenshot</p>
                        <p style={{color:'var(--dim)',fontSize:11,margin:0}}>JPG, PNG supported</p>
                      </>
                    )}
                  </label>

                  <label className="sgc-label">Note (optional)</label>
                  <input className="sgc-input" placeholder="Any note for admin" value={reactivateNote} onChange={e=>setReactivateNote(e.target.value)}/>
                </>
              )}

              <button type="submit" className="sgc-btn-primary" disabled={isReactivating} style={{width:'100%',marginTop:12,padding:'14px',fontSize:15,fontWeight:800}}>
                📤 Submit Reactivation Request
              </button>
            </form>
          </div>
        </div>
      , document.body)}

      <h2 className="sgc-heading">📢 Advertise Your Link</h2>

      <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-start'}}>

        {/* LEFT: Form */}
        <div style={{flex:'1 1 320px',minWidth:0}}>
          <div className="sgc-stats" style={{maxWidth:420,marginBottom:24}}>
            <div className="sgc-stat-card"><div className="sgc-stat-label">Rate Per Member</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>Rs. {adRate}</div></div>
            <div className="sgc-stat-card"><div className="sgc-stat-label">Your Balance</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {profile.balance.toFixed(2)}</div></div>
          </div>

          <form className="sgc-form" style={{maxWidth:520}} onSubmit={handleSubmit}>
            <label className="sgc-label">Ad Title</label>
            <input className="sgc-input" placeholder="e.g. Visit my YouTube channel" value={adForm.title} onChange={e=>setAdForm({...adForm,title:e.target.value})} required/>

            <label className="sgc-label">Ad Link (URL)</label>
            <input className="sgc-input" placeholder="https://yourlink.com" value={adForm.url} onChange={e=>setAdForm({...adForm,url:e.target.value})} required/>

            <label className="sgc-label">Members Needed</label>
            <input className="sgc-input" type="number" min={minCampaignUsers} placeholder={`Min ${minCampaignUsers} users`} value={adForm.members_needed} onChange={e=>setAdForm({...adForm,members_needed:e.target.value})} required/>

            {adForm.members_needed > 0 && (
              <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
                <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px',fontWeight:600}}>Total Cost</p>
                <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:0}}>Rs. {totalCost.toFixed(2)}</p>
                <p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>{adForm.members_needed} members × Rs. {adRate}/member</p>
              </div>
            )}

            <label className="sgc-label">Payment Method</label>
            <div style={{display:'flex',gap:8,marginBottom:18}}>
              {[['wallet','💳 Wallet'],['easypaisa','📱 Easypaisa'],['jazzcash','💳 JazzCash'],['bank','🏦 Bank Transfer']].map(([val,label])=>(
                <div key={val} onClick={()=>setAdPayMethod(val)}
                  style={{flex:1,padding:'10px 4px',borderRadius:10,border:`2px solid ${adPayMethod===val?'var(--accent)':'var(--border)'}`,background:adPayMethod===val?'#0d1e38':'var(--bg)',cursor:'pointer',textAlign:'center',color:adPayMethod===val?'var(--accent)':'var(--muted)',fontWeight:700,fontSize:12,transition:'all .2s'}}>
                  {label}
                </div>
              ))}
            </div>

            {/* 1. WALLET METHOD */}
            {adPayMethod === 'wallet' && (
              <>
                {profile.balance < totalCost ? (
                  <div style={{background:'#451a03',border:'1.5px solid #f59e0b',borderRadius:12,padding:'18px 20px',marginBottom:16}}>
                    <p style={{color:'#fbbf24',fontSize:14,fontWeight:700,margin:'0 0 10px'}}>⚠️ Insufficient Wallet Balance</p>
                    <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 14px'}}>You need Rs. {(totalCost - profile.balance).toFixed(2)} more to advertise.</p>
                    <button type="button" onClick={()=>setTab('transfer')} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'var(--bg)',border:'none',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)'}}>💳 Go to Deposit Section</button>
                  </div>
                ) : (
                  <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                    <p style={{color:'#4ade80',fontSize:13,fontWeight:600,margin:0}}>✓ Sufficient balance! Rs. {totalCost.toFixed(2)} will be deducted automatically from your wallet and your ad will be approved & activated immediately.</p>
                  </div>
                )}
                <button type="submit" className="sgc-btn-primary" disabled={isSubmitting || profile.balance < totalCost} style={{width:'100%',marginTop:8,padding:'14px',fontSize:15,fontWeight:800}}>
                  🚀 Submit & Activate Ad (Rs. {totalCost.toFixed(2)})
                </button>
              </>
            )}

            {/* 2. EASYPAISA / JAZZCASH METHOD (Strict Order: 1. Name, 2. Account Number, 3. TRX ID, 4. Screenshot) */}
            {(adPayMethod === 'easypaisa' || adPayMethod === 'jazzcash') && (
              <>
                {epAccounts.filter(a => a.method_type === adPayMethod).slice(0, 1).map(a => (
                  <div key={a.id} style={{background:'#071a0d',border:'1.5px solid #3cb55940',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                    <p style={{color:'#cbd5e1',fontSize:11,margin:'0 0 4px'}}>Send Rs. {totalCost.toFixed(2)} to this account:</p>
                    <p style={{color:'var(--yellow)',fontWeight:800,fontSize:16,margin:'0 0 2px'}}>{a.account_title}</p>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <p style={{color:'#ffffff',fontFamily:'monospace',fontSize:18,fontWeight:900,margin:0}}>{a.account_number}</p>
                      <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--yellow)',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'var(--font)'}}>Copy</button>
                    </div>
                  </div>
                ))}

                {/* 1. Sender Name */}
                <label className="sgc-label">Sender Name</label>
                <input className="sgc-input" placeholder="Name on Easypaisa/JazzCash account" value={adForm.sender_name} onChange={e=>setAdForm({...adForm,sender_name:e.target.value})} required/>

                {/* 2. Sender Account Number */}
                <label className="sgc-label">Sender Account Number / Phone</label>
                <input className="sgc-input" placeholder="Phone or account number used to send" value={adSenderPhone} onChange={e=>setAdSenderPhone(e.target.value)} required/>

                {/* 3. Transaction ID (TRX ID) */}
                <label className="sgc-label">Transaction ID (TRX ID)</label>
                <input className="sgc-input" placeholder="e.g. 23849102391" value={adForm.transaction_id} onChange={e=>setAdForm({...adForm,transaction_id:e.target.value})} required/>

                {/* 4. Payment Screenshot */}
                <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:12,padding:'18px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setAdScreenshot(e.target.files[0])}/>
                  {adScreenshot ? (
                    <p style={{color:'var(--green)',fontWeight:700,margin:0}}>✓ {adScreenshot.name}</p>
                  ) : (
                    <>
                      <div style={{fontSize:28,marginBottom:4}}>📸</div>
                      <p style={{color:'var(--text)',fontSize:13,fontWeight:700,margin:'0 0 2px'}}>Click to upload screenshot</p>
                      <p style={{color:'var(--dim)',fontSize:11,margin:0}}>JPG, PNG supported</p>
                    </>
                  )}
                </label>

                <button type="submit" className="sgc-btn-primary" disabled={isSubmitting} style={{width:'100%',marginTop:8,padding:'14px',fontSize:15,fontWeight:800}}>
                  🚀 Submit Ad Request (Rs. {totalCost.toFixed(2)})
                </button>
              </>
            )}

            {/* 3. BANK TRANSFER METHOD */}
            {adPayMethod === 'bank' && (
              <>
                {epAccounts.filter(a => a.method_type === 'bank').slice(0, 1).map(a => (
                  <div key={a.id} style={{background:'#0c192e',border:'1.5px solid #3b82f640',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                    <p style={{color:'#cbd5e1',fontSize:11,margin:'0 0 4px'}}>Bank Details to Send Money:</p>
                    <p style={{color:'var(--yellow)',fontWeight:800,fontSize:16,margin:'0 0 2px'}}>{a.bank_name || 'Bank Transfer'}</p>
                    <p style={{color:'#ffffff',fontWeight:700,fontSize:14,margin:'0 0 4px'}}>{a.account_title}</p>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <p style={{color:'#ffffff',fontFamily:'monospace',fontSize:17,fontWeight:900,margin:0}}>{a.account_number}</p>
                      <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--yellow)',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'var(--font)'}}>Copy</button>
                    </div>
                  </div>
                ))}

                {/* Amount Sent (Rs.) Min Rs. 100 */}
                <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',marginBottom:16}}>
                  <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px',fontWeight:700,letterSpacing:.5}}>Amount Sent (Rs.)</p>
                  <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:'0 0 4px'}}>Rs. {totalCost > 0 ? totalCost.toFixed(2) : '0.00'}</p>
                  <p style={{color:'var(--muted)',fontSize:11,margin:0,fontWeight:600}}>Min Rs. 100</p>
                </div>

                {/* Bank Name */}
                <label className="sgc-label">Bank Name</label>
                <input className="sgc-input" placeholder="e.g. HBL, UBL, Meezan Bank" value={adBankName} onChange={e=>setAdBankName(e.target.value)} required/>

                {/* Account Holder Name */}
                <label className="sgc-label">Account Holder Name</label>
                <input className="sgc-input" placeholder="e.g. Ali Hassan" value={adAccountHolder} onChange={e=>setAdAccountHolder(e.target.value)} required/>

                {/* Account Number / IBAN */}
                <label className="sgc-label">Account Number / IBAN</label>
                <input className="sgc-input" placeholder="e.g. PK36HABB0000123456789012" value={adAccountNumber} onChange={e=>setAdAccountNumber(e.target.value)} required/>

                {/* Payment Screenshot * */}
                <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:12,padding:'20px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setAdScreenshot(e.target.files[0])}/>
                  {adScreenshot ? (
                    <p style={{color:'var(--green)',fontWeight:700,margin:0}}>✓ {adScreenshot.name}</p>
                  ) : (
                    <>
                      <div style={{fontSize:28,marginBottom:4}}>📸</div>
                      <p style={{color:'var(--text)',fontSize:13,fontWeight:700,margin:'0 0 2px'}}>Click to upload screenshot</p>
                      <p style={{color:'var(--dim)',fontSize:11,margin:0}}>JPG, PNG supported</p>
                    </>
                  )}
                </label>

                {/* Note (optional) */}
                <label className="sgc-label">Note (optional)</label>
                <input className="sgc-input" placeholder="Any note for admin" value={adNote} onChange={e=>setAdNote(e.target.value)}/>

                {/* Submit Deposit Request Button */}
                <button type="submit" className="sgc-btn-primary" disabled={isSubmitting} style={{width:'100%',marginTop:12,padding:'14px',fontSize:15,fontWeight:800}}>
                  📤 Submit Deposit Request
                </button>
              </>
            )}
          </form>
        </div>

        {/* RIGHT: My Campaign Status (SKY BLUE CARD STYLING) */}
        <div style={{flex:'1 1 340px',minWidth:0}}>
          <h3 style={{color:'var(--accent)',fontSize:16,fontWeight:800,margin:'0 0 16px'}}>📊 My Ad Campaigns</h3>
          {myAdRequests.length===0 ? (
            <div className="sgc-empty">No ad campaigns submitted yet</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {myAdRequests.map(req => {
                const views_cnt = req.views_count || req.members_reached || 0;
                const total_cnt = req.members_needed || 1;
                const pct = Math.min(100, Number(((views_cnt / total_cnt) * 100).toFixed(1)));
                
                const statusMap = {
                  approved: { col: '#38bdf8', bg: '#0c4a6e', border: '1.5px solid #38bdf8', label: '🟢 LIVE', glow: '0 6px 22px rgba(56,189,248,0.25)' },
                  completed: { col: '#60a5fa', bg: '#172554', border: '1.5px solid #60a5fa', label: '✅ COMPLETED', glow: '0 6px 22px rgba(96,165,250,0.22)' },
                  rejected: { col: '#fca5a5', bg: '#450a0a', border: '1.5px solid #ef4444', label: '❌ REJECTED', glow: '0 4px 15px rgba(239,68,68,0.2)' },
                  pending: { col: '#fbbf24', bg: '#451a03', border: '1.5px solid #f59e0b', label: '⌛ PENDING', glow: '0 4px 15px rgba(245,158,11,0.2)' }
                };

                const st = statusMap[req.status] || statusMap.pending;
                const isViewersOpen = Boolean(campaignViewers[req.id]);

                return (
                  <div key={req.id} style={{
                    background: 'linear-gradient(135deg, #072a4a, #03182b)',
                    border: st.border,
                    borderRadius: 18,
                    padding: '20px 22px',
                    boxShadow: st.glow,
                    transition: 'all .3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,marginBottom:8}}>
                      <h4 style={{color:'#f0f9ff',fontWeight:800,fontSize:15,margin:0,wordBreak:'break-all'}}>{req.title}</h4>
                      <span style={{background:st.bg,color:st.col,padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:900,flexShrink:0,letterSpacing:.5,boxShadow:'0 2px 6px rgba(0,0,0,0.3)',border:`1px solid ${st.col}40`}}>
                        {st.label}
                      </span>
                    </div>

                    <a href={req.url} target="_blank" rel="noreferrer" style={{color:'#facc15',fontSize:13,wordBreak:'break-all',display:'inline-block',marginBottom:14,fontWeight:700,textDecoration:'underline'}}>
                      🔗 {req.url}
                    </a>

                    {/* HIGH-CONTRAST ANIMATED PROGRESS BAR PATTI */}
                    <div style={{background:'rgba(3,105,161,0.25)',borderRadius:12,padding:'12px 14px',marginBottom:14,border:'1px solid #0284c7'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,marginBottom:8}}>
                        <span style={{color:'#ffffff',fontWeight:800}}>Campaign Progress:</span>
                        <div>
                          <span style={{color:'#38bdf8',fontWeight:900,fontFamily:'monospace',fontSize:14}}>{views_cnt} / {total_cnt} Viewers </span>
                          <span style={{color:'#4ade80',fontWeight:900,fontFamily:'monospace',fontSize:13}}>({pct}%)</span>
                        </div>
                      </div>
                      <div style={{width:'100%',height:12,background:'#031526',borderRadius:8,overflow:'hidden',border:'1px solid #0369a1',padding:2}}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: pct >= 100 ? 'linear-gradient(90deg, #2563eb, #60a5fa)' : 'linear-gradient(90deg, #0284c7, #38bdf8, #7dd3fc)',
                          borderRadius: 6,
                          transition: 'width .6s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)'
                        }}/>
                      </div>
                    </div>

                    {/* SMART REACTIVATE BUTTON */}
                    {(req.status === 'completed' || req.status === 'rejected' || req.can_reactivate) && (
                      <div style={{marginTop:10,marginBottom:12}}>
                        <button
                          type="button"
                          onClick={() => handleReactivateClick(req)}
                          style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#0284c7,#0369a1)',color:'#ffffff',border:'none',borderRadius:12,fontWeight:900,fontSize:13,cursor:'pointer',fontFamily:'var(--font)',boxShadow:'0 4px 16px rgba(2,132,199,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>
                          🔄 Reactivate Campaign (Rs. {req.total_cost.toFixed(2)})
                        </button>
                      </div>
                    )}

                    {/* VIEWERS HISTORY TOGGLE & LIST */}
                    {(req.status === 'approved' || req.status === 'completed') && (
                      <div style={{marginTop:10}}>
                        <button
                          type="button"
                          onClick={async () => {
                            if (isViewersOpen) {
                              setCampaignViewers(prev => ({ ...prev, [req.id]: null }));
                            } else {
                              try {
                                const r = await API.get(`/user/ad-request/viewers/${req.id}`);
                                setCampaignViewers(prev => ({ ...prev, [req.id]: r.data }));
                                setViewerLimits(prev => ({ ...prev, [req.id]: 10 }));
                              } catch (e) {
                                notify('Failed to load viewers list', 'error');
                              }
                            }
                          }}
                          style={{background:'#07213a',border:'1px solid #0369a1',color:'#38bdf8',borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:800,cursor:'pointer',width:'100%',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                          👥 View Campaign Viewers ({views_cnt}) {isViewersOpen ? '▲' : '▼'}
                        </button>

                        {isViewersOpen && (() => {
                          const list = campaignViewers[req.id] || [];
                          const currentLimit = viewerLimits[req.id] || 10;
                          const shownList = list.slice(0, currentLimit);
                          const totalViewers = list.length;

                          return (
                            <div style={{background:'#021120',border:'1px solid #0284c7',borderRadius:12,padding:'14px 16px',marginTop:10}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,borderBottom:'1px solid #0369a1',paddingBottom:8}}>
                                <p style={{color:'#38bdf8',fontSize:11,fontWeight:900,margin:0,letterSpacing:1}}>👥 CAMPAIGN VIEWERS HISTORY</p>
                                <span style={{color:'#f8fafc',fontSize:11,fontWeight:700}}>Showing {Math.min(currentLimit, totalViewers)} of {totalViewers}</span>
                              </div>

                              {totalViewers > 0 ? (
                                <>
                                  <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:260,overflowY:'auto',paddingRight:4}}>
                                    {shownList.map((v, i) => (
                                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,background:'#072a4a',border:'1px solid #075985',borderRadius:8,padding:'8px 12px'}}>
                                        <div>
                                          <span style={{color:'#38bdf8',fontWeight:800,fontSize:13,display:'block'}}>@{v.username}</span>
                                          <span style={{color:'#cbd5e1',fontSize:10,fontWeight:600}}>📅 {new Date(v.viewed_at).toLocaleString()}</span>
                                        </div>
                                        <span style={{background:'#064e3b',color:'#4ade80',border:'1px solid #166534',padding:'3px 10px',borderRadius:6,fontSize:11,fontWeight:900,boxShadow:'0 2px 6px rgba(6,78,59,0.4)'}}>
                                          +Rs. {(v.earned_amount || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* SEE MORE BUTTONS */}
                                  {totalViewers > currentLimit && (
                                    <div style={{marginTop:12,textAlign:'center'}}>
                                      {currentLimit === 10 && (
                                        <button
                                          type="button"
                                          onClick={() => setViewerLimits(prev => ({ ...prev, [req.id]: 30 }))}
                                          style={{background:'linear-gradient(135deg,#0284c7,#0369a1)',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'var(--font)',boxShadow:'0 2px 8px rgba(2,132,199,0.4)',width:'100%'}}>
                                          ➕ See More (+20 Viewers)
                                        </button>
                                      )}
                                      {currentLimit >= 30 && (
                                        <button
                                          type="button"
                                          onClick={() => setViewerLimits(prev => ({ ...prev, [req.id]: totalViewers }))}
                                          style={{background:'linear-gradient(135deg,#059669,#047857)',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'var(--font)',boxShadow:'0 2px 8px rgba(5,150,105,0.3)',width:'100%'}}>
                                          ➕ See More (Show All Viewers)
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p style={{color:'#93c5fd',fontSize:12,margin:0,textAlign:'center',padding:'8px 0'}}>No viewers recorded yet.</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {req.admin_note && (
                      <p style={{color:'#fca5a5',fontSize:11,margin:'10px 0 0',fontStyle:'italic',background:'#450a0a',padding:'6px 10px',borderRadius:6,border:'1px solid #ef4444'}}>
                        Admin Note: {req.admin_note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}