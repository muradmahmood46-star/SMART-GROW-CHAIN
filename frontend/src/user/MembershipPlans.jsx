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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planPayMethod, setPlanPayMethod] = useState('wallet');
  const [planScreenshot, setPlanScreenshot] = useState(null);
  const [planSenderName, setPlanSenderName] = useState('');
  const [planSenderPhone, setPlanSenderPhone] = useState('');
  const [planTransactionId, setPlanTransactionId] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    API.get('/user/plans').then(r=>setPlans(r.data)).catch(()=>{});
    API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
    API.get('/deposit/easypaisa-accounts').then(r=>setEpAccounts(r.data)).catch(()=>{});
    
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const hasActivatedPlan = profile?.membership && profile.membership !== 'none' && (profile.plan_expires_at || profile.free_plan_expires_at);
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

      {/* Current Plan Info Card */}
      <div style={{background:'linear-gradient(135deg,#0d1e38,#1e3a6e)',border:'1px solid #1e4080',borderRadius:14,padding:'18px 20px',marginBottom:16,maxWidth:480}}>
        <p style={{color:'var(--muted)',fontSize:11,fontWeight:700,letterSpacing:1,margin:'0 0 10px'}}>CURRENT PLAN</p>
        {!hasActivatedPlan ? (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <p style={{color:'var(--yellow)',fontSize:20,fontWeight:800,margin:0}}>No Active Plan</p>
              <span style={{background:'#334155',color:'var(--muted)',padding:'4px 14px',borderRadius:20,fontSize:11,fontWeight:700}}>NO PLAN</span>
            </div>
            <p style={{color:'var(--dim)',fontSize:13,margin:0,lineHeight:1.6}}>You currently do not have an active membership plan. Please select and activate a plan below to start earning.</p>
          </div>
        ) : (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:expiryDate?14:0}}>
              <div>
                <p style={{color:'var(--yellow)',fontSize:22,fontWeight:800,margin:0,textTransform:'capitalize'}}>🏆 {profile.membership}</p>
                {expiryDate && (
                  <p style={{color:isExpired?'var(--red)':'var(--green)',fontSize:12,margin:'4px 0 0',fontWeight:600}}>
                    {isExpired?'Expired on':'Expires'}: <b>{expiryDate.toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</b>
                  </p>
                )}
              </div>
              <span style={{background:isExpired?'#450a0a':'#064e3b',color:isExpired?'#fca5a5':'#4ade80',padding:'4px 16px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'uppercase'}}>
                {isExpired?'EXPIRED':'ACTIVE'}
              </span>
            </div>
            {expiryDate && !isExpired && (
              <div style={{background:'rgba(0,0,0,.25)',borderRadius:10,padding:'12px 14px'}}>
                <p style={{color:'var(--dim)',fontSize:10,fontWeight:700,letterSpacing:1,margin:'0 0 8px'}}>⏱ EXPIRES IN</p>
                <div style={{display:'flex',gap:8}}>
                  {[[dd,'Days'],[hh,'Hours'],[mm,'Mins'],[ss,'Secs']].map(([val,label])=>(
                    <div key={label} style={{flex:1,background:'rgba(255,255,255,.08)',borderRadius:8,padding:'8px 4px',textAlign:'center'}}>
                      <p style={{color:'#fff',fontSize:20,fontWeight:900,margin:0,fontFamily:'monospace'}}>{String(val).padStart(2,'0')}</p>
                      <p style={{color:'var(--dim)',fontSize:10,margin:'2px 0 0',fontWeight:600}}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isExpired && (
              <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:10,padding:'10px 14px',marginTop:10}}>
                <p style={{color:'#fca5a5',fontSize:13,margin:0,fontWeight:600}}>⚠️ Your plan has expired. Please purchase a new plan to continue earning.</p>
              </div>
            )}
          </>
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
            const isCurrent = hasActivatedPlan && !isExpired && profile.membership === p.name;
            const colors=['var(--dim)','var(--accent)','var(--yellow)','var(--purple)'];
            const col=colors[i]||'var(--accent)';
            let lvlMap={};
            let detailMap={};
            try{ lvlMap=JSON.parse(p.level_commissions||'{}'); }catch{}
            try{ detailMap=JSON.parse(p.level_details||'{}'); }catch{}
            const refDisplay = Object.keys(lvlMap).length>0
              ? Object.entries(lvlMap).map(([k,v])=>`L${k}:${v}%`).join(', ')
              : `${(p.referral_commission*100).toFixed(0)}%`;
            const levelDetails = Object.entries(detailMap).filter(([,v])=>v).map(([k,v])=>`L${k}: ${v}`).join(' | ');
            return (
              <div key={p.id} style={{background:'var(--card)',border:`2px solid ${isCurrent?col:'var(--border)'}`,borderRadius:16,padding:24,position:'relative',transition:'transform .2s'}}>
                {isCurrent&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:col,color:'var(--bg)',padding:'2px 14px',borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{String.fromCharCode(10003)} Current Plan</div>}
                <h3 style={{color:col,textTransform:'capitalize',marginBottom:4,fontSize:17}}>{p.name}</h3>
                <p style={{color:'var(--text)',fontSize:26,fontWeight:800,marginBottom:16}}>Rs. {p.price}<span style={{fontSize:13,color:'var(--dim)',fontWeight:400}}>/{p.period_days}d</span></p>
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                  {[
                    ['📺',`${p.daily_ads} ads/day`],
                    ['💰',`Rs. ${p.earning_per_click} per click`],
                    ['👥',`${refDisplay} referral commission`],
                    ['🔗',`${p.referral_levels||'N/A'} referral levels`],
                    ['⬇️',`Min Withdraw: Rs. ${p.min_withdrawal||0}`],
                    ['⬆️',`Max Withdraw: ${p.max_withdrawal>0?`Rs. ${p.max_withdrawal}`:'No limit'}`],
                    ['i',levelDetails || `Send link to ${p.required_referrals_per_level||3} users for next level`],
                  ].map(([icon,text])=>(
                    <div key={text} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted)'}}>
                      <span>{icon}</span><span>{text}</span>
                    </div>
                  ))}
                </div>
                {!isCurrent && p.price>0 && (
                  <button onClick={()=>{ setSelectedPlan(p); setPlanPayMethod('wallet'); setPlanScreenshot(null); setPlanSenderName(''); setPlanSenderPhone(''); }}
                    style={{width:'100%',padding:'10px',background:col,color:'var(--bg)',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}}>
                    Upgrade to {p.name}
                  </button>
                )}
                {!isCurrent && p.price===0 && (
                  <button onClick={()=>{ setSelectedPlan(p); setPlanPayMethod('wallet'); }}
                    style={{width:'100%',padding:'10px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}}>
                    Activate Free Plan
                  </button>
                )}
              </div>
            );
          })}
          {plans.length===0&&<div className="sgc-empty">No plans available.</div>}
        </div>
      )}

      {/* Payment form */}
      {selectedPlan && (
        <div style={{maxWidth:520}}>
          <button onClick={()=>setSelectedPlan(null)} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:13,fontWeight:600,marginBottom:16,fontFamily:'var(--font)',padding:0}}>← Back to Plans</button>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px',marginBottom:20}}>
            <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px',fontWeight:600}}>SELECTED PLAN</p>
            <p style={{color:'var(--yellow)',fontSize:20,fontWeight:800,margin:0,textTransform:'capitalize'}}>{selectedPlan.name} — Rs. {selectedPlan.price}</p>
          </div>

          {/* Method selector — only for paid plans */}
          {selectedPlan.price > 0 && (
            <>
              <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>PAYMENT METHOD</p>
              <div style={{display:'flex',gap:10,marginBottom:20}}>
                {[['wallet','💳 Wallet'],['easypaisa','📱 Easypaisa'],['jazzcash','💳 JazzCash'],['bank','🏦 Bank Transfer']].map(([val,label])=>(
                  <div key={val} onClick={()=>setPlanPayMethod(val)}
                    style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${planPayMethod===val?'var(--accent)':'var(--border)'}`,background:planPayMethod===val?'#0d1e38':'var(--bg)',cursor:'pointer',textAlign:'center',color:planPayMethod===val?'var(--accent)':'var(--muted)',fontWeight:700,fontSize:13,transition:'all .2s'}}>
                    {label}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Free plan — just confirm */}
          {selectedPlan.price === 0 && (
            <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
              <p style={{color:'#4ade80',fontSize:13,fontWeight:600,margin:0}}>✓ This is a free plan. Click below to activate it.</p>
            </div>
          )}

          {/* Wallet */}
          {selectedPlan.price > 0 && planPayMethod==='wallet' && (
            <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px',marginBottom:16}}>
              <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 8px',fontWeight:600}}>WALLET BALANCE</p>
              <p style={{color:profile.balance>=selectedPlan.price?'var(--green)':'var(--red)',fontSize:22,fontWeight:800,margin:'0 0 4px'}}>Rs. {profile.balance.toFixed(2)}</p>
              {profile.balance < selectedPlan.price
                ? <p style={{color:'var(--red)',fontSize:12,margin:0}}>⚠️ Insufficient balance. Need Rs. {(selectedPlan.price - profile.balance).toFixed(2)} more. Please deposit first.</p>
                : <p style={{color:'var(--green)',fontSize:12,margin:0}}>✓ Sufficient balance. Rs. {selectedPlan.price} will be deducted.</p>
              }
            </div>
          )}

          {/* Insufficient balance - show deposit button */}
          {selectedPlan.price > 0 && planPayMethod==='wallet' && profile.balance < selectedPlan.price && (
            <div style={{background:'#451a03',border:'1.5px solid #f59e0b',borderRadius:12,padding:'18px 20px',marginBottom:16}}>
              <p style={{color:'#fbbf24',fontSize:14,fontWeight:700,margin:'0 0 10px'}}>⚠️ Insufficient Wallet Balance</p>
              <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 14px'}}>You need Rs. {(selectedPlan.price - profile.balance).toFixed(2)} more to purchase this plan.</p>
              <button type="button" onClick={()=>setTab('transfer')} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'var(--bg)',border:'none',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)'}}>💳 Go to Deposit Section</button>
            </div>
          )}

          {/* Manual Payment Methods (Easypaisa, JazzCash, Bank) */}
          {selectedPlan.price > 0 && planPayMethod !== 'wallet' && (
            <>
              {epAccounts.filter(a=>(a.method_type||'easypaisa')===planPayMethod).slice(0,1).map(a=>{
                const isEP=(a.method_type||'easypaisa')==='easypaisa';
                const isBank=a.method_type==='bank';
                const col=isEP?'#22c55e':isBank?'#3b82f6':'#ef4444';
                const bg=isEP?'linear-gradient(135deg,#dcfce7,#86efac)':isBank?'linear-gradient(135deg,#dbeafe,#60a5fa)':'linear-gradient(135deg,#fee2e2,#f87171)';
                const methodLabel=isEP?'EASYPAISA':isBank?'BANK TRANSFER':'JAZZCASH';
                return (
                  <div key={a.id} style={{background:bg,border:`2px solid ${col}`,borderRadius:16,padding:'20px 22px',minHeight:210,boxShadow:`0 10px 24px ${col}26`,color:'#0f172a',marginBottom:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <div style={{width:46,height:46,borderRadius:12,background:'#0f172a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,flexShrink:0}}>
                        {isEP?'EP':isBank?'BK':'JC'}
                      </div>
                      <div>
                        <p style={{color:'#0f172a',fontSize:12,fontWeight:900,margin:'0 0 3px',letterSpacing:.6}}>{methodLabel}</p>
                        <p style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)',fontWeight:900,fontSize:18,margin:0}}>{a.account_title}</p>
                      </div>
                    </div>
                    <div style={{background:'rgba(15,23,42,.9)',borderRadius:12,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                      <div>
                        <p style={{color:'#cbd5e1',fontSize:10,margin:'0 0 3px',fontWeight:700}}>Account Number</p>
                        <p style={{color:'#facc15',fontFamily:'monospace',fontSize:17,fontWeight:900,letterSpacing:1,margin:0,wordBreak:'break-all'}}>{a.account_number}</p>
                      </div>
                      <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Number copied! 📋');}} style={{background:'#facc15',border:'none',color:'#111827',borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:12,fontWeight:900,fontFamily:'var(--font)'}}>Copy</button>
                    </div>
                    {isBank&&(
                      <div style={{marginTop:10,color:'#0f172a',fontSize:13,lineHeight:1.7,fontWeight:700}}>
                        <div>Bank: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.bank_name||'Bank Transfer'}</b></div>
                        <div>Account title: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.account_title}</b></div>
                      </div>
                    )}
                    {a.deposit_message && (
                      <div style={{marginTop:12,background:'rgba(255,255,255,.72)',border:'1px solid rgba(15,23,42,.15)',borderRadius:10,padding:'10px 12px',display:'flex',gap:8,alignItems:'flex-start'}}>
                        <span style={{fontSize:15,flexShrink:0}}>💬</span>
                        <p style={{color:'#0f172a',fontSize:12,margin:0,lineHeight:1.6,whiteSpace:'pre-wrap',fontWeight:700}}>{a.deposit_message}</p>
                      </div>
                    )}
                    <div style={{marginTop:16,paddingTop:12,borderTop:`2px dashed ${col}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <p style={{color:'#0f172a',fontSize:12,fontWeight:900,margin:0}}>AMOUNT TO SEND:</p>
                      <p style={{color:'#e11d48',fontSize:19,fontWeight:900,margin:0}}>Rs. {selectedPlan.price}</p>
                    </div>
                  </div>
                );
              })}
              
              {epAccounts.filter(a=>(a.method_type||'easypaisa')===planPayMethod).length===0 && (
                <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:14,marginBottom:16}}>
                  <p style={{color:'var(--red)',fontSize:13,margin:0}}>⚠️ No active {planPayMethod} account available. Please select another method.</p>
                </div>
              )}

              <label className="sgc-label">Your Name (Sender)</label>
              <input className="sgc-input" placeholder="e.g. Ali Hassan" value={planSenderName} onChange={e=>setPlanSenderName(e.target.value)} required/>
              
              <label className="sgc-label">Transaction ID / Sender Number</label>
              <input className="sgc-input" type="text" placeholder="Enter TRX ID or Sender Phone" value={planTransactionId || planSenderPhone} onChange={e=>{
                setPlanTransactionId(e.target.value);
                setPlanSenderPhone(e.target.value);
              }} required/>
              
              <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
              <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setPlanScreenshot(e.target.files[0])}/>
                {planScreenshot?<p style={{color:'var(--green)',margin:0}}>✓ {planScreenshot.name}</p>:<p style={{color:'var(--dim)',margin:0}}>📸 Click to upload screenshot</p>}
              </label>
            </>
          )}

          {selectedPlan.price > 0 && planPayMethod === 'wallet' && profile?.balance < selectedPlan.price ? (
            <div style={{background:'#450a0a', border:'1px solid #ef4444', borderRadius:10, padding:16, textAlign:'center'}}>
              <p style={{color:'#fca5a5', margin:'0 0 12px', fontWeight:600}}>Insufficient balance. Please deposit first.</p>
              <button type="button" className="sgc-btn-secondary" style={{background:'#ef4444', color:'#fff', border:'none'}} onClick={()=>setTab('deposit')}>Go to Deposit</button>
            </div>
          ) : (
            <button className="sgc-btn-primary" disabled={isPurchasing} onClick={async()=>{
              if(isPurchasing) return;
              setIsPurchasing(true);
              try{
                if(selectedPlan.price > 0 && planPayMethod!=='wallet' && !planScreenshot){
                  notify('Please upload payment screenshot','error');
                  setIsPurchasing(false);
                  return;
                }
                const fd=new FormData();
                fd.append('plan_id', selectedPlan.id);
                fd.append('payment_method', selectedPlan.price===0 ? 'wallet' : planPayMethod);
                fd.append('sender_name', planSenderName);
                fd.append('sender_phone', planSenderPhone);
                fd.append('sender_phone', planTransactionId || planSenderPhone);
                if(selectedPlan.price > 0 && planPayMethod!=='wallet' && planScreenshot) fd.append('screenshot', planScreenshot);
                await API.post('/user/plan/purchase', fd, { headers:{'Content-Type':'multipart/form-data'} });
                notify(selectedPlan.price===0 ? 'Free plan activated! ✅' : planPayMethod==='wallet' ? 'Plan activated successfully! ✅' : 'Plan purchase request submitted! Admin will activate shortly. ✅');
                setSelectedPlan(null);
                if (loadData) loadData();
                API.get('/user/plan/my-purchases').then(r=>setMyPlanPurchases(r.data)).catch(()=>{});
              }catch(err){ 
                notify(err.response?.data?.detail||'Error','error');
              }
              setIsPurchasing(false);
            }}>{isPurchasing ? 'Processing...' : (selectedPlan.price===0 ? '✔ Activate Free Plan' : '📤 Submit Purchase Request')}</button>
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