/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { parseUTCDate } from '../utils/dateUtils';
import API from '../api';

export default function MembershipPlans({
  profile,
  notify,
  setTab,
  loadData
}) {
  const [plans, setPlans] = useState([]);
  const [myPlanPurchases, setMyPlanPurchases] = useState([]);
  const [epAccounts, setEpAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Payment Form States matching Deposit section exactly
  const [planPayMethod, setPlanPayMethod] = useState('wallet');
  const [planSenderName, setPlanSenderName] = useState('');
  const [planSenderPhone, setPlanSenderPhone] = useState('');
  const [planTrxId, setPlanTrxId] = useState('');
  const [planBankName, setPlanBankName] = useState('');
  const [planAccountHolder, setPlanAccountHolder] = useState('');
  const [planAccountNumber, setPlanAccountNumber] = useState('');
  const [planNote, setPlanNote] = useState('');
  const [planScreenshot, setPlanScreenshot] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    API.get('/user/plans').then(r=>setPlans(r.data)).catch(()=>{});
    API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
    API.get('/deposit/easypaisa-accounts').then(r => {
      setEpAccounts(r.data);
      setLoadingAccounts(false);
    }).catch(() => {
      setLoadingAccounts(false);
    });
    
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const resetFormState = () => {
    setPlanPayMethod('wallet');
    setPlanSenderName('');
    setPlanSenderPhone('');
    setPlanTrxId('');
    setPlanBankName('');
    setPlanAccountHolder('');
    setPlanAccountNumber('');
    setPlanNote('');
    setPlanScreenshot(null);
  };

  const handleSelectPlan = (p) => {
    setSelectedPlan(p);
    resetFormState();
    if (p.price > 0 && profile.balance < p.price) {
      // Default to first available manual deposit method if wallet balance is insufficient
      const hasEP = epAccounts.some(a => (a.method_type || 'easypaisa') === 'easypaisa');
      const hasJC = epAccounts.some(a => (a.method_type || 'easypaisa') === 'jazzcash');
      const hasBank = epAccounts.some(a => a.method_type === 'bank');
      if (hasEP) setPlanPayMethod('easypaisa');
      else if (hasJC) setPlanPayMethod('jazzcash');
      else if (hasBank) setPlanPayMethod('bank');
    }
  };

  const handleSubmitPurchase = async (e) => {
    if (e) e.preventDefault();
    if (isPurchasing || !selectedPlan) return;

    // Free plan activation
    if (selectedPlan.price === 0) {
      setIsPurchasing(true);
      try {
        const fd = new FormData();
        fd.append('plan_id', selectedPlan.id);
        fd.append('payment_method', 'wallet');
        const res = await API.post('/user/plan/purchase', fd);
        notify(res.data?.message || 'Free plan activated successfully! ✅');
        setSelectedPlan(null);
        if (loadData) loadData();
        API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
      } catch (err) {
        notify(err.response?.data?.detail || 'Failed to activate plan', 'error');
      } finally {
        setIsPurchasing(false);
      }
      return;
    }

    // Wallet activation — frontend guard (backend also verifies independently)
    if (planPayMethod === 'wallet') {
      if ((profile.balance || 0) < selectedPlan.price) {
        notify('Insufficient balance. Please deposit first.', 'error');
        return;
      }
      setIsPurchasing(true);
      try {
        const fd = new FormData();
        fd.append('plan_id', selectedPlan.id);
        fd.append('payment_method', 'wallet');
        const res = await API.post('/user/plan/purchase', fd);
        notify(res.data?.message || `Plan activated! Rs. ${selectedPlan.price} deducted. ✅`);
        setSelectedPlan(null);
        if (loadData) loadData();
        API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
      } catch (err) {
        // Backend returns exact message: "Insufficient balance. Please deposit first."
        notify(err.response?.data?.detail || 'Failed to activate plan', 'error');
      } finally {
        setIsPurchasing(false);
      }
      return;
    }

    // Manual Deposit Payment Methods (Easypaisa, JazzCash, Bank Transfer)
    if (!planScreenshot) {
      notify('Please upload payment screenshot', 'error');
      return;
    }

    if (planPayMethod === 'bank' && (!planBankName || !planAccountHolder || !planAccountNumber)) {
      notify('Please fill all bank details', 'error');
      return;
    }

    if ((planPayMethod === 'easypaisa' || planPayMethod === 'jazzcash') && (!planSenderName || !planSenderPhone || !planTrxId)) {
      notify('Please fill sender name, account number and TRX ID', 'error');
      return;
    }

    setIsPurchasing(true);
    try {
      const fd = new FormData();
      fd.append('plan_id', selectedPlan.id);
      fd.append('payment_method', planPayMethod);

      if (planPayMethod === 'bank') {
        fd.append('sender_name', planAccountHolder.trim());
        fd.append('sender_phone', `BANK|${planBankName.trim()}|${planAccountNumber.trim()}${planNote ? '|Note:' + planNote.trim() : ''}`);
      } else {
        fd.append('sender_name', planSenderName.trim());
        fd.append('sender_phone', `TRX:${planTrxId.trim()}|Phone:${planSenderPhone.trim()}${planNote ? '|Note:' + planNote.trim() : ''}`);
      }

      if (planScreenshot) {
        fd.append('screenshot', planScreenshot);
      }

      await API.post('/user/plan/purchase', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Plan purchase & deposit request submitted! Admin will activate shortly. ✅');
      setSelectedPlan(null);
      if (loadData) loadData();
      API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
    } catch (err) {
      notify(err.response?.data?.detail || 'Error submitting purchase request', 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const hasActivatedPlan = profile?.plan_active;
  const activeExpiry = profile?.membership === 'free' ? profile.free_plan_expires_at : profile?.plan_expires_at;
  const expiryDate = hasActivatedPlan ? parseUTCDate(activeExpiry) : null;
  const now = new Date();
  const isExpired = hasActivatedPlan && expiryDate && expiryDate < now;
  const diffMs = expiryDate && !isExpired ? expiryDate - now : 0;
  const totalSecs = Math.floor(diffMs / 1000);
  const dd = Math.floor(totalSecs / 86400);
  const hh = Math.floor((totalSecs % 86400) / 3600);
  const mm = Math.floor((totalSecs % 3600) / 60);
  const ss = totalSecs % 60;

  return (
    <div>
      <h2 className="sgc-heading">🏆 Membership Plans</h2>
      <p style={{color:'var(--dim)',fontSize:13,marginBottom:20}}>Current Plan: <span style={{color:'var(--yellow)',fontWeight:700,textTransform:'capitalize'}}>{hasActivatedPlan ? profile.membership : 'No Active Plan'}</span></p>

      {/* ── TOTAL ACTIVE PLAN BENEFITS SUMMARY CARD ── */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d, #991b1b, #b91c1c)',
        border: '1.5px solid #ef4444',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20,
        maxWidth: 480,
        boxShadow: '0 8px 28px rgba(239,68,68,0.30)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* subtle shine overlay */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'50%',background:'linear-gradient(180deg,rgba(255,255,255,0.07),transparent)',borderRadius:'16px 16px 0 0',pointerEvents:'none'}} />

        <p style={{color:'#fca5a5',fontSize:11,fontWeight:800,letterSpacing:1.2,margin:'0 0 14px',textTransform:'uppercase'}}>
          📊 Total Active Plan Benefits
        </p>

        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          {/* Ads / Day */}
          <div style={{flex:'1 1 120px',background:'rgba(0,0,0,0.25)',borderRadius:12,padding:'12px 14px',textAlign:'center',border:'1px solid rgba(239,68,68,0.35)'}}>
            <p style={{fontSize:22,margin:'0 0 2px'}}>📺</p>
            <p style={{color:'#ffffff',fontSize:22,fontWeight:900,margin:'0 0 2px',fontFamily:'monospace'}}>
              {hasActivatedPlan ? (profile.daily_ads || 0) : 0}
            </p>
            <p style={{color:'#fca5a5',fontSize:10,fontWeight:700,margin:0,letterSpacing:0.5}}>Ads / Day</p>
          </div>

          {/* Earn per Ad */}
          <div style={{flex:'1 1 120px',background:'rgba(0,0,0,0.25)',borderRadius:12,padding:'12px 14px',textAlign:'center',border:'1px solid rgba(239,68,68,0.35)'}}>
            <p style={{fontSize:22,margin:'0 0 2px'}}>🪙</p>
            <p style={{color:'#ffffff',fontSize:22,fontWeight:900,margin:'0 0 2px',fontFamily:'monospace'}}>
              {hasActivatedPlan ? (profile.earning_per_click || 0).toFixed(2) : '0.00'}
            </p>
            <p style={{color:'#fca5a5',fontSize:10,fontWeight:700,margin:0,letterSpacing:0.5}}>Earn per Ad (Rs.)</p>
          </div>

          {/* Referral % */}
          <div style={{flex:'1 1 120px',background:'rgba(0,0,0,0.25)',borderRadius:12,padding:'12px 14px',textAlign:'center',border:'1px solid rgba(239,68,68,0.35)'}}>
            <p style={{fontSize:22,margin:'0 0 2px'}}>👥</p>
            <p style={{color:'#ffffff',fontSize:22,fontWeight:900,margin:'0 0 2px',fontFamily:'monospace'}}>
              {hasActivatedPlan ? `${((profile.referral_commission || 0) * 100).toFixed(0)}%` : '0%'}
            </p>
            <p style={{color:'#fca5a5',fontSize:10,fontWeight:700,margin:0,letterSpacing:0.5}}>Referral %</p>
          </div>
        </div>

        {!hasActivatedPlan && (
          <p style={{color:'rgba(252,165,165,0.7)',fontSize:11,margin:'12px 0 0',fontStyle:'italic'}}>
            Activate a plan to see your combined benefits here.
          </p>
        )}
      </div>

      {/* Current Plan Info Cards */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16, maxWidth: 480}}>
        {!hasActivatedPlan ? (
          <div style={{background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:14,padding:'18px 20px'}}>
            <p style={{color:'var(--muted)',fontSize:11,fontWeight:700,letterSpacing:1,margin:'0 0 10px'}}>CURRENT PLAN</p>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <p style={{color:'var(--yellow)',fontSize:20,fontWeight:800,margin:0}}>No Active Plan</p>
                <span style={{background:'#334155',color:'var(--muted)',padding:'4px 14px',borderRadius:20,fontSize:11,fontWeight:700}}>NO PLAN</span>
              </div>
              <p style={{color:'var(--dim)',fontSize:13,margin:0,lineHeight:1.6}}>You currently do not have an active membership plan. Please select and activate a plan below to start earning.</p>
            </div>
          </div>
        ) : (
          profile?.active_plans?.map((activePlan, idx) => {
            const expDate = activePlan.expires_at ? parseUTCDate(activePlan.expires_at) : null;
            const isExp = expDate ? now > expDate : false;
            let d = 0, h = 0, m = 0, s = 0;
            if (expDate && !isExp) {
              const diff = expDate - now;
              d = Math.floor(diff / (1000 * 60 * 60 * 24));
              h = Math.floor((diff / (1000 * 60 * 60)) % 24);
              m = Math.floor((diff / 1000 / 60) % 60);
              s = Math.floor((diff / 1000) % 60);
            }
            return (
              <div key={idx} style={{background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:14,padding:'18px 20px'}}>
                <p style={{color:'var(--muted)',fontSize:11,fontWeight:700,letterSpacing:1,margin:'0 0 10px'}}>CURRENT PLAN {profile.active_plans.length > 1 ? `#${idx + 1}` : ''}</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:expDate?14:0}}>
                  <div>
                    <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:0,textTransform:'capitalize'}}>🏆 {activePlan.name}</p>
                    {expDate && (
                      <p style={{color:isExp?'var(--red)':'var(--green)',fontSize:12,margin:'4px 0 0',fontWeight:600}}>
                        {isExp?'Expired on':'Expires'}: <b>{expDate.toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</b>
                      </p>
                    )}
                  </div>
                  <span style={{background:isExp?'#450a0a':'#064e3b',color:isExp?'#fca5a5':'#4ade80',padding:'4px 16px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'uppercase'}}>
                    {isExp?'EXPIRED':'ACTIVE'}
                  </span>
                </div>
                {expDate && !isExp && (
                  <div style={{background:'rgba(0,0,0,.25)',borderRadius:10,padding:'12px 14px'}}>
                    <p style={{color:'var(--dim)',fontSize:10,fontWeight:700,letterSpacing:1,margin:'0 0 8px'}}>⏱ EXPIRES IN</p>
                    <div style={{display:'flex',gap:8}}>
                      {[[d,'Days'],[h,'Hours'],[m,'Mins'],[s,'Secs']].map(([val,label])=>(
                        <div key={label} style={{flex:1,background:'rgba(255,255,255,.08)',borderRadius:8,padding:'8px 4px',textAlign:'center'}}>
                          <p style={{color:'#fff',fontSize:20,fontWeight:900,margin:0,fontFamily:'monospace'}}>{String(val).padStart(2,'0')}</p>
                          <p style={{color:'var(--dim)',fontSize:10,margin:'2px 0 0',fontWeight:600}}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isExp && (
                  <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:10,padding:'10px 14px',marginTop:10}}>
                    <p style={{color:'#fca5a5',fontSize:13,margin:0,fontWeight:600}}>⚠️ Your plan has expired. Please purchase a new plan to continue earning.</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Upsell message */}
      <div style={{background:'linear-gradient(135deg,#451a03,#92400e20)',border:'1px solid #92400e',borderRadius:10,padding:'10px 16px',marginBottom:24,maxWidth:480,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:20}}>🚀</span>
        <p style={{color:'#fbbf24',fontSize:13,fontWeight:600,margin:0}}>Buy a bigger plan and earn more profit!</p>
      </div>

      {/* Plan cards */}
      {!selectedPlan && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16,marginBottom:28}}>
          {plans.map((p,i)=>{
            const planCount = profile?.active_plans?.filter(ap => ap.name === p.name).length || 0;
            const isActive = planCount > 0;
            const badgeText = planCount > 1 ? `(x${planCount})` : '';
            const lowerName = (p.name || '').toLowerCase();
            let col = '#0284c7'; // default
            if (lowerName.includes('free')) col = '#eab308'; // Yellow
            else if (lowerName.includes('silver')) col = '#0ea5e9'; // Sky Blue
            else if (lowerName.includes('gold')) col = '#22c55e'; // Green
            else if (lowerName.includes('premium') || lowerName.includes('platinum')) col = '#db2777'; // Dark Pink
            else if (lowerName.includes('diamond') || lowerName.includes('vip')) col = '#a16207'; // Brown
            let lvlMap={};
            let detailMap={};
            try{ lvlMap=JSON.parse(p.level_commissions||'{}'); }catch{}
            try{ detailMap=JSON.parse(p.level_details||'{}'); }catch{}
            const refDisplay = Object.keys(lvlMap).length>0
              ? Object.entries(lvlMap).map(([k,v])=>`L${k}:${v}%`).join(', ')
              : `${(p.referral_commission*100).toFixed(0)}%`;
            const levelDetails = Object.entries(detailMap).filter(([,v])=>v).map(([k,v])=>`L${k}: ${v}`).join(' | ');
            return (
              <div key={p.id} style={{background:'var(--card)',border:`2px solid ${isActive?col:'var(--border)'}`,borderRadius:16,padding:24,position:'relative',transition:'transform .2s'}}>
                {isActive&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:col,color:'var(--bg)',padding:'2px 14px',borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{String.fromCharCode(10003)} Active Plan {badgeText}</div>}
                <h3 style={{color:col,textTransform:'capitalize',marginBottom:4,fontSize:17}}>{p.name}</h3>
                <p style={{color:'var(--text)',fontSize:26,fontWeight:800,marginBottom:16}}>Rs. {p.price}<span style={{fontSize:13,color:'var(--dim)',fontWeight:400}}>/{p.period_days}d</span></p>
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                  {[
                    ['📺',`${p.daily_ads} ads/day`],
                    ['💰',`Rs. ${p.earning_per_click} per click`],
                    ['👥',`${refDisplay} referral commission`],
                    ['⬇️',`Min Withdraw: Rs. ${p.min_withdrawal||0}`],
                    ['⬆️',`Max Withdraw: ${p.max_withdrawal>0?`Rs. ${p.max_withdrawal}`:'No limit'}`],
                    levelDetails ? ['i', levelDetails] : null
                  ].filter(Boolean).map(([icon,text])=>(
                    <div key={text} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted)'}}>
                      <span>{icon}</span><span>{text}</span>
                    </div>
                  ))}
                </div>
                {p.price>0 && (
                  <button onClick={()=>handleSelectPlan(p)} disabled={isPurchasing}
                    style={{width:'100%',padding:'10px',background:col,color:'#ffffff',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:isPurchasing?'not-allowed':'pointer',fontFamily:'var(--font)',opacity:isPurchasing?0.6:1,boxShadow:`0 4px 14px ${col}40`,transition:'all .2s'}}
                    onMouseEnter={(e)=>e.target.style.filter='brightness(1.1)'}
                    onMouseLeave={(e)=>e.target.style.filter='brightness(1)'}
                    onMouseDown={(e)=>e.target.style.transform='scale(0.96)'}
                    onMouseUp={(e)=>e.target.style.transform='scale(1)'}>
                    {isActive ? `Buy Another ${p.name} ${badgeText}`.trim() : `Upgrade to ${p.name}`}
                  </button>
                )}
                {p.price===0 && (
                  <button onClick={()=>handleSelectPlan(p)} disabled={isPurchasing}
                    style={{width:'100%',padding:'10px',background:col,color:'#ffffff',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:isPurchasing?'not-allowed':'pointer',fontFamily:'var(--font)',opacity:isPurchasing?0.6:1,boxShadow:`0 4px 14px ${col}40`,transition:'all .2s'}}
                    onMouseEnter={(e)=>e.target.style.filter='brightness(1.1)'}
                    onMouseLeave={(e)=>e.target.style.filter='brightness(1)'}
                    onMouseDown={(e)=>e.target.style.transform='scale(0.96)'}
                    onMouseUp={(e)=>e.target.style.transform='scale(1)'}>
                    {isActive ? `Buy Another ${p.name} ${badgeText}`.trim() : `Activate ${p.name}`}
                  </button>
                )}
              </div>
            );
          })}
          {plans.length===0&&<div className="sgc-empty">No plans available.</div>}
        </div>
      )}

      {/* PLAN PURCHASE / DEPOSIT WORKFLOW SECTION */}
      {selectedPlan && (
        <div style={{maxWidth:600}}>
          <button onClick={()=>setSelectedPlan(null)} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:13,fontWeight:600,marginBottom:16,fontFamily:'var(--font)',padding:0}}>
            ← Back to Plans
          </button>
          
          <div style={{background:'linear-gradient(135deg,#072a4a,#03182b)',border:'1.5px solid #0284c7',borderRadius:16,padding:'20px 22px',marginBottom:20,boxShadow:'0 8px 24px rgba(2,132,199,0.2)'}}>
            <p style={{color:'#38bdf8',fontSize:12,margin:'0 0 4px',fontWeight:800,letterSpacing:1}}>SELECTED PLAN FOR ACTIVATION</p>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
              <p style={{color:'#f8fafc',fontSize:22,fontWeight:900,margin:0,textTransform:'capitalize'}}>🏆 {selectedPlan.name} Plan</p>
              <span style={{background:'#0284c7',color:'#ffffff',padding:'6px 16px',borderRadius:20,fontSize:16,fontWeight:900,boxShadow:'0 2px 8px rgba(2,132,199,0.4)'}}>
                Rs. {selectedPlan.price}
              </span>
            </div>
          </div>

          {/* FREE PLAN ACTIVATION */}
          {selectedPlan.price === 0 ? (
            <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:14,padding:'20px',marginBottom:20,textAlign:'center'}}>
              <p style={{color:'#4ade80',fontSize:15,fontWeight:700,margin:'0 0 16px'}}>✓ This is a free plan. Click below to activate it immediately.</p>
              <button
                type="button"
                className="sgc-btn-primary"
                disabled={isPurchasing}
                onClick={handleSubmitPurchase}
                style={{width:'100%',padding:'14px',fontSize:15,fontWeight:800}}>
                {isPurchasing ? 'Activating...' : '✔ Activate Free Plan Now'}
              </button>
            </div>
          ) : (
            /* PAID PLAN — PAYMENT METHOD SELECTOR & SYNCHRONIZED DEPOSIT CARDS */
            <div>
              <p style={{color:'var(--muted)',fontSize:12,fontWeight:800,letterSpacing:1,marginBottom:12}}>SELECT PAYMENT METHOD</p>
              
              {/* Payment Method Selector Grid matching Deposit section */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:12,marginBottom:24}}>
                
                {/* 1. WALLET METHOD */}
                <div
                  onClick={() => setPlanPayMethod('wallet')}
                  style={{
                    padding:'14px 10px',
                    borderRadius:14,
                    border: `2px solid ${planPayMethod === 'wallet' ? '#38bdf8' : 'var(--border)'}`,
                    background: planPayMethod === 'wallet' ? '#0c2847' : 'var(--card)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all .2s',
                    boxShadow: planPayMethod === 'wallet' ? '0 6px 18px rgba(56,189,248,0.25)' : 'none'
                  }}>
                  <div style={{fontSize:20,marginBottom:4}}>💳</div>
                  <div style={{color: planPayMethod === 'wallet' ? '#38bdf8' : 'var(--text)', fontWeight: 800, fontSize: 13}}>Wallet</div>
                  <div style={{color:'var(--dim)',fontSize:10,fontWeight:600,marginTop:2}}>Rs. {profile.balance.toFixed(2)}</div>
                </div>

                {/* 2. EASYPAISA METHOD */}
                {(() => {
                  const hasEP = epAccounts.some(a => (a.method_type || 'easypaisa') === 'easypaisa');
                  return (
                    <div
                      onClick={() => hasEP && setPlanPayMethod('easypaisa')}
                      style={{
                        padding:'14px 10px',
                        borderRadius:14,
                        border: `2px solid ${planPayMethod === 'easypaisa' ? '#22c55e' : 'var(--border)'}`,
                        background: planPayMethod === 'easypaisa' ? '#072713' : 'var(--card)',
                        cursor: hasEP ? 'pointer' : 'not-allowed',
                        opacity: hasEP ? 1 : 0.5,
                        textAlign: 'center',
                        transition: 'all .2s',
                        boxShadow: planPayMethod === 'easypaisa' ? '0 6px 18px rgba(34,197,94,0.25)' : 'none'
                      }}>
                      <div style={{fontSize:20,marginBottom:4}}>📱</div>
                      <div style={{color: planPayMethod === 'easypaisa' ? '#22c55e' : 'var(--text)', fontWeight: 800, fontSize: 13}}>Easypaisa</div>
                      <div style={{color:'var(--dim)',fontSize:10,fontWeight:600,marginTop:2}}>{hasEP ? 'Available' : 'N/A'}</div>
                    </div>
                  );
                })()}

                {/* 3. JAZZCASH METHOD */}
                {(() => {
                  const hasJC = epAccounts.some(a => (a.method_type || 'easypaisa') === 'jazzcash');
                  return (
                    <div
                      onClick={() => hasJC && setPlanPayMethod('jazzcash')}
                      style={{
                        padding:'14px 10px',
                        borderRadius:14,
                        border: `2px solid ${planPayMethod === 'jazzcash' ? '#ef4444' : 'var(--border)'}`,
                        background: planPayMethod === 'jazzcash' ? '#3b0a0a' : 'var(--card)',
                        cursor: hasJC ? 'pointer' : 'not-allowed',
                        opacity: hasJC ? 1 : 0.5,
                        textAlign: 'center',
                        transition: 'all .2s',
                        boxShadow: planPayMethod === 'jazzcash' ? '0 6px 18px rgba(239,68,68,0.25)' : 'none'
                      }}>
                      <div style={{fontSize:20,marginBottom:4}}>💳</div>
                      <div style={{color: planPayMethod === 'jazzcash' ? '#ef4444' : 'var(--text)', fontWeight: 800, fontSize: 13}}>JazzCash</div>
                      <div style={{color:'var(--dim)',fontSize:10,fontWeight:600,marginTop:2}}>{hasJC ? 'Available' : 'N/A'}</div>
                    </div>
                  );
                })()}

                {/* 4. BANK TRANSFER METHOD */}
                {(() => {
                  const hasBank = epAccounts.some(a => a.method_type === 'bank');
                  return (
                    <div
                      onClick={() => hasBank && setPlanPayMethod('bank')}
                      style={{
                        padding:'14px 10px',
                        borderRadius:14,
                        border: `2px solid ${planPayMethod === 'bank' ? '#3b82f6' : 'var(--border)'}`,
                        background: planPayMethod === 'bank' ? '#0c192e' : 'var(--card)',
                        cursor: hasBank ? 'pointer' : 'not-allowed',
                        opacity: hasBank ? 1 : 0.5,
                        textAlign: 'center',
                        transition: 'all .2s',
                        boxShadow: planPayMethod === 'bank' ? '0 6px 18px rgba(59,130,246,0.25)' : 'none'
                      }}>
                      <div style={{fontSize:20,marginBottom:4}}>🏦</div>
                      <div style={{color: planPayMethod === 'bank' ? '#3b82f6' : 'var(--text)', fontWeight: 800, fontSize: 13}}>Bank Transfer</div>
                      <div style={{color:'var(--dim)',fontSize:10,fontWeight:600,marginTop:2}}>{hasBank ? 'Available' : 'N/A'}</div>
                    </div>
                  );
                })()}

              </div>

              {/* METHOD 1: WALLET PAYMENT */}
              {planPayMethod === 'wallet' && (() => {
                const walletBal = profile?.balance || 0;
                const hasSufficientBalance = walletBal >= selectedPlan.price;
                return (
                  <div>
                    {/* Balance card */}
                    <div style={{background:'var(--card)',border:`1.5px solid ${hasSufficientBalance ? '#22c55e44' : '#ef444444'}`,borderRadius:14,padding:'18px 20px',marginBottom:16}}>
                      <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 6px',fontWeight:700,letterSpacing:.8}}>YOUR WALLET BALANCE</p>
                      <p style={{color: hasSufficientBalance ? '#4ade80' : '#f87171', fontSize:26, fontWeight:900, margin:'0 0 6px'}}>
                        Rs. {walletBal.toFixed(2)}
                      </p>
                      <div style={{height:4,background:'var(--border)',borderRadius:4,marginBottom:10,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${Math.min((walletBal/selectedPlan.price)*100,100).toFixed(1)}%`,background:hasSufficientBalance?'#22c55e':'#ef4444',borderRadius:4,transition:'width .6s'}} />
                      </div>
                      {hasSufficientBalance ? (
                        <p style={{color:'#86efac',fontSize:13,margin:0,fontWeight:600}}>
                          ✓ Sufficient balance. Rs. {selectedPlan.price} will be deducted automatically and your plan activated immediately.
                        </p>
                      ) : (
                        <div>
                          <p style={{color:'#fca5a5',fontSize:13,margin:'0 0 4px',fontWeight:700}}>
                            Insufficient balance. Please deposit first.
                          </p>
                          <p style={{color:'var(--dim)',fontSize:12,margin:0}}>
                            Need Rs. {selectedPlan.price} · You have Rs. {walletBal.toFixed(2)} · Short by Rs. {(selectedPlan.price - walletBal).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {hasSufficientBalance ? (
                      <button
                        type="button"
                        className="sgc-btn-primary"
                        disabled={isPurchasing}
                        onClick={handleSubmitPurchase}
                        style={{width:'100%',padding:'14px',fontSize:15,fontWeight:800,opacity:isPurchasing?0.7:1,cursor:isPurchasing?'not-allowed':'pointer'}}>
                        {isPurchasing ? '⏳ Activating...' : `🚀 Activate Plan via Wallet (Rs. ${selectedPlan.price})`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTab('transfer')}
                        style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#000',border:'none',borderRadius:12,fontWeight:800,fontSize:15,cursor:'pointer',fontFamily:'var(--font)',boxShadow:'0 4px 14px rgba(245,158,11,0.4)'}}>
                        💳 Go to Deposit Section
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* METHOD 2: MANUAL DEPOSIT METHODS (Easypaisa, JazzCash, Bank Transfer) EXACT MATCH WITH DEPOSIT SECTION */}
              {planPayMethod !== 'wallet' && (
                <div>
                  {/* Account Information Cards - Synchronized with Deposit Section */}
                  {loadingAccounts && epAccounts.length === 0 ? (
                    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'24px 20px',textAlign:'center',marginBottom:24}}>
                      <p style={{color:'var(--dim)',fontSize:13,margin:0,fontWeight:600}}>Loading deposit accounts...</p>
                    </div>
                  ) : (
                    epAccounts.filter(a => (a.method_type || 'easypaisa') === planPayMethod).map(a => {
                      const isEP = (a.method_type || 'easypaisa') === 'easypaisa';
                      const isBank = a.method_type === 'bank';
                      const col = isEP ? '#22c55e' : isBank ? '#3b82f6' : '#ef4444';
                      const bg = isEP ? 'linear-gradient(135deg,#dcfce7,#86efac)' : isBank ? 'linear-gradient(135deg,#dbeafe,#60a5fa)' : 'linear-gradient(135deg,#fee2e2,#f87171)';
                      const methodLabel = isEP ? 'EASYPAISA' : isBank ? 'BANK TRANSFER' : 'JAZZCASH';

                      return (
                        <div key={a.id} style={{background:bg,border:`2px solid ${col}`,borderRadius:16,padding:'20px 22px',marginBottom:20,boxShadow:`0 10px 24px ${col}26`,color:'#0f172a'}}>
                          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                            <div style={{width:46,height:46,borderRadius:12,background:'#0f172a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,flexShrink:0}}>
                              {isEP ? 'EP' : isBank ? 'BK' : 'JC'}
                            </div>
                            <div>
                              <p style={{color:'#0f172a',fontSize:12,fontWeight:900,margin:'0 0 3px',letterSpacing:.6}}>{methodLabel}</p>
                              <p style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)',fontWeight:900,fontSize:18,margin:0}}>{a.account_title}</p>
                            </div>
                          </div>

                          <div style={{background:'rgba(15,23,42,.9)',borderRadius:12,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                            <div>
                              <p style={{color:'#cbd5e1',fontSize:10,margin:'0 0 3px',fontWeight:700}}>Account / IBAN Number</p>
                              <p style={{color:'#facc15',fontFamily:'monospace',fontSize:17,fontWeight:900,letterSpacing:1,margin:0,wordBreak:'break-all'}}>{a.account_number}</p>
                            </div>
                            <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! 📋');}} style={{background:'#facc15',border:'none',color:'#111827',borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:12,fontWeight:900,fontFamily:'var(--font)'}}>Copy</button>
                          </div>

                          {isBank && (
                            <div style={{marginTop:10,color:'#0f172a',fontSize:13,lineHeight:1.7,fontWeight:700}}>
                              <div>Bank Name: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.bank_name || 'Bank Transfer'}</b></div>
                              <div>Account Holder: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.account_title}</b></div>
                            </div>
                          )}

                          {a.deposit_message && (
                            <div style={{marginTop:12,background:'rgba(255,255,255,.72)',border:'1px solid rgba(15,23,42,.15)',borderRadius:10,padding:'10px 12px',display:'flex',gap:8,alignItems:'flex-start'}}>
                              <span style={{fontSize:15,flexShrink:0}}>💬</span>
                              <p style={{color:'#0f172a',fontSize:12,margin:0,lineHeight:1.6,whiteSpace:'pre-wrap',fontWeight:700}}>{a.deposit_message}</p>
                            </div>
                          )}

                          <div style={{marginTop:16,paddingTop:12,borderTop:`2px dashed ${col}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <p style={{color:'#0f172a',fontSize:12,fontWeight:900,margin:0}}>EXACT AMOUNT TO SEND:</p>
                            <p style={{color:'#e11d48',fontSize:20,fontWeight:900,margin:0}}>Rs. {selectedPlan.price}</p>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {epAccounts.filter(a => (a.method_type || 'easypaisa') === planPayMethod).length === 0 && !loadingAccounts && (
                    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:16,marginBottom:20}}>
                      <p style={{color:'var(--red)',fontSize:13,margin:0}}>⚠️ No active {planPayMethod} deposit account available. Please contact support.</p>
                    </div>
                  )}

                  {/* Complete Deposit Form — Matching Deposit Section Workflow */}
                  <form onSubmit={handleSubmitPurchase} className="sgc-form" style={{background: planPayMethod==='bank'?'#0a1628':'#0d1e38', border:'1px solid #1e4080', borderRadius:16, padding:'22px 24px'}}>
                    
                    {/* Amount Field (Locked to exact plan price) */}
                    <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 16px',marginBottom:16}}>
                      <p style={{color:'var(--dim)',fontSize:11,margin:'0 0 2px',fontWeight:700,letterSpacing:.5}}>AMOUNT SENT (RS.)</p>
                      <p style={{color:'var(--yellow)',fontSize:20,fontWeight:900,margin:0}}>Rs. {selectedPlan.price}</p>
                    </div>

                    {planPayMethod === 'bank' ? (
                      <>
                        <label className="sgc-label">Bank Name</label>
                        <input className="sgc-input" placeholder="e.g. HBL, UBL, Meezan Bank" value={planBankName} onChange={e=>setPlanBankName(e.target.value)} required/>

                        <label className="sgc-label">Account Holder Name</label>
                        <input className="sgc-input" placeholder="e.g. Ali Hassan" value={planAccountHolder} onChange={e=>setPlanAccountHolder(e.target.value)} required/>

                        <label className="sgc-label">Transaction id/TRx id</label>
                        <input className="sgc-input" placeholder="e.g. TRX123456789" value={planAccountNumber} onChange={e=>setPlanAccountNumber(e.target.value)} required/>
                      </>
                    ) : (
                      <>
                        <label className="sgc-label">Send By (Your Account Name)</label>
                        <input className="sgc-input" placeholder="e.g. Ali Hassan" value={planSenderName} onChange={e=>setPlanSenderName(e.target.value)} required/>

                        <label className="sgc-label">Your {planPayMethod==='easypaisa'?'Easypaisa':'JazzCash'} Number</label>
                        <input className="sgc-input" type="tel" placeholder="03XX-XXXXXXX" value={planSenderPhone} onChange={e=>setPlanSenderPhone(e.target.value)} required/>

                        <label className="sgc-label">TRX ID (Transaction ID)</label>
                        <input className="sgc-input" placeholder="Enter transaction ID" value={planTrxId} onChange={e=>setPlanTrxId(e.target.value)} required/>
                      </>
                    )}

                    <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
                    <div style={{marginBottom:16}}>
                      <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:12,padding:'20px',textAlign:'center',cursor:'pointer',background:'var(--bg)',transition:'border-color .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setPlanScreenshot(e.target.files[0])}/>
                        {planScreenshot ? (
                          <div>
                            <img src={URL.createObjectURL(planScreenshot)} alt="preview" style={{maxHeight:120,borderRadius:8,marginBottom:6}}/>
                            <p style={{color:'var(--green)',fontSize:12,margin:0,fontWeight:700}}>✓ {planScreenshot.name}</p>
                          </div>
                        ) : (
                          <div>
                            <p style={{fontSize:28,margin:'0 0 6px'}}>📸</p>
                            <p style={{color:'var(--text)',fontSize:13,margin:'0 0 2px',fontWeight:700}}>Click to upload screenshot</p>
                            <p style={{color:'var(--dim)',fontSize:11,margin:0}}>JPG, PNG supported</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <label className="sgc-label">Note (optional)</label>
                    <input className="sgc-input" placeholder="Any note for admin" value={planNote} onChange={e=>setPlanNote(e.target.value)}/>

                    <button type="submit" className="sgc-btn-primary" disabled={isPurchasing} style={{width:'100%',marginTop:12,padding:'14px',fontSize:15,fontWeight:800}}>
                      {isPurchasing ? 'Submitting Request...' : `📤 Submit Plan Purchase Request (Rs. ${selectedPlan.price})`}
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* My purchase history */}
      {myPlanPurchases.length>0 && (
        <div style={{marginTop:28}}>
          <h3 className="sgc-subheading" style={{marginBottom:12}}>📋 My Plan Purchase History</h3>
          <div className="sgc-table-wrap">
            <table className="sgc-table">
              <thead><tr><th className="sgc-th">Plan</th><th className="sgc-th">Price</th><th className="sgc-th">Method</th><th className="sgc-th">Status</th><th className="sgc-th">Expiry</th><th className="sgc-th">Date</th></tr></thead>
              <tbody>{myPlanPurchases.map((r,i)=>(
                <tr key={i} className="sgc-tr">
                  <td className="sgc-td" style={{color:'var(--yellow)',fontWeight:700,textTransform:'capitalize'}}>{r.plan_name}</td>
                  <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {r.plan_price}</td>
                  <td className="sgc-td">{r.payment_method}</td>
                  <td className="sgc-td"><span className="sgc-badge" style={{background:r.status==='approved'?'#064e3b':r.status==='rejected'?'#450a0a':'#451a03',color:r.status==='approved'?'#4ade80':r.status==='rejected'?'#fca5a5':'#fbbf24'}}>{r.status}</span></td>
                  <td className="sgc-td" style={{fontSize:12}}>
                    {r.expires_at ? (
                      <span style={{color:parseUTCDate(r.expires_at)<new Date()?'var(--red)':'var(--green)',fontWeight:600}}>
                        {parseUTCDate(r.expires_at)<new Date()?'❌ ':'✅ '}
                        {parseUTCDate(r.expires_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}
                      </span>
                    ) : r.status==='pending' ? <span style={{color:'var(--dim)'}}>—</span> : <span style={{color:'var(--dim)'}}>—</span>}
                  </td>
                  <td className="sgc-td">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}